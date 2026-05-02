from reportlab.platypus import PageBreak, Paragraph, Spacer

from utils import create_indexed_heading, normal_text, subtitle_style


def build(story):
    create_indexed_heading(story, "Conclusion", level=0)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Project Summary", subtitle_style))
    story.append(Paragraph(
        """
        The UML documentation provides a complete view of the School Management System. The use case diagrams
        define role responsibilities, the class diagram explains backend structure, the sequence diagrams show
        runtime frontend-to-backend collaboration, and the navigation diagram clarifies how users move through
        the interface.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Design Value", subtitle_style))
    story.append(Paragraph(
        """
        Together, the diagrams make the system easier to understand, review, and extend. They separate user
        responsibilities clearly, expose the core backend domains, and document the flow of data between the
        browser, API layer, and database.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 10))
    story.append(Paragraph("Repository and Tooling Note", subtitle_style))
    story.append(Paragraph(
        """
        The project repository is available at <b>https://github.com/MohammedBoure/SMS-FE-BE</b>.
        AI-assisted tools were used to support development analysis, documentation refinement, and UML/report
        quality improvements.
        """,
        normal_text,
    ))

    story.append(PageBreak())
