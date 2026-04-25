import os
from reportlab.platypus import PageBreak, Paragraph, Spacer, KeepTogether
from utils import BASE_DIR, render_diagram, normal_text, subtitle_style, create_indexed_heading

def build(story):
    elements = []
    
    create_indexed_heading(elements, "User Interface: Navigation Diagram", level=0)
    elements.append(Spacer(1, 10))
    
    intro_text = """
    The Navigation Diagram maps the Information Architecture (IA) and the complete user journey 
    within the School Management System. It illustrates how users transition between different 
    views, modules, and functional components, ensuring an intuitive and secure user experience 
    driven by a central dashboard hub.
    """
    elements.append(Paragraph(intro_text, normal_text))
    elements.append(Spacer(1, 15))
    
    filepath = os.path.join(BASE_DIR, "navigation", "Navigation_Diagram.svg")
    render_diagram(elements, filepath, "")
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Interface Flow & Architecture Breakdown", subtitle_style))
    elements.append(Spacer(1, 15))

    analysis_text = """
    The user interface utilizes a highly organized Hub-and-Spoke navigation model, structured as follows:
    <br/><br/>
    <b>1. Authentication & Global State:</b> The journey strictly begins at the 'Login' gateway. Upon successful credential validation, the user is routed into the system. Global elements—such as the persistent sidebar, top header (handling profile and notifications), and global UI controllers (like ESC to close modals)—remain constantly accessible.
    <br/><br/>
    <b>2. Central Hub (Dashboard):</b> Acting as the primary navigational spoke, the Dashboard provides immediate KPI overviews, quick actions, and critical alerts. From here, routing branches out into several distinct functional domains, dynamically filtered by the user's RBAC permissions.
    <br/><br/>
    <b>3. Primary Functional Domains:</b> The architecture isolates administrative boundaries. 'Settings & Config' handles foundational parameters. 'Academics' and 'Operations' drive the educational core (Classes, Programs, Schedules, Grades). The 'Finance' and 'Inventory & Store' modules control the ledger and physical assets, while 'Human Resources' governs user identities.
    <br/><br/>
    <b>4. Cross-Module Navigation:</b> While the primary structure is hierarchical, contextual horizontal pathways (indicated by dotted lines) are built-in to reduce click depth. For instance, the UI allows seamless contextual jumps from 'Teachers' directly to their specific 'Assignments', or from 'Classes' straight into the 'Weekly Timetable', mirroring natural administrative workflows.
    """
    elements.append(Paragraph(analysis_text, normal_text))
    
    story.append(KeepTogether(elements))
    story.append(PageBreak())