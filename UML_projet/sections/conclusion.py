from reportlab.platypus import PageBreak, Paragraph, Spacer, KeepTogether
from utils import title_style, subtitle_style, normal_text, create_indexed_heading

def build(story):
    elements = []
    
    create_indexed_heading(elements, "Conclusion", level=0)
    elements.append(Spacer(1, 20))
    
    elements.append(Paragraph("Summary of Achievements", subtitle_style))
    achievements_text = """
    This project has successfully established a comprehensive architectural framework for a modern School Management System. 
    The primary achievement lies in the detailed modeling of over 20 core administrative and academic activities, 
    all integrated within a secure Role-Based Access Control (RBAC) matrix. By bridging functional requirements 
    with structured UML designs, this document provides a complete 57-page technical blueprint ready for full-scale 
    software implementation.
    """
    elements.append(Paragraph(achievements_text, normal_text))
    elements.append(Spacer(1, 15))

    elements.append(Paragraph("Challenges & Difficulties", subtitle_style))
    difficulties_text = """
    Navigating the system analysis and design phase involved overcoming several technical hurdles:
    <br/><br/>
    <b>1. Conflict Resolution Logic:</b> Designing a validation engine for the schedule builder to prevent teacher 
    overlaps and resource overallocation required complex relational modeling.
    <br/><br/>
    <b>2. Layout & Graphics Synchronization:</b> Integrating high-density SVG diagrams with academic analysis in 
    ReportLab necessitated precise scaling utilities to prevent layout disruptions and maintain document clarity.
    <br/><br/>
    <b>3. State Consistency:</b> Ensuring that financial statuses and enrollment states remained synchronized 
    across decoupled modules demanded a rigorous application of state machine logic.
    """
    elements.append(Paragraph(difficulties_text, normal_text))
    elements.append(Spacer(1, 15))

    elements.append(Paragraph("Future Development & Roadmap", subtitle_style))
    future_text = """
    To further enhance the platform's capabilities, the following enhancements are proposed for future iterations:
    <br/><br/>
    <b>1. Native Mobile Integration:</b> Deployment of dedicated iOS and Android applications for Parents and Students 
    to facilitate real-time push notifications, mobile payments, and simplified access to educational resources.
    <br/><br/>
    <b>2. AI-Driven Attendance:</b> Implementing an Artificial Intelligence layer utilizing facial recognition for 
    automated, contactless attendance recording, significantly reducing manual administrative input.
    <br/><br/>
    <b>3. Intelligent Academic Analytics:</b> Using machine learning to analyze student performance trends and 
    automatically generate intervention alerts for students requiring additional academic support.
    """
    elements.append(Paragraph(future_text, normal_text))
    
    story.append(KeepTogether(elements))
    story.append(PageBreak())