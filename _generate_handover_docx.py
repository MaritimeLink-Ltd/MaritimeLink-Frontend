#!/usr/bin/env python3
"""Generate a clean, professionally formatted MaritimeLink handover DOCX."""

from __future__ import annotations

import re
from pathlib import Path

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "MARITIMELINK_HANDOVER_DOCUMENTATION.txt"
OUT = ROOT / "MARITIMELINK_HANDOVER_DOCUMENTATION.docx"

RE_BORDER = re.compile(r"^[=\-]{8,}\s*$")
RE_UNDERLINE = re.compile(r"^\s*-{5,}\s*$")
RE_PART = re.compile(r"^\s*(PART\s+\d+)\s*[—\-–]\s*(.+?)\s*$", re.I)
RE_APPENDIX = re.compile(r"^\s*(APPENDIX\s+[A-Z])\s*[—\-–]\s*(.+?)\s*$", re.I)
RE_SECTION = re.compile(r"^(\d+\.\d+)\s+([A-Z0-9].*?)\s*$")
RE_APP_SECTION = re.compile(r"^([A-C]\.\d+)\s+(.+?)\s*$")
RE_TOC = re.compile(r"^\s*((?:PART\s+\d+|APPENDIX\s+[A-Z]))\s*\.{2,}\s*(.+?)\s*$", re.I)
RE_META = re.compile(r"^\s*([A-Za-z][A-Za-z /]+?)\s*\.{2,}\s*(.+?)\s*$")
RE_CHECK = re.compile(r"^\s*\[x\]\s*(.+?)\s*\.{2,}\s*(.+?)\s*$", re.I)
RE_BULLET = re.compile(r"^(\s*)([*\-•])\s+(.+)$")
RE_NUMBERED = re.compile(r"^(\s*)(\d+)(?:[.)]\s+|\s{2,})(.+)$")
RE_LETTERED = re.compile(r"^(\s*)([a-z]\))\s+(.+)$")
RE_SPACED = re.compile(r"\b(?:[A-Z]\s){2,}[A-Z]\b")
RE_TABLE_RULE = re.compile(r"^\s*\+[-=+]+\+\s*$")
RE_TABLE_ROW = re.compile(r"^\s*\|.+\|\s*$")
RE_KV = re.compile(r"^([A-Za-z][A-Za-z0-9 /+()_.-]{0,36}?)\s{2,}(.+)$")


NAVY = RGBColor(0x0B, 0x3D, 0x5C)
STEEL = RGBColor(0x1B, 0x4F, 0x72)
BODY = RGBColor(0x22, 0x22, 0x22)
MUTED = RGBColor(0x66, 0x66, 0x66)


def unspace_caps(text: str) -> str:
    return RE_SPACED.sub(lambda m: m.group(0).replace(" ", ""), text)


def clean(text: str) -> str:
    text = unspace_caps(text.replace("\u00a0", " "))
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def set_font(run, name="Calibri", size=None, bold=None, color=None, italic=None):
    run.font.name = name
    run._element.rPr.rFonts.set(qn("w:eastAsia"), name)
    if size is not None:
        run.font.size = size
    if bold is not None:
        run.bold = bold
    if color is not None:
        run.font.color.rgb = color
    if italic is not None:
        run.italic = italic


def spacing(p, before=0, after=6, line=1.15):
    pf = p.paragraph_format
    pf.space_before = Pt(before)
    pf.space_after = Pt(after)
    pf.line_spacing = line
    pf.line_spacing_rule = WD_LINE_SPACING.MULTIPLE


def shade_cell(cell, hex_color: str):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), hex_color)
    shd.set(qn("w:val"), "clear")
    tcPr.append(shd)


def shade_para(p, hex_color: str):
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), hex_color)
    shd.set(qn("w:val"), "clear")
    p._p.get_or_add_pPr().append(shd)


def add_page_number(paragraph):
    run = paragraph.add_run()
    set_font(run, size=Pt(8), color=MUTED)
    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    fld_sep = OxmlElement("w:fldChar")
    fld_sep.set(qn("w:fldCharType"), "separate")
    fld_text = OxmlElement("w:t")
    fld_text.text = "1"
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")
    run._r.append(fld_begin)
    run._r.append(instr)
    run._r.append(fld_sep)
    run._r.append(fld_text)
    run._r.append(fld_end)


