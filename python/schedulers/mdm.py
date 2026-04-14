"""
MDM Scheduler using OR-Tools CP-SAT - FIXED VERSION
Addresses: room conflicts, faculty conflicts, expanded time slots
"""

import sys
import pandas as pd
from ortools.sat.python import cp_model
from collections import defaultdict

# Configuration
DAYS = {0: 'Monday', 1: 'Tuesday', 2: 'Wednesday', 3: 'Thursday', 4: 'Friday'}
SLOT_STR = {
    1: '08:30-09:25', 2: '09:25-10:20', 3: '10:30-11:25', 4: '11:25-12:20',
    5: '12:20-13:15', 6: '13:15-14:10', 7: '14:10-15:05', 8: '15:10-16:00', 9: '16:00-16:50'
}

# Expanded time slots for better scheduling
LAB_TIME_SLOTS = [
    (0, 1),  # Monday 08:30-10:20
    (2, 1),  # Wednesday 08:30-10:20

]

THEORY_TIME_SLOTS = [
    (0, 5),  # Monday 12:20-13:15
    (0, 3),  # Monday 14:10-15:05
]

def read_input(filename):
    print(f"📖 Reading input: {filename}")
    xl = pd.ExcelFile(filename)
    
    # Faculty sheet
    faculty_df = None
    for name in xl.sheet_names:
        df = pd.read_excel(xl, name)
        if 'Name of Faculty' in df.columns:
            faculty_df = df
            break
    if faculty_df is None:
        raise ValueError("❌ No Faculty sheet found")
    
    # Rooms sheet  
    rooms_df = None
    for name in xl.sheet_names:
        df = pd.read_excel(xl, name)
        if 'Rooms' in df.columns and 'Type' in df.columns:
            rooms_df = df
            break
    if rooms_df is None:
        raise ValueError("❌ No Rooms sheet found")
    
    return faculty_df, rooms_df

def normalize_faculty_rows(fac_df):
    print("🔧 Normalizing faculty data")
    fac_df = fac_df.copy()
    fac_df['Name of Faculty'] = fac_df['Name of Faculty'].ffill()
    fac_df['Hours'] = pd.to_numeric(fac_df['Hours'], errors='coerce')
    
    faculty_meta = {}
    for name, group in fac_df.groupby('Name of Faculty'):
        total = group['Hours'].dropna()
        total_hours = int(total.iloc[0]) if not total.empty else None
        faculty_meta[name] = {'rows': group.to_dict('records'), 'total_hours': total_hours}
    
    return faculty_meta

def build_sessions(faculty_meta):
    print("📋 Building sessions")
    
    # Build batch to faculty mapping
    batch_to_fac = defaultdict(list)
    course_batches = defaultdict(set)
    
    for fac, meta in faculty_meta.items():
        for r in meta['rows']:
            course = r.get('Course Name')
            batch = r.get('Batch')
            if pd.notna(batch) and pd.notna(course):
                batch_to_fac[batch].append(fac)
                course_batches[course].add(batch)
    
    print("   Course batches found:")
    for course, batches in sorted(course_batches.items()):
        print(f"   {course}: {sorted(batches)}")
    
    sessions = []
    sid = 0
    
    # Group batches by course
    course_main_batches = {}
    course_sub_batches = {}
    
    for course, batches in course_batches.items():
        main_batches = []
        sub_batches = []
        
        for batch in batches:
            batch_str = str(batch)
            if '-' in batch_str and any(c.isdigit() for c in batch_str.split('-')[-1]):
                sub_batches.append(batch)
            else:
                main_batches.append(batch)
        
        course_main_batches[course] = sorted(main_batches)
        course_sub_batches[course] = sorted(sub_batches)
    
    # Create theory sessions - 2 per course
    for course in sorted(course_batches.keys()):
        main_batches = course_main_batches.get(course, [])
        if main_batches:
            main_batch = main_batches[0]
            faculties = batch_to_fac.get(main_batch, [])
            
            for i in range(2):
                sessions.append({
                    'id': f'S{sid}',
                    'course': course,
                    'batch': main_batch,
                    'type': 'Theory',
                    'duration': 1,
                    'eligible_faculties': faculties if faculties else ['Unknown_Faculty'],
                    'allowed_times': THEORY_TIME_SLOTS
                })
                sid += 1
                print(f"   ➕ Theory session {i+1}/2: {course} - {main_batch}")
    
    # Create lab sessions - 4 per course
    for course in sorted(course_batches.keys()):
        sub_batches = course_sub_batches.get(course, [])
        for sub_batch in sub_batches[:4]:
            faculties = batch_to_fac.get(sub_batch, [])
            
            sessions.append({
                'id': f'S{sid}',
                'course': course,
                'batch': sub_batch,
                'type': 'Lab',
                'duration': 2,
                'eligible_faculties': faculties if faculties else ['Unknown_Faculty'],
                'allowed_times': LAB_TIME_SLOTS
            })
            sid += 1
            print(f"   ➕ Lab session: {course} - {sub_batch}")
    
    theory_count = sum(1 for s in sessions if s['type'] == 'Theory')
    lab_count = sum(1 for s in sessions if s['type'] == 'Lab')
    
    print(f"\n✅ Session creation complete:")
    print(f"   Theory sessions: {theory_count}")
    print(f"   Lab sessions: {lab_count}")
    print(f"   Total sessions: {len(sessions)}")
    
    return sessions

