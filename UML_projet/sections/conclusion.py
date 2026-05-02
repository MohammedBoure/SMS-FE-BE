from reportlab.platypus import Paragraph, Spacer

from utils import create_indexed_heading, normal_text, subtitle_style


def build(story):
    create_indexed_heading(story, "Conclusion", level=0)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Project Summary", subtitle_style))
    story.append(Paragraph(
        """
        The UML documentation gives a structured view of the system: role responsibilities, backend
        structure, frontend-to-backend interactions, and navigation flow.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Design Value", subtitle_style))
    story.append(Paragraph(
        """
        The diagrams make the project easier to review and extend. The data structure was first studied
        from the Al Abakera Excel reference, then modeled into UML, backend APIs, frontend dashboards,
        and a hosted web setup.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Repository and Tooling Note", subtitle_style))
    story.append(Paragraph(
        """
        The project repository is available at <b>https://github.com/MohammedBoure/SMS-FE-BE</b>.
        AI-assisted tools supported analysis, documentation refinement, and UML/report quality improvements.
        """,
        normal_text,
    ))
