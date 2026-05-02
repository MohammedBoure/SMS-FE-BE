from reportlab.lib.units import inch
from reportlab.platypus import Image, PageBreak, Paragraph, Spacer

from utils import LOGO_PATH, normal_center, normal_text, subtitle_style, title_style


STUDENTS = [
    "1. Bouremouz Mouhammed",
    "2. Debieche Amine",
    "3. Bessibes Mouin",
    "4. Chaabani Sidahmed",
    "5. Bouzekria Sohib",
    "6. Meriche Chemseddine",
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


def build_resume(story):
    story.append(Paragraph("Executive Summary", title_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        """
        This project focuses on the conception and development of a collaborative web application for
        school management. The system is designed for educational support schools, training centers,
        and language learning institutions, with the objective of simplifying administrative work,
        improving communication, and supporting academic follow-up.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        """
        The application is organized around secure role-based spaces for the main actors of the school:
        administration, reception, accounting, teachers, students, and parents. Each role has access to
        the functions that match its responsibilities, including student and parent management, teacher
        assignments, schedules, attendance, assessments, grades, resources, payments, messages,
        notifications, and announcements.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        """
        The UML documentation models the system through use case diagrams for each role, a class diagram
        for the backend structure, sequence diagrams for the main runtime interactions, and a navigation
        diagram that explains how users move between the login page and their dashboards.
        """,
        normal_text,
    ))
    story.append(PageBreak())


def build_introduction(story):
    story.append(Paragraph("Introduction", title_style))
    story.append(Spacer(1, 10))
    story.append(Paragraph(
        """
        This report presents the analysis and design of a School Management System developed according
        to a web architecture. The application is organized around six role-based dashboards: Admin,
        Receptionist, Accountant, Teacher, Student, and Parent. These roles represent the main actors
        involved in school administration, pedagogical monitoring, communication, and financial follow-up.
        """,
        normal_text,
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        """
        The documentation focuses on the functional and structural modeling of the project. It includes
        a project context section, use case diagrams for each role, a class diagram for the backend
        structure, sequence diagrams for runtime interactions, a navigation diagram, a technology and
        deployment summary, and a concise conclusion.
        """,
        normal_text,
    ))
