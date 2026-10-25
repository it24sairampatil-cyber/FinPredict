import re
import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def style_run(run, font_name="Times New Roman", size_pt=11, bold=False, italic=False, color_rgb=(0,0,0)):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.bold = bold
    run.italic = italic
    run.font.color.rgb = RGBColor(*color_rgb)

def set_cell_shading(cell, color_hex="F3F4F6"):
    shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading)

def set_cell_margins(cell, top=80, bottom=80, left=120, right=120):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table, color="000000", sz="4", val="single"):
    tblPr = table._tbl.tblPr
    borders = parse_xml(
        f'<w:tblBorders {nsdecls("w")}>\n'
        f'  <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
        f'  <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
        f'  <w:left w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
        f'  <w:right w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
        f'  <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
        f'  <w:insideV w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>\n'
        f'</w:tblBorders>'
    )
    tblPr.append(borders)

def build_docx_from_markdown(md_path, docx_path, title="FinPredict Academic Document"):
    doc = Document()
    for s in doc.sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(0.8)
        s.right_margin = Inches(0.8)

    with open(md_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    # Pre-parse: extract header table info and titles
    in_code_block = False
    code_buffer = []
    in_table = False
    table_buffer = []

    def flush_table(buffer):
        if not buffer:
            return
        # Parse markdown table
        rows = []
        for line in buffer:
            line_str = line.strip()
            if not line_str.startswith("|"):
                continue
            # skip separator line
            if re.match(r'^\|[\s\-:|]+\|$', line_str):
                continue
            cells = [c.strip() for c in line_str.split("|")[1:-1]]
            rows.append(cells)
        if not rows:
            return
        num_cols = max(len(r) for r in rows)
        tbl = doc.add_table(rows=len(rows), cols=num_cols)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(tbl)
        for r_idx, r_cells in enumerate(rows):
            for c_idx, c_val in enumerate(r_cells):
                cell = tbl.cell(r_idx, c_idx)
                set_cell_margins(cell, 60, 60, 90, 90)
                if r_idx == 0:
                    set_cell_shading(cell, "F3F4F6")
                p = cell.paragraphs[0]
                # clean bold markers
                c_clean = re.sub(r'\*\*(.*?)\*\*', r'\1', c_val)
                r = p.add_run(c_clean)
                style_run(r, size_pt=9.5, bold=(r_idx==0))
        p_space = doc.add_paragraph()
        p_space.paragraph_format.space_before = Pt(0)
        p_space.paragraph_format.space_after = Pt(4)

    def flush_code(buffer):
        if not buffer:
            return
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        set_cell_shading(cell, "F9FAFB")
        set_cell_margins(cell, 80, 80, 100, 100)
        set_table_borders(tbl, color="D1D5DB", sz="4", val="single")
        cp = cell.paragraphs[0]
        cp.paragraph_format.space_before = Pt(2)
        cp.paragraph_format.space_after = Pt(2)
        cp.paragraph_format.line_spacing = 1.05
        code_text = "".join(buffer)
        r = cp.add_run(code_text)
        style_run(r, font_name="Consolas", size_pt=9.5)
        p_space = doc.add_paragraph()
        p_space.paragraph_format.space_before = Pt(0)
        p_space.paragraph_format.space_after = Pt(4)

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Handle HTML header table
        if "<table class=\"header-info-table\"" in line or "<table" in line:
            # Parse student header table
            tbl_h = doc.add_table(rows=4, cols=2)
            tbl_h.alignment = WD_TABLE_ALIGNMENT.CENTER
            tblPr = tbl_h._tbl.tblPr
            borders = parse_xml(f'<w:tblBorders {nsdecls("w")}><w:top w:val="none"/><w:left w:val="none"/><w:bottom w:val="none"/><w:right w:val="none"/><w:insideH w:val="none"/><w:insideV w:val="none"/></w:tblBorders>')
            tblPr.append(borders)
            h_data = [
                ("Students Name: Krish Pathare (43), Sairam Patil (48)", ""),
                ("Subject: Artificial Intelligence and Machine Learning", ""),
                ("Semester: V", "Class: TE IT"),
                ("Division: B", "Date of Submission: 19 October 2026")
            ]
            for r_i, (c0, c1) in enumerate(h_data):
                row = tbl_h.rows[r_i]
                p0 = row.cells[0].paragraphs[0]
                p0.paragraph_format.space_after = Pt(2)
                r0 = p0.add_run(c0)
                style_run(r0, size_pt=11, bold=True)
                p1 = row.cells[1].paragraphs[0]
                p1.paragraph_format.space_after = Pt(2)
                r1 = p1.add_run(c1)
                style_run(r1, size_pt=11, bold=True)
            # Skip until </table>
            while i < len(lines) and "</table>" not in lines[i]:
                i += 1
            i += 1
            continue

        # Handle complex engineering title div
        if "class=\"complex-engineering-title\"" in line:
            title_text = re.sub(r'<[^>]+>', '', line).strip()
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(24)
            p.paragraph_format.space_after = Pt(6)
            r = p.add_run(title_text)
            style_run(r, size_pt=16, bold=True)
            i += 1
            continue

        if "class=\"project-sub-title\"" in line or "class=\"project-title\"" in line:
            sub_text = re.sub(r'<[^>]+>', '', line).strip()
            sub_text = sub_text.replace("&amp;", "&")
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(18)
            r = p.add_run(sub_text)
            style_run(r, size_pt=13.5, bold=True)
            i += 1
            continue

        # Handle Code blocks ```
        if stripped.startswith("```"):
            if in_code_block:
                in_code_block = False
                flush_code(code_buffer)
                code_buffer = []
            else:
                in_code_block = True
                code_buffer = []
            i += 1
            continue

        if in_code_block:
            code_buffer.append(line)
            i += 1
            continue

        # Handle Markdown Tables
        if stripped.startswith("|"):
            table_buffer.append(line)
            in_table = True
            i += 1
            continue
        elif in_table:
            in_table = False
            flush_table(table_buffer)
            table_buffer = []

        # Handle Headings
        if stripped.startswith("#"):
            level = len(stripped.split()[0])
            heading_text = stripped.lstrip("#").strip()
            heading_text = re.sub(r'\*\*(.*?)\*\*', r'\1', heading_text)
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(4)
            size = 15 if level == 1 else (13 if level == 2 else 11.5)
            r = p.add_run(heading_text)
            style_run(r, size_pt=size, bold=True)
            i += 1
            continue

        # Handle Bullet points
        if stripped.startswith("* ") or stripped.startswith("- "):
            bullet_text = stripped[2:].strip()
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            # Parse bold runs inside bullet
            parts = re.split(r'(\*\*.*?\*\*)', bullet_text)
            for part in parts:
                if part.startswith("**") and part.endswith("**"):
                    r = p.add_run(part[2:-2])
                    style_run(r, size_pt=10.5, bold=True)
                else:
                    r = p.add_run(part)
                    style_run(r, size_pt=10.5)
            i += 1
            continue

        # Skip empty lines or horizontal rules
        if not stripped or stripped.startswith("---") or stripped.startswith("<hr"):
            i += 1
            continue

        # Normal Paragraph
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.15
        parts = re.split(r'(\*\*.*?\*\*)', stripped)
        for part in parts:
            if part.startswith("**") and part.endswith("**"):
                r = p.add_run(part[2:-2])
                style_run(r, size_pt=11, bold=True)
            else:
                # clean math dollar signs for word display
                clean_text = part.replace("$$", "").replace("$", "")
                r = p.add_run(clean_text)
                style_run(r, size_pt=11)
        i += 1

    if in_table:
        flush_table(table_buffer)
    if in_code_block:
        flush_code(code_buffer)

    doc.save(docx_path)
    print(f"Docx generated successfully: {docx_path}")

if __name__ == "__main__":
    from generate_docx import create_experiment_docx
    create_experiment_docx("documentation/Experiment_10_FinPredict.docx")
    build_docx_from_markdown(
        "documentation/FinPredict_Complex_Engineering_Problem_Report.md",
        "documentation/FinPredict_Complex_Engineering_Problem_Report.docx",
        "FinPredict Complex Engineering Problems"
    )
