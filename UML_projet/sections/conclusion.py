from reportlab.platypus import Paragraph, Spacer

from utils import create_indexed_heading, make_table, normal_text


def build(story):
    create_indexed_heading(story, "General Conclusion", level=0)
    story.append(Spacer(1, 8))

    story.append(Paragraph(
        """
        This work made it possible to design and implement a web-based school management application
        covering administrative, academic, financial, and communication dimensions. The project starts
        from a concrete need: replacing scattered management practices with a centralized, structured,
        and role-based platform.
        """,
        normal_text,
    ))
    story.append(Paragraph(
        """
        The existing-system study revealed the limits of manual documents and disconnected tools. The
        requirements analysis identified actors, modules, and quality constraints. UML design
        formalized use cases, the structural model, interaction sequences, and navigation. Finally,
        implementation materialized these choices in a frontend/backend architecture connected to a
        MySQL database.
        """,
        normal_text,
    ))

    story.append(Spacer(1, 8))
    create_indexed_heading(story, "Project Assessment", level=1)
    story.append(make_table([
        ["Aspect", "Result"],
        ["Functional", "Dedicated dashboards for administrator, receptionist, accountant, teacher, student, and parent."],
        ["Technical", "RESTful architecture with JavaScript frontend, FastAPI backend, and MySQL relational database."],
        ["Modeling", "Use case, class, sequence, and navigation diagrams integrated into the report."],
        ["User experience", "Role-based interfaces, theme support, languages, messaging, notifications, and posts."],
        ["Documentation", "Academic report structured around context, requirements, design, implementation, and testing."],
    ], [115, 373]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Future Work", level=1)
    story.append(make_table([
        ["Perspective", "Possible Improvement"],
        ["Advanced security", "Add token-based authentication, stronger password policies, and audit logging."],
        ["Reporting", "Create PDF/Excel exports for grades, attendance, fees, and class statistics."],
        ["Deployment", "Prepare a Docker environment and a reproducible production configuration."],
        ["Automated tests", "Add backend unit tests, API integration tests, and frontend end-to-end tests."],
        ["Mobile experience", "Improve responsive behavior or provide a dedicated mobile experience for parents and students."],
    ], [115, 373]))

    story.append(Spacer(1, 8))
    story.append(Paragraph(
        """
        In conclusion, the School Management System provides a solid basis for modernizing school
        administration. Its modular structure supports gradual evolution and keeps a clear connection
        between analysis, design, and implementation.
        """,
        normal_text,
    ))
