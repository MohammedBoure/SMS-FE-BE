from reportlab.platypus import PageBreak, Paragraph, Spacer

from utils import add_caption, create_indexed_heading, diagram_path, make_table, normal_text, render_diagram


def build(story):
    create_indexed_heading(story, "User Interface Design", level=1)
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        """
        The interface follows a simple principle: one common entry point, authentication, and then a
        workspace dedicated to the connected role. This separation reduces visual complexity and
        avoids mixing features that do not belong to the same actor.
        """,
        normal_text,
    ))

    create_indexed_heading(story, "Design Principles", level=2)
    story.append(make_table([
        ["Principle", "Application in the Project"],
        ["Clarity", "Each dashboard groups modules into readable and directly accessible sections."],
        ["Consistency", "Roles share common components: authentication, API client, local storage, language, theme, messages, and notifications."],
        ["Role separation", "Admin, receptionist, accountant, teacher, student, and parent pages have their own controllers and services."],
        ["Language readiness", "Translation files make the interface ready for multiple languages."],
        ["Visual continuity", "Theme and language preferences follow the user across navigation."],
    ], [130, 358]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Page Description", level=2)
    story.append(make_table([
        ["Page", "Main Content"],
        ["Login", "Authentication, language selection, theme selection, and public posts before login."],
        ["Admin", "Users, students, parents, teachers, classes, programs, finance, resources, posts, messages, and notifications."],
        ["Receptionist", "Student and parent files, search, front-office operations, financial consultation, posts, messages, and notifications."],
        ["Accountant", "Students, fees, payments, transactions, search, attendance, and financial notifications."],
        ["Teacher", "Assignments, schedule, attendance, assessments, grades, resources, posts, and messaging."],
        ["Student", "Schedule, assessments, grades, attendance, resources, fees, posts, and messages."],
        ["Parent", "Child follow-up, grades, attendance, fees, posts, messages, and notifications."],
    ], [95, 393]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Navigation Diagram", level=2)
    story.append(Paragraph(
        """
        The navigation diagram presents the transition from the entry page to specialized dashboards.
        It also shows the shared controls reused across the different spaces.
        """,
        normal_text,
    ))
    story.append(PageBreak())

    create_indexed_heading(story, "Role-Based Navigation Diagram", level=2, visible=False)
    render_diagram(story, diagram_path("Navigation_Diagram.svg"), "")
    add_caption(story, "Figure 3.8 - Role-based navigation diagram.")
    story.append(PageBreak())
