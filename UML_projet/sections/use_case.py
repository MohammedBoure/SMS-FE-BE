from reportlab.platypus import PageBreak, Paragraph, Spacer

from utils import add_caption, create_indexed_heading, diagram_path, make_table, normal_text, render_diagram


USE_CASE_DIAGRAMS = [
    ("2.1", "Administrator", "Use_Case_Admin.svg"),
    ("2.2", "Receptionist", "Use_Case_Receptionist.svg"),
    ("2.3", "Accountant", "Use_Case_Accountant.svg"),
    ("2.4", "Teacher", "Use_Case_Teacher.svg"),
    ("2.5", "Student", "Use_Case_Student.svg"),
    ("2.6", "Parent", "Use_Case_Parent.svg"),
]


def build(story):
    create_indexed_heading(story, "Chapter 2 - Requirements Analysis", level=0)
    story.append(Spacer(1, 8))

    create_indexed_heading(story, "Introduction", level=1)
    story.append(Paragraph(
        """
        Requirements analysis transforms the problem statement into concrete specifications. It
        identifies the actors, expected functions, quality constraints, and use cases that guide the
        UML design and the implementation.
        """,
        normal_text,
    ))

    create_indexed_heading(story, "Actor Identification", level=1)
    story.append(make_table([
        ["Actor", "Main Responsibilities", "Application Space"],
        ["Administrator", "Manage users, academic data, resources, finance, posts, and notifications.", "Admin dashboard"],
        ["Receptionist", "Create and consult student/parent files, search records, and perform front-office operations.", "Reception dashboard"],
        ["Accountant", "Track fees, payments, transactions, balances, and financial notifications.", "Finance dashboard"],
        ["Teacher", "Consult assignments, manage attendance, assessments, grades, resources, and academic communication.", "Teacher dashboard"],
        ["Student", "Consult schedule, grades, attendance, resources, fees, messages, and notifications.", "Student dashboard"],
        ["Parent", "Follow linked children: grades, attendance, fees, publications, messages, and notifications.", "Parent dashboard"],
    ], [92, 286, 110]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Functional Requirements", level=1)
    story.append(make_table([
        ["Module", "Expected Features"],
        ["Authentication", "Login, role identification, dashboard redirection, and logout."],
        ["People management", "Create and update users, students, parents, and teachers with active/inactive states."],
        ["Academic management", "Classes, programs, enrollments, teacher assignments, schedules, attendance, assessments, and grades."],
        ["Resources", "Add, consult, and download educational resources associated with classes or subjects."],
        ["Finance", "Student fees, payments, balances, user transactions, overdue follow-up, and financial notifications."],
        ["Communication", "Conversations, messages, targeted notifications, and posts visible from the interfaces."],
        ["Preferences", "Theme, language, and visual experience management by role."],
    ], [120, 368]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Non-Functional Requirements", level=1)
    story.append(make_table([
        ["Requirement", "Description"],
        ["Security", "Role-based access, input validation, protection of sensitive operations, and controlled error handling."],
        ["Performance", "Fast table loading, targeted API requests, and separated responsibilities to reduce coupling."],
        ["Usability", "Readable interfaces, section-based navigation, user feedback, and responsive behavior."],
        ["Maintainability", "Organization by frontend modules, backend routers, and reusable data managers."],
        ["Reliability", "Relational database consistency, foreign-key constraints, and API-side error handling."],
        ["Scalability", "Ability to add modules, roles, languages, or reports without rewriting the whole system."],
    ], [120, 368]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Use Case Diagrams", level=1)
    story.append(Paragraph(
        """
        The following diagrams define the functional boundary of the system for each profile. They
        help verify that responsibilities are separated and that each actor has a coherent functional
        scope.
        """,
        normal_text,
    ))

    story.append(Spacer(1, 8))
    create_indexed_heading(story, "Use Case Relationship Notation", level=2)
    story.append(make_table([
        ["Notation", "Meaning", "Use in this report"],
        ["Association", "A solid line links an actor to the main use cases that the actor can initiate.", "Used between each role and its main dashboard, academic, financial, or communication functions."],
        ["<<include>>", "A dashed arrow from a base use case to a required sub-use case.", "Used when a function systematically needs another function, such as authentication before dashboard access."],
        ["<<extend>>", "A dashed arrow from an optional or conditional use case to the use case it extends.", "Used for optional behavior such as language/theme changes or contextual notifications."],
        ["System boundary", "The rectangle represents the application scope.", "All use cases inside the boundary belong to the School Management System."],
    ], [92, 190, 206]))
    story.append(PageBreak())

    for figure_no, role, filename in USE_CASE_DIAGRAMS:
        create_indexed_heading(story, f"Use Case Diagram - {role}", level=2, visible=False)
        render_diagram(story, diagram_path(filename), "")
        add_caption(story, f"Figure {figure_no} - Use case diagram: {role}.")
        story.append(PageBreak())

    create_indexed_heading(story, "Textual Description of Main Use Cases", level=1)
    story.append(make_table([
        ["Use Case", "Main Actor", "Description"],
        ["Log in", "All profiles", "The user enters credentials, the backend verifies the account, and the frontend opens the dashboard that matches the role."],
        ["Manage users", "Administrator", "The administrator creates, updates, activates, or deactivates accounts and assigns application roles."],
        ["Enroll a student", "Administrator / Receptionist", "A student file is created, linked to a parent, assigned to a class, and made available for academic and financial follow-up."],
        ["Record attendance", "Teacher", "The teacher opens the class sheet, marks attendance or absence, and records justifications when required."],
        ["Enter grades", "Teacher", "The teacher selects an assessment, enters grades, and makes results available to the student and parent."],
        ["Record a payment", "Accountant", "The accountant selects a financial file, enters the amount, updates the balance, and keeps the operation history."],
        ["Exchange a message", "All profiles", "A user opens a conversation, sends a message, and receives new exchanges through the internal messaging module."],
    ], [118, 100, 270]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Conclusion", level=1)
    story.append(Paragraph(
        """
        The identified requirements confirm the need for a multi-module application unified by the
        same authentication, navigation, and data logic. The next chapter details the technical design
        that satisfies these requirements.
        """,
        normal_text,
    ))
    story.append(PageBreak())