def configure(doc: Document):
    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal.font.size = Pt(11)
    normal.font.color.rgb = BODY
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
    normal.paragraph_format.space_after = Pt(8)
    normal.paragraph_format.line_spacing = 1.15

    for name, size, color, before, after in [
        ("Title", 28, NAVY, 0, 6),
        ("Heading 1", 16, NAVY, 20, 8),
        ("Heading 2", 13, STEEL, 14, 6),
        ("Heading 3", 11, STEEL, 10, 4),
    ]:
        st = doc.styles[name]
        st.font.name = "Calibri"
        st.font.size = Pt(size)
        st.font.bold = True
        st.font.color.rgb = color
        st._element.rPr.rFonts.set(qn("w:eastAsia"), "Calibri")
        st.paragraph_format.space_before = Pt(before)
        st.paragraph_format.space_after = Pt(after)
        st.paragraph_format.keep_with_next = True

    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)


def heading(doc, text, level):
    p = doc.add_heading(clean(text), level=level)
    for run in p.runs:
        set_font(run, bold=True)
    return p


def para(doc, text, *, bold=False, italic=False):
    text = clean(text)
    if not text:
        return None
    p = doc.add_paragraph()
    run = p.add_run(text)
    set_font(run, size=Pt(11), bold=bold, italic=italic, color=BODY)
    spacing(p, 0, 8, 1.15)
    return p


def bullet(doc, text, level=0):
    p = doc.add_paragraph(style="List Bullet")
    p.clear()
    run = p.add_run(clean(text))
    set_font(run, size=Pt(11), color=BODY)
    spacing(p, 0, 3, 1.1)
    if level:
        p.paragraph_format.left_indent = Inches(0.25 * level)
    return p


def numbered(doc, text):
    p = doc.add_paragraph(style="List Number")
    p.clear()
    run = p.add_run(clean(text))
    set_font(run, size=Pt(11), color=BODY)
    spacing(p, 0, 3, 1.1)
    return p


def pre(doc, lines: list[str]):
    # Keep relative indentation; fix spaced caps; trim right
    out = []
    min_indent = None
    for line in lines:
        if line.strip():
            ind = len(line) - len(line.lstrip(" "))
            min_indent = ind if min_indent is None else min(min_indent, ind)
    min_indent = min_indent or 0
    for line in lines:
        if not line.strip():
            out.append("")
            continue
        body = unspace_caps(line.rstrip())
        body = body[min_indent:] if len(body) >= min_indent else body.lstrip()
        out.append(body)
    text = "\n".join(out).strip("\n")
    if not text.strip():
        return None
    p = doc.add_paragraph()
    run = p.add_run(text)
    set_font(run, name="Consolas", size=Pt(8), color=RGBColor(0x33, 0x33, 0x33))
    spacing(p, 4, 10, 1.05)
    p.paragraph_format.left_indent = Inches(0.1)
    shade_para(p, "F4F7FA")
    return p


def set_cell(cell, text, *, header=False):
    cell.text = ""
    p = cell.paragraphs[0]
    run = p.add_run(clean(text))
    set_font(run, size=Pt(9), bold=header, color=RGBColor(0xFF, 0xFF, 0xFF) if header else BODY)
    spacing(p, 2, 2, 1.0)
    if header:
        shade_cell(cell, "0B3D5C")


def add_table(doc, rows: list[list[str]], header=True):
    if not rows:
        return
    cols = max(len(r) for r in rows)
    rows = [r + [""] * (cols - len(r)) for r in rows]
    table = doc.add_table(rows=len(rows), cols=cols)
    table.style = "Table Grid"
    for ri, row in enumerate(rows):
        for ci, val in enumerate(row):
            cell = table.rows[ri].cells[ci]
            is_hdr = header and ri == 0
            set_cell(cell, val, header=is_hdr)
            if not is_hdr and ri % 2 == 0:
                shade_cell(cell, "F4F7FA")
    doc.add_paragraph()


def add_kv_table(doc, pairs: list[tuple[str, str]]):
    table = doc.add_table(rows=len(pairs), cols=2)
    table.style = "Table Grid"
    for i, (k, v) in enumerate(pairs):
        set_cell(table.rows[i].cells[0], k, header=False)
        for run in table.rows[i].cells[0].paragraphs[0].runs:
            run.bold = True
        shade_cell(table.rows[i].cells[0], "E8EEF4")
        set_cell(table.rows[i].cells[1], v, header=False)
        table.rows[i].cells[0].width = Inches(1.7)
        table.rows[i].cells[1].width = Inches(4.8)
    doc.add_paragraph()


