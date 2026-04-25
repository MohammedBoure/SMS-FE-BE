import os
from reportlab.platypus import PageBreak, Paragraph, Spacer, KeepTogether
from utils import BASE_DIR, render_diagram, normal_text, subtitle_style, create_indexed_heading

def process_activity(story, folder, filename, title, intro, analysis):
    elements = []
    
    create_indexed_heading(elements, title, level=1)
    
    if intro:
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(intro, normal_text))
        elements.append(Spacer(1, 15))
    
    filepath = os.path.join(BASE_DIR, "Activity", folder, filename)
    render_diagram(elements, filepath, "")
    
    if analysis:
        elements.append(Spacer(1, 15))
        elements.append(Paragraph("Process Breakdown", subtitle_style))
        elements.append(Spacer(1, 10))
        elements.append(Paragraph(analysis, normal_text))
    
    story.append(KeepTogether(elements))
    story.append(PageBreak())

def build(story):
    create_indexed_heading(story, "Behavioral Models: Activity Diagrams", level=0)
    story.append(Spacer(1, 15))

    intro_01 = """
    This Activity Diagram models the secure authentication and login workflow of the School Management System. 
    It illustrates the interaction between the end-user and the system's security layer, emphasizing credential 
    validation, session management, and integrated security mechanisms against unauthorized access.
    """
    
    analysis_01 = """
    The authentication process is designed with multiple strict security checkpoints:
    <br/><br/>
    <b>1. Credential Validation:</b> The user initiates the process by submitting their username and password, which the system cross-references against the database records.
    <br/><br/>
    <b>2. Brute-Force Protection:</b> If the credentials are invalid, the system increments a failed login counter. Exceeding 5 failed attempts triggers an automated security protocol: the account is locked for 15 minutes, and an alert is immediately dispatched to the Administrator.
    <br/><br/>
    <b>3. Authorization & Auditing:</b> Upon successful credential validation, the system evaluates the 'is_active' flag. Suspended accounts are blocked. For active accounts, the system generates a secure user session, records the login event in 'system_logs' for future auditing, and routes the user to their specific dashboard.
    """
    
    process_activity(story, "act01_login", "act01_login.svg", "Activity Diagram: Login & Authentication", intro_01, analysis_01)

    intro_02 = """
    This Activity Diagram maps the end-to-end workflow for registering a new student into the educational platform. 
    It highlights the multi-lane interaction between the Administrator, the System's internal validation engines, and the Parent, 
    ensuring that academic capacity constraints and financial policy linkages are strictly enforced prior to admission.
    """
    
    analysis_02 = """
    The registration pipeline is governed by robust validation and automated provisioning steps:
    <br/><br/>
    <b>1. Data Input & Validation:</b> The Administrator initiates the process by submitting demographic, academic, and financial policy data. The System immediately intercepts the payload to validate completeness and format, rejecting invalid entries back to the Admin for correction.
    <br/><br/>
    <b>2. Dynamic Capacity Management:</b> Before finalizing enrollment, the System queries the database for real-time class availability. If the designated class is at full capacity, the workflow logically diverges, prompting the Admin to either place the student on a formal waitlist or select an alternative class.
    <br/><br/>
    <b>3. Automated Provisioning & Auditing:</b> Upon confirming seat availability, the System executes a unified transaction: it saves the core student record, generates a standardized unique ID (e.g., STU-YYYY-XXXXX), and creates the active enrollment. It then automatically bridges to the financial module to generate initial student fees, dispatches a digital notification to the Parent, and records the entire sequence in the system audit logs.
    """
    
    process_activity(story, "act02_enrollment", "act02_enrollment.svg", "Activity Diagram: New Student Registration", intro_02, analysis_02)

    intro_03 = """
    This Activity Diagram models the financial transaction workflow, specifically detailing fee payments and automated receipt generation. 
    It outlines the structured interaction between the user (Accountant or Parent) and the system's billing engine, 
    ensuring strict mathematical validation, dynamic status updates, and secure document generation.
    """
    
    analysis_03 = """
    The payment processing pipeline is built on strict financial constraints and automated fulfillment:
    <br/><br/>
    <b>1. Invoice Retrieval & Assessment:</b> The workflow initiates with a targeted student query. The system retrieves all financial obligations from the 'student_fees' table, presenting them with real-time dynamic statuses (pending, partial, paid, or overdue).
    <br/><br/>
    <b>2. Transaction Validation & State Mutation:</b> When a payment is submitted, the core engine intercepts the payload to validate the amount against the outstanding balance. The logic branches based on precision: an exact match mutates the invoice status to 'paid', while an amount less than the balance updates it to 'partial'. Invalid amounts (such as negative values or overpayments) are immediately rejected.
    <br/><br/>
    <b>3. Automated Fulfillment & Auditing:</b> Once the ledger is updated in the 'payments' table, the system enters an automated fulfillment phase. It generates a sequential, unique receipt tracking number (REC-YYYY-XXXXX), renders a downloadable PDF, dispatches a digital confirmation to the parent, and securely records the transaction in 'system_logs' for strict financial auditing.
    """
    
    process_activity(story, "act03_payment", "act03_payment.svg", "Activity Diagram: Fee Payment & Receipt Generation", intro_03, analysis_03)

    intro_04 = """
    This Activity Diagram maps the daily attendance tracking and absence justification workflow. 
    It illustrates a structured, tri-lane interaction between the Teacher, the System's automated 
    monitoring engine, and the Administrator, ensuring both real-time academic tracking and strict policy enforcement.
    """
    
    analysis_04 = """
    The attendance lifecycle integrates manual input with automated consequence management:
    <br/><br/>
    <b>1. Daily Recording:</b> The workflow begins with the Teacher selecting a specific class and date. The System retrieves the corresponding student roster, allowing the Teacher to efficiently mark statuses (present or absent) and commit the data to the database.
    <br/><br/>
    <b>2. Automated Processing & Threshold Alerts:</b> Upon saving, the System initiates a parallel execution sequence. It logs the transaction for security auditing while simultaneously recalculating each student's overall attendance rate. If a student crosses the predefined absence threshold, the system autonomously generates a formal record and dispatches an alert to the Parent.
    <br/><br/>
    <b>3. Administrative Justification:</b> To maintain academic fairness, the Administrator can independently review absence logs. If a valid excuse is provided, the Admin processes a formal justification. The System then mutates the record state ('is_justified = true'), archives the justification reason, and sends a final confirmation notice to the Parent.
    """
    
    process_activity(story, "act04_attendance", "act04_attendance.svg", "Activity Diagram: Attendance Recording & Justification", intro_04, analysis_04)

    intro_05 = """
    This Activity Diagram outlines the academic evaluation workflow, focusing on the bulk input, validation, and automated processing of student grades. It highlights the collaborative interaction between the Teacher's input phase and the System's analytical engine.
    """
    
    analysis_05 = """
    The grading pipeline emphasizes data integrity and automated academic analytics:
    <br/><br/>
    <b>1. Assessment Initialization & Data Entry:</b> The Teacher initiates a new assessment by defining the class, subject, and term. The System provisions a bulk input interface populated with the relevant student roster. As the Teacher inputs raw scores, the UI dynamically computes percentage equivalents in real-time.
    <br/><br/>
    <b>2. Systemic Validation & Error Correction:</b> Before committing data, the System executes a strict validation check to ensure no individual grade exceeds the defined maximum score for the assessment. Any logical violations are immediately rejected, highlighting the specific invalid fields for the Teacher to correct.
    <br/><br/>
    <b>3. Automated Analytics & Notification:</b> Upon successful validation, the System saves the records and triggers an analytical sequence. It calculates the overall class average and categorizes individual student performance (e.g., Excellent, Pass, Needs Support, Fail). Finally, it dispatches performance notifications to Parents and Students, concluding with a secure audit log entry.
    """
    
    process_activity(story, "act05_grades", "act05_grades.svg", "Activity Diagram: Grades & Assessments Input", intro_05, analysis_05)

    intro_06 = """
    This Activity Diagram details the monthly payroll generation process. It illustrates the sequence of operations from the initial request by an Administrator or Accountant, through complex systemic calculations and reviews, to the final generation of payslips and employee notifications.
    """
    
    analysis_06 = """
    The payroll process is structured to ensure financial accuracy, accommodate manual adjustments, and provide an audit trail:
    <br/><br/>
    <b>1. Initialization & Data Aggregation:</b> The process is initiated by an Admin/Accountant selecting the target month and year. The System responds by fetching all active employees. Crucially, it employs a parallel execution block (indicated by the heavy black bars) to concurrently gather three critical data sets: session counts (from assignments and schedules), advances/deductions, and recorded bonuses.
    <br/><br/>
    <b>2. Calculation & Review Cycle:</b> Once the necessary data is aggregated, the System automatically calculates the net salary for each employee using the formula: `net = base_salary + bonuses - advances - deductions + previous_arrears`. A preliminary payroll record is created with a 'pending' status. The workflow then returns to the Admin/Accountant for review. If adjustments are needed, the record is edited, prompting the System to automatically recalculate the net salary before the values are confirmed.
    <br/><br/>
    <b>3. Finalization & Distribution:</b> Upon confirmation, the Admin/Accountant marks the payroll as 'Paid'. The System then finalizes the process by updating the record's status, setting the payment date, generating a PDF payslip, and sending a notification to the employee. The employee can then receive the notification and download their payslip. Finally, the entire transaction is securely logged in 'system_logs' for auditing purposes.
    """
    
    process_activity(story, "act06_payroll", "act06_payroll.svg", "Activity Diagram: Monthly Payroll Generation", intro_06, analysis_06)

    intro_07 = """
    This Activity Diagram delineates the structured workflow for expense submission and administrative approval. 
    It highlights the tripartite interaction between the Employee initiating the request, the System's validation layer, 
    and the Administrator's decisive authority, ensuring financial accountability and clear communication channels.
    """
    
    analysis_07 = """
    The expense approval process enforces strict financial governance through a clear chain of command:
    <br/><br/>
    <b>1. Submission & Initial Validation:</b> An Employee initiates the workflow by completing an expense form (detailing description, category, amount, and attaching optional invoices). Upon submission, the System intercepts the data, validating its completeness. Incomplete submissions are immediately routed back to the Employee for correction.
    <br/><br/>
    <b>2. Pending State & Notification:</b> Validated submissions are saved with a 'pending' status. The System then acts as an intermediary, automatically dispatching a notification to the Administrator, alerting them to a new expense requiring review.
    <br/><br/>
    <b>3. Administrative Decision & Resolution:</b> The Administrator reviews the pending expense and makes a binary decision. An 'Approve' action updates the status and triggers an approval notification to the Employee. Conversely, a 'Reject' action mandates the entry of a rejection reason, updates the status accordingly, and sends a detailed rejection notice to the Employee. All terminal actions culminate in a secure system log entry.
    """
    
    process_activity(story, "act07_expense", "act07_expense.svg", "Activity Diagram: Expense Approval Workflow", intro_07, analysis_07)

    intro_08 = """
    This Activity Diagram maps the execution logic for inventory stock actions, specifically detailing the 'Stock In' and 'Stock Out' processes. 
    It illustrates the critical systemic checks performed during inventory depletion to prevent negative balances and manage reorder thresholds.
    """
    
    analysis_08 = """
    The inventory management workflow prioritizes real-time stock integrity and automated threshold monitoring:
    <br/><br/>
    <b>1. Action Initialization:</b> The Inventory Manager selects an item and defines the stock action type (In or Out), specifying the quantity and reason. The System immediately assists by auto-filling the current stock balance for context.
    <br/><br/>
    <b>2. Conditional Validation (Stock Out):</b> The workflow heavily scrutinizes 'Stock Out' actions. The System validates the requested quantity against the current stock. If the request exceeds available inventory, the operation is blocked, and an error is displayed, forcing the Manager to correct the quantity. 'Stock In' actions bypass this specific volume check.
    <br/><br/>
    <b>3. Transaction Execution & Threshold Alerts:</b> Upon successful validation, the System dynamically adds or deducts the quantity from the 'inventory_items' table. Crucially, it then recalculates the new balance. If this new balance falls below the predefined 'reorder_level', the System automatically generates a reorder alert and notifies the Inventory Manager. Finally, the transaction is permanently recorded in 'inventory_logs'.
    """
    
    process_activity(story, "act08_inventory", "act08_inventory.svg", "Activity Diagram: Inventory Stock Action", intro_08, analysis_08)

    intro_09 = """
    This Activity Diagram details the workflow for building academic schedules and the systemic mechanisms employed to prevent scheduling conflicts. It highlights the interaction between the Administrator and the System's automated conflict-resolution engine.
    """
    
    analysis_09 = """
    The schedule building process is designed to ensure operational efficiency and prevent resource overallocation:
    <br/><br/>
    <b>1. Schedule Initialization & Input:</b> The Administrator begins by selecting a specific class, prompting the System to load the current weekly timetable grid. The Admin then selects an empty time slot and inputs the necessary session details (Class, Subject, Teacher, Day, Time, Duration).
    <br/><br/>
    <b>2. Systemic Conflict Resolution:</b> Upon attempting to add the session, the System immediately dispatches a conflict check request (via API). It rigorously evaluates the proposed session against existing data. If a conflict is detected (e.g., the Teacher is already assigned to another class during that time), the System blocks the save operation, issues a specific warning, and forces the Admin to select a different time slot or cancel the operation.
    <br/><br/>
    <b>3. Finalization & UI Update:</b> Only when no conflicts are found does the System proceed to save the session in the 'schedules' table. It then dynamically updates the weekly timetable on the user interface and provides a confirmation toast notification.
    """
    
    process_activity(story, "act09_schedule", "act09_schedule.svg", "Activity Diagram: Schedule Building & Conflict Check", intro_09, analysis_09)

    intro_10 = """
    This Activity Diagram models the rigorous 'Daily Cash Handover' (Cloture de Caisse) process. It outlines the financial reconciliation workflow between the Accountant and the System, culminating in an administrative review to ensure absolute financial transparency.
    """
    
    analysis_10 = """
    The daily cash handover enforces strict financial reconciliation and systemic variance tracking:
    <br/><br/>
    <b>1. Financial Aggregation & State Check:</b> The process starts when the Accountant opens the handover page. The System automatically fetches a real-time summary of the day's financial activities (Total received, Total paid out, and the Expected balance). Crucially, the System verifies if the day has already been closed; if so, it restricts the user to view-only mode, preventing duplicate closures.
    <br/><br/>
    <b>2. Manual Reconciliation & Variance Calculation:</b> If the day is open, the Accountant manually enters the actual counted physical cash balance. The System immediately calculates the variance (`variance = actual - expected`). It employs a visual threshold system: if the absolute variance exceeds a predefined limit (e.g., 500), it throws a hard warning requiring a recount. Acceptable variances are color-coded (green for zero, red for deficit, orange for surplus).
    <br/><br/>
    <b>3. Administrative Auditing:</b> After adding optional notes and confirming the closure, the System saves the record in 'cash_handovers', logs the event, and autonomously sends a daily report to the Administrator. The Admin then reviews the report; if the variance is unacceptable, they can formally request an explanation from the Accountant, ensuring complete financial accountability before final approval.
    """
    
    process_activity(story, "act10_cash", "act10_cash.svg", "Activity Diagram: Daily Cash Handover", intro_10, analysis_10)

    intro_11 = """
    This Activity Diagram delineates the mass communication workflow within the system, specifically detailing the creation and dissemination of broadcast notifications. It highlights the sequence from audience selection by the Administrator to systemic delivery and recipient interaction.
    """
    
    analysis_11 = """
    The broadcast notification process ensures targeted and verifiable communication:
    <br/><br/>
    <b>1. Message Configuration & Targeting:</b> The Administrator initiates the process by defining the target audience (e.g., all parents, specific classes, or all staff) and crafting the message payload (title, body, and priority level). The System assists by querying the database to provide a real-time preview of the expected recipient count before execution.
    <br/><br/>
    <b>2. Systemic Distribution:</b> Upon confirmation, the System fetches the precise recipient list and concurrently generates individual records within the 'notifications' table for each user, ensuring independent state tracking. The broadcast event is also centrally recorded in the system logs.
    <br/><br/>
    <b>3. Recipient Engagement:</b> On the recipient's interface, the new notification triggers a badge counter. The UI renders the message dynamically based on its priority flag (e.g., urgent messages are highlighted in red). Once the recipient views the message, the System updates the state to 'is_read = true', providing the administration with accurate engagement metrics.
    """
    
    process_activity(story, "act11_notification", "act11_notification.svg", "Activity Diagram: Broadcast Notification", intro_11, analysis_11)

    intro_12 = """
    This Activity Diagram models the financial workflow for managing and settling external financial obligations (e.g., utility bills, vendor payments). It details the interaction between the Accountant and the System's ledger, emphasizing debt validation and automated recurring obligation generation.
    """
    
    analysis_12 = """
    The external obligation management process ensures accurate debt servicing and automated future planning:
    <br/><br/>
    <b>1. Ledger Review & Initialization:</b> The Accountant accesses the obligations dashboard, where the System automatically fetches the current list, visually highlighting any overdue accounts to prioritize action. The Accountant selects a specific obligation and inputs the payment details.
    <br/><br/>
    <b>2. Financial Validation & State Mutation:</b> The System rigorously validates the entered payment amount against the remaining balance. If the amount exceeds the debt, it is rejected. For valid amounts, the System updates the 'amount_paid' and calculates the new balance. It then dynamically updates the status to either 'settled' (if the balance is zero) or 'partial'.
    <br/><br/>
    <b>3. Automated Recurring Generation:</b> A critical feature of this workflow is its predictive capability. If the settled obligation is flagged as 'is_recurring = true', the System automatically generates a new, identical obligation record for the subsequent month, ensuring continuous financial tracking without manual data entry.
    """
    
    process_activity(story, "act12_obligation", "act12_obligation.svg", "Activity Diagram: External Obligation Payment", intro_12, analysis_12)

    intro_13 = """
    This Activity Diagram maps the complete lifecycle of an Academic Year, from its initial creation to its formal systemic closure. It highlights the critical temporal transitions managed by the Administrator, emphasizing the automated archiving and student promotion protocols triggered at year-end.
    """
    
    analysis_13 = """
    The academic year lifecycle is a foundational structural process that governs all temporal data within the educational platform:
    <br/><br/>
    <b>1. Initialization & State Management:</b> When the Administrator creates a new academic year, they define its exact temporal boundaries. If the new year is flagged as 'current', the System automatically executes a state transition, safely deactivating the previously active year to guarantee that strictly one active academic cycle governs the database at any given time.
    <br/><br/>
    <b>2. Year-End Closure Initiation:</b> Terminating an academic year is a high-stakes, irreversible operation. When the Administrator initiates the closure, the System intercepts the action with a mandatory two-step confirmation protocol, warning that the operation dictates systemic archiving and global student progression.
    <br/><br/>
    <b>3. Automated Systemic Transition:</b> Upon final confirmation, the System executes a massive parallel processing block. It simultaneously removes the 'current' flag, autonomously promotes all active students to their subsequent academic tiers, archives the closed year's operational records, and securely logs the global transition to maintain absolute historical integrity.
    """
    
    process_activity(story, "act13_academicyear", "act13_academicyear.svg", "Activity Diagram: Academic Year Lifecycle", intro_13, analysis_13)

    intro_14 = """
    This Activity Diagram delineates the workflow for recording daily inventory consumption. It illustrates the interaction between the Inventory Manager and the System to ensure accurate real-time stock depletion tracking, financial cost aggregation, and automated threshold alerts.
    """
    
    analysis_14 = """
    The daily consumption workflow enforces rigorous logistical monitoring through automated validations and cascaded updates:
    <br/><br/>
    <b>1. State Verification & Data Entry:</b> The workflow begins with a systemic temporal validation to check if the day's consumption has already been logged, preventing duplicate batch entries. The Inventory Manager then dynamically adds consumed items. To minimize human error and ensure financial accuracy, the System automatically retrieves and locks the 'unit price' for each item directly from the core inventory database.
    <br/><br/>
    <b>2. Automated Financial Aggregation:</b> As items are continuously added to the daily list, the System computes the total financial cost of the consumption in real-time (`total = SUM(quantity x unit_price)`), providing the Manager with an immediate, mathematically verified summary before final submission.
    <br/><br/>
    <b>3. Cascaded Execution & Threshold Monitoring:</b> Upon confirmation, the System triggers a multi-step automated sequence. It formally records the consumption, deducts the precise quantities from the master stock, and writes to the inventory audit logs. Crucially, it then evaluates the newly depleted stock levels against predefined reorder thresholds, automatically dispatching procurement alerts to the Manager if any item reaches a critical level.
    """
    
    process_activity(story, "act14_consumption", "act14_consumption.svg", "Activity Diagram: Daily Consumption Recording", intro_14, analysis_14)

    intro_15 = """
    This Activity Diagram outlines the procedural workflow for formally assigning teachers to specific subjects and classes. 
    It highlights the System's dynamic data filtering capabilities and its built-in validation engines designed to prevent 
    duplicate assignments and monitor educator workload.
    """
    
    analysis_15 = """
    The teacher assignment workflow relies heavily on relational logic and automated workload constraints:
    <br/><br/>
    <b>1. Dynamic Relational Filtering:</b> The process utilizes cascading selections. When the Administrator selects a Teacher, the System dynamically filters the available subjects based on that teacher's recorded specialty. Subsequently, selecting a subject filters the available classes, ensuring logically sound assignments.
    <br/><br/>
    <b>2. Conflict Detection & Overwrite Protocol:</b> Upon attempting to confirm the assignment, the System preemptively queries the database (`/api/teacher-assignments/check-duplicate`) to prevent redundant links. If a duplicate is found, the System halts the process and presents a conflict modal, offering the Administrator the controlled option to explicitly override and replace the existing assignment or cancel the operation.
    <br/><br/>
    <b>3. Workload Validation & Auditing:</b> After successfully saving a new or overwritten assignment to the 'teacher_assignments' table, the System automatically evaluates the Teacher's total weekly session load. If the load exceeds the standard threshold (e.g., 20 sessions/week), a soft warning is triggered for administrative awareness. Finally, all state changes are permanently committed to 'system_logs'.
    """
    
    process_activity(story, "act15_assignment", "act15_assignment.svg", "Activity Diagram: Teacher Assignment", intro_15, analysis_15)

    intro_16 = """
    This Activity Diagram models the internal messaging and communication subsystem. It details the end-to-end flow of 
    peer-to-peer data exchange, highlighting conversation thread management, multimedia attachment processing, and 
    real-time delivery state tracking.
    """
    
    analysis_16 = """
    The internal messaging workflow ensures secure, stateful communication across the platform's user base:
    <br/><br/>
    <b>1. Thread Management & Initialization:</b> The workflow branches immediately based on context. If starting a new communication, the System initializes a distinct record in the 'conversations' table and maps the respective users in 'conversation_participants'. If accessing an existing thread, the System retrieves the historical payload and immediately mutates the state of incoming messages to 'read' (`is_read = true`).
    <br/><br/>
    <b>2. Payload Construction & Media Processing:</b> The Sender authors the message text and has the option to append files. If an attachment is included, the System intercepts the payload, uploads the file to secure storage, and generates a unified `attachment_url` to bundle with the final message payload before database insertion.
    <br/><br/>
    <b>3. Real-Time Delivery & State Tracking:</b> Upon dispatch, the System saves the core message and instantly pushes a notification to the Recipient. The Recipient's UI responds in real-time, updating unread badge counters. Once the Recipient opens the specific message, the systemic loop closes by definitively setting the `is_read` flag to true, providing accurate read receipts.
    """
    
    process_activity(story, "act16_messages", "act16_messages.svg", "Activity Diagram: Internal Messaging System", intro_16, analysis_16)

    intro_17 = """
    This Activity Diagram models the comprehensive data retrieval and management workflow for the Student Profile. It illustrates the parallel processing architecture used to aggregate distinct academic, financial, and personal data points into a single unified interface for Administrators and Parents.
    """
    
    analysis_17 = """
    The profile viewing process emphasizes system performance, data centralization, and secure mutation:
    <br/><br/>
    <b>1. Parallel Data Aggregation:</b> When a user requests a student profile, the System optimizes load times by executing multiple asynchronous API calls in parallel. It concurrently fetches core demographics, attendance summaries, academic grades, and financial fee statuses.
    <br/><br/>
    <b>2. Unified Tabular Interface:</b> The aggregated payload is rendered into a structured modal containing five distinct tabs. This separation of concerns allows users to navigate seamlessly between 'Personal Data', graphical 'Attendance' metrics, tabular 'Grades', 'Fees' tracking, and secure administrative 'Notes'.
    <br/><br/>
    <b>3. Controlled Data Mutation:</b> While Parents operate in a view-only capacity, Administrators retain the authority to edit profile fields. Any modification triggers a secure update sequence where the System commits the changes to the database, generates a tracking entry in 'system_logs', and provides immediate UI feedback via a success notification.
    """
    
    process_activity(story, "act17_studentprofile", "act17_studentprofile.svg", "Activity Diagram: Full Student Profile View", intro_17, analysis_17)

    intro_18 = """
    This Activity Diagram details the digital wallet ecosystem, covering both the administrative top-up sequence and the automated Point of Sale (POS) purchasing logic. It demonstrates the seamless integration between user financial balances, transaction auditing, and real-time inventory management.
    """
    
    analysis_18 = """
    The wallet and store workflow enforces strict balance validation and executes cascading multi-module updates:
    <br/><br/>
    <b>1. Wallet Funding & Ledger Credit:</b> The cycle initiates with a manual top-up managed by the Administration. Upon entry, the System immediately updates the user's base 'wallet_balance', securely records a formal 'credit' in 'wallet_transactions', and dispatches a notification to the Student or Parent confirming fund availability.
    <br/><br/>
    <b>2. Purchase Validation (Point of Sale):</b> When a user attempts to purchase an item from the digital store, the System acts as a strict financial gatekeeper. It evaluates the current wallet balance against the total cost. Insufficient funds explicitly block the transaction, prompting the user to either adjust their cart volume or request an additional top-up.
    <br/><br/>
    <b>3. Cascading Transaction Execution:</b> A successful balance validation triggers a complex, multi-table execution block. The System simultaneously debits the user's wallet, logs the specific store purchase, records the formal debit transaction, and physically deducts the item count from 'inventory_items'. Finally, it evaluates the new stock levels to conditionally trigger reorder alerts to the Inventory Manager before closing the sequence with an audit log.
    """
    
    process_activity(story, "act18_wallet", "act18_wallet.svg", "Activity Diagram: Wallet Top-Up & Store Purchase", intro_18, analysis_18)

    intro_19 = """
    This Activity Diagram details the granular Role-Based Access Control (RBAC) management workflow. It illustrates the interaction 
    between the Administrator and the system's security matrix, emphasizing dynamic permission toggling and real-time synchronization 
    of user roles.
    """
    
    analysis_19 = """
    The roles and permissions management process ensures strict security governance through a dynamic matrix:
    <br/><br/>
    <b>1. Role Initialization & User Auditing:</b> The Administrator accesses the roles page, where the System fetches existing roles and concurrently calculates the user count per role. This provides immediate visibility into the impact of any global permission changes.
    <br/><br/>
    <b>2. Dynamic Permission Matrix:</b> Upon selecting a role, the System fetches the grouped permissions matrix (`/api/permissions/matrix`). The Administrator can then toggle specific switches (On/Off). The System dynamically detects these changes and enables the 'Save Changes' button with a visual glow effect only when modifications are present.
    <br/><br/>
    <b>3. Security Synchronization & Logging:</b> Saving changes triggers a PATCH request containing the modified permission IDs. The System updates the 'role_permissions' table, dispatches success feedback, and securely logs the event in 'system_logs' to maintain a verifiable audit trail of security policy changes.
    """
    
    process_activity(story, "act19_roles", "act19_roles.svg", "Activity Diagram: Roles & Permissions Management", intro_19, analysis_19)

    intro_20 = """
    This Activity Diagram maps the lifecycle of educational resource management, from teacher upload to student access. 
    It details the system's handling of diverse resource types (Files and external Links), automated metadata extraction, 
    and multi-channel distribution.
    """
    
    analysis_20 = """
    The educational resources workflow optimizes academic content delivery through automated processing:
    <br/><br/>
    <b>1. Resource Ingestion & Validation:</b> The Teacher or Admin initiates an upload by selecting the target class and resource type. For physical files, the System automatically validates the size and extension while extracting the original filename. External URLs (such as YouTube links) bypass file validation and are stored directly.
    <br/><br/>
    <b>2. Automated Content Provisioning:</b> Upon confirmation, the System handles the heavy lifting: it uploads files to secure cloud storage, generates unique access URLs, calculates file sizes in MB, and inserts the comprehensive record into the 'resources' table.
    <br/><br/>
    <b>3. Targeted Notification & Student Fulfillment:</b> Once saved, the System identifies all active students in the selected class and autonomously creates notification records for them. Students receive a real-time alert, allowing them to navigate directly to the resources tab in their profile where they can either download files via a dedicated endpoint or be redirected to external academic links.
    """
    
    process_activity(story, "act20_resources", "act20_resources.svg", "Activity Diagram: Educational Resources Management", intro_20, analysis_20)