def build_room_map(rooms_df):
    print("\n🏢 Building room mapping")
    room_map = defaultdict(list)
    
    for _, r in rooms_df.iterrows():
        course = r.get('Course Name')
        typ = r.get('Type')
        room = r.get('Rooms')
        if pd.isna(course) or pd.isna(typ) or pd.isna(room):
            continue
        key = (str(course).strip(), str(typ).strip())
        room_map[key].append(str(room).strip())
    
    # Create type-only mapping
    type_room_map = defaultdict(set)
    for (course, typ), rooms in room_map.items():
        type_room_map[typ].update(rooms)
    
    type_room_map = {k: list(v) for k, v in type_room_map.items()}
    
    print(f"   Found {len(room_map)} course-type room mappings")
    print(f"   Room types available: {list(type_room_map.keys())}")
    
    return room_map, type_room_map

def get_time_slots_for_session(session_type, start_slot):
    """Return list of slot numbers occupied by a session"""
    if session_type == 'Lab':
        return [start_slot, start_slot + 1]
    else:
        return [start_slot]

def sessions_overlap(s1_type, s1_slot, s2_type, s2_slot):
    """Check if two sessions overlap in time"""
    slots1 = set(get_time_slots_for_session(s1_type, s1_slot))
    slots2 = set(get_time_slots_for_session(s2_type, s2_slot))
    return bool(slots1 & slots2)

