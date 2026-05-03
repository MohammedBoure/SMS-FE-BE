from reportlab.platypus import PageBreak, Paragraph, Spacer

from utils import add_caption, create_indexed_heading, diagram_path, make_table, normal_text, render_diagram


SEQUENCE_DIAGRAMS = [
    ("3.2", "Administrator", "Sequence_Admin.svg"),
    ("3.3", "Receptionist", "Sequence_Receptionist.svg"),
    ("3.4", "Accountant", "Sequence_Accountant.svg"),
    ("3.5", "Teacher", "Sequence_Teacher.svg"),
    ("3.6", "Student", "Sequence_Student.svg"),
    ("3.7", "Parent", "Sequence_Parent.svg"),
]


def build(story):
    create_indexed_heading(story, "Sequence Diagrams", level=1)
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        """
        Sequence diagrams describe the behavior of the system at runtime. They show collaboration
        between the user, dashboard, frontend controller, API service, FastAPI router, and data
        manager.
        """,
        normal_text,
    ))

    create_indexed_heading(story, "Selected Dynamic Scenarios", level=2)
    story.append(make_table([
        ["Role", "Represented Scenario", "Design Purpose"],
        ["Administrator", "Dashboard loading, consultation, and global CRUD operations.", "Validate central control and calls to the main modules."],
        ["Receptionist", "File creation, file consultation, and front-office search.", "Show the relationship between reception, students, parents, and payments."],
        ["Accountant", "Fee follow-up, payments, transactions, and notifications.", "Separate financial operations from general administration."],
        ["Teacher", "Assignments, attendance, assessments, grades, resources, and messages.", "Formalize academic flows from classroom work to family follow-up."],
        ["Student", "Consultation of personal and academic information.", "Ensure secure read access to data linked to the connected profile."],
        ["Parent", "Aggregation of information for linked children.", "Illustrate multi-child follow-up and communication with the school."],
    ], [92, 210, 186]))

    story.append(PageBreak())

    for figure_no, role, filename in SEQUENCE_DIAGRAMS:
        create_indexed_heading(story, f"Sequence Diagram - {role}", level=2, visible=False)
        render_diagram(story, diagram_path(filename), "")
        add_caption(story, f"Figure {figure_no} - Sequence diagram: {role}.")
        story.append(PageBreak())
