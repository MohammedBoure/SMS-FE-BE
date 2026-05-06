from reportlab.lib.units import inch
from reportlab.platypus import Image, PageBreak, Paragraph, Spacer

from utils import add_caption, create_indexed_heading, make_table, normal_text, screenshot_path


INTERFACE_SCREENSHOTS = [
    ("4.1", "Login Interface", "login.png", True),
    ("4.2", "Posts Board", "posts-board.png", False),
    ("4.3", "Post Details", "post-details.png", True),
    ("4.4", "Administrator Grade Management", "admin-grades.png", False),
    ("4.5", "Parent Messaging Interface", "parent-messages.png", False),
    ("4.6", "Teacher Resources Interface", "teacher-resources.png", False),
    ("4.7", "Teacher Grade Entry and Consultation", "teacher-grades.png", False),
    ("4.8", "Parent Children Follow-Up View", "parent-children-follow-up.png", False),
]


def _append_screenshot(story, figure_no, title, filename, featured=False):
    path = screenshot_path(filename)
    create_indexed_heading(story, title, level=2, visible=False)

    if not path.exists():
        story.append(Paragraph(f"Screenshot not found: {filename}", normal_text))
        story.append(Spacer(1, 10))
        return

    max_width = 6.45 * inch
    max_height = 5.85 * inch if featured else 3.65 * inch
    image = Image(str(path), width=max_width, height=max_height, kind="proportional")
    image.hAlign = "CENTER"
    story.append(image)
    add_caption(story, f"Figure {figure_no} - {title}.")


def build(story):
    create_indexed_heading(story, "Chapter 4 - Implementation and Testing", level=0)
    story.append(Spacer(1, 8))

    create_indexed_heading(story, "Introduction", level=1)
    story.append(Paragraph(
        """
        This chapter presents the transition from design to implementation. It describes the
        development environment, source-code organization, main interfaces, and validation scenarios
        used to check the behavior of the system.
        """,
        normal_text,
    ))

    create_indexed_heading(story, "Development Environment", level=1)
    story.append(make_table([
        ["Element", "Description"],
        ["System", "Development was carried out on Windows with a Python environment and a modern browser for frontend testing."],
        ["Backend", "Python 3, FastAPI, Uvicorn, Pydantic, mysql-connector-python, python-dotenv, and python-multipart."],
        ["Frontend", "HTML, CSS, vanilla JavaScript, JSON translation files, and static pages by role."],
        ["Database", "MySQL with SQL scripts and Python data managers."],
        ["Documentation", "PlantUML for diagrams, SVG export, and PDF generation with ReportLab."],
    ], [115, 373]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Folder Architecture", level=1)
    story.append(make_table([
        ["Folder / File", "Role"],
        ["backend/app.py", "FastAPI entry point and router inclusion."],
        ["backend/apis", "REST endpoints by functional domain."],
        ["backend/database", "Data managers, configuration, and MySQL access."],
        ["frontend/pages", "HTML pages by role and login page."],
        ["frontend/js/core", "Shared modules: API, authentication, routing, storage, preferences, and i18n."],
        ["frontend/js/roles", "Controllers, services, and interfaces specific to each role."],
        ["frontend/locales", "Translations by language and dashboard."],
        ["UML_projet", "PlantUML sources, generation scripts, SVG assets, and PDF report sections."],
    ], [145, 343]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Application Presentation", level=1)
    story.append(Paragraph(
        """
        The following screenshots illustrate representative application screens: login, posts,
        grade management, messaging, educational resources, and parent follow-up. They complement the
        UML diagrams by showing the visible result for users.
        """,
        normal_text,
    ))
    story.append(PageBreak())

    for index, (figure_no, title, filename, featured) in enumerate(INTERFACE_SCREENSHOTS, start=1):
        _append_screenshot(story, figure_no, title, filename, featured=featured)
        if index < len(INTERFACE_SCREENSHOTS):
            if featured or index % 2 == 1:
                story.append(PageBreak())
            else:
                story.append(Spacer(1, 10))

    story.append(PageBreak())
    create_indexed_heading(story, "Testing and Validation", level=1)
    story.append(Paragraph(
        """
        Validation was organized around business scenarios covering the main roles. The tests confirm
        that data flows correctly between the interface, the API, and the database, and that functional
        rights remain coherent.
        """,
        normal_text,
    ))
    story.append(make_table([
        ["Scenario", "Expected Result"],
        ["Active user login", "The corresponding dashboard opens and initial data is loaded."],
        ["Student file creation", "The profile is saved, linked to parent/class data, and available in searches."],
        ["Attendance entry", "The class sheet is updated and can be consulted by concerned profiles."],
        ["Grade entry", "The grade is saved and displayed for teacher, student, parent, and administrator views."],
        ["Payment recording", "The balance is updated and the payment history is visible in finance modules."],
        ["Message sending", "The conversation is updated in the inboxes of the concerned users."],
        ["Language or theme change", "The interface updates without losing the current user context."],
    ], [150, 338]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Browser Validation", level=1)
    story.append(Paragraph(
        """
        The screens were checked in a modern browser to verify navigation, forms, tables, modals,
        messaging, visual preferences, and the screenshots used in this report. APIs were verified
        through direct application calls and read/write scenarios.
        """,
        normal_text,
    ))

    create_indexed_heading(story, "Conclusion", level=1)
    story.append(Paragraph(
        """
        The implementation confirms the feasibility of the designed architecture: roles have
        specialized dashboards, modules communicate with the REST API, and data is stored in a
        relational database. The validation scenarios show that the main business flows are covered.
        """,
        normal_text,
    ))
    story.append(PageBreak())