def build_and_solve(sessions, room_map, type_room_map, faculty_meta, output_filename, course='FY', mdm_start='12:00', mdm_end='13:00'):
    print(f"\n⚙️ Building and solving model for {course}")
    print(f"   MDM Lunch Timings: {mdm_start} - {mdm_end}")
    model = cp_model.CpModel()
    
    # Create session variables
    sess_vars = {}
    
    for s in sessions:
        sid = s['id']
        
        # Time selection
        time_count = len(s['allowed_times'])
        time_var = model.NewIntVar(0, time_count - 1, f"time_{sid}")
        
        # Room selection
        rooms = room_map.get((s['course'], s['type']))
        if not rooms:
            rooms = type_room_map.get(s['type'], ['Virtual_Room'])
        room_var = model.NewIntVar(0, len(rooms) - 1, f"room_{sid}")
        
        # Faculty selection
        facs = s['eligible_faculties']
        fac_var = model.NewIntVar(0, len(facs) - 1, f"fac_{sid}")
        
        sess_vars[sid] = {
            'session': s,
            'time_var': time_var,
            'room_var': room_var,
            'fac_var': fac_var,
            'rooms': rooms,
            'facs': facs
        }
    
    print(f"✅ Created variables for {len(sess_vars)} sessions")
    
    # NO ROOM CONFLICTS
    print("\n🚫 Adding room conflict constraints...")
    room_conflicts = 0
    
    all_rooms = set()
    for vs in sess_vars.values():
        all_rooms.update(vs['rooms'])
    
    for room in all_rooms:
        # Sessions that can use this room
        room_sessions = []
        for sid, vs in sess_vars.items():
            if room in vs['rooms']:
                room_idx = vs['rooms'].index(room)
                room_sessions.append((sid, room_idx))
        
        # No two sessions can use same room at overlapping times
        for i in range(len(room_sessions)):
            sid_i, room_idx_i = room_sessions[i]
            vs_i = sess_vars[sid_i]
            s_i = vs_i['session']
            
            for j in range(i + 1, len(room_sessions)):
                sid_j, room_idx_j = room_sessions[j]
                vs_j = sess_vars[sid_j]
                s_j = vs_j['session']
                
                # Check all time slot combinations
                for t_i in range(len(s_i['allowed_times'])):
                    day_i, slot_i = s_i['allowed_times'][t_i]
                    
                    for t_j in range(len(s_j['allowed_times'])):
                        day_j, slot_j = s_j['allowed_times'][t_j]
                        
                        # Same day and overlapping slots?
                        if day_i == day_j and sessions_overlap(s_i['type'], slot_i, s_j['type'], slot_j):
                            # Create boolean: both use this room AND both pick these times
                            b_room_i = model.NewBoolVar(f'rc_{sid_i}_{sid_j}_{room}_{t_i}_{t_j}_ri')
                            b_room_j = model.NewBoolVar(f'rc_{sid_i}_{sid_j}_{room}_{t_i}_{t_j}_rj')
                            b_time_i = model.NewBoolVar(f'rc_{sid_i}_{sid_j}_{room}_{t_i}_{t_j}_ti')
                            b_time_j = model.NewBoolVar(f'rc_{sid_i}_{sid_j}_{room}_{t_i}_{t_j}_tj')
                            
                            model.Add(vs_i['room_var'] == room_idx_i).OnlyEnforceIf(b_room_i)
                            model.Add(vs_i['room_var'] != room_idx_i).OnlyEnforceIf(b_room_i.Not())
                            
                            model.Add(vs_j['room_var'] == room_idx_j).OnlyEnforceIf(b_room_j)
                            model.Add(vs_j['room_var'] != room_idx_j).OnlyEnforceIf(b_room_j.Not())
                            
                            model.Add(vs_i['time_var'] == t_i).OnlyEnforceIf(b_time_i)
                            model.Add(vs_i['time_var'] != t_i).OnlyEnforceIf(b_time_i.Not())
                            
                            model.Add(vs_j['time_var'] == t_j).OnlyEnforceIf(b_time_j)
                            model.Add(vs_j['time_var'] != t_j).OnlyEnforceIf(b_time_j.Not())
                            
                            # Prevent all four from being true
                            model.AddBoolOr([b_room_i.Not(), b_room_j.Not(), b_time_i.Not(), b_time_j.Not()])
                            room_conflicts += 1
    
    print(f"✅ Added {room_conflicts} room conflict constraints")
    
    # NO FACULTY CONFLICTS
    print("\n👨‍🏫 Adding faculty conflict constraints...")
    faculty_conflicts = 0
    
    all_faculties = set()
    for vs in sess_vars.values():
        all_faculties.update(vs['facs'])
    
    for faculty in all_faculties:
        if faculty == 'Unknown_Faculty':
            continue
            
        # Sessions that can use this faculty
        fac_sessions = []
        for sid, vs in sess_vars.items():
            if faculty in vs['facs']:
                fac_idx = vs['facs'].index(faculty)
                fac_sessions.append((sid, fac_idx))
        
        # No faculty double-booking
        for i in range(len(fac_sessions)):
            sid_i, fac_idx_i = fac_sessions[i]
            vs_i = sess_vars[sid_i]
            s_i = vs_i['session']
            
            for j in range(i + 1, len(fac_sessions)):
                sid_j, fac_idx_j = fac_sessions[j]
                vs_j = sess_vars[sid_j]
                s_j = vs_j['session']
                
                for t_i in range(len(s_i['allowed_times'])):
                    day_i, slot_i = s_i['allowed_times'][t_i]
                    
                    for t_j in range(len(s_j['allowed_times'])):
                        day_j, slot_j = s_j['allowed_times'][t_j]
                        
                        if day_i == day_j and sessions_overlap(s_i['type'], slot_i, s_j['type'], slot_j):
                            b_fac_i = model.NewBoolVar(f'fc_{sid_i}_{sid_j}_{faculty}_{t_i}_{t_j}_fi')
                            b_fac_j = model.NewBoolVar(f'fc_{sid_i}_{sid_j}_{faculty}_{t_i}_{t_j}_fj')
                            b_time_i = model.NewBoolVar(f'fc_{sid_i}_{sid_j}_{faculty}_{t_i}_{t_j}_ti')
                            b_time_j = model.NewBoolVar(f'fc_{sid_i}_{sid_j}_{faculty}_{t_i}_{t_j}_tj')
                            
                            model.Add(vs_i['fac_var'] == fac_idx_i).OnlyEnforceIf(b_fac_i)
                            model.Add(vs_i['fac_var'] != fac_idx_i).OnlyEnforceIf(b_fac_i.Not())
                            
                            model.Add(vs_j['fac_var'] == fac_idx_j).OnlyEnforceIf(b_fac_j)
                            model.Add(vs_j['fac_var'] != fac_idx_j).OnlyEnforceIf(b_fac_j.Not())
                            
                            model.Add(vs_i['time_var'] == t_i).OnlyEnforceIf(b_time_i)
                            model.Add(vs_i['time_var'] != t_i).OnlyEnforceIf(b_time_i.Not())
                            
                            model.Add(vs_j['time_var'] == t_j).OnlyEnforceIf(b_time_j)
                            model.Add(vs_j['time_var'] != t_j).OnlyEnforceIf(b_time_j.Not())
                            
                            model.AddBoolOr([b_fac_i.Not(), b_fac_j.Not(), b_time_i.Not(), b_time_j.Not()])
                            faculty_conflicts += 1
    
    print(f"✅ Added {faculty_conflicts} faculty conflict constraints")
    
    # Faculty workload limits
    print("\n⏰ Adding faculty workload constraints...")
    workload_count = 0
    for fac_name, meta in faculty_meta.items():
        total_hours = meta['total_hours']
        if total_hours is None:
            continue
            
        workload_terms = []
        for sid, vs in sess_vars.items():
            if fac_name in vs['facs']:
                fac_idx = vs['facs'].index(fac_name)
                fac_selected = model.NewBoolVar(f"workload_{sid}_{fac_name}")
                model.Add(vs['fac_var'] == fac_idx).OnlyEnforceIf(fac_selected)
                model.Add(vs['fac_var'] != fac_idx).OnlyEnforceIf(fac_selected.Not())
                workload_terms.append(fac_selected * vs['session']['duration'])
        
        if workload_terms:
            model.Add(sum(workload_terms) <= total_hours)
            workload_count += 1
    
    print(f"✅ Added workload limits for {workload_count} faculty members")
    
    # Solve
    print("\n🔍 Solving model...")
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 600.0
    solver.parameters.num_search_workers = 8
    solver.parameters.log_search_progress = False
    
    status = solver.Solve(model)
    
    print(f"\n📊 Solver status: {solver.StatusName()}")
    print(f"   Wall time: {solver.WallTime():.2f}s")
    
    if status not in [cp_model.OPTIMAL, cp_model.FEASIBLE]:
        print("❌ No solution found")
        print(f"   Sufficient assumptions: {solver.SufficientAssumptionsForInfeasibility()}")
        return False
    
    # Build output and validate
    print("\n📝 Building output...")
    scheduled_rows = []
    
    # Track for validation
    room_schedule = defaultdict(lambda: defaultdict(set))  # room -> day -> set of slots
    faculty_schedule = defaultdict(lambda: defaultdict(set))  # faculty -> day -> set of slots
    
    for sid, vs in sess_vars.items():
        s = vs['session']
        
        time_idx = solver.Value(vs['time_var'])
        day, slot = s['allowed_times'][time_idx]
        
        room_idx = solver.Value(vs['room_var'])
        room = vs['rooms'][room_idx]
        
        fac_idx = solver.Value(vs['fac_var'])
        faculty = vs['facs'][fac_idx]
        
        # Get occupied slots
        occupied_slots = get_time_slots_for_session(s['type'], slot)
        
        # Format time string
        if s['type'] == 'Lab':
            time_str = f"{SLOT_STR[slot]} & {SLOT_STR[slot+1]}"
        else:
            time_str = SLOT_STR[slot]
        
        # Validate no conflicts
        for occ_slot in occupied_slots:
            if occ_slot in room_schedule[room][day]:
                print(f"⚠️  WARNING: Room conflict detected: {room} on {DAYS[day]} slot {occ_slot}")
            if occ_slot in faculty_schedule[faculty][day]:
                print(f"⚠️  WARNING: Faculty conflict detected: {faculty} on {DAYS[day]} slot {occ_slot}")
            
            room_schedule[room][day].add(occ_slot)
            faculty_schedule[faculty][day].add(occ_slot)
        
        scheduled_rows.append({
            'Day': DAYS[day],
            'Time': time_str,
            'Batch': s['batch'],
            'Course': s['course'],
            'Faculty': faculty,
            'Room': room,
            'Type': s['type']
        })
    
    # Write output
    with pd.ExcelWriter(output_filename, engine='openpyxl') as writer:
        if scheduled_rows:
            scheduled_df = pd.DataFrame(scheduled_rows)
            
            # Add day order for sorting
            day_order = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4}
            scheduled_df['DayOrder'] = scheduled_df['Day'].map(day_order)
            
            # Sort by day and time
            scheduled_df = scheduled_df.sort_values(['DayOrder', 'Time'])
            scheduled_df = scheduled_df.drop('DayOrder', axis=1)
            
            # Overview sheet
            scheduled_df.to_excel(writer, sheet_name='Overview', index=False)
            print(f"\n✅ Scheduled {len(scheduled_df)} sessions")
            
            # Extract base course name (remove Theory/Lab suffix)
            def get_base_course(course_name):
                course_str = str(course_name).strip()
                # Remove common suffixes
                for suffix in [' Theory', ' Lab', '-Theory', '-Lab', '_Theory', '_Lab', '(Theory)', '(Lab)']:
                    if course_str.endswith(suffix):
                        return course_str[:-len(suffix)].strip()
                return course_str
            
            scheduled_df['BaseCourse'] = scheduled_df['Course'].apply(get_base_course)
            
            # Create separate sheet for each base course
            unique_base_courses = scheduled_df['BaseCourse'].unique()
            print(f"\n📚 Creating {len(unique_base_courses)} course sheets...")
            
            for base_course in sorted(unique_base_courses):
                course_df = scheduled_df[scheduled_df['BaseCourse'] == base_course].copy()
                course_df = course_df.drop('BaseCourse', axis=1)
                course_df['DayOrder'] = course_df['Day'].map(day_order)
                course_df = course_df.sort_values(['DayOrder', 'Time'])
                course_df = course_df.drop('DayOrder', axis=1)
                
                # Sanitize sheet name (max 31 chars, no special chars)
                sheet_name = str(base_course)[:31].replace('/', '-').replace('\\', '-').replace('*', '').replace('?', '').replace('[', '').replace(']', '')
                course_df.to_excel(writer, sheet_name=sheet_name, index=False)
                print(f"   ✓ {sheet_name}: {len(course_df)} sessions")
        
        # Add empty unscheduled sheet
        pd.DataFrame(columns=['Course', 'Batch', 'Type', 'Reason']).to_excel(
            writer, sheet_name='Unscheduled', index=False
        )
    
    print(f"\n📁 Output written to {output_filename}")
    
    # Statistics
    day_dist = defaultdict(int)
    type_dist = defaultdict(int)
    for row in scheduled_rows:
        day_dist[row['Day']] += 1
        type_dist[row['Type']] += 1
    
    print("\n📊 Final statistics:")
    print(f"   Day distribution: {dict(day_dist)}")
    print(f"   Type distribution: {dict(type_dist)}")
    print(f"   Unique rooms used: {len(room_schedule)}")
    print(f"   Unique faculties used: {len(faculty_schedule)}")
    
    return True

# Main execution
if __name__ == '__main__':
    print("🚀 MDM Scheduler - CONFLICT-FREE VERSION")
    print("=" * 60)
    
    infile = sys.argv[1] if len(sys.argv) > 1 else 'mdm_input.xlsx'
    outfile = sys.argv[2] if len(sys.argv) > 2 else 'schedule_output.xlsx'
    
    try:
        fac_df, rooms_df = read_input(infile)
        faculty_meta = normalize_faculty_rows(fac_df)
        sessions = build_sessions(faculty_meta)
        room_map, type_room_map = build_room_map(rooms_df)
        
        success = build_and_solve(sessions, room_map, type_room_map, faculty_meta, outfile)
        if not success:
            print("\n❌ Scheduling failed")
            sys.exit(1)
        else:
            print("\n🎉 Scheduling completed successfully!")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)