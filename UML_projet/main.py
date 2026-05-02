from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate, Paragraph, Spacer
from reportlab.platypus.tableofcontents import TableOfContents

from sections import (
    class_diagram,
    conclusion,
    cover_page,
    navigation,
    project_context,
    sequence,
    tech_stack,
    use_case,
)
from utils import BASE_DIR, OUTPUT_DIR, title_style


REPORT_FILENAME = "School_Management_System_UML_Report.pdf"


class IndexedDocTemplate(BaseDocTemplate):
    def afterFlowable(self, flowable):
        level = getattr(flowable, "toc_level", None)
        if level is None:
            return

        text = getattr(flowable, "toc_text", None)
        if text is None and isinstance(flowable, Paragraph):
            text = flowable.getPlainText()
        if text:
            self.notify("TOCEntry", (level, text, self.page))


def add_page_number(canvas, doc):
    page_num = canvas.getPageNumber()
    if page_num <= 1:
        return

    width, height = A4
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setStrokeColorRGB(0.82, 0.87, 0.92)
    canvas.line(20 * mm, 14 * mm, width - 20 * mm, 14 * mm)
    canvas.drawString(20 * mm, 9 * mm, "School Management System - UML Report")
    canvas.drawRightString(width - 20 * mm, 9 * mm, f"Page {page_num}")
    canvas.restoreState()


def build_doc(output_filename):
    doc = IndexedDocTemplate(
        str(output_filename),
        pagesize=A4,
        leftMargin=24,
        rightMargin=24,
        topMargin=28,
        bottomMargin=34,
        title="School Management System - UML Report",
        author="UML_projet",
    )

    frame = Frame(
        doc.leftMargin,
        doc.bottomMargin,
        doc.width,
        doc.height,
        id="main_frame",
        leftPadding=0,
        rightPadding=0,
        topPadding=0,
        bottomPadding=0,
    )
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=add_page_number)])
    return doc


def add_table_of_contents(story):
    story.append(Paragraph("Table of Contents", title_style))
    story.append(Spacer(1, 10))

    toc = TableOfContents()
    toc.levelStyles = [
        ParagraphStyle(
            name="TOCLevel0",
            fontSize=10.5,
            fontName="Helvetica-Bold",
            leftIndent=0,
            firstLineIndent=0,
            spaceBefore=5,
            leading=13,
        ),
        ParagraphStyle(
            name="TOCLevel1",
            fontSize=9,
            fontName="Helvetica",
            leftIndent=18,
            firstLineIndent=0,
            spaceBefore=2,
            leading=11,
        ),
    ]
    story.append(toc)
    story.append(Spacer(1, 14))


def validate_required_svgs():
    required = [
        "Navigation_Diagram.svg",
        "SchoolManagementSystem_A3.svg",
        "Sequence_Accountant.svg",
        "Sequence_Admin.svg",
        "Sequence_Parent.svg",
        "Sequence_Receptionist.svg",
        "Sequence_Student.svg",
        "Sequence_Teacher.svg",
        "UseCase_Accountant.svg",
        "UseCase_Admin.svg",
        "UseCase_Parent.svg",
        "UseCase_Receptionist.svg",
        "UseCase_Student.svg",
        "UseCase_Teacher.svg",
    ]
    missing = [name for name in required if not (BASE_DIR / name).exists()]
    if missing:
        formatted = "\n".join(f" - {name}" for name in missing)
        raise FileNotFoundError(f"Missing required SVG files in {BASE_DIR}:\n{formatted}")


def output_candidates(path):
    yield path
    for index in range(1, 100):
        yield path.with_name(f"{path.stem}_{index}{path.suffix}")


def build_story():
    story = []
    cover_page.build(story)
    cover_page.build_resume(story)
    add_table_of_contents(story)
    cover_page.build_introduction(story)
    project_context.build(story)
    use_case.build(story)
    class_diagram.build(story)
    sequence.build(story)
    navigation.build(story)
    tech_stack.build(story)
    conclusion.build(story)
    return story


def build_pdf(output_filename=None):
    validate_required_svgs()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    output_path = Path(output_filename) if output_filename else OUTPUT_DIR / REPORT_FILENAME
    last_error = None

    for candidate in output_candidates(output_path):
        try:
            doc = build_doc(candidate)
            doc.multiBuild(build_story())
            print(f"Successfully generated: {candidate}")
            return candidate
        except PermissionError as error:
            last_error = error

    raise PermissionError(
        f"Could not write the PDF report. Close any open report files in {OUTPUT_DIR} and try again."
    ) from last_error

if __name__ == "__main__":
    build_pdf()
