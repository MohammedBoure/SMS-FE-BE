from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import PageBreak, Paragraph, Spacer, Table, TableStyle

from utils import create_indexed_heading, normal_text, subtitle_style


BENEFITS = [
    (
        "Administrative efficiency",
        "Centralizes student records, parent information, enrollments, schedules, and daily follow-up.",
    ),
    (
        "Pedagogical follow-up",
        "Allows teachers, students, and parents to follow assessments, grades, attendance, and resources.",
    ),
    (
        "Communication",
        "Improves information exchange through messages, notifications, and administration posts.",
    ),
    (
        "Financial clarity",
        "Supports fee tracking, payments, transactions, reminders, and student financial files.",
    ),
    (
        "Role-based organization",
        "Separates responsibilities between administration, reception, accounting, teachers, students, and parents.",
    ),
]


def _benefits_table():
    header_style = ParagraphStyle(
        "BenefitHeader",
        fontName="Helvetica-Bold",
        fontSize=8.8,
        leading=11,
        textColor=colors.HexColor("#1F3A5F"),
    )
    label_style = ParagraphStyle(
        "BenefitLabel",
        fontName="Helvetica-Bold",
        fontSize=8.6,
        leading=10.5,
        textColor=colors.HexColor("#1E293B"),
    )
    cell_style = ParagraphStyle(
        "BenefitCell",
        fontName="Helvetica",
        fontSize=8.6,
        leading=10.5,
        textColor=colors.HexColor("#334155"),
    )

    rows = [
        [
            Paragraph("Benefit", header_style),
            Paragraph("Contribution to the School Management System", header_style),
        ]
    ]
    rows.extend([
        [Paragraph(title, label_style), Paragraph(description, cell_style)]
        for title, description in BENEFITS
    ])

    table = Table(rows, colWidths=[145, 360], hAlign="CENTER", repeatRows=1)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#EAF2F8")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1F3A5F")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8.8),
        ("LEADING", (0, 0), (-1, -1), 11),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#B7C6D6")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    return table


def build(story):
    create_indexed_heading(story, "Project Context and Benefits", level=0)
    story.append(Spacer(1, 10))

    story.append(Paragraph("Opening Statement", subtitle_style))
    story.append(Paragraph(
        """
        The School Management System was designed as a practical response to the needs of modern
        educational institutions. The project aims to connect administration, teachers, parents,
        students, reception staff, and financial managers inside one coherent web platform.
        The goal is not only to digitize isolated operations, but also to make school information
        easier to organize, access, review, and communicate.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("System Benefits", subtitle_style))
    story.append(Paragraph(
        """
        The system provides value by reducing repeated manual work, improving the visibility of
        academic progress, and giving each user a dedicated workspace that matches their role.
        """,
        normal_text,
    ))
    story.append(_benefits_table())
    story.append(Spacer(1, 12))

    story.append(Paragraph("Initial Data Modeling with Al Abakera Excel Data", subtitle_style))
    story.append(Paragraph(
        """
        At the beginning of the project, an Excel-based data reference related to Al Abakera School
        was used to understand the real structure of school information. This helped identify the
        main data entities, such as users, students, parents, teachers, classes, enrollments, fees,
        payments, attendance, schedules, assessments, grades, and resources.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        """
        This early spreadsheet analysis supported the transition from raw operational data to a more
        structured relational model. The UML class diagram and the backend database managers were then
        organized around these domains to keep the implementation close to realistic school workflows.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Hosting, Port Forwarding, and Cloud Services", subtitle_style))
    story.append(Paragraph(
        """
        To make the application testable outside the local development environment, hosted access was
        configured with port forwarding for both the frontend and the backend. This allowed the web
        interface and the FastAPI service to be reached remotely during testing and demonstration.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        """
        Cloud services were also used to support remote access, availability, and collaboration during
        the project. This deployment approach reflects the architecture expected from a web-based school
        management platform: a browser-based frontend communicating with a backend API and a persistent
        database layer.
        """,
        normal_text,
    ))

    story.append(PageBreak())
