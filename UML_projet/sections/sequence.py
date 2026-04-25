import os
from reportlab.platypus import PageBreak, Paragraph, Spacer, KeepTogether
from utils import BASE_DIR, render_diagram, normal_text, subtitle_style, create_indexed_heading

def build(story):
    elements = []
    
    create_indexed_heading(elements, "Dynamic Models: Sequence Diagram", level=0)
    elements.append(Spacer(1, 10))
    
    intro_text = """
    The Sequence Diagram illustrates the dynamic behavior of the system during the critical 
    process of Student Enrollment and Fee Payment. It meticulously maps the chronological 
    sequence of messages and interactions between external actors, user interfaces, system 
    controllers, and the underlying database.
    """
    elements.append(Paragraph(intro_text, normal_text))
    elements.append(Spacer(1, 15))

    filepath = os.path.join(BASE_DIR, "Séquence", "SchoolManagement_EnrollmentSequence.svg")
    render_diagram(elements, filepath, "")
    
    elements.append(Spacer(1, 20))
    elements.append(Paragraph("Process Execution Breakdown", subtitle_style))
    elements.append(Spacer(1, 15))

    analysis_text = """
    The enrollment lifecycle is orchestrated through four distinct, sequential phases:
    <br/><br/>
    <b>1. Enrollment Request & Validation:</b> The process begins when an Admin or Parent requests enrollment. The System UI communicates with the Enrollment Controller to verify real-time class capacity against the MySQL Database. If the class is full, the system actively rejects the request or prompts a waitlist option.
    <br/><br/>
    <b>2. Profile Creation & Registration:</b> Upon confirming seat availability, the system creates a new student profile and inserts an initial enrollment record into the database with a 'pending' status, ensuring no academic privileges are granted before payment.
    <br/><br/>
    <b>3. Financial Policy Application & Fee Generation:</b> The Finance Controller calculates the exact tuition. It fetches the base program price and dynamically applies any registered financial policies or discounts, culminating in the creation of a definitive fee record for the student.
    <br/><br/>
    <b>4. Payment Processing & Activation:</b> Once the user submits the payment, the Finance Controller validates the amount. A successful transaction results in a database insertion for the payment, generation of a digital PDF receipt, and a crucial state change updating the student's enrollment status from 'pending' to 'active'.
    """
    elements.append(Paragraph(analysis_text, normal_text))
    
    story.append(KeepTogether(elements))
    story.append(PageBreak())