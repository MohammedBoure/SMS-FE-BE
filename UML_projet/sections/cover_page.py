from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import Image, PageBreak, Paragraph, Spacer, Table, TableStyle

from utils import BASE_DIR, LOGO_PATH, create_indexed_heading, normal_center, normal_text, subtitle_style, title_style


STUDENTS = [
    "1. Bouremouz Mouhammed",
    "2. Debieche Amine",
    "3. Bessibes Mouin",
    "4. Chaabani Sidahmed",
    "5. Bouzekria Sohib",
    "6. Meriche Chemseddine",
]

LOGIN_PREVIEW_PATH = BASE_DIR / "login.PNG"


def _resume_cell_style(name, bold=False):
    return ParagraphStyle(
        name,
        fontName="Helvetica-Bold" if bold else "Helvetica",
        fontSize=8.4,
        leading=10.6,
        textColor=colors.HexColor("#1E293B") if bold else colors.HexColor("#334155"),
    )


def _resume_table(rows, col_widths):
    label_style = _resume_cell_style("ResumeLabel", bold=True)
    value_style = _resume_cell_style("ResumeValue")
    formatted_rows = [
        [Paragraph(label, label_style), Paragraph(value, value_style)]
        for label, value in rows
    ]
    table = Table(formatted_rows, colWidths=col_widths, hAlign="CENTER")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#EEF6FF")),
        ("ROWBACKGROUNDS", (1, 0), (1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#C8D3E0")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ]))
    return table


def build(story):
    story.append(Spacer(1, 8))

    if LOGO_PATH.exists():
        logo = Image(str(LOGO_PATH), width=1.1 * inch, height=1.1 * inch, kind="proportional")
        logo.hAlign = "CENTER"
        story.append(logo)
        story.append(Spacer(1, 10))

    story.append(Paragraph("People's Democratic Republic of Algeria", normal_center))
    story.append(Paragraph("Ministry of Higher Education and Scientific Research", normal_center))
    story.append(Spacer(1, 4))
    story.append(Paragraph("<b>Mohamed Seddik Ben Yahia University - Jijel</b>", subtitle_style))
    story.append(Paragraph("Faculty of Sciences and Technology", normal_center))
    story.append(Paragraph("Department of Computer Science", normal_center))

    story.append(Spacer(1, 30))
    story.append(Paragraph("School Management System", title_style))
    story.append(Paragraph("UML Analysis and Design Report", subtitle_style))

    story.append(Spacer(1, 22))
    story.append(Paragraph("<b>Specialty:</b> Computer Science (Informatics)", normal_center))
    story.append(Paragraph("<b>Level:</b> 3rd Year License", normal_center))
    story.append(Paragraph("<b>Academic Session:</b> 2025 - 2026", normal_center))

    story.append(Spacer(1, 24))
    story.append(Paragraph("<u><b>Prepared by</b></u>", subtitle_style))
    for student in STUDENTS:
        story.append(Paragraph(student, normal_center))

    story.append(Spacer(1, 20))
    story.append(Paragraph("<u><b>Under the supervision of</b></u>", subtitle_style))
    story.append(Paragraph("Dr. El Hillali Kerkouche", normal_center))
    story.append(PageBreak())


def build_resume(story):
    story.append(Paragraph("Executive Summary", title_style))
    story.append(Spacer(1, 8))

    if LOGIN_PREVIEW_PATH.exists():
        preview = Image(str(LOGIN_PREVIEW_PATH), width=5.45 * inch, height=3.7 * inch, kind="proportional")
        preview.hAlign = "CENTER"
        story.append(preview)
        story.append(Spacer(1, 5))
        story.append(Paragraph("Login interface preview", normal_center))
        story.append(Spacer(1, 8))

    story.append(Paragraph(
        """
        The School Management System is a complete web application for organizing school administration,
        academic follow-up, communication, and finance. It is built around a frontend/backend architecture
        and six role-based dashboards: Admin, Receptionist, Accountant, Teacher, Student, and Parent.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 8))
    story.append(_resume_table([
        (
            "Project goal",
            "Digitize daily school workflows, reduce manual follow-up, and give each actor a secure workspace.",
        ),
        (
            "Architecture",
            "Static HTML/CSS/JavaScript frontend connected to a Python FastAPI backend and relational database.",
        ),
        (
            "Frontend structure",
            "Shared core modules manage API calls, authentication, routing, preferences, storage, and i18n; each role has its own page, services, controller, and UI renderer.",
        ),
        (
            "Backend structure",
            "FastAPI routers and database managers cover users, parents, students, teachers, classes, enrollments, assignments, schedules, attendance, assessments, grades, resources, fees, payments, transactions, messages, notifications, posts, and programs.",
        ),
        (
            "Data design",
            "The initial structure was studied from an Excel data reference from Al Abakera School, then transformed into relational entities and UML models.",
        ),
        (
            "Deployment",
            "The project was prepared for hosted demonstration using frontend/backend port forwarding and cloud services for remote access.",
        ),
        (
            "Documentation",
            "The UML report includes use case diagrams, class diagram, sequence diagrams, navigation diagram, technology notes, GitHub repository, and tooling notes.",
        ),
    ], [120, 385]))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Role Coverage", subtitle_style))
    story.append(_resume_table([
        (
            "Admin",
            "Manages users, parents, students, teachers, classes, programs, enrollments, attendance, schedules, assessments, grades, resources, finance, posts, notifications, and conversations.",
        ),
        (
            "Receptionist",
            "Handles student and parent registration, student files, search, finance lookup, payments, posts, messages, and notifications.",
        ),
        (
            "Accountant",
            "Follows student fees, payments, transactions, financial files, attendance reports, messages, notifications, and finance notices.",
        ),
        (
            "Teacher",
            "Uses assignments, schedules, attendance sheets, assessments, grade entry, educational resources, posts, messages, and notifications.",
        ),
        (
            "Student",
            "Consults schedule, assessments, grades, attendance, resources, fees, posts, messages, and notifications.",
        ),
        (
            "Parent",
            "Follows linked children, grades, attendance, fees, posts, messages, and notifications.",
        ),
    ], [105, 400]))
    story.append(Spacer(1, 10))

    story.append(Paragraph(
        """
        In short, this summary gives the reader the project scope, technical structure, main features,
        data-modeling approach, deployment context, and UML documentation strategy before reading the
        detailed diagrams and sections.
        """,
        normal_text,
    ))
    story.append(PageBreak())


def build_introduction(story):
    create_indexed_heading(story, "Introduction", level=0)
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        """
        This report presents the analysis and design of a web-based School Management System. The
        application is organized around six role-based dashboards: Admin, Receptionist, Accountant,
        Teacher, Student, and Parent.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        """
        The documentation includes a concise project context, use case diagrams, a class diagram,
        sequence diagrams, a navigation diagram, technology/deployment notes, and a conclusion.
        """,
        normal_text,
    ))
