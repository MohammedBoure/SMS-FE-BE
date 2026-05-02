from reportlab.lib.units import inch
from reportlab.platypus import Image, PageBreak, Paragraph, Spacer

from utils import BASE_DIR, create_indexed_heading, normal_text, subtitle_style


INTERFACE_SCREENSHOTS = [
    ("Parent Messages", "parent-messages.PNG"),
    ("Parent - My Children", "parent-mychild.PNG"),
    ("Post Details", "Post.PNG"),
    ("Posts Board", "Posts.PNG"),
    ("Teacher Grades", "teacher-grades.PNG"),
    ("Teacher Resources", "teacher-ressources.PNG"),
]


def _append_screenshot(story, title, filename):
    path = BASE_DIR / filename
    story.append(Paragraph(title, subtitle_style))
    story.append(Spacer(1, 4))

    if not path.exists():
        story.append(Paragraph(f"Screenshot not found: {filename}", normal_text))
        story.append(Spacer(1, 10))
        return

    image = Image(str(path), width=6.35 * inch, height=3.05 * inch, kind="proportional")
    image.hAlign = "CENTER"
    story.append(image)
    story.append(Spacer(1, 12))


def build(story):
    story.append(PageBreak())
    create_indexed_heading(story, "Application Interface Showcase", level=0)
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        """
        The following screenshots present the visual side of the implemented application. Each image
        represents one concrete interface from the role-based dashboards.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 8))

    for index, (title, filename) in enumerate(INTERFACE_SCREENSHOTS, start=1):
        _append_screenshot(story, title, filename)
        if index % 2 == 0 and index < len(INTERFACE_SCREENSHOTS):
            story.append(PageBreak())

    story.append(PageBreak())
