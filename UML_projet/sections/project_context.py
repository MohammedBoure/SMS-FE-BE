from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Spacer, Table, TableStyle

from utils import create_indexed_heading, normal_text, subtitle_style


BENEFITS = [
    (
        "Administrative efficiency",
        "Centralizes records, enrollments, schedules, and follow-up.",
    ),
    (
        "Pedagogical follow-up",
        "Tracks assessments, grades, attendance, and resources.",
    ),
    (
        "Communication",
        "Uses messages, notifications, and administration posts.",
    ),
    (
        "Financial clarity",
        "Supports fees, payments, transactions, and reminders.",
    ),
    (
        "Role-based organization",
        "Separates dashboards by responsibility and user role.",
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
        The system addresses daily school workflows: learner records, parent follow-up, classes,
        schedules, attendance, grades, resources, payments, messages, and notifications. Each actor
        works through a dedicated dashboard connected to the same backend services.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("System Benefits", subtitle_style))
    story.append(_benefits_table())
    story.append(Spacer(1, 10))

    story.append(Paragraph("Initial Data Modeling with Al Abakera Excel Data", subtitle_style))
    story.append(Paragraph(
        """
        At the beginning, an Excel data reference from Al Abakera School was used to identify the
        main entities: users, students, parents, teachers, classes, enrollments, fees, payments,
        attendance, schedules, assessments, grades, and resources.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 6))

    story.append(Paragraph("Hosting, Port Forwarding, and Cloud Services", subtitle_style))
    story.append(Paragraph(
        """
        Port forwarding was configured for both frontend and backend services to support remote testing.
        Cloud services were used to make the hosted demonstration accessible outside the local network.
        """,
        normal_text,
    ))

    story.append(Spacer(1, 14))
