from reportlab.platypus import PageBreak, Paragraph, Spacer

from utils import create_indexed_heading, normal_text, subtitle_style


PROJECT_GITHUB_URL = "https://github.com/MohammedBoure/SMS-FE-BE"


TECH_SECTIONS = [
    (
        "Frontend Layer",
        """
        The frontend is a static web application built with <b>HTML5</b>, <b>CSS3</b>, and
        <b>vanilla JavaScript</b>. It uses shared core modules for routing, authentication,
        local storage, API calls, preferences, and internationalization. Each role has its own
        page, controller, service layer, and UI renderer.
        """,
    ),
    (
        "Backend API Layer",
        """
        The backend is built with <b>Python</b> and <b>FastAPI</b>. The API is organized into
        routers for users, parents, students, teachers, classes, enrollments, schedules,
        attendance, assessments, grades, resources, fees, payments, transactions, notifications,
        messages, posts, and programs. <b>Uvicorn</b> is used as the ASGI server and
        <b>Pydantic</b> supports request/response validation.
        """,
    ),
    (
        "Database and Persistence",
        """
        The persistence layer uses a relational database accessed through <b>mysql-connector-python</b>
        and <b>SQLAlchemy</b> utilities. Database managers separate identity, academic, learning,
        finance, and communication responsibilities.
        """,
    ),
    (
        "Documentation and UML Report",
        """
        UML diagrams are exported as <b>SVG</b> assets and embedded into the PDF report with
        <b>ReportLab</b> and <b>svglib</b>. The report covers use case diagrams, the class diagram,
        sequence diagrams, and the navigation diagram.
        """,
    ),
    (
        "Hosting and Cloud Access",
        """
        The application was prepared for hosted access by configuring port forwarding for both the
        frontend and backend services. This made it possible to demonstrate and test the web interface
        and the FastAPI API from outside the local development environment. Cloud services were used to
        support remote availability, collaboration, and practical validation of the web architecture.
        """,
    ),
    (
        "Artificial Intelligence Assistance",
        """
        AI-assisted tools were used during the project to support analysis, code review, UML/report
        refinement, and documentation improvement. The final implementation and modeling decisions
        remain part of the team project work.
        """,
    ),
    (
        "Project Repository",
        f"""
        The project source code is available on GitHub:
        <br/><b>{PROJECT_GITHUB_URL}</b>
        """,
    ),
]


def build(story):
    create_indexed_heading(story, "Technology Stack, Deployment, and Repository", level=0)
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        """
        This section lists the technologies directly used by the School Management System, its UML report,
        and its hosted demonstration setup.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 8))

    for title, description in TECH_SECTIONS:
        story.append(Paragraph(title, subtitle_style))
        story.append(Paragraph(description, normal_text))
        story.append(Spacer(1, 6))

    story.append(PageBreak())
