import os
import json
import base64
import gc
import tempfile
import shutil
import urllib.parse
import time
import glob

from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename

import config
from core.runner import run_scheduler
from core.validation import validate_excel_file
from schedulers.fy import run_fy_scheduler
from schedulers.mdm import (
    read_input,
    normalize_faculty_rows,
    build_sessions,
    build_room_map,
    build_and_solve,
)
from utils.keepalive import start_keepalive


app = Flask(__name__)
start_keepalive()
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response


@app.route('/', methods=['GET'])
def root():
    return jsonify({
        "status": "Python API is running",
        "endpoints": ["/health", "/generate-schedule", "/generate-mdm-schedule"],
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "OK", "service": "Python API"})


@app.route('/validate', methods=['POST', 'OPTIONS'])
def validate_schedule_template():
    if not request.files or 'file' not in request.files:
        return jsonify({"success": False, "output": "No file uploaded"}), 400

    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({"success": False, "output": "No file selected"}), 400

    temp_filepath = os.path.join(
        tempfile.gettempdir(), f'validate_{int(time.time())}_{secure_filename(file.filename)}'
    )
    try:
        file.save(temp_filepath)
        return jsonify(validate_excel_file(temp_filepath))
    finally:
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)


def _apply_faculty_availability(faculty_availability):
    if not faculty_availability:
        return
    parsed = json.loads(faculty_availability) if isinstance(faculty_availability, str) else faculty_availability
    config.update_faculty_availability(parsed)


def handle_mdm_schedule(file):
    temp_filepath = None
    output_file = None
    try:
        secure_filename(file.filename)
        temp_filepath = os.path.join(tempfile.gettempdir(), f'mdm_input_{int(time.time())}.xlsx')
        file.save(temp_filepath)

        output_file = f'mdm_schedule_output_{int(time.time())}.xlsx'
        fac_df, rooms_df = read_input(temp_filepath)
        faculty_meta = normalize_faculty_rows(fac_df)
        sessions = build_sessions(faculty_meta)
        room_map, type_room_map = build_room_map(rooms_df)

        del fac_df, rooms_df
        gc.collect()

        success = build_and_solve(sessions, room_map, type_room_map, faculty_meta, output_file)

        if success and os.path.exists(output_file):
            with open(output_file, 'rb') as f:
                file_data = base64.b64encode(f.read()).decode()
            return {"success": True, "filename": "mdm_schedule.xlsx", "data": file_data}
        return {"success": False, "error": "Failed to generate schedule"}
    except Exception as e:
        return {"success": False, "error": str(e)}
    finally:
        if temp_filepath and os.path.exists(temp_filepath):
            os.remove(temp_filepath)
        if output_file and os.path.exists(output_file):
            os.remove(output_file)


def handle_fy_schedule(file, online_config):
    temp_filepath = None
    cwd_filepath = None
    try:
        secure_filename(file.filename)
        temp_filepath = os.path.join(tempfile.gettempdir(), 'fy_timetable_data.xlsx')
        file.save(temp_filepath)

        cwd_filepath = os.path.join(os.getcwd(), 'fy_timetable_data.xlsx')
        shutil.copy(temp_filepath, cwd_filepath)

        successful_runs = 0
        results = {}

        for run in range(1, 4):
            try:
                gc.collect()
                result = run_fy_scheduler(cwd_filepath, run, online_config)

                if result:
                    successful_runs += 1
                    output_file = f'final_timetable_run{run}.xlsx'

                    if os.path.exists(output_file):
                        with open(output_file, 'rb') as f:
                            file_data = base64.b64encode(f.read()).decode()
                        results[f'schedule{run}'] = {'filename': output_file, 'data': file_data}
                        os.remove(output_file)
                        del file_data
                        gc.collect()
            except Exception as e:
                print(f"FY Scheduler error on run {run}: {e}")
                gc.collect()
                continue

        if successful_runs == 0:
            return {"success": False, "error": "No FY schedules generated"}

        return {
            "success": True,
            "results": results,
            "successful_runs": successful_runs,
            "total_runs": 3,
        }
    finally:
        if temp_filepath and os.path.exists(temp_filepath):
            os.remove(temp_filepath)
        if cwd_filepath and os.path.exists(cwd_filepath):
            os.remove(cwd_filepath)
        gc.collect()


