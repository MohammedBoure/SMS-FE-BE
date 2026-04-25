import os
from reportlab.platypus import PageBreak, Paragraph, Spacer, KeepTogether
from utils import BASE_DIR, render_diagram, normal_text, subtitle_style, create_indexed_heading

def build(story):
    elements = []
    
    create_indexed_heading(elements, "Functional Models: Use Case Diagram", level=0)
    elements.append(Spacer(1, 10))
    
    intro_text = """
    The Use Case Diagram provides a high-level overview of the functional requirements and system boundaries 
    of the School Management System. The architecture is heavily centralized around a <b>Dynamic Role-Based 
    Access Control (RBAC)</b> system. All interactions across all modules are intercepted and validated by 
    the Global Permission Verification engine.
    """
    elements.append(Paragraph(intro_text, normal_text))
    elements.append(Spacer(1, 15))

    filepath = os.path.join(BASE_DIR, "UseCas", "SchoolManagementSystem_UseCase.svg")
    render_diagram(elements, filepath, "")
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Actors and Core Responsibilities", subtitle_style))
    elements.append(Spacer(1, 15))

    analysis_text = """
    Given the complexity of the system, it is divided into distinct operational modules, driven by a strict actor hierarchy:
    <br/><br/>
    <b>1. Administrator (Super User):</b> Inherits all use cases from other actors. Has exclusive access to system configurations, branch management, dynamic role creation, and the global access matrix.
    <br/><br/>
    <b>2. Finance & Accounting (Accountant):</b> Handles the financial core, including managing student fees, processing daily cash handovers, payrolls, external obligations, and user digital wallets.
    <br/><br/>
    <b>3. Academics & Operations (Teacher):</b> Responsible for the educational lifecycle. Teachers input grades, record daily attendance, manage assignments, and upload educational resources.
    <br/><br/>
    <b>4. End Users (Student & Parent):</b> They can monitor academic progress, download resources, view financial balances, top-up wallets, and communicate with teachers and administration via the messaging module.
    <br/><br/>
    <b>5. Inventory & Store (Inventory Mgr & POS Cashier):</b> Manages physical stock, processes Point of Sale (POS) purchases (e.g., cafeteria or bookstore), and records daily consumptions.
    """
    elements.append(Paragraph(analysis_text, normal_text))
    
    story.append(KeepTogether(elements))
    story.append(PageBreak())