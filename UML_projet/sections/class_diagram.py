from reportlab.platypus import PageBreak, Paragraph, Spacer

from utils import add_caption, create_indexed_heading, diagram_path, make_table, normal_text, render_diagram


def build(story):
    create_indexed_heading(story, "Chapter 3 - System Design", level=0)
    story.append(Spacer(1, 8))

    create_indexed_heading(story, "Introduction", level=1)
    story.append(Paragraph(
        """
        The design chapter explains how requirements are transformed into software architecture,
        data models, UML diagrams, REST APIs, and user interfaces. The goal is to ensure a coherent,
        maintainable, and extensible structure.
        """,
        normal_text,
    ))

    create_indexed_heading(story, "General System Architecture", level=1)
    story.append(Paragraph(
        """
        The system follows a separated-layer web architecture. The frontend manages display,
        user experience, and role interactions. The FastAPI backend exposes business services
        through REST endpoints. The MySQL database stores data, relationships, and integrity
        constraints.
        """,
        normal_text,
    ))
    story.append(make_table([
        ["Layer", "Responsibility", "Project Elements"],
        ["Presentation", "Display dashboards, forms, tables, messages, and preferences.", "HTML, CSS, JavaScript, role pages, i18n, auth, api, and preferences modules."],
        ["API services", "Receive requests, validate data, apply business logic, and return JSON responses.", "FastAPI, routers, dependencies, Pydantic, and Uvicorn."],
        ["Data", "Store entities, relationships, history, and integrity constraints.", "MySQL, data managers, relational tables, and foreign keys."],
    ], [85, 195, 208]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Nominal Data Flow", level=1)
    story.append(Paragraph(
        """
        A typical scenario starts with a user action in the dashboard. The frontend controller calls a
        JavaScript service, which sends an HTTP request to the appropriate FastAPI router. The router
        delegates the operation to a data manager and returns a structured response to the frontend.
        The interface is then updated without exposing the database directly to the client.
        """,
        normal_text,
    ))

    create_indexed_heading(story, "Database Modeling", level=1)
    story.append(Paragraph(
        """
        The database is organized around school and relational entities. The tables cover identity,
        profiles, classes, programs, enrollments, assignments, resources, assessments, grades,
        attendance, finance, and communication.
        """,
        normal_text,
    ))
    story.append(make_table([
        ["View", "Description"],
        ["Conceptual model", "The main concepts are User, Student, Parent, Teacher, Class, Program, Enrollment, Assessment, Grade, Attendance, Fee, Payment, Message, Notification, and Post."],
        ["Logical model", "Relationships are translated into tables with primary and foreign keys. A parent can be linked to several students, a teacher receives assignments, a class groups enrollments, and an assessment produces grades."],
        ["Physical model", "The MySQL implementation defines data types, constraints, indexes, and integrity rules required by the API."],
    ], [90, 398]))
    story.append(Spacer(1, 8))
    story.append(make_table([
        ["Family", "Main Tables"],
        ["Identity", "roles, users, parents, students, teachers"],
        ["Academic", "programs, classes, student_enrollments, teacher_assignments, subjects, resources, assessments, grades, attendance, schedules"],
        ["Finance", "student_fees, payments, user_transactions"],
        ["Communication", "conversations, messages, notifications, posts"],
    ], [100, 388]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Class Diagram", level=1)
    story.append(Paragraph(
        """
        The class diagram summarizes the backend structure and the main relationships between domain
        entities and data managers. It is a reference for understanding how the system modules
        cooperate around the same database.
        """,
        normal_text,
    ))
    story.append(PageBreak())

    create_indexed_heading(story, "School Management System Class Diagram", level=2, visible=False)
    render_diagram(story, diagram_path("SchoolManagementSystem_A3.svg"), "")
    add_caption(story, "Figure 3.1 - School Management System class diagram.")
    story.append(PageBreak())