def handle_standard_schedule(file, timing_config, pec_config, mdm_config, common_slots, online_config):
    temp_filepath = None
    cwd_filepath = None
    try:
        secure_filename(file.filename)
        temp_filepath = os.path.join(tempfile.gettempdir(), 'timetable_data.xlsx')
        file.save(temp_filepath)

        cwd_filepath = os.path.join(os.getcwd(), 'timetable_data.xlsx')
        shutil.copy(temp_filepath, cwd_filepath)

        if timing_config:
            parsed_config = json.loads(timing_config)
            if parsed_config.get('syLunchSlot'):
                config.SY_LUNCH_SLOT = int(parsed_config['syLunchSlot'])
            if parsed_config.get('tyLunchSlot'):
                config.TY_LUNCH_SLOT = int(parsed_config['tyLunchSlot'])

        if online_config:
            parsed_online = json.loads(online_config) if isinstance(online_config, str) else online_config
            sy_online = parsed_online.get('SY', [0, 0, 0, 0, 0])
            ty_online = parsed_online.get('TY', [0, 0, 0, 0, 0])
            config.update_online_config(sy_online, ty_online)

        _apply_faculty_availability(request.form.get('facultyAvailability', '{}'))

        if pec_config:
            ty_pec_theory = pec_config.get('tyPecTheorySlots', {})
            ty_pec_lab = pec_config.get('tyPecLabSlots', {})

            config.TY_PEC_THEORY_SLOTS = set()
            config.TY_PEC_LAB_SLOTS = set()

            for day, slots in ty_pec_theory.items():
                day_idx = config.DAYS.index(day) if day in config.DAYS else None
                if day_idx is not None:
                    for slot in slots:
                        config.TY_PEC_THEORY_SLOTS.add((day_idx, slot))

            for day, slots in ty_pec_lab.items():
                day_idx = config.DAYS.index(day) if day in config.DAYS else None
                if day_idx is not None:
                    for slot in slots:
                        config.TY_PEC_LAB_SLOTS.add((day_idx, slot))

        if mdm_config:
            config.TY_MDM_THEORY_SLOTS = set()
            config.TY_MDM_LAB_SLOTS = set()

            for day, slots in mdm_config.items():
                day_idx = config.DAYS.index(day) if day in config.DAYS else None
                if day_idx is not None:
                    for slot_info in slots:
                        slot_idx = slot_info.get('slot')
                        slot_type = slot_info.get('type', 'theory').lower()
                        if slot_type == 'theory':
                            config.TY_MDM_THEORY_SLOTS.add((day_idx, slot_idx))
                        elif slot_type == 'lab':
                            config.TY_MDM_LAB_SLOTS.add((day_idx, slot_idx))

        if common_slots:
            config.COMMON_LOCKED_SLOTS = set()
            for day, slots in common_slots.items():
                day_idx = config.DAYS.index(day) if day in config.DAYS else None
                if day_idx is not None:
                    for slot_idx in slots:
                        config.COMMON_LOCKED_SLOTS.add((day_idx, slot_idx))

        successful_runs = 0
        results = {}

        for run in range(1, 4):
            try:
                gc.collect()
                result = run_scheduler(run)

                if not result:
                    continue

                successful_runs += 1
                output_file = f'final_timetable_run{run}.xlsx'
                file_path = None

                if os.path.exists(output_file):
                    file_path = output_file
                else:
                    matches = glob.glob(
                        os.path.join(tempfile.gettempdir(), '**', output_file),
                        recursive=True,
                    )
                    if matches:
                        file_path = matches[0]

                if file_path:
                    with open(file_path, 'rb') as f:
                        file_content = f.read()
                    file_data = base64.b64encode(file_content).decode()
                    results[f'schedule{run}'] = {'filename': output_file, 'data': file_data}
                    if os.path.exists(file_path):
                        os.remove(file_path)
                    del file_data, file_content
                    gc.collect()
            except Exception as e:
                print(f"Scheduler error on run {run}: {e}")
                gc.collect()
                continue

        if successful_runs == 0:
            return {"success": False, "error": "No schedules generated"}

        return {
            "success": True,
            "results": results,
            "successful_runs": successful_runs,
            "total_runs": 3,
        }
    finally:
        if temp_filepath and os.path.exists(temp_filepath):
            os.remove(temp_filepath)
        if cwd_filepath and os.path.exists(cwd_filepath):
            os.remove(cwd_filepath)
        gc.collect()


@app.route('/generate-mdm-schedule', methods=['POST', 'OPTIONS'])
def generate_mdm_schedule():
    if not request.files or 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"})

    file = request.files['file']
    if not file or file.filename == '':
        return jsonify({"success": False, "error": "No file selected"})

    return jsonify(handle_mdm_schedule(file))


@app.route('/schedule', methods=['POST'])
@app.route('/generate-schedule', methods=['POST'])
def generate_schedule():
    try:
        if not request.files or 'file' not in request.files:
            return jsonify({"success": False, "error": "No file uploaded"})

        file = request.files['file']
        if not file or file.filename == '':
            return jsonify({"success": False, "error": "No file selected"})

        department = request.form.get('department', 'Unknown')
        dept_decoded = urllib.parse.unquote(department)
        dept_clean = dept_decoded.upper().replace('.', '').replace(' ', '').replace('-', '').replace('_', '')
        dept_upper = department.upper()

        online_config = request.form.get('onlineConfig', '{}')
        faculty_availability = request.form.get('facultyAvailability', '{}')

        if dept_clean == 'FY' or 'FIRSTYEAR' in dept_clean or 'FIRST YEAR' in dept_upper:
            _apply_faculty_availability(faculty_availability)
            return jsonify(handle_fy_schedule(file, online_config))

        timing_config = request.form.get('timingConfig', '{}')
        pec_config = {
            'tyPecTheorySlots': json.loads(request.form.get('tyPecTheorySlots', '{}')),
            'tyPecLabSlots': json.loads(request.form.get('tyPecLabSlots', '{}')),
            'btechPecTheorySlots': json.loads(request.form.get('btechPecTheorySlots', '{}')),
            'btechPecLabSlots': json.loads(request.form.get('btechPecLabSlots', '{}')),
        }
        mdm_config = json.loads(request.form.get('mdmSlots', '{}'))
        common_slots = json.loads(request.form.get('commonSlots', '{}'))

        return jsonify(
            handle_standard_schedule(file, timing_config, pec_config, mdm_config, common_slots, online_config)
        )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3001))
    is_production = bool(os.environ.get('PORT'))
    print(f"Starting Python API on port {port} ({'production' if is_production else 'local'})")
    app.run(host='0.0.0.0', port=port, debug=not is_production)
