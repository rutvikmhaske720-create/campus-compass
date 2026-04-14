from collections import defaultdict

from config import DAYS, TIME_SLOTS, SY_ONLINE_DAYS, TY_ONLINE_DAYS
from core.helpers import batch_main, is_sub, is_ty, is_sy


def schedule_remaining(
    assignments, remaining, sessions, feasible, idx_to_room, ONLINE_ROOM_IDX, run_num=1
):
    """
    Greedy day-by-day scheduling pass for sessions in `remaining`.
    Mutates `assignments` (append placements) and `remaining` (remove placed ids).

    This is intentionally conservative: it uses quick occupancy lookups and tries
    day-order alternate strategies to place sessions that CP couldn't handle.
    """
    if not remaining:
        return
    
    # Re-import online config to get latest values
    import config
    global SY_ONLINE_DAYS, TY_ONLINE_DAYS
    SY_ONLINE_DAYS = config.SY_ONLINE_DAYS
    TY_ONLINE_DAYS = config.TY_ONLINE_DAYS

    print(f"\n=== Day-by-day scheduling for {len(remaining)} remaining sessions ===")
    
    session_by_id = {s["id"]: s for s in sessions}
    
    # Show breakdown of what we're scheduling
    vsec_count = sum(1 for sid in remaining if session_by_id[sid].get("is_vsec", False))
    pec_count = sum(1 for sid in remaining if session_by_id[sid].get("is_pec", False))
    mdm_count = sum(1 for sid in remaining if session_by_id[sid].get("is_mdm", False))
    other_count = len(remaining) - vsec_count - pec_count - mdm_count
    print(f"  Breakdown: VSEC={vsec_count}, PEC={pec_count}, MDM={mdm_count}, Others={other_count}")

    # occupancy maps
    occ_room = defaultdict(set)  # (ridx,d) -> set(slots)
    occ_fac = defaultdict(set)  # (faculty,d) -> set(slots)
    occ_batch = defaultdict(set)  # (batch,d) -> set(slots)
    occ_main_sub = defaultdict(set)  # (bmain, is_sub, d) -> set(slots)
    occ_mdm_pec = defaultdict(set)  # d -> set(slots)
    occ_ty = defaultdict(set)  # d -> set(slots)
    occ_vsec = defaultdict(set)  # d -> set(slots)
    occ_ty_core = defaultdict(set)  # d -> set(slots) - TY non-MDM/PEC/VSEC

    occ_theory_course_batch_day = defaultdict(set)
    occ_lab_course_batch_day = defaultdict(set)
    batch_days = defaultdict(set)
    faculty_day_count = defaultdict(lambda: defaultdict(int))  # Track faculty sessions per day

    def slots_for(a):
        if a["Type"] == "Lab":
            return (a["StartSlot"], a["StartSlot"] + 1)
        else:
            return (a["StartSlot"],)

    name_to_ridx = {v: k for k, v in idx_to_room.items()}

    # Seed occupancy from already scheduled assignments (including pre-placed)
    for a in assignments:
        d = a["DayIndex"]
        b = a["Batch"]
        bmain = batch_main(b)
        ridx = name_to_ridx.get(a["Room"], ONLINE_ROOM_IDX)
        sset = set(slots_for(a))

        if ridx != ONLINE_ROOM_IDX and a["Room"] != "ONLINE (No Room)":
            occ_room[(ridx, d)].update(sset)
        occ_fac[(a["Faculty"], d)].update(sset)
        occ_batch[(b, d)].update(sset)
        occ_main_sub[(bmain, is_sub(b), d)].update(sset)

        if a["is_mdm"] or a["is_pec"]:
            occ_mdm_pec[d].update(sset)
        if a.get("is_ty", is_ty(b)):
            occ_ty[d].update(sset)
        if a.get("is_vsec", False):
            occ_vsec[d].update(sset)
        if a.get("is_ty", is_ty(b)) and not (a["is_mdm"] or a["is_pec"]):
            occ_ty_core[d].update(sset)

        if not (a["is_mdm"] or a["is_pec"] or a.get("is_vsec", False)):
            if a["Type"] == "Theory":
                occ_theory_course_batch_day[(bmain, a["Course"], d)].update(sset)
            else:
                occ_lab_course_batch_day[(b, a["Course"], d)].update(sset)

        if not (a["is_mdm"] or a["is_pec"]):
            batch_days[b].add(d)
        
        faculty_day_count[a["Faculty"]][d] += 1

    def can_place_session(s, d, t, ridx):
        slots = (t, t + 1) if s["type"] == "lab" else (t,)
        sset = set(slots)

        # Room conflict - check each slot individually for labs
        if ridx != ONLINE_ROOM_IDX:
            for sl in slots:
                if sl in occ_room[(ridx, d)]:
                    return False

        # Faculty conflict
        if sset & occ_fac[(s["faculty"], d)]:
            return False

        # Batch conflict
        if sset & occ_batch[(s["batch"], d)]:
            return False

        # Main-sub conflict
        if sset & occ_main_sub[(s["batch_main"], not s["is_sub"], d)]:
            return False

        # MDM/PEC isolation (VSEC excluded - has separate batches)
        if s["is_mdm"] or s["is_pec"]:
            if sset & occ_ty[d]:
                return False
        else:
            if s["is_ty"] and not s.get("is_vsec", False) and (sset & occ_mdm_pec[d]):
                return False

        # Same-course/day checks (exclude MDM/PEC/VSEC)
        if not s["is_mdm"] and not s["is_pec"] and not s.get("is_vsec", False):
            if s["type"] == "theory":
                key = (s["batch_main"], s["course"], d)
                if key in occ_theory_course_batch_day:
                    return False
            else:
                key = (s["batch"], s["course"], d)
                if key in occ_lab_course_batch_day:
                    return False

        return True

    def update_occupancy(s, d, t, ridx):
        slots = (t, t + 1) if s["type"] == "lab" else (t,)
        sset = set(slots)
        b = s["batch"]
        bmain = s["batch_main"]

        if ridx != ONLINE_ROOM_IDX:
            occ_room[(ridx, d)].update(sset)
        occ_fac[(s["faculty"], d)].update(sset)
        occ_batch[(b, d)].update(sset)
        occ_main_sub[(bmain, s["is_sub"], d)].update(sset)

        if s["is_mdm"] or s["is_pec"]:
            occ_mdm_pec[d].update(sset)
        if s["is_ty"]:
            occ_ty[d].update(sset)
        if s.get("is_vsec", False):
            occ_vsec[d].update(sset)
        if s["is_ty"] and not s["is_mdm"] and not s["is_pec"]:
            occ_ty_core[d].update(sset)

        if not s["is_mdm"] and not s["is_pec"] and not s.get("is_vsec", False):
            if s["type"] == "theory":
                occ_theory_course_batch_day[(bmain, s["course"], d)].update(sset)
            else:
                occ_lab_course_batch_day[(b, s["course"], d)].update(sset)

        if not s["is_mdm_or_pec"]:
            batch_days[b].add(d)
        
        faculty_day_count[s["faculty"]][d] += 1

    # Day ordering strategies (different per run to diversify)
    if run_num == 1:
        day_order = [0, 1, 2, 3, 4]
    elif run_num == 2:
        day_order = [1, 2, 3, 4, 0]
    else:
        day_order = [2, 3, 4, 0, 1]

    pass_count = 0
    max_passes = 10  # Limit passes to prevent infinite loops
    
    while remaining and pass_count < max_passes:
        pass_count += 1
        pass_placed_total = 0
        print(f"\n--- Pass {pass_count} starting with {len(remaining)} unscheduled sessions ---")

        for day in day_order:
            if not remaining:
                break

            day_candidates = [
                sid
                for sid in list(remaining)
                if any(len(opt) >= 3 and opt[0] == day for opt in feasible.get(sid, []))
            ]
            if not day_candidates:
                # Don't print for every day with no candidates to reduce noise
                continue

            # Prioritize sessions: VSEC first, then by faculty load
            def priority(sid):
                s = session_by_id[sid]
                b = s["batch"]
                fac = s["faculty"]
                
                # Highest priority: VSEC sessions (most constrained)
                vsec_priority = 0 if s.get("is_vsec", False) else 10000
                
                # Primary: faculty with fewer sessions on this day
                fac_count = faculty_day_count[fac][day]
                
                # Secondary: batches with no classes on this day
                batch_priority = 0
                if not s["is_mdm_or_pec"] and day not in batch_days[b]:
                    batch_priority = -1000
                
                # Tertiary: sessions with fewer options
                options = 0
                for opt in feasible.get(sid, []):
                    if len(opt) >= 3 and opt[0] == day:
                        options += 1
                
                return (vsec_priority, fac_count * 100, batch_priority, options)

            day_candidates.sort(key=priority)
            placed_count = 0

            for sid in day_candidates:
                s = session_by_id[sid]
                placed = False

                day_options = [
                    (d, t, r) for opt in feasible.get(sid, []) 
                    if len(opt) >= 3 
                    for d, t, r in [opt[:3]] 
                    if d == day
                ]
                # Sort by room (ONLINE last) then by slot
                day_options.sort(
                    key=lambda x: (0 if x[2] == ONLINE_ROOM_IDX else 1, x[1])
                )

                for d, t, ridx in day_options:
                    if can_place_session(s, d, t, ridx):
                        # Check if this session should be online based on day and year
                        should_be_online = False
                        if d < 5:  # Only Mon-Fri
                            if s["is_ty"]:
                                should_be_online = TY_ONLINE_DAYS[d] == 1
                            elif is_sy(s["batch"]):
                                should_be_online = SY_ONLINE_DAYS[d] == 1
                        
                        # Determine room assignment
                        if should_be_online or ridx == ONLINE_ROOM_IDX:
                            room_name = "ONLINE"
                        else:
                            room_name = idx_to_room[ridx]
                        
                        time_str = (
                            f"{TIME_SLOTS[t]} & {TIME_SLOTS[t+1]}"
                            if s["type"] == "lab"
                            else TIME_SLOTS[t]
                        )

                        assignments.append(
                            {
                                "Day": DAYS[d],
                                "DayIndex": d,
                                "StartSlot": t,
                                "Time": time_str,
                                "Batch": s["batch"],
                                "BatchMain": s["batch_main"],
                                "Course": s["course"],
                                "Faculty": s["faculty"],
                                "Room": room_name,
                                "Type": "Lab" if s["type"] == "lab" else "Theory",
                                "is_mdm": s["is_mdm"],
                                "is_pec": s["is_pec"],
                                "is_ty": s["is_ty"],
                            }
                        )

                        update_occupancy(s, d, t, ridx)
                        remaining.remove(sid)
                        placed = True
                        placed_count += 1
                        
                        # Log VSEC placements for debugging
                        if s.get("is_vsec", False):
                            print(f"    [VSEC] Placed {s['batch']} - {s['course']} on {DAYS[d]} slot {t} in {room_name}")
                        break

                if not placed:
                    # Try any feasible slot across all days as fallback
                    for opt in feasible.get(sid, []):
                        if len(opt) < 3:
                            continue
                        d, t, ridx = opt[:3]
                        if can_place_session(s, d, t, ridx):
                            # Check if this session should be online based on day and year
                            should_be_online = False
                            if d < 5:  # Only Mon-Fri
                                if s["is_ty"]:
                                    should_be_online = TY_ONLINE_DAYS[d] == 1
                                elif is_sy(s["batch"]):
                                    should_be_online = SY_ONLINE_DAYS[d] == 1
                            
                            # Determine room assignment
                            if should_be_online or ridx == ONLINE_ROOM_IDX:
                                room_name = "ONLINE"
                            else:
                                room_name = idx_to_room[ridx]
                            
                            time_str = (
                                f"{TIME_SLOTS[t]} & {TIME_SLOTS[t+1]}"
                                if s["type"] == "lab"
                                else TIME_SLOTS[t]
                            )

                            assignments.append(
                                {
                                    "Day": DAYS[d],
                                    "DayIndex": d,
                                    "StartSlot": t,
                                    "Time": time_str,
                                    "Batch": s["batch"],
                                    "BatchMain": s["batch_main"],
                                    "Course": s["course"],
                                    "Faculty": s["faculty"],
                                    "Room": room_name,
                                    "Type": "Lab" if s["type"] == "lab" else "Theory",
                                    "is_mdm": s["is_mdm"],
                                    "is_pec": s["is_pec"],
                                    "is_ty": s["is_ty"],
                                }
                            )

                            update_occupancy(s, d, t, ridx)
                            remaining.remove(sid)
                            placed = True
                            placed_count += 1
                            break

            if placed_count > 0:
                print(f"  ✓ {DAYS[day]}: placed {placed_count}/{len(day_candidates)} candidates")
                pass_placed_total += placed_count
            else:
                print(f"  ✗ {DAYS[day]}: placed 0/{len(day_candidates)} candidates (conflicts)")

        print(f"--- Pass {pass_count} complete: placed {pass_placed_total} sessions, {len(remaining)} remaining ---")
        
        if pass_placed_total == 0:
            print(f"\n⚠ No sessions placed in pass {pass_count}, stopping greedy scheduler.")
            # Print diagnostic for why sessions can't be placed
            if remaining and len(remaining) <= 10:
                print(f"\nDiagnostic for {len(remaining)} unscheduled sessions:")
                for sid in list(remaining)[:10]:
                    s = session_by_id[sid]
                    opts_count = len(feasible.get(sid, []))
                    print(f"  • {sid}: {s['batch']} - {s['course']} ({s['type']}) - {opts_count} feasible options")
            break

    if remaining:
        vsec_left = sum(1 for sid in remaining if session_by_id[sid].get("is_vsec", False))
        print(f"\n[DAY-BY-DAY] Finished with {len(remaining)} sessions still unscheduled.")
        print(f"  VSEC unscheduled: {vsec_left}/{vsec_count}")
    else:
        print("\n[DAY-BY-DAY] ✓ All remaining sessions scheduled successfully!")
