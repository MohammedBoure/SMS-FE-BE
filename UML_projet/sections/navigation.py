from reportlab.platypus import PageBreak, Paragraph, Spacer

from utils import create_indexed_heading, diagram_path, normal_text, render_diagram, subtitle_style


def build(story):
    create_indexed_heading(story, "User Interface: Navigation Diagram", level=0)
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        """
        The navigation diagram documents how users move from the entry point and authentication page
        into their role-specific dashboards. It also shows the shared frontend controls and the major
        section families exposed by each role.
        """,
        normal_text,
    ))
    story.append(Paragraph("Navigation Flow", subtitle_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph(
        """
        <b>Entry:</b> users start from the index/login flow, where authentication determines the target dashboard.
        <br/>
        <b>Dashboards:</b> Admin, Receptionist, Accountant, Teacher, Student, and Parent each have a dedicated page
        and role controller.
        <br/>
        <b>Sections:</b> navigation buttons call the active role controller, which loads the selected section and
        renders the corresponding UI.
        <br/>
        <b>Shared controls:</b> authentication checks, language switching, theme preferences, logout, messaging,
        and notifications are reused across dashboards.
        """,
        normal_text,
    ))
    story.append(PageBreak())

    create_indexed_heading(story, "Role-Based Navigation Diagram", level=1, visible=False)
    render_diagram(story, diagram_path("Navigation_Diagram.svg"), "")
    story.append(PageBreak())