def split_row(line: str) -> list[str]:
    inner = line.strip()
    if inner.startswith("|"):
        inner = inner[1:]
    if inner.endswith("|"):
        inner = inner[:-1]
    return [c.strip() for c in inner.split("|")]


def is_real_table_block(block: list[str]) -> bool:
    """True for rectangular pipe tables; False for ASCII architecture diagrams."""
    rows = [ln for ln in block if RE_TABLE_ROW.match(ln)]
    rules = [ln for ln in block if RE_TABLE_RULE.match(ln)]
    if len(rows) < 2 or len(rules) < 1:
        return False
    # Diagrams place separate boxes side-by-side: "+---+   +---+" (gap between boxes).
    # A normal table rule "+----+----+" has junctions but no wide gap between closed boxes.
    for ln in block:
        if re.search(r"\+[-=]+\+\s{2,}\+[-=]+\+", ln):
            return False
        # nested content boxes inside a larger frame (architecture diagrams)
        if RE_TABLE_ROW.match(ln) and ln.count("|") >= 6 and "+--" in ln:
            return False
    widths = [len(split_row(r)) for r in rows]
    if not widths:
        return False
    primary = max(set(widths), key=widths.count)
    if primary < 2:
        return False
    consistent = sum(1 for w in widths if w == primary) / len(widths)
    return consistent >= 0.7


def table_has_header(block: list[str]) -> bool:
    """Header exists when the first row is followed by a rule line (markdown-table style)."""
    seen_row = False
    for ln in block:
        if RE_TABLE_RULE.match(ln):
            if seen_row:
                return True
            continue
        if RE_TABLE_ROW.match(ln):
            if seen_row:
                return False
            seen_row = True
    return False


def parse_table(block: list[str]) -> list[list[str]]:
    rows: list[list[str]] = []
    for ln in block:
        if RE_TABLE_RULE.match(ln) or not ln.strip():
            continue
        if not RE_TABLE_ROW.match(ln):
            continue
        cells = split_row(ln)
        if rows and cells and cells[0] == "" and any(cells[1:]):
            prev = rows[-1]
            for i, cell in enumerate(cells):
                if i < len(prev) and cell:
                    prev[i] = f"{prev[i]} {cell}".strip()
            continue
        if rows and len(cells) == len(rows[-1]) and cells[0] == "" and all(
            (cells[i] == "" or i == 0) for i in range(len(cells))
        ):
            continue
        # continuation where first cell empty but others fill previous empties / wrap
        if rows and len(cells) == len(rows[-1]) and cells[0] == "":
            prev = rows[-1]
            merged = False
            for i, cell in enumerate(cells):
                if cell:
                    prev[i] = f"{prev[i]} {cell}".strip()
                    merged = True
            if merged:
                continue
        rows.append(cells)
    if not rows:
        return []
    width = max(len(r) for r in rows)
    return [r + [""] * (width - len(r)) for r in rows]


def looks_like_diagram_line(line: str) -> bool:
    s = line.rstrip()
    if not s.strip():
        return False
    if RE_TABLE_RULE.match(s) or RE_TABLE_ROW.match(s):
        return True
    if re.search(r"\|--|\|--", s):
        return True
    if re.match(r"^\s{0,8}[v^]\s*$", s):
        return True
    if re.match(r"^\s{2,}[|+]", s) and ("->" in s or s.count("|") >= 1):
        return True
    if re.search(r"\+[-=]+\+", s):
        return True
    # state machine / flow lines
    if re.search(r"->|<-", s) and re.search(r"PENDING|APPROVED|OTP|register|FLAGGED|KYC", s):
        return True
    if re.match(r"^\s{4,}.+\|.+\|", s):
        return True
    return False


def is_all_caps_label(s: str) -> bool:
    letters = [c for c in s if c.isalpha()]
    return bool(letters) and all(c.isupper() for c in letters) and 3 <= len(s) <= 70


def join_wrapped(lines: list[str], start: int, stop_preds) -> tuple[str, int]:
    """Join start line with subsequent indented/continuation lines."""
    parts = [lines[start].strip()]
    j = start + 1
    while j < len(lines):
        nxt = lines[j]
        if not nxt.strip():
            break
        if any(pred(nxt, j) for pred in stop_preds):
            break
        # continuation: indented, or lowercase start, or hanging after non-terminal
        if nxt.startswith(" ") or nxt.startswith("\t"):
            parts.append(nxt.strip())
            j += 1
            continue
        break
    return clean(" ".join(parts)), j


