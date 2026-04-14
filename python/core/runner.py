import os
import tempfile

from config import INPUT_XLSX, OUTPUT_PREFIX, DAYS, SY_ONLINE_DAYS, TY_ONLINE_DAYS
from core.data_loading import read_workbook, pick_core_sheets, build_room_lists
from core.sessions_builder import build_sessions
from core.feasibility import compute_feasible
from core.phase_scheduler import schedule_phases
from core.day_scheduler import schedule_remaining
from core.exporter import export_to_excel


def run_scheduler(run_num: int) -> bool:
    print("\n" + "=" * 60)
    print(f"[RUNNING] SCHEDULER RUN {run_num}")
    print("=" * 60)

    # ---------------- LOAD INPUT ----------------
    # Update time slots from Excel before processing
    from config import update_time_slots
    update_time_slots(INPUT_XLSX)
    
    # Re-import online config and faculty availability to get latest values
    import config
    global SY_ONLINE_DAYS, TY_ONLINE_DAYS
    SY_ONLINE_DAYS = config.SY_ONLINE_DAYS
    TY_ONLINE_DAYS = config.TY_ONLINE_DAYS
    print(f"[INFO] Online Config → SY: {SY_ONLINE_DAYS}, TY: {TY_ONLINE_DAYS}")
    print(f"[INFO] Faculty Availability → {len(config.FACULTY_AVAILABILITY)} faculty configured")
    
    sheets = read_workbook(INPUT_XLSX)
    rooms_sheet, students_sheet, faculty_sheet = pick_core_sheets(sheets)

    rooms_df = sheets[rooms_sheet].copy()
    faculty_df = sheets[faculty_sheet].copy()

    # Room structure
    theory_rooms, lab_rooms, all_rooms, room_to_idx, idx_to_room, ONLINE_ROOM_IDX = \
        build_room_lists(rooms_df)

    print(f"[INFO] Rooms → Theory: {len(theory_rooms)}, Lab: {len(lab_rooms)}")

    # ---------------- BUILD SESSIONS ----------------
    sessions, session_by_id = build_sessions(faculty_df)

    total_theory = sum(1 for s in sessions if s["type"] == "theory")
    total_lab = sum(1 for s in sessions if s["type"] == "lab")

    print(f"[INFO] Sessions → Theory = {total_theory}, Lab = {total_lab}, Total = {len(sessions)}")

    # ---------------- FEASIBILITY ----------------
    feasible = compute_feasible(
        sessions,
        theory_rooms,
        lab_rooms,
        room_to_idx,
        ONLINE_ROOM_IDX,
        verbose=True
    )

    # Zero-feasible diagnostics
    zero = [sid for sid, opts in feasible.items() if not opts]
    if zero:
        print("\n[WARNING] ZERO-FEASIBLE SESSIONS:")
        for sid in zero:
            s = session_by_id[sid]
            print(f"  • {sid} → {s['batch']} - {s['course']} ({s['type']})")

    # ---------------------- NO MORE AGGRESSIVE GREEDY ----------------------
    # We ONLY pre-place sessions that have EXACTLY 1 feasible option.
    # This is safe and avoids blocking many other sessions.

    assignments = []
    preplaced = set()

    # Quick occupancy
    occ_room = set()
    occ_fac = set()
    occ_batch = set()

    def can_place_single(sid, d, t, ridx):
        s = session_by_id[sid]
        slots = (t, t+1) if s["type"] == "lab" else (t,)
        for sl in slots:
            if ridx != ONLINE_ROOM_IDX and (ridx, d, sl) in occ_room:
                return False
            if (s["faculty"], d, sl) in occ_fac:
                return False
            if (s["batch"], d, sl) in occ_batch:
                return False
        return True

    one_option_sessions = [sid for sid, opts in feasible.items() if len(opts) == 1]

    print(f"\n[SAFE-GREEDY] Pre-placing ONLY 1-option sessions: {len(one_option_sessions)} sessions")

    for sid in one_option_sessions:
        d, t, ridx = feasible[sid][0]
        if can_place_single(sid, d, t, ridx):
            s = session_by_id[sid]
            # Check if this session should be online based on day and year
            should_be_online = False
            if d < 5:  # Only Mon-Fri
                if s["is_ty"]:
                    should_be_online = TY_ONLINE_DAYS[d] == 1
                elif s["is_sy"]:
                    should_be_online = SY_ONLINE_DAYS[d] == 1
            
            # Determine room assignment
            if should_be_online or ridx == ONLINE_ROOM_IDX:
                room_assignment = "ONLINE"
            else:
                room_assignment = idx_to_room[ridx]
            
            assignments.append({
                "Day": DAYS[d],
                "DayIndex": d,
                "StartSlot": t,
                "Time": (
                    f"{t} & {t+1}" if s["type"] == "lab" else f"{t}"
                ),
                "Batch": s["batch"],
                "BatchMain": s["batch_main"],
                "Course": s["course"],
                "Faculty": s["faculty"],
                "Room": room_assignment,
                "Type": "Lab" if s["type"] == "lab" else "Theory",
                "is_mdm": s["is_mdm"],
                "is_pec": s["is_pec"],
                "is_ty": s["is_ty"]
            })

            for sl in ((t, t+1) if s["type"] == "lab" else (t,)):
                if ridx != ONLINE_ROOM_IDX:
                    occ_room.add((ridx, d, sl))
                occ_fac.add((s["faculty"], d, sl))
                occ_batch.add((s["batch"], d, sl))

            preplaced.add(sid)

    # Remove from CP set
    for sid in preplaced:
        feasible.pop(sid, None)

    # ---------------- PHASE SCHEDULER (main CP model) ----------------
    sessions_cp = [s for s in sessions if s["id"] not in preplaced]

    cp_assignments, remaining = schedule_phases(
        sessions=sessions_cp,
        feasible=feasible,
        idx_to_room=idx_to_room,
        ONLINE_ROOM_IDX=ONLINE_ROOM_IDX,
        run_num=run_num
    )

    assignments.extend(cp_assignments)

    # ---------------- FALLBACK SCHEDULER ----------------
    if remaining:
        print(f"\n[DAY-BY-DAY] Fallback scheduling for {len(remaining)} sessions...")
        schedule_remaining(
            assignments=assignments,
            remaining=remaining,
            sessions=sessions,
            feasible=feasible,
            idx_to_room=idx_to_room,
            ONLINE_ROOM_IDX=ONLINE_ROOM_IDX,
            run_num=run_num
        )

    # ---------------- FINAL RESULTS ----------------
    print("\n" + "=" * 50)
    print("[RESULTS] FINAL REPORT")
    print("=" * 50)
    print(f"Total sessions:     {len(sessions)}")
    print(f"Scheduled:          {len(assignments)}")
    print(f"Unscheduled:        {len(remaining)}")

    if remaining:
        print("\n[UNSCHEDULED DETAILS]")
        for sid in remaining:
            s = session_by_id[sid]
            print(f"  • {sid}: {s['batch']} {s['course']} ({s['type']})  | feasible = {len(feasible.get(sid, []))}")

    # ---------------- EXPORT ----------------
    if run_num == 1:
        temp_dir = tempfile.mkdtemp(prefix="timetable_")
        with open("temp_output_dir.txt", "w") as f:
            f.write(temp_dir)
    else:
        with open("temp_output_dir.txt", "r") as f:
            temp_dir = f.read().strip()

    out_path = os.path.join(temp_dir, f"{OUTPUT_PREFIX}_run{run_num}.xlsx")
    ok = export_to_excel(assignments, out_path)

    if ok:
        print(f"[EXPORTED] {out_path}")
        return True
    else:
        print("[ERROR] Failed to export Excel")
        return False
