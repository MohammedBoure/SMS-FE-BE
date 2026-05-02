import math
from io import BytesIO
from pathlib import Path
from xml.etree import ElementTree as ET

from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import white
from reportlab.platypus import Flowable, PageBreak, Paragraph
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY
from reportlab.lib.units import mm
from svglib.svglib import svg2rlg

UML_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = UML_DIR.parent
BASE_DIR = PROJECT_ROOT / "out" / "UML_projet"
OUTPUT_DIR = BASE_DIR
LOGO_PATH = UML_DIR / "logo.png"

PAGE_WIDTH, PAGE_HEIGHT = A4
MAX_IMG_WIDTH = PAGE_WIDTH - 60
MAX_IMG_HEIGHT = PAGE_HEIGHT - 70
TALL_DIAGRAM_RATIO = 1.85

styles = getSampleStyleSheet()
title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=23, spaceAfter=16, alignment=TA_CENTER, fontName="Helvetica-Bold", leading=28)
subtitle_style = ParagraphStyle('SubtitleStyle', parent=styles['Heading2'], fontSize=15, spaceAfter=11, alignment=TA_CENTER, fontName="Helvetica-Bold", leading=18)
normal_center = ParagraphStyle('NormalCenter', parent=styles['Normal'], fontSize=10.5, spaceAfter=6, alignment=TA_CENTER, fontName="Helvetica", leading=13)
normal_text = ParagraphStyle('NormalText', parent=styles['Normal'], fontSize=10.2, spaceAfter=8, alignment=TA_JUSTIFY, fontName="Helvetica", leading=14)
diagram_title_style = ParagraphStyle('DiagramTitle', parent=styles['Heading1'], fontSize=15, spaceAfter=12, alignment=TA_CENTER, fontName="Helvetica-Bold", leading=18)

styles.add(ParagraphStyle(name='TOCHeading', parent=styles['Heading1'], fontSize=17, spaceAfter=11, fontName="Helvetica-Bold", leading=21))
styles.add(ParagraphStyle(name='TOCHeading_L1', parent=styles['Normal'], fontSize=10.5, leftIndent=18, spaceBefore=4, fontName="Helvetica-Bold", leading=13))
styles.add(ParagraphStyle(name='HiddenTOCHeading', parent=styles['Normal'], fontSize=0.1, leading=0.1, spaceAfter=0, textColor=white))

class TOCMarker(Flowable):
    def __init__(self, text, level):
        super().__init__()
        self.toc_text = text
        self.toc_level = level

    def wrap(self, availWidth, availHeight):
        return 0, 0

    def draw(self):
        return None

def create_indexed_heading(story, text, level=0, visible=True):
    if not visible:
        story.append(TOCMarker(text, level))
        return

    style = styles['HiddenTOCHeading'] if not visible else styles['TOCHeading'] if level == 0 else styles['TOCHeading_L1']
    p = Paragraph(text, style)
    p.toc_level = level
    story.append(p)
    if visible:
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

def fill_drawing(drawing, max_width, max_height):
    if drawing is None:
        return None
    scale_x = max_width / drawing.width
    scale_y = max_height / drawing.height
    drawing.width = max_width
    drawing.height = max_height
    drawing.scale(scale_x, scale_y)
    drawing.hAlign = 'CENTER'
    return drawing

def diagram_path(filename):
    return BASE_DIR / filename

def _svg_viewbox(root, drawing):
    viewbox = root.get("viewBox")
    if viewbox:
        parts = [float(part) for part in viewbox.replace(",", " ").split()]
        if len(parts) == 4:
            return parts
    return [0.0, 0.0, float(drawing.width), float(drawing.height)]

def _build_svg_slices(filepath, drawing):
    ET.register_namespace("", "http://www.w3.org/2000/svg")
    ET.register_namespace("xlink", "http://www.w3.org/1999/xlink")

    source_tree = ET.parse(filepath)
    source_root = source_tree.getroot()
    view_x, view_y, view_width, view_height = _svg_viewbox(source_root, drawing)
    slice_height = min(view_height, view_width * (MAX_IMG_HEIGHT / MAX_IMG_WIDTH))
    slice_count = max(1, math.ceil(view_height / slice_height))
    elements = []

    for index in range(slice_count):
        if index > 0:
            elements.append(PageBreak())

        top = view_y + index * slice_height
        current_height = min(slice_height, view_y + view_height - top)
        root = ET.fromstring(ET.tostring(source_root, encoding="utf-8"))
        root.set("viewBox", f"{view_x:g} {top:g} {view_width:g} {current_height:g}")
        root.set("width", f"{view_width:g}px")
        root.set("height", f"{current_height:g}px")
        root.set("preserveAspectRatio", "xMidYMin meet")

        slice_bytes = ET.tostring(root, encoding="utf-8", xml_declaration=True)
        slice_drawing = svg2rlg(BytesIO(slice_bytes))
        elements.append(scale_drawing(slice_drawing, MAX_IMG_WIDTH, MAX_IMG_HEIGHT))

    return elements

def render_diagram(story, filepath, title):
    filepath = Path(filepath)
    if not filepath.exists():
        return False

    try:
        drawing = svg2rlg(str(filepath))
        if not drawing:
            return False

        should_fill_page = filepath.name.startswith("Sequence_")
        is_tall_and_unreadable = drawing.height / drawing.width > TALL_DIAGRAM_RATIO
        if is_tall_and_unreadable and not should_fill_page:
            try:
                story.extend(_build_svg_slices(filepath, drawing))
            except Exception:
                story.append(scale_drawing(drawing, MAX_IMG_WIDTH, MAX_IMG_HEIGHT))
        elif should_fill_page:
            story.append(fill_drawing(drawing, MAX_IMG_WIDTH, MAX_IMG_HEIGHT))
        else:
            story.append(scale_drawing(drawing, MAX_IMG_WIDTH, MAX_IMG_HEIGHT))
        return True
    except Exception as e:
        story.append(Paragraph(f"<i>Diagram could not be rendered: {filepath.name}<br/>Error: {str(e)}</i>", normal_center))
        return False

def render_svg_markup(story, svg_markup, name="diagram.svg", fill_page=True):
    try:
        drawing = svg2rlg(BytesIO(svg_markup.encode("utf-8")))
        if not drawing:
            return False
        if fill_page:
            story.append(fill_drawing(drawing, MAX_IMG_WIDTH, MAX_IMG_HEIGHT))
        else:
            story.append(scale_drawing(drawing, MAX_IMG_WIDTH, MAX_IMG_HEIGHT))
        return True
    except Exception as e:
        story.append(Paragraph(f"<i>Diagram could not be rendered: {name}<br/>Error: {str(e)}</i>", normal_center))
        return False

def add_page_number(canvas, doc):
    page_num = canvas.getPageNumber()
    if page_num > 1:
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.drawCentredString(PAGE_WIDTH/2, 10*mm, f"Page {page_num}")
        canvas.drawString(18*mm, 10*mm, "School Management System - UML Report")
        canvas.restoreState()
