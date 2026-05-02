from reportlab.lib.units import inch
from reportlab.platypus import Image, PageBreak, Paragraph, Spacer

from utils import LOGO_PATH, normal_center, normal_text, subtitle_style, title_style


STUDENTS = [
    "1. Bouremouz Mouhammed",
    "2. Debieche Amine",
    "3. Bessibes Mouin",
    "4. Bouzekria Sohib",
    "5. Side Ahmed Cheabani",
    "6. Chemsse Adden Marriche",
]


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


def build_introduction(story):
    story.append(Paragraph("Introduction", title_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        """
        This report presents the UML analysis of the School Management System. The project is organized
        around six role-based dashboards: Admin, Receptionist, Accountant, Teacher, Student, and Parent.
        The diagrams document the functional responsibilities of each role, the backend structure, the
        runtime communication between frontend and backend, and the navigation flow of the application.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        """
        The report is structured into use case diagrams, a class diagram, sequence diagrams, the navigation
        diagram, a technology stack summary, and a concise conclusion.
        """,
        normal_text,
    ))
