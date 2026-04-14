#!/usr/bin/env python3
import pandas as pd
from ortools.sat.python import cp_model
import time
from collections import defaultdict


class OptimizedTimetableScheduler:
    def __init__(self):
        self.model = cp_model.CpModel()
        self.solver = cp_model.CpSolver()

        # Data structures
        self.faculty_data = None
        self.room_data = None
        self.student_data = None
        self.time_slots = None  # {index (1-based): "HH:MM-HH:MM"}

        # Parsed / derived data
        self.faculty_sessions = defaultdict(list)
        self.batch_sessions = defaultdict(list)
        self.subject_rooms = defaultdict(lambda: {'theory': [], 'lab': []})
        self.sessions = []  # list of dicts with keys: id, faculty, course, batch, type, duration, rooms

        # For new compact model
        self.session_starts = {}     # sid -> IntVar(global_start)
        self.session_ends = {}       # sid -> IntVar(global_end)
        self.session_intervals = {}  # sid -> IntervalVar (mandatory)
        self.session_room_bools = defaultdict(dict)  # sid -> {room_name: BoolVar}

        # Constants
        self.days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        self.time_slots_per_day = 9
        self.lunch_break_index = 5  # 1-based index within the day for lunch (default; may be overridden)

        # ONLINE DAYS CONFIG (0 = offline, 1 = online)
        # Index: 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat
        # Example here: only Tuesday is online
        self.online_days = [0, 0, 0, 0, 0, 1]   # <-- EDIT THIS ARRAY ONLY

        # Mapping between global time index and (day, slot_index)
        self.global_to_day_slot = {}
        self.allowed_theory_starts = []
        self.allowed_lab_starts = []

        # Cached sets of online/offline global indices
        self.online_global_indices = set()
        self.offline_global_indices = set()

    def load_data(self, excel_file):
        """Load data from Excel files"""
        print("=" * 60)
        print("OPTIMIZED TIMETABLE SCHEDULER - CP-SAT")
        print("=" * 60)
        print("\n[1/5] Loading data from Excel files...")

        try:
            self.faculty_data = pd.read_excel(excel_file, sheet_name='Faculty')
            self.room_data = pd.read_excel(excel_file, sheet_name='Rooms')
            self.student_data = pd.read_excel(excel_file, sheet_name='Students')

            # Load time slots from Excel
            try:
                time_df = pd.read_excel(excel_file, sheet_name='Time')
                self.time_slots = {}  # index -> slot string
                for _, row in time_df.iterrows():
                    idx = int(row['Index'])
                    self.time_slots[idx] = row['Slot']
                self.time_slots_per_day = len(self.time_slots)
                # Lunch break at slot 5 if it exists
                if 5 in self.time_slots:
                    self.lunch_break_index = 5
                print(f"  ✓ Loaded {len(self.time_slots)} time slots from Excel")
            except Exception as e:
                print(f"  ⚠ Could not load Time sheet: {e}, using defaults")
                self.time_slots = {i + 1: slot for i, slot in enumerate([
                    "08:30-09:25", "09:25-10:20", "10:30-11:25", "11:25-12:20",
                    "12:20-01:15", "01:15-02:10", "02:10-03:05", "03:10-04:00", "04:00-04:50"
                ])}
                self.time_slots_per_day = 9
                self.lunch_break_index = 5

            print(f"  ✓ Faculty entries: {len(self.faculty_data)}")
            print(f"  ✓ Rooms: {len(self.room_data)}")
            print(f"  ✓ Batches: {len(self.student_data)}")
            print(f"  ✓ Time slots: {len(self.time_slots)}")

            return True
        except Exception as e:
            print(f"  ✗ Error: {e}")
            return False

    def parse_faculty_assignments(self):
        """Parse faculty assignments and create sessions (O(n))"""
        print("\n[2/5] Parsing faculty assignments...")

        # Build room lookup (subject -> theory/lab rooms)
        for _, room in self.room_data.iterrows():
            room_name = room['Rooms']
            room_type = room.get('Type', 'Theory')
            if pd.notna(room_type):
                room_type = room_type.strip().lower()
            else:
                room_type = 'theory'

            subject = room.get('Subject', 'Gen')
            if pd.notna(subject):
                subject = subject.strip()
            else:
                subject = 'Gen'

            self.subject_rooms[subject][room_type].append(room_name)

            # Also store keyword-based lab mapping
            if room_type == 'lab':
                keywords = subject.lower().replace(' lab', '').split()
                for keyword in keywords:
                    if len(keyword) > 3:
                        self.subject_rooms[f"keyword{keyword}"][room_type].append(room_name)

        # Parse sessions
        session_id = 0
        current_faculty = None

        for _, row in self.faculty_data.iterrows():
            if pd.notna(row.get('Name of Faculty')):
                current_faculty = row['Name of Faculty']

            if current_faculty and pd.notna(row.get('Course Name')):
                course_name = row['Course Name']
                batch = row['Batch']

                # safe parsing of hours (handle NaN)
                theory_hours = 0
                lab_hours = 0
                if 'Theory (Hours/week)' in row and pd.notna(row['Theory (Hours/week)']):
                    try:
                        theory_hours = int(row['Theory (Hours/week)'])
                    except Exception:
                        theory_hours = int(float(row['Theory (Hours/week)']))
                if 'Lab(Hours/Week)' in row and pd.notna(row['Lab(Hours/Week)']):
                    try:
                        lab_hours = int(row['Lab(Hours/Week)'])
                    except Exception:
                        lab_hours = int(float(row['Lab(Hours/Week)']))

                # THEORY SESSIONS
                if theory_hours > 0:
                    num_sessions = theory_hours  # each theory hour = 1 session
                    for _ in range(num_sessions):
                        # Theory rooms: use 'Gen' theory rooms if available
                        required_rooms = self.subject_rooms.get('Gen', {}).get('theory', [])
                        if not required_rooms:
                            # Fallback: all non-keyword theory rooms
                            required_rooms = []
                            for subj, rooms_dict in self.subject_rooms.items():
                                if not subj.startswith('keyword'):
                                    required_rooms.extend(rooms_dict.get('theory', []))
                            required_rooms = list(set(required_rooms))

                        if not required_rooms:
                            # Final fallback: use first few rooms from room_data
                            required_rooms = list(self.room_data['Rooms'])[:8]

                        session = {
                            'id': session_id,
                            'faculty': current_faculty,
                            'course': course_name,
                            'batch': batch,
                            'type': 'Theory',
                            'duration': 1,
                            'rooms': required_rooms
                        }

                        self.sessions.append(session)
                        self.faculty_sessions[current_faculty].append(session_id)
                        self.batch_sessions[batch].append(session_id)
                        session_id += 1

                # LAB SESSIONS (full 2-hour labs) + possible leftover 1-hour tutorials
                if lab_hours > 0:
                    num_full_labs = lab_hours // 2
                    leftover = lab_hours % 2

                    # create full 2-hour lab sessions
                    for _ in range(num_full_labs):
                        required_rooms = []
                        course_lower = course_name.lower().strip()

                        # Try exact match with Subject column
                        for subject_key in self.subject_rooms.keys():
                            if subject_key.startswith('keyword'):
                                continue
                            subject_lower = subject_key.lower().strip()

                            # Check if course name contains the subject or vice versa
                            if subject_lower in course_lower or course_lower in subject_lower:
                                required_rooms = self.subject_rooms[subject_key].get('lab', [])
                                if required_rooms:
                                    break

                        # Try matching key terms (Applied Mechanics, Design Thinking, etc.)
                        if not required_rooms:
                            # Extract meaningful words from course name
                            course_words = [w for w in course_lower.replace('lab', '').split() if len(w) > 3]

                            for subject_key in self.subject_rooms.keys():
                                if subject_key.startswith('keyword'):
                                    continue
                                subject_lower = subject_key.lower()

                                # Check if any course word matches subject
                                for word in course_words:
                                    if word in subject_lower:
                                        required_rooms = self.subject_rooms[subject_key].get('lab', [])
                                        if required_rooms:
                                            break
                                if required_rooms:
                                    break

                        # Fallback: all lab rooms
                        if not required_rooms:
                            for subj, rooms_dict in self.subject_rooms.items():
                                if not subj.startswith('keyword'):
                                    required_rooms.extend(rooms_dict.get('lab', []))
                            required_rooms = list(set(required_rooms))

                        if not required_rooms:
                            # if not enough lab rooms in mapping, fallback to later rooms
                            if len(self.room_data) > 8:
                                required_rooms = list(self.room_data['Rooms'])[8:]
                            else:
                                required_rooms = list(self.room_data['Rooms'])

                        session = {
                            'id': session_id,
                            'faculty': current_faculty,
                            'course': course_name,
                            'batch': batch,
                            'type': 'Lab',
                            'duration': 2,
                            'rooms': required_rooms
                        }

                        self.sessions.append(session)
                        self.faculty_sessions[current_faculty].append(session_id)
                        self.batch_sessions[batch].append(session_id)
                        session_id += 1

                    # leftover 1-hour: treat as a Tutorial (1-slot) scheduled like Theory
                    if leftover == 1:
                        # use theory rooms for tutorials (fallback same as theory)
                        required_rooms = self.subject_rooms.get('Gen', {}).get('theory', [])
                        if not required_rooms:
                            required_rooms = []
                            for subj, rooms_dict in self.subject_rooms.items():
                                if not subj.startswith('keyword'):
                                    required_rooms.extend(rooms_dict.get('theory', []))
                            required_rooms = list(set(required_rooms))

                        if not required_rooms:
                            required_rooms = list(self.room_data['Rooms'])[:8]

                        session = {
                            'id': session_id,
                            'faculty': current_faculty,
                            'course': course_name + " (Tutorial)",
                            'batch': batch,
                            'type': 'Tutorial',
                            'duration': 1,
                            'rooms': required_rooms
                        }

                        self.sessions.append(session)
                        self.faculty_sessions[current_faculty].append(session_id)
                        self.batch_sessions[batch].append(session_id)
                        session_id += 1

        print(f"  ✓ Total sessions: {len(self.sessions)}")
        print(f"  ✓ Theory: {sum(1 for s in self.sessions if s['type'] == 'Theory')}, "
              f"Lab: {sum(1 for s in self.sessions if s['type'] == 'Lab')}, "
              f"Tutorial: {sum(1 for s in self.sessions if s['type'] == 'Tutorial')}")
        return True

    def _build_time_domains(self):
        """
        Build mapping between a global time index and (day, slot_index),
        and precompute allowed starts for theory and labs.

        IMPORTANT:
         - Exclude lunch slot from theory/tutorial starts.
         - Exclude lab starts if start OR start+1 is lunch slot.
        """
        num_days = len(self.days)

        self.global_to_day_slot = {}
        self.allowed_theory_starts = []
        self.allowed_lab_starts = []

        # Use sorted keys for consistent ordering
        sorted_slots = sorted(self.time_slots.keys())

        # Map each (day, slot_index) to a unique global index and build allowed starts
        # global indices are 0-based and contiguous: day * time_slots_per_day + (slot_idx - 1)
        for day in range(num_days):
            for slot_idx in sorted_slots:
                global_idx = day * self.time_slots_per_day + (slot_idx - 1)
                self.global_to_day_slot[global_idx] = (day, slot_idx)

                # THEORY / TUTORIAL: exclude lunch slot starts
                if slot_idx != self.lunch_break_index:
                    self.allowed_theory_starts.append(global_idx)

        # Lab slots (start indices within a day, 1-based)
        # These are the allowed starting slots, but must ensure:
        #  - they exist in time_slots
        #  - slot_idx + 1 also exists (for 2-hour lab)
        # Keep your original preferred lab start choices
        lab_slots = [1, 3, 6, 8]

        for day in range(num_days):
            for slot_idx in lab_slots:
                # both slot_idx and slot_idx+1 must be valid slots
                if slot_idx in self.time_slots and (slot_idx + 1) in self.time_slots:
                    # Do NOT allow lab to start at lunch slot (if defined as lunch_break_index)
                    # Also do NOT allow if the second slot is lunch
                    if slot_idx == self.lunch_break_index or (slot_idx + 1) == self.lunch_break_index:
                        continue
                    global_idx = day * self.time_slots_per_day + (slot_idx - 1)
                    self.allowed_lab_starts.append(global_idx)

    def create_timetable_model(self):
        """Create optimized CP-SAT model using interval variables"""
        print("\n[3/5] Creating optimized model (interval-based)...")
        start_time = time.time()

        all_batches = list(self.batch_sessions.keys())
        all_faculties = list(self.faculty_sessions.keys())
        all_rooms = list(self.room_data['Rooms'])

        # Build time domains and mappings
        self._build_time_domains()

        # Compute which global indices correspond to online vs offline days
        self.online_global_indices = set()
        self.offline_global_indices = set()
        for g, (day_idx, slot_idx) in self.global_to_day_slot.items():
            if day_idx < len(self.online_days) and self.online_days[day_idx] == 1:
                self.online_global_indices.add(g)
            else:
                self.offline_global_indices.add(g)

        online_day_names = [self.days[i] for i, v in enumerate(self.online_days) if v == 1]
        if online_day_names:
            print(f"  Online teaching days: {', '.join(online_day_names)}")
        else:
            print("  Online teaching days: none (all days use physical rooms)")

        # Domain objects for theory and lab starts
        # If allowed starts are empty (safety), fall back to all global indices that are not lunch
        if not self.allowed_theory_starts:
            # build fallback from global_to_day_slot excluding lunch
            self.allowed_theory_starts = [g for g, (d, s) in self.global_to_day_slot.items() if s != self.lunch_break_index]
        if not self.allowed_lab_starts:
            # conservative fallback: any start where next slot exists and neither is lunch
            fallback_lab = []
            for g, (d, s) in self.global_to_day_slot.items():
                next_slot_idx = s + 1
                if next_slot_idx in self.time_slots:
                    if s != self.lunch_break_index and next_slot_idx != self.lunch_break_index:
                        fallback_lab.append(g)
            self.allowed_lab_starts = fallback_lab

        theory_domain = cp_model.Domain.FromValues(self.allowed_theory_starts) if self.allowed_theory_starts else cp_model.Domain.FromIntervals([(0, 0)])
        lab_domain = cp_model.Domain.FromValues(self.allowed_lab_starts) if self.allowed_lab_starts else cp_model.Domain.FromIntervals([(0, 0)])

        # Create base intervals (one per session)
        print("  Creating session intervals and room choices...")

        room_to_optional_intervals = defaultdict(list)  # room -> list of optional intervals
        faculty_to_intervals = defaultdict(list)        # faculty -> list of base intervals
        batch_to_intervals = defaultdict(list)          # batch -> list of base intervals

        total_optional_intervals = 0

        for session in self.sessions:
            sid = session['id']
            duration = session['duration']
            faculty = session['faculty']
            batch = session['batch']
            candidate_rooms = session['rooms'] or all_rooms

            # Time variables for this session
            if session['type'] == 'Lab':
                start_var = self.model.NewIntVarFromDomain(lab_domain, f"start_s{sid}")
            else:
                # Theory and Tutorial both use the 1-slot theory domain
                start_var = self.model.NewIntVarFromDomain(theory_domain, f"start_s{sid}")

            end_var = self.model.NewIntVar(0, max(self.global_to_day_slot.keys()) + duration,
                                           f"end_s{sid}")

            # Interval for resource constraints (faculty & batch)
            interval = self.model.NewIntervalVar(start_var, duration, end_var, f"interval_s{sid}")

            self.session_starts[sid] = start_var
            self.session_ends[sid] = end_var
            self.session_intervals[sid] = interval

            faculty_to_intervals[faculty].append(interval)
            batch_to_intervals[batch].append(interval)

            # Room choice: exactly one room per session
            room_bools = []

            # Physical rooms: optional intervals with NoOverlap
            for room_name in candidate_rooms:
                rn = str(room_name).replace(" ", "").replace("-", "")
                assign_var = self.model.NewBoolVar(f"assign_s{sid}r{rn}")
                self.session_room_bools[sid][room_name] = assign_var
                opt_interval = self.model.NewOptionalIntervalVar(
                    start_var, duration, end_var, assign_var,
                    f"opt_interval_s{sid}r{rn}"
                )
                room_to_optional_intervals[room_name].append(opt_interval)
                room_bools.append(assign_var)
                total_optional_intervals += 1

            # virtual ONLINE room (no NoOverlap, unlimited capacity)
            online_var = self.model.NewBoolVar(f"assign_s{sid}_ONLINE")
            self.session_room_bools[sid]['ONLINE'] = online_var
            room_bools.append(online_var)

            # Exactly one among all (physical + ONLINE)
            self.model.AddExactlyOne(room_bools)

            # Link ONLINE variable with online/offline day indices
            # If scheduled on an online global index -> ONLINE must be 1
            if self.online_global_indices:
                tuples_online_must_be_true = [(g, 0) for g in self.online_global_indices]
                self.model.AddForbiddenAssignments([start_var, online_var], tuples_online_must_be_true)

            # If scheduled on an offline global index -> ONLINE must be 0 (must use physical room)
            if self.offline_global_indices:
                tuples_online_must_be_false = [(g, 1) for g in self.offline_global_indices]
                self.model.AddForbiddenAssignments([start_var, online_var], tuples_online_must_be_false)

        print(f"  ✓ Created {len(self.sessions)} base intervals")
        print(f"  ✓ Created {total_optional_intervals} optional room intervals")

        # CONSTRAINT: Room conflicts (NoOverlap per room)
        print("  Adding C2: Room conflicts (NoOverlap per room)...")
        for room_name, intervals in room_to_optional_intervals.items():
            if len(intervals) > 1:
                self.model.AddNoOverlap(intervals)

        # CONSTRAINT: Faculty conflicts (NoOverlap per faculty)
        print("  Adding C3: Faculty conflicts (NoOverlap per faculty)...")
        for faculty, intervals in faculty_to_intervals.items():
            if len(intervals) > 1:
                self.model.AddNoOverlap(intervals)

        # CONSTRAINT: Batch conflicts (NoOverlap per batch)
        print("  Adding C4: Batch conflicts (NoOverlap per batch)...")
        for batch, intervals in batch_to_intervals.items():
            if len(intervals) > 1:
                self.model.AddNoOverlap(intervals)

        # CONSTRAINT: Parent batch and sub-batch conflicts (only parent vs subs)
        print("  Adding C5: Parent-subbatch conflicts (parent vs subs only)...")
        parent_subbatch_map = defaultdict(lambda: {'parent': None, 'subs': []})
        for batch in all_batches:
            if '-' in batch:
                parent = batch.split('-')[0]
                parent_subbatch_map[parent]['subs'].append(batch)
            else:
                parent_subbatch_map[batch]['parent'] = batch

        # We only prevent parent batch from clashing with its sub-batches.
        # Sub-batches are allowed to clash with each other (different rooms).
        batch_session_ids = defaultdict(list)  # batch -> [session_ids]
        for s in self.sessions:
            batch_session_ids[s['batch']].append(s['id'])

        for parent, info in parent_subbatch_map.items():
            parent_batch = info['parent']
            sub_batches = info['subs']
            if not parent_batch or not sub_batches:
                continue

            parent_sids = batch_session_ids.get(parent_batch, [])
            for sub in sub_batches:
                sub_sids = batch_session_ids.get(sub, [])
                for psid in parent_sids:
                    for ssid in sub_sids:
                        # NoOverlap on just the two intervals (parent vs that sub session)
                        self.model.AddNoOverlap([
                            self.session_intervals[psid],
                            self.session_intervals[ssid]
                        ])

        # SOFT CONSTRAINTS: faculty spread + batch compactness
        print("  Adding C6: Faculty spread across week (soft)...")
        print("  Adding C7: Batch schedule compactness / no gaps (soft)...")
        self._add_soft_objective()

        print(f"  ✓ Model created in {time.time() - start_time:.2f}s")
        return True

    def _add_soft_objective(self):
        """
        Soft constraints via objective minimization:
          - Faculty spread: penalise faculty who have no session on some day
            (target = min(num_sessions, num_days) distinct active days).
          - Batch compactness: penalise gap slots between a batch's first and
            last session on any given day (students should not sit idle between
            lectures). Lunch contributes +1 to span on lunch-crossing days —
            accepted as a small systematic offset.
        """
        num_days = len(self.days)
        slots_per_day = self.time_slots_per_day

        # Per-session day / slot derived vars via Div/Mod on the global start.
        day_of = {}
        slot_of = {}
        for session in self.sessions:
            sid = session['id']
            start_var = self.session_starts[sid]
            day_v = self.model.NewIntVar(0, num_days - 1, f"day_s{sid}")
            slot_v = self.model.NewIntVar(0, slots_per_day - 1, f"slot_s{sid}")
            self.model.AddDivisionEquality(day_v, start_var, slots_per_day)
            self.model.AddModuloEquality(slot_v, start_var, slots_per_day)
            day_of[sid] = day_v
            slot_of[sid] = slot_v

        # session_on_day[sid][d] = True iff session sid is scheduled on day d
        session_on_day = {}
        for session in self.sessions:
            sid = session['id']
            session_on_day[sid] = {}
            for d in range(num_days):
                b = self.model.NewBoolVar(f"sod_s{sid}_d{d}")
                self.model.Add(day_of[sid] == d).OnlyEnforceIf(b)
                self.model.Add(day_of[sid] != d).OnlyEnforceIf(b.Not())
                session_on_day[sid][d] = b

        # --- Faculty spread ---
        faculty_idle_penalty = []
        for fac_idx, (faculty, sids) in enumerate(self.faculty_sessions.items()):
            if not sids:
                continue
            n = len(sids)
            day_active = []
            for d in range(num_days):
                a = self.model.NewBoolVar(f"fac{fac_idx}_d{d}")
                # a == OR over sids of session_on_day[sid][d]
                self.model.AddMaxEquality(a, [session_on_day[sid][d] for sid in sids])
                day_active.append(a)

            target = min(n, num_days)
            active_sum = self.model.NewIntVar(0, num_days, f"fac{fac_idx}_active")
            self.model.Add(active_sum == sum(day_active))

            pen = self.model.NewIntVar(0, num_days, f"fac{fac_idx}_pen")
            self.model.Add(pen == target - active_sum)
            faculty_idle_penalty.append(pen)

        # --- Batch compactness (no gaps between a batch's lectures on a day) ---
        batch_gap_terms = []
        BIG = slots_per_day + 5
        NEG = -5
        for b_idx, (batch, sids) in enumerate(self.batch_sessions.items()):
            if not sids:
                continue
            for d in range(num_days):
                eff_starts = []
                eff_ends = []
                dur_contribs = []
                on_bools = []
                for sid in sids:
                    dur = self.sessions[sid]['duration']
                    on = session_on_day[sid][d]
                    on_bools.append(on)

                    es = self.model.NewIntVar(0, BIG, f"es_b{b_idx}_d{d}_s{sid}")
                    self.model.Add(es == slot_of[sid]).OnlyEnforceIf(on)
                    self.model.Add(es == BIG).OnlyEnforceIf(on.Not())
                    eff_starts.append(es)

                    ee = self.model.NewIntVar(NEG, BIG, f"ee_b{b_idx}_d{d}_s{sid}")
                    self.model.Add(ee == slot_of[sid] + (dur - 1)).OnlyEnforceIf(on)
                    self.model.Add(ee == NEG).OnlyEnforceIf(on.Not())
                    eff_ends.append(ee)

                    c = self.model.NewIntVar(0, dur, f"c_b{b_idx}_d{d}_s{sid}")
                    self.model.Add(c == dur).OnlyEnforceIf(on)
                    self.model.Add(c == 0).OnlyEnforceIf(on.Not())
                    dur_contribs.append(c)

                any_on = self.model.NewBoolVar(f"any_b{b_idx}_d{d}")
                self.model.AddMaxEquality(any_on, on_bools)

                min_start = self.model.NewIntVar(0, BIG, f"mn_b{b_idx}_d{d}")
                max_end = self.model.NewIntVar(NEG, BIG, f"mx_b{b_idx}_d{d}")
                self.model.AddMinEquality(min_start, eff_starts)
                self.model.AddMaxEquality(max_end, eff_ends)

                total_dur = self.model.NewIntVar(0, slots_per_day + 5, f"td_b{b_idx}_d{d}")
                self.model.Add(total_dur == sum(dur_contribs))

                # gap = span - total_dur when any session on day, else 0
                # span = max_end - min_start + 1
                gap = self.model.NewIntVar(0, slots_per_day, f"gap_b{b_idx}_d{d}")
                self.model.Add(gap == (max_end - min_start + 1) - total_dur).OnlyEnforceIf(any_on)
                self.model.Add(gap == 0).OnlyEnforceIf(any_on.Not())
                batch_gap_terms.append(gap)

        # --- Objective ---
        # Heavy weight on faculty spread since user wants "no days off for faculty".
        FAC_WEIGHT = 20
        GAP_WEIGHT = 5
        self.model.Minimize(
            FAC_WEIGHT * sum(faculty_idle_penalty) +
            GAP_WEIGHT * sum(batch_gap_terms)
        )

        print(f"    ✓ Faculty spread terms: {len(faculty_idle_penalty)} "
              f"(weight={FAC_WEIGHT})")
        print(f"    ✓ Batch gap terms: {len(batch_gap_terms)} "
              f"(weight={GAP_WEIGHT})")

    def solve(self, time_limit=300):
        """Solve with optimized parameters"""
        print(f"\n[4/5] Solving (limit: {time_limit}s)...")

        self.solver.parameters.max_time_in_seconds = time_limit
        self.solver.parameters.num_search_workers = 8

        # Keep presolve and linearization on
        self.solver.parameters.cp_model_presolve = True
        self.solver.parameters.linearization_level = 2

        # Turn off verbose logging for speed
        self.solver.parameters.log_search_progress = False

        start_time = time.time()
        status = self.solver.Solve(self.model)
        solve_time = time.time() - start_time

        print(f"  ✓ Solved in {solve_time:.2f}s")

        if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            print(f"  ✓ Solution found! (Status: {status})")
            return True
        else:
            print("  ✗ No solution found!")
            return False

    def extract_solution(self):
        """Extract solution from compact interval model (O(n))"""
        print("\n[5/5] Extracting solution...")

        solution = []

        for session in self.sessions:
            sid = session['id']
            duration = session['duration']
            batch = session['batch']
            course = session['course']
            faculty = session['faculty']
            st = self.solver.Value(self.session_starts[sid])

            # Map global start index -> (day, slot_index)
            day, slot_idx = self.global_to_day_slot[st]
            time_str = self.time_slots[slot_idx]

            if duration == 2:
                next_slot_idx = slot_idx + 1
                if next_slot_idx in self.time_slots:
                    time_str = f"{time_str} & {self.time_slots[next_slot_idx]}"

            # Find chosen room (including ONLINE)
            chosen_room = None
            for room_name, var in self.session_room_bools[sid].items():
                if self.solver.Value(var):
                    chosen_room = room_name
                    break

            if chosen_room is None:
                # This should not happen if model is correct, but guard anyway
                chosen_room = "UNASSIGNED"

            solution.append({
                'Day': self.days[day],
                'Time': time_str,
                'Batch': batch,
                'Course': course,
                'Faculty': faculty,
                'Room': chosen_room,
                'Type': session['type'],
                '_sort_day': day,
                '_sort_slot': slot_idx
            })

        # Sort by day, slot, then batch
        solution.sort(key=lambda x: (x['_sort_day'], x['_sort_slot'], x['Batch']))

        # Remove internal sort keys
        for row in solution:
            del row['_sort_day'], row['_sort_slot']

        print(f"  ✓ Scheduled: {len(solution)} sessions")
        return solution

    def save_timetable(self, solution, output_file):
        """Save to Excel with separate sheets for divisions, faculties, and rooms"""
        print(f"\nSaving timetable to {output_file}...")

        df = pd.DataFrame(solution)
        if df.empty:
            print("  ✗ No scheduled sessions to save.")
            return

        column_order = ['Day', 'Time', 'Batch', 'Course', 'Faculty', 'Room', 'Type']
        df = df[column_order]

        # Define all divisions (parent batches)
        divisions = [
            'CS1', 'CS2', 'CS3', 'CS4', 'CS5', 'CS6', 'CS7', 'CS8', 'CS9',
            'IT', 'SOFT', 'AIML', 'DS',
            'ENTC1', 'ENTC2', 'ENTC3',
            'CHEM', 'MECH', 'CIVIL'
        ]

        def get_parent_batch(batch):
            return batch.split('-')[0] if '-' in batch else batch
        
        # Day order for sorting
        day_order = {'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5}

        with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
            # 1. Overview sheet
            df.to_excel(writer, sheet_name='Overview', index=False)

            # 2. Division-specific sheets (19 sheets)
            for division in divisions:
                division_df = df[df['Batch'].apply(lambda x: get_parent_batch(x) == division)].copy()
                if not division_df.empty:
                    # Sort by Day -> Time -> Batch
                    division_df['_day_order'] = division_df['Day'].map(day_order)
                    division_df = division_df.sort_values(['_day_order', 'Time', 'Batch'])
                    division_df = division_df.drop('_day_order', axis=1)
                    division_df.to_excel(writer, sheet_name=division, index=False)
            
            # 3. Faculty sheets (one per faculty)
            faculties = sorted(df['Faculty'].unique())
            for faculty in faculties:
                fac_df = df[df['Faculty'] == faculty].copy()
                if not fac_df.empty:
                    # Sort by Day -> Time
                    fac_df['_day_order'] = fac_df['Day'].map(day_order)
                    fac_df = fac_df.sort_values(['_day_order', 'Time'])
                    fac_df = fac_df.drop('_day_order', axis=1)
                    # Limit sheet name to 31 chars
                    sheet_name = f"F_{faculty}"[:31]
                    fac_df.to_excel(writer, sheet_name=sheet_name, index=False)
            
            # 4. Room sheets (one per room)
            rooms = sorted(df['Room'].unique())
            for room in rooms:
                room_df = df[df['Room'] == room].copy()
                if not room_df.empty:
                    # Sort by Day -> Time
                    room_df['_day_order'] = room_df['Day'].map(day_order)
                    room_df = room_df.sort_values(['_day_order', 'Time'])
                    room_df = room_df.drop('_day_order', axis=1)
                    # Limit sheet name to 31 chars
                    sheet_name = f"R_{room}"[:31]
                    room_df.to_excel(writer, sheet_name=sheet_name, index=False)

        total_sheets = 1 + len(divisions) + len(faculties) + len(rooms)
        print(f"  ✓ Saved successfully with {total_sheets} sheets!")
        print(f"    - 1 Overview + {len(divisions)} Divisions + {len(faculties)} Faculty + {len(rooms)} Rooms")
        print("\nSample timetable (Overview):")
        print("-" * 110)
        print(df.head(15).to_string(index=False))
        if len(df) > 15:
            print(f"\n... ({len(df) - 15} more rows)")

def run_fy_scheduler(input_file, run_number, online_config_json='{}'):
    """Run FY scheduler for a specific run number with online configuration"""
    scheduler = OptimizedTimetableScheduler()
    
    # Parse and apply online config
    import json
    online_config = json.loads(online_config_json) if online_config_json else {}
    if 'FY' in online_config:
        scheduler.online_days = online_config['FY']
    
    print(f'FY Scheduler Run {run_number} - Online days: {scheduler.online_days}')
    
    if not scheduler.load_data(input_file):
        return False
    
    if not scheduler.parse_faculty_assignments():
        return False
    
    if not scheduler.create_timetable_model():
        return False
    
    if scheduler.solve(time_limit=300):
        solution = scheduler.extract_solution()
        output_file = f'final_timetable_run{run_number}.xlsx'
        scheduler.save_timetable(solution, output_file)
        return True
    else:
        return False


def main():
    scheduler = OptimizedTimetableScheduler()

    # If you want to change online days globally, edit here or in _init_:
    # Example: Friday + Saturday online -> [0,0,0,0,1,1]
    # scheduler.online_days = [0, 0, 0, 0, 1, 1]

    if not scheduler.load_data('FY.xlsx'):
        return

    if not scheduler.parse_faculty_assignments():
        return

    if not scheduler.create_timetable_model():
        return

    if scheduler.solve(time_limit=1500):
        solution = scheduler.extract_solution()
        scheduler.save_timetable(solution, 'FY_TT.xlsx')
        print("\n" + "=" * 60)
        print("SUCCESS: Timetable generated with division sheets!")
        print("=" * 60)
    else:
        print("\nFailed to generate timetable. Try adjusting constraints or time limit.")


if __name__ == "__main__":
    main()