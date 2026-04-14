import pandas as pd
from core.helpers import find_sheet_by_keyword, find_col, is_sub, batch_main


def read_workbook(path: str):
    return pd.read_excel(path, sheet_name=None)


def pick_core_sheets(sheets):
    rooms_sheet = find_sheet_by_keyword(sheets, ["room"])
    students_sheet = find_sheet_by_keyword(sheets, ["student", "batch"])
    faculty_sheet = find_sheet_by_keyword(sheets, ["faculty", "facult"])
    return rooms_sheet, students_sheet, faculty_sheet


def build_room_lists(rooms_df):
    room_name_col = find_col(rooms_df, ["room", "name"])
    try:
        room_type_col = find_col(rooms_df, ["type"])
    except Exception:
        room_type_col = None

    if room_type_col:
        theory_rooms = list(
            rooms_df.loc[
                rooms_df[room_type_col].astype(str).str.contains("theory", case=False, na=False),
                room_name_col,
            ].astype(str).unique()
        )
        lab_rooms = list(
            rooms_df.loc[
                rooms_df[room_type_col].astype(str).str.contains("lab", case=False, na=False),
                room_name_col,
            ].astype(str).unique()
        )
    else:
        # If no type column, consider all rooms available for both
        theory_rooms = list(rooms_df[room_name_col].astype(str).unique())
        lab_rooms = list(rooms_df[room_name_col].astype(str).unique())

    if len(theory_rooms) == 0:
        theory_rooms = list(rooms_df[room_name_col].astype(str).unique())
    if len(lab_rooms) == 0:
        lab_rooms = list(rooms_df[room_name_col].astype(str).unique())

    all_rooms = list(dict.fromkeys(theory_rooms + lab_rooms))
    room_to_idx = {r: i for i, r in enumerate(all_rooms)}
    idx_to_room = {i: r for r, i in room_to_idx.items()}

    # Add ONLINE pseudo-room index
    ONLINE_ROOM_IDX = len(all_rooms)
    idx_to_room[ONLINE_ROOM_IDX] = "ONLINE"

    return theory_rooms, lab_rooms, all_rooms, room_to_idx, idx_to_room, ONLINE_ROOM_IDX


def build_main_to_subs(students_df):
    from collections import defaultdict
    main_to_subs = defaultdict(list)
    if students_df is not None:
        students_df = students_df.fillna("")
        try:
            student_batch_col = find_col(students_df, ["batch"])
        except Exception:
            student_batch_col = list(students_df.columns)[0]
        for _, r in students_df.iterrows():
            b = str(r[student_batch_col]).strip()
            if not b:
                continue
            if is_sub(b):
                main_to_subs[batch_main(b)].append(b)
            else:
                main_to_subs.setdefault(batch_main(b), [])
    return main_to_subs
