from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import Image, PageBreak, Paragraph, Spacer, Table, TableStyle

from utils import (
    BASE_DIR,
    LOGO_PATH,
    REPORT_FONT,
    REPORT_FONT_BOLD,
    create_indexed_heading,
    make_table,
    normal_center,
    normal_text,
    subtitle_style,
    title_style,
)


PROJECT_NAME = "School Management System"
PROJECT_TITLE = "Design and Implementation of a Web-Based School Management System"
ACADEMIC_YEAR = "2025 / 2026"

STUDENTS = [
    "Bouremouz Mouhammed",
    "Debieche Amine",
    "Bessibes Mouin",
    "Chaabani Sidahmed",
    "Bouzekria Sohib",
    "Meriche Chemseddine",
]

LOGIN_PREVIEW_PATH = BASE_DIR / "login.PNG"


def _cover_label_style(name, bold=False):
    return ParagraphStyle(
        name,
        fontName=REPORT_FONT_BOLD if bold else REPORT_FONT,
        fontSize=9.2,
        leading=12,
        alignment=1,
        textColor=colors.HexColor("#1E293B"),
    )


def _people_table(title, values):
    title_style_local = _cover_label_style(f"{title}Title", bold=True)
    value_style = _cover_label_style(f"{title}Value")
    rows = [[Paragraph(f"<u><b>{title}</b></u>", title_style_local)]]
    rows.extend([[Paragraph(value, value_style)] for value in values])
    table = Table(rows, colWidths=[250], hAlign="CENTER")
    table.setStyle(TableStyle([
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    return table


def build(story):
    story.append(Spacer(1, 8))

    if LOGO_PATH.exists():
        logo = Image(str(LOGO_PATH), width=1.05 * inch, height=1.05 * inch, kind="proportional")
        logo.hAlign = "CENTER"
        story.append(logo)
        story.append(Spacer(1, 8))

    story.append(Paragraph("People's Democratic Republic of Algeria", normal_center))
    story.append(Paragraph("Ministry of Higher Education and Scientific Research", normal_center))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Mohamed Seddik Ben Yahia University - Jijel</b>", subtitle_style))
    story.append(Paragraph("Faculty of Exact Sciences and Computer Science", normal_center))
    story.append(Paragraph("Department of Computer Science", normal_center))

    story.append(Spacer(1, 28))
    story.append(Paragraph("Bachelor's Degree Project", subtitle_style))
    story.append(Paragraph(PROJECT_TITLE, title_style))
    story.append(Paragraph(f"<b>{PROJECT_NAME}</b>", subtitle_style))

    story.append(Spacer(1, 16))
    story.append(Paragraph("<b>Level:</b> 3rd Year Bachelor's Degree", normal_center))
    story.append(Paragraph("<b>Specialty:</b> Computer Science", normal_center))
    story.append(Paragraph(f"<b>Academic Year:</b> {ACADEMIC_YEAR}", normal_center))

    story.append(Spacer(1, 24))
    story.append(_people_table("Prepared by (G16):", STUDENTS))

    story.append(Spacer(1, 16))
    story.append(_people_table("Supervised by", ["Dr. El Hillali Kerkouche"]))

    story.append(PageBreak())


def build_resume(story):
    create_indexed_heading(story, "Executive Summary", level=0)
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        """
        This report presents the design and implementation of a web-based School Management System.
        The proposed platform centralizes administrative, academic, financial, and communication data
        in one structured system. Each user role accesses a dedicated workspace that matches its
        responsibilities.
        """,
        normal_text,
    ))
    story.append(Paragraph(
        """
        The system follows a layered RESTful architecture: an HTML5, CSS3, and vanilla JavaScript
        frontend; a Python FastAPI backend exposing modular REST endpoints; and a MySQL relational
        database for persistence. The application supports six main profiles: administrator,
        receptionist, accountant, teacher, student, and parent.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "<b>Keywords:</b> school management, web application, FastAPI, MySQL, REST API, UML, role-based architecture.",
        normal_text,
    ))
    story.append(Spacer(1, 12))
    story.append(make_table([
        ["Area", "Summary"],
        ["Objective", "Automate daily school management processes and provide each role with an appropriate workspace."],
        ["Scope", "Users, students, parents, teachers, classes, enrollments, attendance, grades, resources, fees, payments, messages, notifications, and posts."],
        ["Method", "Existing-system study, requirements analysis, UML design, frontend/backend implementation, and scenario-based validation."],
        ["Result", "A modular web application with role-based dashboards, a REST API, and a relational database."],
    ], [105, 383]))
    story.append(PageBreak())

    create_indexed_heading(story, "System Overview and Development Methodology", level=0)
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        """
        This thesis-style report documents the complete software engineering process used to design
        and implement the School Management System. It begins with the study of the school management
        domain and the limitations of manual or disconnected tools, then formalizes the functional
        and non-functional requirements.
        """,
        normal_text,
    ))
    story.append(Paragraph(
        """
        The design chapter presents the system architecture, database model, UML diagrams, API
        organization, security considerations, and user-interface structure. The implementation
        chapter describes the development environment, source-code organization, application screens,
        and validation scenarios. The final result is a maintainable, extensible, role-based school
        management platform.
        """,
        normal_text,
    ))
    story.append(PageBreak())


def build_introduction(story):
    create_indexed_heading(story, "General Introduction", level=0)
    story.append(Spacer(1, 8))

    create_indexed_heading(story, "General Context", level=1)
    story.append(Paragraph(
        """
        Digital transformation has become a major requirement for educational institutions. Schools
        manage a large amount of sensitive data every day, including student files, enrollments,
        schedules, attendance, grades, resources, payments, and communication between stakeholders.
        When this information is spread across paper registers, spreadsheets, and informal messages,
        follow-up becomes slower and less reliable.
        """,
        normal_text,
    ))
    story.append(Paragraph(
        """
        A centralized web application is an appropriate response to this problem. It provides a shared
        information base, automates repetitive tasks, traces important operations, and gives each user
        profile a dedicated interface.
        """,
        normal_text,
    ))

    create_indexed_heading(story, "Problem Statement", level=1)
    story.append(Paragraph(
        """
        Traditional school management suffers from data dispersion, slow access to information,
        fragmented academic follow-up, manual financial errors, and unstructured communication
        between administrators, teachers, students, parents, and financial staff. The central question
        is therefore: how can we design a reliable, clear, and extensible platform that centralizes
        the core processes of a school while respecting the rights and responsibilities of each role?
        """,
        normal_text,
    ))

    create_indexed_heading(story, "Project Objectives", level=1)
    story.append(make_table([
        ["Objective", "Description"],
        ["Centralization", "Group school information into one coherent reference system."],
        ["Role-based access", "Adapt features to the responsibilities of the administrator, receptionist, accountant, teacher, student, and parent."],
        ["Automation", "Reduce manual work related to enrollments, attendance, grades, payments, and communication."],
        ["Traceability", "Keep fa clear record of important operations and make follow-up easier."],
        ["Scalability", "Build a modular architecture that can integrate future modules."],
    ], [120, 368]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Work Methodology", level=1)
    story.append(make_table([
        ["Phase", "Work Performed"],
        ["Preliminary study", "Understanding the school domain, stakeholders, existing documents, and limits of manual management."],
        ["Requirements analysis", "Identifying actors, functional requirements, non-functional requirements, and use cases."],
        ["Design", "Defining the architecture, UML models, database model, REST API structure, and user-interface organization."],
        ["Implementation", "Developing frontend interfaces, JavaScript services, FastAPI routers, and data managers."],
        ["Validation", "Checking business scenarios, API behavior, role navigation, and interface consistency."],
    ], [120, 368]))

    story.append(Spacer(1, 10))
    create_indexed_heading(story, "Report Organization", level=1)
    story.append(Paragraph(
        """
        This report is organized into four chapters. Chapter 1 presents the existing-system study and
        the proposed solution. Chapter 2 formalizes the requirements and use cases. Chapter 3 explains
        the system design, including architecture, UML models, database structure, API design, and
        security. Chapter 4 presents the implementation, application interfaces, and validation
        scenarios. A general conclusion summarizes the work and proposes future improvements.
        """,
        normal_text,
    ))
    story.append(PageBreak())
