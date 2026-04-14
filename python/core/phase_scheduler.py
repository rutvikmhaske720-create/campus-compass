import time
import os
import random
from collections import defaultdict
from ortools.sat.python import cp_model

from config import (
    TIME_SLOTS,
    DAYS,
    PHASE_TIME_LIMIT,
    NUM_WORKERS,
    PHASE_TIME_LIMITS,
    SEED,
    SY_ONLINE_DAYS,
    TY_ONLINE_DAYS,
)


def schedule_phases(sessions, feasible, idx_to_room, ONLINE_ROOM_IDX, run_num):
    """CP-SAT phase scheduling with partial assignment + dynamic randomness."""
    
    # Re-import online config to get latest values
    import config
    global SY_ONLINE_DAYS, TY_ONLINE_DAYS
    SY_ONLINE_DAYS = config.SY_ONLINE_DAYS
    TY_ONLINE_DAYS = config.TY_ONLINE_DAYS

    session_by_id = {s["id"]: s for s in sessions}
    assignments = []
    remaining = set(s["id"] for s in sessions)

    pec_sessions = [s["id"] for s in sessions if s["is_pec"]]
    mdm_sessions = [s["id"] for s in sessions if s["is_mdm"] and not s["is_pec"]]
    vsec_sessions = [s["id"] for s in sessions if s.get("is_vsec", False) and not s["is_mdm"] and not s["is_pec"]]
    other_sessions = [s["id"] for s in sessions if not s["is_mdm"] and not s["is_pec"] and not s.get("is_vsec", False)]

    print(
        f"\nPHASE DISTRIBUTION: PEC={len(pec_sessions)}, MDM={len(mdm_sessions)}, VSEC={len(vsec_sessions)}, OTHERS={len(other_sessions)}"
    )

    # -----------------------------
    # INTERNAL PHASE SOLVER
    # -----------------------------
    def solve_phase(name, phase_list):
        if not phase_list:
            print(f"\n=== PHASE {name}: 0 sessions ===")
            return

        # ---------- RANDOMNESS FIX ----------
        if SEED is not None:
            base_raw = SEED
        else:
            base_raw = int(time.time() * 1000) ^ int.from_bytes(os.urandom(4), "big")

        # Reduce to 32-bit safe:
        base = base_raw % 2_000_000_000

        rnd = random.Random(base + run_num * 999)
        phase_list = list(phase_list)
        rnd.shuffle(phase_list)

        print(f"\n=== PHASE {name}: scheduling {len(phase_list)} sessions ===")

        model = cp_model.CpModel()
        vars_dict = {}
        session_vars = defaultdict(list)
        chosen_vars = []

        # Build variables
        for sid in phase_list:
            opts = feasible.get(sid, [])
            if not opts:
                continue
            for d, t, ridx in opts:
                v = model.NewBoolVar(f"x_{sid}_{d}_{t}_{ridx}")
                vars_dict[(sid, d, t, ridx)] = v
                session_vars[sid].append((d, t, ridx, v))

        # Partial scheduling support
        for sid, opts in session_vars.items():
            chosen = model.NewBoolVar(f"chosen_{sid}")
            chosen_vars.append(chosen)

            for _, _, _, v in opts:
                model.Add(v <= chosen)

            model.Add(sum(v for (_, _, _, v) in opts) == chosen)

        # Build constraints
        room_slot = defaultdict(list)
        fac_slot = defaultdict(list)
        batch_slot = defaultdict(list)
        main_slot = defaultdict(list)
        sub_slot = defaultdict(list)
        mdmpec_slot = defaultdict(list)
        ty_non_slot = defaultdict(list)
        main_non_slot = defaultdict(list)
        tcbd = defaultdict(list)
        lcbd = defaultdict(list)
        TY_slot = defaultdict(lambda: defaultdict(list))

        for (sid, d, t, ridx), var in vars_dict.items():
            s = session_by_id[sid]
            slots = (t, t + 1) if s["type"] == "lab" else (t,)

            if ridx != ONLINE_ROOM_IDX:
                for sl in slots:
                    room_slot[(ridx, d, sl)].append(var)

            for sl in slots:
                fac_slot[(s["faculty"], d, sl)].append(var)
                batch_slot[(s["batch"], d, sl)].append(var)

            if s["is_sub"]:
                for sl in slots:
                    sub_slot[(s["batch_main"], d, sl)].append(var)
            else:
                for sl in slots:
                    main_slot[(s["batch_main"], d, sl)].append(var)

            for sl in slots:
                if s["is_mdm"] or s["is_pec"]:
                    mdmpec_slot[(d, sl)].append(var)
                else:
                    if not s["is_sub"]:
                        main_non_slot[(d, sl)].append(var)
                    if s["is_ty"]:
                        ty_non_slot[(d, sl)].append(var)

            if not s["is_mdm"] and not s["is_pec"] and not s["is_vsec"]:
                if s["type"] == "theory":
                    tcbd[(s["batch_main"], s["course"], d)].append(var)
                else:
                    lcbd[(s["batch"], s["course"], d)].append(var)

            if s["is_ty"]:
                TY_slot[s["batch"]][d].append(var)

        # Add constraints
        for lst in room_slot.values():
            if len(lst) > 1:
                model.Add(sum(lst) <= 1)
        for lst in fac_slot.values():
            if len(lst) > 1:
                model.Add(sum(lst) <= 1)
        for lst in batch_slot.values():
            if len(lst) > 1:
                model.Add(sum(lst) <= 1)

        keys = set(main_slot.keys()) | set(sub_slot.keys())
        for k in keys:
            m = main_slot.get(k, [])
            sb = sub_slot.get(k, [])
            if m and sb:
                model.Add(sum(m) + sum(sb) <= 1)

        keys = set(mdmpec_slot.keys()) | set(main_non_slot.keys())
        for k in keys:
            m = mdmpec_slot.get(k, [])
            n = main_non_slot.get(k, [])
            if m and n:
                model.Add(sum(m) + sum(n) <= 1)

        keys = set(mdmpec_slot.keys()) | set(ty_non_slot.keys())
        for k in keys:
            m = mdmpec_slot.get(k, [])
            n = ty_non_slot.get(k, [])
            if m and n:
                model.Add(sum(m) + sum(n) <= 1)

        for lst in tcbd.values():
            if len(lst) > 1:
                model.Add(sum(lst) <= 1)
        for lst in lcbd.values():
            if len(lst) > 1:
                model.Add(sum(lst) <= 1)

        # Minimal distribution for VSEC - only prevent extreme clustering
        if name == "VSEC":
            vsec_day_vars = defaultdict(list)
            for (sid, d, t, ridx), var in vars_dict.items():
                vsec_day_vars[d].append(var)
            
            # Only limit if we have many VSEC sessions
            total_vsec = sum(len(v) for v in vsec_day_vars.values())
            if total_vsec >= 10:
                max_per_day = max(3, int(total_vsec / 2))
                for d, lst in vsec_day_vars.items():
                    if len(lst) > max_per_day:
                        model.Add(sum(lst) <= max_per_day)
        
        # Only apply full distribution constraints for OTHERS phase
        elif name == "OTHERS":
            # Faculty day distribution - spread lectures across week
            faculty_day_vars = defaultdict(lambda: defaultdict(list))
            for (sid, d, t, ridx), var in vars_dict.items():
                s = session_by_id[sid]
                faculty_day_vars[s["faculty"]][d].append(var)
            
            for faculty, days in faculty_day_vars.items():
                total_vars = sum(len(v) for v in days.values())
                if total_vars >= 5:
                    max_per_day = max(2, int(total_vars / 3))
                    for d, lst in days.items():
                        if len(lst) > 0:
                            model.Add(sum(lst) <= max_per_day)
            
            # TY day distribution
            for batch, days in TY_slot.items():
                total = sum(len(v) for v in days.values())
                if total >= 5:
                    cap = max(1, int(total * 0.4))
                    for d, lst in days.items():
                        model.Add(sum(lst) <= cap)
            
            # Batch day distribution
            batch_day_vars = defaultdict(lambda: defaultdict(list))
            for (sid, d, t, ridx), var in vars_dict.items():
                s = session_by_id[sid]
                batch_day_vars[s["batch"]][d].append(var)
            
            for batch, days in batch_day_vars.items():
                total_vars = sum(len(v) for v in days.values())
                if total_vars >= 5:
                    max_per_day = max(1, int(total_vars / 3.5))
                    for d, lst in days.items():
                        if len(lst) > 0:
                            model.Add(sum(lst) <= max_per_day)
            
            # Global day balance - only set max, no min to avoid infeasibility
            day_totals = defaultdict(list)
            for (sid, d, t, ridx), var in vars_dict.items():
                day_totals[d].append(var)
            
            if len(day_totals) == 5:
                total_sessions = sum(len(v) for v in day_totals.values())
                avg_per_day = total_sessions / 5
                max_per_day = int(avg_per_day * 2.0)  # More relaxed max
                
                for d in range(5):
                    if day_totals[d]:
                        model.Add(sum(day_totals[d]) <= max_per_day)

        # ---------- Objective ----------
        objective = []

        # Much higher weight for VSEC to prioritize placement
        weight_multiplier = 50000 if name == "VSEC" else 10000
        for chosen in chosen_vars:
            objective.append(weight_multiplier * chosen)

        # Rotate day preference per run to distribute load
        order = {1: [0, 1, 2, 3, 4], 2: [4, 3, 2, 1, 0], 3: [2, 3, 4, 0, 1]}.get(run_num, [1, 2, 3, 4, 0])

        # Track faculty day usage for objective
        faculty_day_usage = defaultdict(lambda: defaultdict(int))
        
        for sid, opts in session_vars.items():
            s = session_by_id[sid]
            fewness = max(0, 50 - len(opts))

            for opt in opts:
                if len(opt) != 4:
                    continue
                d, t, ridx, v = opt
                w = 100 + fewness
                
                # Penalize days that already have many sessions for this faculty
                faculty_day_count = faculty_day_usage[s["faculty"]][d]
                w -= faculty_day_count * 5
                
                # Encourage Friday usage
                if d == 4:
                    w += 10
                
                # Minimal day rotation
                w += (5 - order.index(d)) * 0.3
                w -= t * 0.2

                if ridx == ONLINE_ROOM_IDX:
                    w -= 1

                if s["is_mdm_or_pec_or_vsec"] and t in (0, 2):
                    w += 1

                w += rnd.randint(0, 8)
                objective.append(w * v)
                
                faculty_day_usage[s["faculty"]][d] += 1

        model.Maximize(sum(objective))

        # ----------- Solver -----------
        solver = cp_model.CpSolver()
        solver.parameters.max_time_in_seconds = PHASE_TIME_LIMITS.get(
            name, PHASE_TIME_LIMIT
        )
        solver.parameters.num_search_workers = NUM_WORKERS

        # SAFE 32-bit SEED:
        seed32 = int((base + run_num * 77) % 2_000_000_000)
        solver.parameters.random_seed = seed32

        status = solver.Solve(model)
        print("Status:", solver.StatusName(status))

        if status not in (cp_model.OPTIMAL, cp_model.FEASIBLE):
            print(f"  ✗ Phase {name} failed with status: {solver.StatusName(status)}")
            return

        # Extract placements
        placed_count = 0
        for (sid, d, t, ridx), var in vars_dict.items():
            if solver.Value(var) == 1:
                s = session_by_id[sid]
                placed_count += 1
                
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
                
                assignments.append(
                    {
                        "Day": DAYS[d],
                        "DayIndex": d,
                        "StartSlot": t,
                        "Time": (
                            f"{TIME_SLOTS[t]} & {TIME_SLOTS[t+1]}"
                            if s["type"] == "lab"
                            else TIME_SLOTS[t]
                        ),
                        "Batch": s["batch"],
                        "BatchMain": s["batch_main"],
                        "Course": s["course"],
                        "Faculty": s["faculty"],
                        "Room": room_assignment,
                        "Type": "Lab" if s["type"] == "lab" else "Theory",
                        "is_mdm": s["is_mdm"],
                        "is_pec": s["is_pec"],
                        "is_ty": s["is_ty"],
                    }
                )
                if sid in remaining:
                    remaining.remove(sid)
        
        print(f"  ✓ Placed {placed_count}/{len(phase_list)} sessions in {name} phase")

    # Run all phases
    solve_phase("PEC", pec_sessions)
    
    # Greedy fallback for remaining PEC sessions
    pec_remaining = set([sid for sid in pec_sessions if sid in remaining])
    if pec_remaining:
        print(f"\n[PEC GREEDY] Attempting greedy placement for {len(pec_remaining)} remaining PEC sessions")
        from day_scheduler import schedule_remaining
        schedule_remaining(assignments, pec_remaining, sessions, feasible, idx_to_room, ONLINE_ROOM_IDX, run_num)
        # Update main remaining set
        for sid in list(pec_sessions):
            if sid not in pec_remaining:
                remaining.discard(sid)
        print(f"[PEC GREEDY] After greedy: {len(pec_remaining)} PEC still unscheduled")
    
    solve_phase("MDM", mdm_sessions)
    solve_phase("VSEC", vsec_sessions)
    
    # Greedy fallback for remaining VSEC sessions
    vsec_remaining = set([sid for sid in vsec_sessions if sid in remaining])
    if vsec_remaining:
        print(f"\n[VSEC GREEDY] Attempting greedy placement for {len(vsec_remaining)} remaining VSEC sessions")
        from day_scheduler import schedule_remaining
        schedule_remaining(assignments, vsec_remaining, sessions, feasible, idx_to_room, ONLINE_ROOM_IDX, run_num)
        # Update main remaining set
        for sid in list(vsec_sessions):
            if sid not in vsec_remaining:
                remaining.discard(sid)
        print(f"[VSEC GREEDY] After greedy: {len(vsec_remaining)} VSEC still unscheduled")
    
    solve_phase("OTHERS", other_sessions)

    return assignments, remaining
