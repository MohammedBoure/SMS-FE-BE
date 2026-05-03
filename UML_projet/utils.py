import math
from io import BytesIO
from pathlib import Path
from xml.etree import ElementTree as ET

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.colors import white
from reportlab.platypus import Flowable, ListFlowable, ListItem, PageBreak, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.units import mm
from svglib.svglib import svg2rlg

UML_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = UML_DIR.parent
BASE_DIR = PROJECT_ROOT / "out" / "UML_projet"
OUTPUT_DIR = BASE_DIR
LOGO_PATH = UML_DIR / "logo.png"

PAGE_WIDTH, PAGE_HEIGHT = A4
MAX_IMG_WIDTH = PAGE_WIDTH - 40 * mm
MAX_IMG_HEIGHT = PAGE_HEIGHT - 62 * mm
TALL_DIAGRAM_RATIO = 1.85

styles = getSampleStyleSheet()
PRIMARY = colors.HexColor("#1F3A5F")
ACCENT = colors.HexColor("#0F766E")
TEXT = colors.HexColor("#1E293B")
MUTED = colors.HexColor("#475569")
BORDER = colors.HexColor("#B7C6D6")
SOFT = colors.HexColor("#F4F8FB")

REPORT_FONT = "Times-Roman"
REPORT_FONT_BOLD = "Times-Bold"
REPORT_FONT_ITALIC = "Times-Italic"

title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], fontSize=22, spaceAfter=15, alignment=TA_CENTER, fontName=REPORT_FONT_BOLD, leading=27, textColor=PRIMARY)
subtitle_style = ParagraphStyle('SubtitleStyle', parent=styles['Heading2'], fontSize=13.5, spaceAfter=9, alignment=TA_CENTER, fontName=REPORT_FONT_BOLD, leading=17, textColor=PRIMARY)
normal_center = ParagraphStyle('NormalCenter', parent=styles['Normal'], fontSize=10.3, spaceAfter=6, alignment=TA_CENTER, fontName=REPORT_FONT, leading=13, textColor=TEXT)
normal_text = ParagraphStyle('NormalText', parent=styles['Normal'], fontSize=10.1, spaceAfter=7, alignment=TA_JUSTIFY, fontName=REPORT_FONT, leading=14.2, textColor=TEXT)
normal_left = ParagraphStyle('NormalLeft', parent=normal_text, alignment=TA_LEFT)
small_text = ParagraphStyle('SmallText', parent=normal_text, fontSize=8.7, leading=11.2, spaceAfter=4)
diagram_title_style = ParagraphStyle('DiagramTitle', parent=styles['Heading1'], fontSize=14.5, spaceAfter=10, alignment=TA_CENTER, fontName=REPORT_FONT_BOLD, leading=18, textColor=PRIMARY)
caption_style = ParagraphStyle('CaptionStyle', parent=styles['Normal'], fontSize=8.4, leading=10.5, spaceBefore=5, spaceAfter=10, alignment=TA_CENTER, fontName=REPORT_FONT_ITALIC, textColor=MUTED)

styles.add(ParagraphStyle(name='TOCHeading', parent=styles['Heading1'], fontSize=16.5, spaceBefore=4, spaceAfter=11, fontName=REPORT_FONT_BOLD, leading=20, textColor=PRIMARY))
styles.add(ParagraphStyle(name='TOCHeading_L1', parent=styles['Heading2'], fontSize=12.1, spaceBefore=8, spaceAfter=6, fontName=REPORT_FONT_BOLD, leading=15, textColor=PRIMARY))
styles.add(ParagraphStyle(name='TOCHeading_L2', parent=styles['Normal'], fontSize=10.3, leftIndent=10, spaceBefore=5, spaceAfter=3, fontName=REPORT_FONT_BOLD, leading=13, textColor=TEXT))
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

    if level <= 0:
        style = styles['TOCHeading']
    elif level == 1:
        style = styles['TOCHeading_L1']
    else:
        style = styles['TOCHeading_L2']
    p = Paragraph(text, style)
    p.toc_level = level
    story.append(p)
    if visible:
        story.append(Paragraph(f'<a name="{text.replace(" ", "_")}"/>', styles['Normal']))

def add_caption(story, text):
    caption = Paragraph(text, caption_style)
    caption.figure_text = text
    story.append(caption)

def bullet_list(items, bullet_type="bullet", left_indent=18):
    return ListFlowable(
        [ListItem(Paragraph(item, normal_text), leftIndent=8) for item in items],
        bulletType=bullet_type,
        leftIndent=left_indent,
        bulletFontName="Helvetica-Bold",
        bulletFontSize=7,
        bulletOffsetY=1,
        spaceBefore=2,
        spaceAfter=6,
    )

def make_table(rows, col_widths, header=True, h_align="CENTER"):
    header_style = ParagraphStyle(
        "ReportTableHeader",
        parent=small_text,
        fontName=REPORT_FONT_BOLD,
        textColor=PRIMARY,
        alignment=TA_LEFT,
    )
    cell_style = ParagraphStyle(
        "ReportTableCell",
        parent=small_text,
        alignment=TA_LEFT,
    )

    formatted_rows = [
        [
            Paragraph(str(cell), header_style if header and row_index == 0 else cell_style)
            for cell in row
        ]
        for row_index, row in enumerate(rows)
    ]

    table = Table(formatted_rows, colWidths=col_widths, hAlign=h_align, repeatRows=1 if header else 0)
    style_commands = [
        ("GRID", (0, 0), (-1, -1), 0.32, BORDER),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("ROWBACKGROUNDS", (0, 1 if header else 0), (-1, -1), [colors.white, SOFT]),
    ]
    if header:
        style_commands.append(("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EAF2F8")))
    table.setStyle(TableStyle(style_commands))
    return table

def add_paragraphs(story, paragraphs):
    for paragraph in paragraphs:
        story.append(Paragraph(paragraph, normal_text))
        story.append(Spacer(1, 2))

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
        canvas.setFont(REPORT_FONT, 9)
        canvas.drawCentredString(PAGE_WIDTH/2, 10*mm, f"Page {page_num}")
        canvas.drawString(18*mm, 10*mm, "School Management System - Design Report")
        canvas.restoreState()
