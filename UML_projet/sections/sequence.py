from reportlab.platypus import PageBreak, Paragraph, Spacer

from utils import create_indexed_heading, diagram_path, normal_text, render_diagram, subtitle_style


SEQUENCE_DIAGRAMS = [
    ("Admin", "Sequence_Admin.svg"),
    ("Receptionist", "Sequence_Receptionist.svg"),
    ("Accountant", "Sequence_Accountant.svg"),
    ("Teacher", "Sequence_Teacher.svg"),
    ("Student", "Sequence_Student.svg"),
    ("Parent", "Sequence_Parent.svg"),
]


def build(story):
    create_indexed_heading(story, "Dynamic Models: Sequence Diagrams", level=0)
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        """
        The sequence diagrams describe how each role interacts with the application at runtime. The
        common pattern is: user action in the frontend, role controller handling, service/API request,
        FastAPI router processing, database operation, then UI rendering of the result.
        """,
        normal_text,
    ))
    story.append(PageBreak())

    for role, filename in SEQUENCE_DIAGRAMS:
        create_indexed_heading(story, f"{role} Sequence Diagram", level=1, visible=False)
        render_diagram(story, diagram_path(filename), "")
        story.append(PageBreak())

    story.append(Paragraph("Sequence Flow Summary", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        """
        <b>Admin:</b> authentication, route selection, data loading, and full create/update/delete administration.
        <br/><br/>
        <b>Receptionist:</b> dashboard bootstrap, student and parent registration, student records, payments,
        posts, messaging, and notifications.
        <br/><br/>
        <b>Accountant:</b> finance workspace loading, student financial files, fee creation, payment recording,
        notices, attendance reports, messaging, and notification updates.
        <br/><br/>
        <b>Teacher:</b> teacher profile resolution, assignments, schedules, attendance, assessments, grades,
        resources, messaging, and notifications.
        <br/><br/>
        <b>Student:</b> linked profile resolution, academic self-service views, messages, and notifications.
        <br/><br/>
        <b>Parent:</b> parent profile resolution, linked children aggregation, child monitoring, posts,
        messages, and notifications.
        """,
        normal_text,
    ))
    story.append(PageBreak())