def convert():
    lines = [ln.rstrip() for ln in SRC.read_text(encoding="utf-8").splitlines()]
    n = len(lines)
    doc = Document()
    configure(doc)

    def at(idx):
        return lines[idx] if 0 <= idx < n else ""

    i = 0
    first_part = True

    # -------- Cover --------
    while i < n and (RE_BORDER.match(lines[i]) or not lines[i].strip()):
        i += 1
    title = clean(at(i)) or "MaritimeLink"
    if title.replace(" ", "").upper() == "MARITIMELINK":
        title = "MaritimeLink"
    i += 1
    subtitle_parts = []
    while i < n and lines[i].strip() and not RE_BORDER.match(lines[i]) and not RE_META.match(lines[i]):
        subtitle_parts.append(clean(lines[i]))
        i += 1
    subtitle = " ".join(subtitle_parts)
    while i < n and (RE_BORDER.match(lines[i]) or not lines[i].strip()):
        i += 1

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(title)
    set_font(run, size=Pt(28), bold=True, color=NAVY)
    spacing(p, 36, 6, 1.0)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(subtitle)
    set_font(run, size=Pt(13), bold=True, color=STEEL)
    spacing(p, 0, 16, 1.15)

    meta = []
    while i < n:
        if not lines[i].strip():
            i += 1
            if meta:
                break
            continue
        if RE_BORDER.match(lines[i]):
            i += 1
            break
        m = RE_META.match(lines[i])
        if not m:
            break
        key, val = clean(m.group(1)), clean(m.group(2))
        j = i + 1
        while j < n and lines[j].startswith("   ") and lines[j].strip() and not RE_META.match(lines[j]):
            val = clean(val + " " + lines[j].strip())
            j += 1
        meta.append((key, val))
        i = j
    if meta:
        add_kv_table(doc, meta)

    # -------- Body --------
    while i < n:
        line = lines[i]
        stripped = line.strip()

        if not stripped:
            i += 1
            continue

        if RE_BORDER.match(line) or RE_UNDERLINE.match(line):
            i += 1
            continue

        # Major part / appendix heading (must be followed by border or stand alone as PART line)
        m = RE_PART.match(stripped) or RE_APPENDIX.match(stripped)
        if m and (RE_BORDER.match(at(i + 1)) or RE_BORDER.match(at(i - 1)) or RE_UNDERLINE.match(at(i + 1))):
            if not first_part:
                doc.add_page_break()
            first_part = False
            heading(doc, f"{m.group(1).upper()} — {clean(m.group(2))}", 1)
            i += 1
            if RE_BORDER.match(at(i)) or RE_UNDERLINE.match(at(i)):
                i += 1
            continue

        # Numbered section 1.1 / A.10 — ONLY when followed by underline dashes
        m = RE_SECTION.match(stripped) or RE_APP_SECTION.match(stripped)
        if m and RE_UNDERLINE.match(at(i + 1)):
            heading(doc, f"{m.group(1)} {clean(m.group(2))}", 2)
            i += 2
            continue

        # Standalone uppercase section titles with underline
        if is_all_caps_label(stripped) and RE_UNDERLINE.match(at(i + 1)) and not stripped.startswith(("GET ", "POST ", "PATCH ", "DELETE ")):
            label = "Table of Contents" if stripped == "TABLE OF CONTENTS" else stripped.title()
            level = 1 if stripped in {"TABLE OF CONTENTS", "WHAT THIS DOCUMENT IS"} else 2
            # keep WHAT THIS DOCUMENT IS as H2 under cover
            if stripped == "WHAT THIS DOCUMENT IS":
                level = 2
            heading(doc, label, level)
            i += 2
            continue

        # TOC lines
        m = RE_TOC.match(stripped)
        if m:
            p = doc.add_paragraph()
            r1 = p.add_run(clean(m.group(1)))
            set_font(r1, size=Pt(11), bold=True, color=BODY)
            r2 = p.add_run(f"  —  {clean(m.group(2))}")
            set_font(r2, size=Pt(11), color=BODY)
            spacing(p, 0, 2, 1.1)
            i += 1
            continue

        # Checklist
        m = RE_CHECK.match(stripped)
        if m:
            p = doc.add_paragraph(style="List Bullet")
            p.clear()
            r1 = p.add_run(f"✓ {clean(m.group(1))}")
            set_font(r1, size=Pt(11), bold=True)
            r2 = p.add_run(f" — {clean(m.group(2))}")
            set_font(r2, size=Pt(11))
            spacing(p, 0, 2, 1.1)
            i += 1
            continue

        # ASCII table or diagram block starting with +--- or |
        if RE_TABLE_RULE.match(line) or (RE_TABLE_ROW.match(line) and (RE_TABLE_RULE.match(at(i + 1)) or RE_TABLE_RULE.match(at(i - 1)))):
            block = []
            j = i
            while j < n:
                cur = lines[j]
                if not cur.strip():
                    # end block on blank unless next continues table/diagram
                    if j + 1 < n and looks_like_diagram_line(lines[j + 1]):
                        block.append("")
                        j += 1
                        continue
                    break
                if RE_BORDER.match(cur) or RE_UNDERLINE.match(cur):
                    break
                if RE_SECTION.match(cur.strip()) or RE_PART.match(cur.strip()) or RE_APPENDIX.match(cur.strip()):
                    break
                if RE_APP_SECTION.match(cur.strip()) and RE_UNDERLINE.match(at(j + 1)):
                    break
                if looks_like_diagram_line(cur) or RE_TABLE_ROW.match(cur) or RE_TABLE_RULE.match(cur):
                    block.append(cur)
                    j += 1
                    continue
                # allow lightly indented connector lines in diagrams
                if re.match(r"^\s{2,}[|v^<\-]", cur) or "->" in cur:
                    block.append(cur)
                    j += 1
                    continue
                break
            if is_real_table_block(block):
                add_table(doc, parse_table(block), header=table_has_header(block))
            else:
                pre(doc, block)
            i = j
            continue

        # Directory tree / state-machine pre blocks
        if looks_like_diagram_line(line) or (
            line.startswith("    ")
            and (
                line.strip().startswith("Maritime/")
                or re.match(r"^\s+\|--", line)
                or re.match(r"^\s+\{", line)
                or re.match(r'^\s+"', line)
            )
        ):
            block = []
            j = i
            while j < n:
                cur = lines[j]
                if not cur.strip():
                    if j + 1 < n and (
                        looks_like_diagram_line(lines[j + 1])
                        or lines[j + 1].startswith("    ")
                        or re.search(r"->|<-|\+--", lines[j + 1])
                    ):
                        block.append("")
                        j += 1
                        continue
                    break
                if RE_BORDER.match(cur) or RE_UNDERLINE.match(cur):
                    break
                if RE_SECTION.match(cur.strip()) and RE_UNDERLINE.match(at(j + 1)):
                    break
                if RE_PART.match(cur.strip()) or RE_APPENDIX.match(cur.strip()):
                    break
                if RE_BULLET.match(cur) and not looks_like_diagram_line(cur):
                    # bullets that are part of prose
                    if not re.search(r"->|\+--", cur):
                        break
                if (
                    looks_like_diagram_line(cur)
                    or cur.startswith("    ")
                    or re.search(r"->|<-|\+--", cur)
                    or re.match(r"^\s{2,}\S", cur)
                ):
                    block.append(cur)
                    j += 1
                    continue
                break
            pre(doc, block)
            i = j
            continue

        # Feature group heading (short title followed by dash bullets)
        if (
            len(line) - len(line.lstrip(" ")) <= 2
            and 3 < len(stripped) < 55
            and len(stripped.split()) >= 2
            and stripped[0].isupper()
            and not stripped.endswith((".", ";", ":"))
            and at(i + 1).lstrip().startswith("- ")
        ):
            heading(doc, stripped, 3)
            i += 1
            continue

        # Explicit stack / deliverable banners
        if re.match(r"^(DOCUMENTATION|RUNNING SYSTEMS|ACCESS AND OWNERSHIP)\b", stripped, re.I) and (
            at(i + 1).lstrip().startswith(("[x]", "-")) or bool(at(i + 1).strip())
        ):
            heading(doc, stripped, 3)
            i += 1
            continue
        if re.match(r"^(BACKEND|WEB|MOBILE)\b", stripped, re.I) and (
            "—" in stripped or "–" in stripped or RE_TABLE_RULE.match(at(i + 1))
        ):
            heading(doc, stripped, 3)
            i += 1
            continue

        # Definition / code-name labels (ACCOUNT_NOT_VERIFIED etc.)
        if (
            re.match(r"^[A-Z][A-Z0-9_]+(?:\s{2,}\(.+\))?$", stripped)
            and at(i + 1).startswith(" ")
            and not RE_UNDERLINE.match(at(i + 1))
        ):
            p = doc.add_paragraph()
            run = p.add_run(clean(stripped))
            set_font(run, name="Consolas", size=Pt(10), bold=True, color=NAVY)
            spacing(p, 8, 2, 1.1)
            i += 1
            continue

        # Bullets
        m = RE_BULLET.match(line)
        if m:
            level = 1 if len(m.group(1)) >= 4 else 0
            stop = [
                lambda nxt, j: bool(RE_BULLET.match(nxt) or RE_NUMBERED.match(nxt) or RE_LETTERED.match(nxt)),
                lambda nxt, j: bool(RE_SECTION.match(nxt.strip()) and RE_UNDERLINE.match(at(j + 1))),
                lambda nxt, j: bool(RE_PART.match(nxt.strip()) or RE_APPENDIX.match(nxt.strip())),
                lambda nxt, j: bool(RE_TABLE_RULE.match(nxt) or looks_like_diagram_line(nxt)),
                lambda nxt, j: bool(RE_BORDER.match(nxt) or RE_UNDERLINE.match(nxt)),
                lambda nxt, j: (not nxt.startswith(" ") and not nxt.startswith("\t")),
            ]
            # custom join: only indented continuations
            text = m.group(3)
            j = i + 1
            while j < n:
                nxt = lines[j]
                if not nxt.strip():
                    break
                if RE_BULLET.match(nxt) or RE_NUMBERED.match(nxt) or RE_LETTERED.match(nxt):
                    break
                if RE_SECTION.match(nxt.strip()) and RE_UNDERLINE.match(at(j + 1)):
                    break
                if RE_PART.match(nxt.strip()) or RE_APPENDIX.match(nxt.strip()):
                    break
                if RE_TABLE_RULE.match(nxt) or (looks_like_diagram_line(nxt) and not nxt.startswith(" ")):
                    break
                if nxt.startswith(" ") or nxt.startswith("\t"):
                    text += " " + nxt.strip()
                    j += 1
                    continue
                break
            bullet(doc, text, level)
            i = j
            continue

        # Numbered / lettered
        m = RE_NUMBERED.match(line) or RE_LETTERED.match(line)
        if m:
            is_letter = bool(RE_LETTERED.match(line))
            text = m.group(3)
            j = i + 1
            sub_pre = []
            while j < n:
                nxt = lines[j]
                if not nxt.strip():
                    break
                if RE_BULLET.match(nxt) or RE_NUMBERED.match(nxt) or RE_LETTERED.match(nxt):
                    break
                if RE_SECTION.match(nxt.strip()) and RE_UNDERLINE.match(at(j + 1)):
                    break
                if RE_PART.match(nxt.strip()) or RE_APPENDIX.match(nxt.strip()):
                    break
                if RE_TABLE_RULE.match(nxt):
                    break
                # deeply indented code-ish lines under a numbered step → collect as pre
                if nxt.startswith("         ") or (
                    nxt.startswith("      ") and ("->" in nxt or nxt.strip().startswith(("app.", "GET ", "POST ", "helmet", "cors", "express.", "/api")))
                ):
                    sub_pre.append(nxt)
                    j += 1
                    continue
                if nxt.startswith(" ") or nxt.startswith("\t"):
                    if RE_BULLET.match(nxt):
                        break
                    text += " " + nxt.strip()
                    j += 1
                    continue
                break
            if is_letter:
                bullet(doc, f"{m.group(2)} {text}")
            else:
                numbered(doc, text)
            if sub_pre:
                pre(doc, sub_pre)
            i = j
            continue

        # Key/value tech stack lines
        m = RE_KV.match(stripped)
        if m and len(m.group(1).split()) <= 4:
            label, value = clean(m.group(1)), clean(m.group(2))
            j = i + 1
            while j < n and lines[j].startswith("               ") and lines[j].strip():
                # continuation of value column
                if RE_KV.match(lines[j].strip()):
                    break
                value += " " + clean(lines[j])
                j += 1
            p = doc.add_paragraph()
            r1 = p.add_run(label)
            set_font(r1, size=Pt(11), bold=True, color=BODY)
            r2 = p.add_run(f"  —  {value}")
            set_font(r2, size=Pt(11), color=BODY)
            spacing(p, 0, 3, 1.1)
            i = j
            continue

        # Glossary-style: Term + hanging indent definition
        if (
            not line.startswith(" ")
            and len(stripped.split()) <= 6
            and stripped[0].isupper()
            and at(i + 1).startswith(" ")
            and not at(i + 1).lstrip().startswith(("-", "*", "•"))
            and not RE_UNDERLINE.match(at(i + 1))
        ):
            # Could be "Application status   The stage..."
            if "  " in stripped:
                left, right = re.split(r"\s{2,}", stripped, maxsplit=1)
                text = clean(right)
                j = i + 1
                while j < n and lines[j].startswith(" ") and lines[j].strip():
                    if not line.startswith(" ") and RE_KV.match(lines[j].strip()) and len(lines[j].strip().split()) <= 3:
                        # new term
                        break
                    # new glossary term often starts at col 1
                    text += " " + lines[j].strip()
                    j += 1
                p = doc.add_paragraph()
                r1 = p.add_run(clean(left))
                set_font(r1, size=Pt(11), bold=True, color=NAVY)
                r2 = p.add_run(f"  —  {clean(text)}")
                set_font(r2, size=Pt(11), color=BODY)
                spacing(p, 2, 4, 1.1)
                i = j
                continue

        # Regular prose paragraph — join wrapped lines carefully
        parts = [stripped]
        j = i + 1
        while j < n:
            nxt = lines[j]
            ns = nxt.strip()
            if not ns:
                break
            if RE_BORDER.match(nxt) or RE_UNDERLINE.match(nxt):
                break
            if RE_PART.match(ns) or RE_APPENDIX.match(ns):
                break
            if (RE_SECTION.match(ns) or RE_APP_SECTION.match(ns)) and RE_UNDERLINE.match(at(j + 1)):
                break
            if is_all_caps_label(ns) and RE_UNDERLINE.match(at(j + 1)):
                break
            if RE_BULLET.match(nxt) or RE_NUMBERED.match(nxt) or RE_LETTERED.match(nxt) or RE_CHECK.match(ns) or RE_TOC.match(ns):
                break
            if RE_TABLE_RULE.match(nxt) or looks_like_diagram_line(nxt):
                break
            if (
                not nxt.startswith(" ")
                and 3 < len(ns) < 55
                and ns[0].isupper()
                and not ns.endswith((".", ";", ":"))
                and at(j + 1).lstrip().startswith("- ")
            ):
                break
            if RE_KV.match(ns) and len(RE_KV.match(ns).group(1).split()) <= 4 and not nxt.startswith(" "):
                break
            if re.match(r"^[A-Z][A-Z0-9_]+(?:\s{2,}\(.+\))?$", ns) and at(j + 1).startswith(" "):
                break
            # hanging indent or soft wrap
            if nxt.startswith(" ") or nxt.startswith("\t"):
                parts.append(ns)
                j += 1
                continue
            # soft-wrapped prose: previous doesn't end sentence, or next continues mid-thought
            prev = parts[-1]
            if not prev.endswith((".", ":", "!", "?", ";")) or ns[0].islower():
                parts.append(ns)
                j += 1
                continue
            # new sentence on its own line — still same paragraph if short doc wrap
            if len(ns) > 0 and ns[0].isupper() and len(prev) < 90:
                parts.append(ns)
                j += 1
                continue
            break
        para(doc, " ".join(parts))
        i = j

    # Footer
    for section in doc.sections:
        footer = section.footer
        footer.is_linked_to_previous = False
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = fp.add_run("MaritimeLink Ltd — Confidential  |  Page ")
        set_font(run, size=Pt(8), color=MUTED)
        add_page_number(fp)

    doc.core_properties.title = "MaritimeLink — Complete Technical, Operational & Handover Documentation"
    doc.core_properties.author = "MaritimeLink Ltd"
    doc.core_properties.version = "1.0"

    doc.save(OUT)
    print(f"Wrote {OUT}")
    print(f"Paragraphs: {len(doc.paragraphs)}  Tables: {len(doc.tables)}")


if __name__ == "__main__":
    convert()
