from reportlab.platypus import PageBreak, Paragraph, Spacer

from utils import create_indexed_heading, diagram_path, normal_text, render_diagram, subtitle_style


def build(story):
    create_indexed_heading(story, "Structural Model: Class Diagram", level=0)
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        """
        The class diagram presents the backend structure of the School Management System. It groups
        the database managers and domain entities used to support identity, academic management,
        learning operations, finance, communication, and publication features.
        """,
        normal_text,
    ))
    story.append(PageBreak())

    create_indexed_heading(story, "School Management System Class Diagram", level=1, visible=False)
    render_diagram(story, diagram_path("SchoolManagementSystem_A3.svg"), "")
    story.append(PageBreak())

    story.append(Paragraph("Structural Responsibilities", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        """
        <b>Identity and people:</b> users, parents, students, teachers, authentication, and role ownership.
        <br/><br/>
        <b>Academic structure:</b> programs, classes, enrollments, subjects, and teacher assignments.
        <br/><br/>
        <b>Learning operations:</b> schedules, attendance, assessments, grades, and educational resources.
        <br/><br/>
        <b>Finance:</b> student fees, payments, and user transactions.
        <br/><br/>
        <b>Communication:</b> conversations, messages, notifications, and posts.
        """,
        normal_text,
    ))
    story.append(PageBreak())
