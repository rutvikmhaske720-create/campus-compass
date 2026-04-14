import math
from core.helpers import find_col, read_int, contains_mdm, contains_pec, contains_vsec, batch_main, is_sub, is_ty, is_sy


def build_sessions(faculty_df):
    """Build session list from faculty sheet; annotate fields."""
    faculty_name_col = find_col(faculty_df, ["name"])
    faculty_df[faculty_name_col] = faculty_df[faculty_name_col].ffill()
    
    # Try to find course NAME column (not code)
    # Look for "Course Name" specifically, not "Course Code"
    course_col = None
    for col in faculty_df.columns:
        col_lower = str(col).lower()
        if "course" in col_lower and "name" in col_lower:
            course_col = col
            break
    if course_col is None:
        # Fallback: find any column with "course" but prefer longer names
        course_cols = [c for c in faculty_df.columns if "course" in str(c).lower()]
        if course_cols:
            # Pick the one with "name" or the longest one (likely the descriptive name)
            course_col = max(course_cols, key=lambda c: len(str(c)))
        else:
            raise ValueError("No course column found")
    
    batch_col = find_col(faculty_df, ["batch"])
    theory_col = find_col(faculty_df, ["theory"])
    lab_col = find_col(faculty_df, ["lab"])

    sessions = []
    sid = 0
    pec_count = 0
    vsec_count = 0

    for _, r in faculty_df.iterrows():
        faculty = str(r[faculty_name_col]).strip()
        course = str(r[course_col]).strip()
        batch = str(r[batch_col]).strip()
        if not batch or str(batch).lower() == "nan":
            continue

        t_h = read_int(r.get(theory_col, 0))
        l_h = read_int(r.get(lab_col, 0))

        for _ in range(t_h):
            is_pec_flag = contains_pec(course)
            is_mdm_flag = contains_mdm(course)
            is_vsec_flag = contains_vsec(course)
            if is_pec_flag:
                pec_count += 1
            if is_vsec_flag:
                vsec_count += 1
            sessions.append(
                {
                    "id": sid,
                    "type": "theory",
                    "faculty": faculty,
                    "course": course,
                    "batch": batch,
                    "duration": 1,
                    "is_mdm": is_mdm_flag,
                    "is_pec": is_pec_flag,
                    "is_vsec": is_vsec_flag,
                }
            )
            sid += 1

        if l_h > 0:
            # each lab uses 2 slots; if lab hours odd, ceil(l_h/2) labs
            nlab = math.ceil(l_h / 2)
            for _ in range(nlab):
                is_pec_flag = contains_pec(course)
                is_mdm_flag = contains_mdm(course)
                is_vsec_flag = contains_vsec(course)
                if is_pec_flag:
                    pec_count += 1
                if is_vsec_flag:
                    vsec_count += 1
                sessions.append(
                    {
                        "id": sid,
                        "type": "lab",
                        "faculty": faculty,
                        "course": course,
                        "batch": batch,
                        "duration": 2,
                        "is_mdm": is_mdm_flag,
                        "is_pec": is_pec_flag,
                        "is_vsec": is_vsec_flag,
                    }
                )
                sid += 1

    # Precompute constant fields for speed
    for s in sessions:
        b = s["batch"]
        s["batch_main"] = batch_main(b)
        s["is_sub"] = is_sub(b)
        s["is_ty"] = is_ty(b)
        s["is_sy"] = is_sy(b)
        s["is_mdm_or_pec"] = s["is_mdm"] or s["is_pec"]
        s["is_mdm_or_pec_or_vsec"] = s["is_mdm"] or s["is_pec"] or s["is_vsec"]


    
    session_by_id = {s["id"]: s for s in sessions}
    return sessions, session_by_id
