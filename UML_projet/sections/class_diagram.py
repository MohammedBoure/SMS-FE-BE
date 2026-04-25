import os
from reportlab.platypus import PageBreak, Paragraph, Spacer
from utils import BASE_DIR, render_diagram, normal_text, subtitle_style, create_indexed_heading

def build(story):
    create_indexed_heading(story, "Structural Models: Class Diagram", level=0)
    story.append(Spacer(1, 10))
    
    intro_text = """
    The Class Diagram illustrates the static structural model of the School Management System. 
    It defines the core entities, their attributes, methods, and the complex relationships that bind 
    the system together. The architecture is highly modular, ensuring data integrity, scalability, 
    and strict logical separation of concerns across all educational and administrative departments.
    """
    story.append(Paragraph(intro_text, normal_text))
    story.append(Spacer(1, 15))

    filepath = os.path.join(BASE_DIR, "class", "SchoolManagementSystem.svg")
    render_diagram(story, filepath, "")
    
    story.append(Spacer(1, 20))
    story.append(Paragraph("Structural Modules Breakdown", subtitle_style))
    story.append(Spacer(1, 15))

    analysis_text = """
    The system's object-oriented structure is divided into highly cohesive, interconnected domains:
    <br/><br/>
    <b>1. Core & Users Module:</b> Centralizes identity management using inheritance. The base 'User' class extends to 'Student', 'Teacher', and 'Parent'. The 'Core' package establishes the foundational setup, including 'Branch', 'AcademicYear', and 'FinancialPolicy'.
    <br/><br/>
    <b>2. Academics & Operations:</b> Manages the educational pipeline. It handles 'StudentEnrollment' within 'Programs' and 'Classes'. The 'Operations' domain intricately links users to academic activities, tracking 'Schedules', 'Assessments', 'Grades', and daily 'Attendance'.
    <br/><br/>
    <b>3. Finance & Inventory:</b> A robust financial ledger that tracks 'Payments', 'StudentFees', 'Payrolls', 'Expenses', and digital 'WalletTransactions'. It seamlessly integrates with the 'Inventory' package to monitor 'StorePurchases', 'DailyConsumptions', and exact 'InventoryItem' stock levels.
    <br/><br/>
    <b>4. Security & System Communications:</b> The 'Permissions' package enforces Dynamic Role-Based Access Control (RBAC) mapping 'Users' to 'Roles' and discrete 'Permissions'. Concurrently, the 'System' package handles audit trails via 'SystemLogs' and facilitates real-time interaction through 'Notifications' and internal 'Messages'.
    """
    story.append(Paragraph(analysis_text, normal_text))
    
    story.append(PageBreak())