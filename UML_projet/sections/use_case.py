from reportlab.platypus import PageBreak, Paragraph, Spacer

from utils import create_indexed_heading, diagram_path, normal_text, render_diagram, subtitle_style


USE_CASE_DIAGRAMS = [
    ("Admin", "UseCase_Admin.svg"),
    ("Receptionist", "UseCase_Receptionist.svg"),
    ("Accountant", "UseCase_Accountant.svg"),
    ("Teacher", "UseCase_Teacher.svg"),
    ("Student", "UseCase_Student.svg"),
    ("Parent", "UseCase_Parent.svg"),
]


def build(story):
    create_indexed_heading(story, "Functional Models: Use Case Diagrams", level=0)
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        """
        The use case diagrams define the visible services of the School Management System for each role.
        They show the functional boundary of every dashboard and clarify which operations belong to
        administration, reception, accounting, teaching, learner self-service, and parent follow-up.
        """,
        normal_text,
    ))
    story.append(Paragraph("Use Case Scope", subtitle_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        """
        <b>Admin:</b> complete system administration across people, academic, finance, posts, and notifications.
        <br/>
        <b>Receptionist:</b> front-desk workflows for students, parents, records, finance lookup, posts, and communication.
        <br/>
        <b>Accountant:</b> fees, payments, transactions, student financial files, notices, and attendance reports.
        <br/>
        <b>Teacher:</b> assignments, schedules, attendance, assessments, grades, resources, messages, and notifications.
        <br/>
        <b>Student:</b> read-only academic self-service: schedule, assessments, grades, attendance, resources, posts,
        fees, messages, and notifications.
        <br/>
        <b>Parent:</b> child monitoring: grades, attendance, fees, posts, messages, and notifications.
        """,
        normal_text,
    ))
    story.append(PageBreak())

    for role, filename in USE_CASE_DIAGRAMS:
        create_indexed_heading(story, f"{role} Use Case Diagram", level=1, visible=False)
        render_diagram(story, diagram_path(filename), "")
        story.append(PageBreak())
