import os
from reportlab.platypus import Paragraph, Spacer, PageBreak, Image
from reportlab.lib.units import inch
from utils import title_style, subtitle_style, normal_center, normal_text

def build(story):
    logo_path = "logo.png"
    if os.path.exists(logo_path):
        img = Image(logo_path, width=1.8*inch, height=1.8*inch, kind='proportional')
        img.hAlign = 'CENTER'
        story.append(img)
    
    story.append(Spacer(1, 15))
    story.append(Paragraph("People's Democratic Republic of Algeria", normal_center))
    story.append(Paragraph("Ministry of Higher Education and Scientific Research", normal_center))
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>Mohamed Seddik Ben Yahia University - Jijel</b>", subtitle_style))
    story.append(Paragraph("Faculty of Sciences and Technology", normal_center))
    story.append(Paragraph("Department of Computer Science", normal_center))
    
    story.append(Spacer(1, 50))
    story.append(Paragraph("School Management System", title_style))
    story.append(Paragraph("System Analysis & Design Comprehensive Report", subtitle_style))
    
    story.append(Spacer(1, 40))
    story.append(Paragraph("<b>Specialty:</b> Computer Science (Informatics)", normal_center))
    story.append(Paragraph("<b>Level:</b> 3rd Year License", normal_center))
    story.append(Paragraph("<b>Academic Session:</b> 2025 - 2026", normal_center))

    story.append(Spacer(1, 60))
    story.append(Paragraph("<u><b>Prepared by:</b></u>", subtitle_style))
    
    students = ["1. Mouhammed Bouremouz", "2. Amine Debieche", "3. moain bssibsse", "4. Sohib Bouzekria", "5. Side Ahmed Sheabani", "6. chemsse adden marriche"]
    for student in students:
        story.append(Paragraph(student, normal_center))
    
    story.append(Spacer(1, 40))
    story.append(Paragraph("<u><b>Under the supervision of:</b></u>", subtitle_style))
    story.append(Paragraph("Prof. [Professor's]", normal_center))
    story.append(PageBreak())

    story.append(Spacer(1, 20))
    story.append(Paragraph("Executive Summary", title_style))
    story.append(Spacer(1, 20))
    abstract = """
    This report provides a comprehensive architectural breakdown of a School Management System designed to modernize 
    educational infrastructures. By integrating advanced modules for student lifecycle management, financial 
    governance, and automated academic tracking, the system offers a scalable solution for modern institutions. 
    The following documentation utilizes industry-standard UML modeling to illustrate both the structural 
    framework and the dynamic behavioral processes of the platform.
    """
    story.append(Paragraph(abstract, normal_text))
    story.append(PageBreak())

    story.append(Spacer(1, 20))
    story.append(Paragraph("Introduction", title_style))
    story.append(Spacer(1, 20))
    intro_content = """
    In the era of digital transformation, educational institutions require integrated systems to manage 
    their daily operations efficiently. This project focuses on the analysis and design of a 
    <b>School Management System</b> tailored to handle student data, academic scheduling, 
    and administrative workflows.
    <br/><br/>
    The documentation presents a detailed UML-based modeling approach, covering behavioral 
    and structural aspects. This design serves as the foundation for developing a scalable and secure solution 
    that meets the requirements of modern educational management.
    """
    story.append(Paragraph(intro_content, normal_text))
    story.append(PageBreak())