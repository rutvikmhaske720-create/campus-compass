import re
import pandas as pd

_batch_main_regex1 = re.compile(r"^(SY|TY)_[A-Z]+", re.I)
_batch_main_regex2 = re.compile(r"^(.*?)(\d+)$")


def batch_main(batch: str):
    """Return main batch ID (e.g., SY_A from SY_A1)."""
    if not isinstance(batch, str):
        return batch
    batch = batch.strip()
    if batch == "":
        return batch
    m = _batch_main_regex1.match(batch)
    if m:
        return m.group(0).upper()
    m2 = _batch_main_regex2.match(batch)
    if m2:
        return m2.group(1).upper()
    return batch.upper()


def is_sub(batch: str) -> bool:
    return isinstance(batch, str) and len(batch) > 0 and batch[-1].isdigit()


def is_ty(batch: str) -> bool:
    return isinstance(batch, str) and batch.strip().upper().startswith("TY")


def is_sy(batch: str) -> bool:
    return isinstance(batch, str) and batch.strip().upper().startswith("SY")


def contains_mdm(course: str) -> bool:
    if not isinstance(course, str):
        return False
    c = course.lower()
    # Only match "mdm" specifically, not general "management" courses
    return "mdm" in c


def contains_pec(course: str) -> bool:
    if not isinstance(course, str):
        return False
    c = course.lower().strip()
    # Match PEC patterns: "pec", "professional elective", or contains "pec"
    # Simplified: just check if "pec" appears anywhere in the course name
    return "pec" in c


def contains_vsec(course: str) -> bool:
    if not isinstance(course, str):
        return False
    c = course.lower().strip()
    # Match VSEC patterns: "vsec" or "value added skill enhancement course"
    return "vsec" in c


def read_int(v) -> int:
    try:
        if v is None or (isinstance(v, float) and pd.isna(v)):
            return 0
        if isinstance(v, str):
            v = v.strip()
            if v == "":
                return 0
        return int(float(v))
    except Exception:
        return 0


def find_sheet_by_keyword(sheets_dict, keywords):
    for name in sheets_dict:
        low = name.lower()
        if all(k.lower() in low for k in keywords):
            return name
    for name in sheets_dict:
        low = name.lower()
        if any(k.lower() in low for k in keywords):
            return name
    return None


def find_col(df, keywords):
    cols = list(df.columns)
    for c in cols:
        low = str(c).lower()
        if all(k.lower() in low for k in keywords):
            return c
    for c in cols:
        low = str(c).lower()
        if any(k.lower() in low for k in keywords):
            return c
    raise ValueError(f"Could not find column with keywords {keywords}. Available: {cols}")
