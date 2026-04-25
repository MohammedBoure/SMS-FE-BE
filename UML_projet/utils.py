import os
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import Paragraph, PageBreak, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.units import mm
from svglib.svglib import svg2rlg

BASE_DIR = "out"
PAGE_WIDTH, PAGE_HEIGHT = landscape(A4)
MAX_IMG_WIDTH = PAGE_WIDTH - 100
MAX_IMG_HEIGHT = PAGE_HEIGHT - 240

styles = getSampleStyleSheet()
title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=28, spaceAfter=30, alignment=TA_CENTER, fontName="Helvetica-Bold")
subtitle_style = ParagraphStyle('SubtitleStyle', parent=styles['Heading2'], fontSize=18, spaceAfter=20, alignment=TA_CENTER, fontName="Helvetica")
normal_center = ParagraphStyle('NormalCenter', parent=styles['Normal'], fontSize=14, spaceAfter=10, alignment=TA_CENTER, fontName="Helvetica")
normal_text = ParagraphStyle('NormalText', parent=styles['Normal'], fontSize=12, spaceAfter=10, alignment=TA_JUSTIFY, fontName="Helvetica", leading=16)
diagram_title_style = ParagraphStyle('DiagramTitle', parent=styles['Heading1'], fontSize=20, spaceAfter=20, alignment=TA_CENTER, fontName="Helvetica-Bold")

styles.add(ParagraphStyle(name='TOCHeading', parent=styles['Heading1'], fontSize=18, spaceAfter=15, fontName="Helvetica-Bold"))
styles.add(ParagraphStyle(name='TOCHeading_L1', parent=styles['Normal'], fontSize=12, leftIndent=20, spaceBefore=5, fontName="Helvetica-Bold"))

def create_indexed_heading(story, text, level=0):
    style = styles['TOCHeading'] if level == 0 else styles['TOCHeading_L1']
    p = Paragraph(text, style)
    p.toc_level = level
    story.append(p)
    story.append(Paragraph(f'<a name="{text.replace(" ", "_")}"/>', styles['Normal']))

def scale_drawing(drawing, max_width, max_height):
    if drawing is None: return None
    scale_factor = min(max_width / drawing.width, max_height / drawing.height)
    if scale_factor < 1.0:
        drawing.width = drawing.width * scale_factor
        drawing.height = drawing.height * scale_factor
        drawing.scale(scale_factor, scale_factor)
    drawing.hAlign = 'CENTER'
    return drawing

def render_diagram(story, filepath, title):
    if title:
        story.append(Paragraph(title, diagram_title_style))
    if os.path.exists(filepath):
        try:
            drawing = svg2rlg(filepath)
            if drawing:
                story.append(scale_drawing(drawing, MAX_IMG_WIDTH, MAX_IMG_HEIGHT))
            else:
                story.append(Paragraph("<i>Error reading diagram data.</i>", normal_center))
        except Exception as e:
            story.append(Paragraph(f"<i>Failed to load: {os.path.basename(filepath)}<br/>Error: {str(e)}</i>", normal_center))
    else:
        story.append(Paragraph(f"<i>Warning: File not found -> {filepath}</i>", normal_center))

def add_page_number(canvas, doc):
    page_num = canvas.getPageNumber()
    if page_num > 1:
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.drawCentredString(PAGE_WIDTH/2, 10*mm, f"Page {page_num}")
        canvas.drawString(20*mm, 10*mm, "School Management System - Project Report")
        canvas.restoreState()