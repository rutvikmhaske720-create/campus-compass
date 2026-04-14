from collections import defaultdict

from config import (
    DAY_COUNT,
    SLOT_COUNT,
    DAYS,
    THEORY_SLOTS,
    LAB_START_SLOTS,
)


def compute_feasible(
    sessions,
    theory_rooms,
    lab_rooms,
    room_to_idx,
    ONLINE_ROOM_IDX,
    *,
    verbose=True,
    relax_tuesday_online_policy=False,
):
    """
    Return dict: sid -> list of (d, t, ridx).
    Improvements:
      - Verbose diagnostics summary printed when verbose=True
      - Optionally allow relaxing the 'TY Tuesday -> ONLINE only' rule via
        relax_tuesday_online_policy (useful for debugging / increasing feasibility)
    """
    # Read latest config at call time so per-request updates are honored
    import config
    SY_ONLINE_DAYS = config.SY_ONLINE_DAYS
    TY_ONLINE_DAYS = config.TY_ONLINE_DAYS
    FACULTY_AVAIL = config.FACULTY_AVAILABILITY
    SY_LUNCH_SLOT = config.SY_LUNCH_SLOT
    TY_LUNCH_SLOT = config.TY_LUNCH_SLOT
    TY_MDM_THEORY_SLOTS = config.TY_MDM_THEORY_SLOTS
    TY_MDM_LAB_SLOTS = config.TY_MDM_LAB_SLOTS
    TY_PEC_THEORY_SLOTS = config.TY_PEC_THEORY_SLOTS
    TY_PEC_LAB_SLOTS = config.TY_PEC_LAB_SLOTS
    TY_VSEC_THEORY_SLOTS = config.TY_VSEC_THEORY_SLOTS
    TY_VSEC_LAB_SLOTS = config.TY_VSEC_LAB_SLOTS
    
    feasible = {}
    noopts = []

    for s in sessions:
        sid_ = s["id"]
        opts = []

        # Check faculty availability for this session
        faculty_name = s.get("faculty", "")
        faculty_avail_matrix = FACULTY_AVAIL.get(faculty_name, None)
        
        # THEORIES
        if s["type"] == "theory":
            for d in range(DAY_COUNT):
                # Check if this session should be online on this day
                is_online_day = False
                if d < 5:  # Only Mon-Fri
                    if s["is_ty"]:
                        is_online_day = TY_ONLINE_DAYS[d] == 1
                    elif s["is_sy"]:
                        is_online_day = SY_ONLINE_DAYS[d] == 1
                
                # If online day, only use ONLINE room; otherwise use physical rooms
                if is_online_day:
                    room_indices = [ONLINE_ROOM_IDX]
                else:
                    room_indices = [room_to_idx[r] for r in theory_rooms]

                for t in THEORY_SLOTS:
                    # Check faculty availability for this specific day and time slot
                    if faculty_avail_matrix and d < 5:
                        if isinstance(faculty_avail_matrix, list) and len(faculty_avail_matrix) > d:
                            day_slots = faculty_avail_matrix[d]
                            if isinstance(day_slots, list) and len(day_slots) > t:
                                if day_slots[t] == 1:  # 1 = not available
                                    continue
                    
                    # lunch constraints
                    if s["is_sy"] and t == SY_LUNCH_SLOT:
                        continue
                    if s["is_ty"] and t == TY_LUNCH_SLOT:
                        continue

                    # MDM/PEC/VSEC theory reserved constraints
                    if s["is_mdm"]:
                        if t == TY_LUNCH_SLOT:
                            continue
                        if (d, t) not in TY_MDM_THEORY_SLOTS:
                            continue
                    if s["is_pec"]:
                        if t == TY_LUNCH_SLOT:
                            continue
                        if (d, t) not in TY_PEC_THEORY_SLOTS:
                            continue
                    if s["is_vsec"]:
                        if t == TY_LUNCH_SLOT:
                            continue
                        if (d, t) not in TY_VSEC_THEORY_SLOTS:
                            continue

                    # Non MDM/PEC/VSEC TY cannot use reserved slots
                    if s["is_ty"] and (not s["is_mdm_or_pec_or_vsec"]):
                        if (d, t) in TY_MDM_THEORY_SLOTS or (d, t) in TY_PEC_THEORY_SLOTS or (d, t) in TY_VSEC_THEORY_SLOTS:
                            continue

                    for ridx in room_indices:
                        opts.append((d, t, ridx))

        # LABS
        else:
            for d in range(DAY_COUNT):
                # Check if this session should be online on this day
                is_online_day = False
                if d < 5:  # Only Mon-Fri
                    if s["is_ty"]:
                        is_online_day = TY_ONLINE_DAYS[d] == 1
                    elif s["is_sy"]:
                        is_online_day = SY_ONLINE_DAYS[d] == 1
                
                # If online day, only use ONLINE room; otherwise use physical rooms
                if is_online_day:
                    room_indices = [ONLINE_ROOM_IDX]
                else:
                    room_indices = [room_to_idx[r] for r in lab_rooms]

                for t in LAB_START_SLOTS:
                    if t + 1 >= SLOT_COUNT:
                        continue
                    
                    # Check faculty availability for both lab slots (t and t+1)
                    if faculty_avail_matrix and d < 5:
                        if isinstance(faculty_avail_matrix, list) and len(faculty_avail_matrix) > d:
                            day_slots = faculty_avail_matrix[d]
                            if isinstance(day_slots, list):
                                # Check both consecutive slots for lab
                                if len(day_slots) > t and day_slots[t] == 1:
                                    continue
                                if len(day_slots) > t + 1 and day_slots[t + 1] == 1:
                                    continue

                    # lunch overlap
                    if s["is_sy"] and (t == SY_LUNCH_SLOT or t + 1 == SY_LUNCH_SLOT):
                        continue
                    if s["is_ty"] and (t == TY_LUNCH_SLOT or t + 1 == TY_LUNCH_SLOT):
                        continue

                    # MDM/PEC/VSEC lab reserved constraints
                    if s["is_mdm"]:
                        if t == TY_LUNCH_SLOT or t + 1 == TY_LUNCH_SLOT:
                            continue
                        if (d, t) not in TY_MDM_LAB_SLOTS:
                            continue
                    if s["is_pec"]:
                        if t == TY_LUNCH_SLOT or t + 1 == TY_LUNCH_SLOT:
                            continue
                        if (d, t) not in TY_PEC_LAB_SLOTS:
                            continue
                    if s["is_vsec"]:
                        if t == TY_LUNCH_SLOT or t + 1 == TY_LUNCH_SLOT:
                            continue
                        if (d, t) not in TY_VSEC_LAB_SLOTS:
                            continue

                    # Non MDM/PEC/VSEC TY cannot use reserved lab slots
                    if s["is_ty"] and (not s["is_mdm_or_pec_or_vsec"]):
                        if (d, t) in TY_MDM_LAB_SLOTS or (d, t) in TY_PEC_LAB_SLOTS or (d, t) in TY_VSEC_LAB_SLOTS:
                            continue

                    for ridx in room_indices:
                        opts.append((d, t, ridx))

        feasible[sid_] = opts
        if not opts:
            noopts.append(sid_)
            if verbose:
                print(
                    f"WARNING: Session {sid_} ({s['batch']} - {s['course']}) has NO feasible options!"
                )

    if verbose:
        # Summary
        total_opts = sum(len(v) for v in feasible.values())
        print(
            f"\n[FEASIBILITY] Total feasible options across all sessions: {total_opts}"
        )

        # Feasible options per day
        day_counts = defaultdict(int)
        for sid_, opts in feasible.items():
            for d, t, r in opts:
                day_counts[d] += 1
        print("\n[FEASIBILITY] Feasible options per day:")
        for d in range(DAY_COUNT):
            print(f"  {DAYS[d]}: {day_counts[d]} feasible options")

        if noopts:
            print(
                f"\n[FEASIBILITY] Sessions with zero options: {len(noopts)} (list below)"
            )
            # Print a short list (sid, batch, course)
            for sid in noopts:
                s = next((x for x in sessions if x["id"] == sid), {})
                print(f"  - SID {sid}: {s.get('batch','?')} - {s.get('course','?')}")

    return feasible
