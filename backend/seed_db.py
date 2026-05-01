import random
import hashlib
import logging
import itertools
from datetime import datetime, timedelta
from database import Database

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

FIRST_NAMES = ['Mohamed', 'Amine', 'Fatima', 'Sarah', 'Yassine', 'Imane', 'Aymen']
LAST_NAMES = ['Benali', 'Saidi', 'Mansouri', 'Brahimi', 'Khelil', 'Touati']
SUBJECTS = ['Mathématiques', 'Physique-Chimie', 'Sciences Naturelles', 'Langue Française', 'Anglais']
CLASSES = [('1 AS', 'Secondaire'), ('2 AS', 'Secondaire'), ('3 AS', 'Secondaire')]
ROOMS = ['Salle 01', 'Salle 02', 'Laboratoire A']

def hash_password(password="python"):
    return hashlib.sha256(password.encode()).hexdigest()

def generate_user_data(role_prefix, index):
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    username = f"{role_prefix}{index}"
    email = f"{username}@school.local"
    phone = f"055{random.randint(100000, 999999)}"
    full_name = f"{first} {last}"
    return username, full_name, email, phone

def get_roles(cursor):
    cursor.execute("SELECT id, name FROM roles")
    return {row['name']: row['id'] for row in cursor.fetchall()}

def seed_academic_structure(cursor):
    cursor.execute("INSERT INTO programs (program_name, program_type, price_cash) VALUES ('Programme Annuel', 'Standard', 45000)")
    program_id = cursor.lastrowid

    class_ids = []
    for c_name, c_level in CLASSES:
        cursor.execute("INSERT INTO classes (class_name, level, capacity) VALUES (%s, %s, 30)", (c_name, c_level))
        class_ids.append(cursor.lastrowid)

    subject_ids = []
    for sub in SUBJECTS:
        cursor.execute("INSERT INTO subjects (subject_name) VALUES (%s)", (sub,))
        subject_ids.append(cursor.lastrowid)

    return program_id, class_ids, subject_ids

def seed_users(cursor, roles):
    teacher_ids = []
    parent_ids = []
    all_users = []

    for i in range(1, 7):
        username, full_name, email, phone = generate_user_data('prof', i)
        cursor.execute(
            "INSERT INTO users (role_id, username, password, full_name, email, phone, is_active) VALUES (%s, %s, %s, %s, %s, %s, TRUE)",
            (roles['teacher'], username, hash_password(), full_name, email, phone)
        )
        user_id = cursor.lastrowid
        all_users.append(user_id)
        
        specialty = SUBJECTS[(i-1) % len(SUBJECTS)]
        hire_date = (datetime.now() - timedelta(days=random.randint(300, 1500))).strftime('%Y-%m-%d')
        cursor.execute("INSERT INTO teachers (user_id, specialty, hire_date) VALUES (%s, %s, %s)", (user_id, specialty, hire_date))
        teacher_ids.append({'id': cursor.lastrowid, 'user_id': user_id, 'specialty': specialty})

    for i in range(1, 16):
        username, full_name, email, phone = generate_user_data('parent', i)
        cursor.execute(
            "INSERT INTO users (role_id, username, password, full_name, email, phone, is_active) VALUES (%s, %s, %s, %s, %s, %s, TRUE)",
            (roles['parent'], username, hash_password(), full_name, email, phone)
        )
        user_id = cursor.lastrowid
        all_users.append(user_id)
        cursor.execute("INSERT INTO parents (user_id) VALUES (%s)", (user_id,))
        parent_ids.append(cursor.lastrowid)

    return teacher_ids, parent_ids, all_users

def seed_students_and_enrollments(cursor, roles, parent_ids, class_ids, program_id):
    student_ids = []
    all_student_users = []
    today = datetime.now()

    for i in range(1, 46):
        username, full_name, email, phone = generate_user_data('eleve', i)
        cursor.execute(
            "INSERT INTO users (role_id, username, password, full_name, email, phone, is_active) VALUES (%s, %s, %s, %s, %s, %s, TRUE)",
            (roles['student'], username, hash_password(), full_name, email, phone)
        )
        user_id = cursor.lastrowid
        all_student_users.append(user_id)

        parent_id = random.choice(parent_ids)
        class_id = random.choice(class_ids)
        dob = f"{random.randint(2007, 2010)}-0{random.randint(1,9)}-{random.randint(10, 28)}"
        
        cursor.execute(
            "INSERT INTO students (user_id, parent_id, class_id, date_of_birth, registration_date, status) VALUES (%s, %s, %s, %s, CURDATE(), 'active')",
            (user_id, parent_id, class_id, dob)
        )
        student_id = cursor.lastrowid
        student_ids.append(student_id)

        cursor.execute(
            "INSERT INTO student_enrollments (student_id, program_id, group_name, enrollment_date, status) VALUES (%s, %s, %s, CURDATE(), 'active')",
            (student_id, program_id, f"Groupe {random.randint(1,3)}")
        )

        cursor.execute(
            "INSERT INTO student_fees (student_id, program_id, fee_type, amount_due, due_date) VALUES (%s, %s, 'Frais Scolaires Annuels', 45000, %s)",
            (student_id, program_id, (today + timedelta(days=30)).strftime('%Y-%m-%d'))
        )

    return student_ids, all_student_users

def seed_schedules_and_academics(cursor, teacher_ids, class_ids, subject_ids):
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
    times = [('08:00', '10:00'), ('10:00', '12:00'), ('13:00', '15:00'), ('15:00', '17:00')]
    all_time_slots = list(itertools.product(days, times))
    today = datetime.now()

    for class_id in class_ids:
        available_slots = all_time_slots.copy()
        random.shuffle(available_slots)

        assigned_teachers = random.sample(teacher_ids, min(4, len(teacher_ids)))
        
        for teacher in assigned_teachers:
            cursor.execute("SELECT id FROM subjects WHERE subject_name = %s", (teacher['specialty'],))
            subject_result = cursor.fetchone()
            if not subject_result:
                continue
            subject_id = subject_result['id']

            cursor.execute("INSERT INTO teacher_assignments (teacher_id, subject_id, class_id) VALUES (%s, %s, %s)", 
                           (teacher['id'], subject_id, class_id))
            assign_id = cursor.lastrowid

            if len(available_slots) >= 2:
                assigned_slots = [available_slots.pop(), available_slots.pop()]
                for day, (t_start, t_end) in assigned_slots:
                    cursor.execute(
                        "INSERT INTO schedules (assignment_id, day_of_week, start_time, end_time, room_number) VALUES (%s, %s, %s, %s, %s)",
                        (assign_id, day, t_start, t_end, random.choice(ROOMS))
                    )

            exam_date = (today - timedelta(days=random.randint(5, 30))).strftime('%Y-%m-%d')
            cursor.execute(
                "INSERT INTO assessments (title, type, max_grade, assignment_id, due_date) VALUES (%s, 'exam', 20, %s, %s)",
                (f"Exam - {teacher['specialty']}", assign_id, exam_date)
            )
            assessment_id = cursor.lastrowid

            cursor.execute("SELECT id FROM students WHERE class_id = %s", (class_id,))
            students = cursor.fetchall()

            for stu in students:
                grade = round(random.gauss(11.5, 4.0), 2)
                grade = max(0.0, min(20.0, grade))

                if grade >= 16:
                    remark = random.choice(["Excellent work", "Perfect", "Outstanding"])
                elif grade >= 12:
                    remark = random.choice(["Good job", "Keep it up"])
                elif grade >= 9:
                    remark = random.choice(["Needs improvement", "Average work"])
                else:
                    remark = random.choice(["Insufficient", "Requires more focus", "Warning"])

                cursor.execute(
                    "INSERT INTO grades (student_id, assessment_id, grade_value, teacher_remarks) VALUES (%s, %s, %s, %s)",
                    (stu['id'], assessment_id, grade, remark)
                )

                absence_chance = 0.4 if grade < 10 else 0.05
                if random.random() < absence_chance:
                    date_abs = (today - timedelta(days=random.randint(1, 40))).strftime('%Y-%m-%d')
                    is_justified = random.choice([True, False])
                    reason = "Medical certificate" if is_justified else None
                    cursor.execute(
                        "INSERT INTO attendance (student_id, date, status, is_justified, justification_reason) VALUES (%s, %s, 'absent', %s, %s)",
                        (stu['id'], date_abs, is_justified, reason)
                    )

def seed_notifications(cursor):
    cursor.execute("SELECT id FROM users")
    users = cursor.fetchall()
    
    notification_templates = [
        ("System Update", "The system will undergo maintenance tonight at 11 PM."),
        ("Welcome", "Welcome to the new platform! Check your dashboard for updates."),
        ("Reminder", "Please update your profile information before the end of the week."),
        ("Security", "A new login was detected. Please verify your account activity."),
        ("Event", "Don't forget the upcoming school meeting this Thursday.")
    ]
    
    for user in users:
        title, message = random.choice(notification_templates)
        cursor.execute(
            "INSERT INTO notifications (user_id, title, message) VALUES (%s, %s, %s)",
            (user['id'], title, message)
        )

def seed_posts(cursor, teacher_ids):
    posts_data = [
        {
            "title": "Introduction to Quadratic Equations",
            "content": "# Quadratic Equations\n\nA quadratic equation is a second-order polynomial equation in a single variable x.\n\n## Standard Form\n\nThe standard form is:\n$$ax^2 + bx + c = 0$$\n\nWhere $x$ represents an unknown, and $a$, $b$, and $c$ represent known numbers, where $a \\neq 0$."
        },
        {
            "title": "Newton's Second Law",
            "content": "# Dynamics\n\nNewton's second law of motion pertains to the behavior of objects for which all existing forces are not balanced.\n\n## Formula\n\n$$F = ma$$\n\nWhere $F$ is the net force, $m$ is mass, and $a$ is acceleration."
        },
        {
            "title": "Pythagorean Theorem",
            "content": "# Geometry Basics\n\nIn mathematics, the Pythagorean theorem is a fundamental relation in Euclidean geometry among the three sides of a right triangle.\n\n## Equation\n\n$$a^2 + b^2 = c^2$$\n\nWhere $c$ represents the length of the hypotenuse."
        }
    ]
    
    for teacher in teacher_ids:
        post = random.choice(posts_data)
        cursor.execute(
            "INSERT INTO posts (title, content, user_id) VALUES (%s, %s, %s)",
            (post["title"], post["content"], teacher['user_id'])
        )

def seed_communications(cursor, all_user_ids):
    for i in range(1, 6):
        cursor.execute("INSERT INTO conversations (title, type) VALUES (%s, 'individual')", (f"Discussion {i}",))
    
    messages_templates = [
        "Hello, could you please clarify the homework?",
        "The document has been uploaded.",
        "When is the next assessment scheduled?",
        "Thank you for the update.",
        "I will check the portal for the grades."
    ]
    
    for _ in range(40):
        sender = random.choice(all_user_ids)
        receiver = random.choice(all_user_ids)
        while sender == receiver:
            receiver = random.choice(all_user_ids)
        
        content = random.choice(messages_templates)
        cursor.execute(
            "INSERT INTO messages (content, sender_id, receiver_id) VALUES (%s, %s, %s)",
            (content, sender, receiver)
        )

def seed_database():
    db = Database()
    try:
        with db.get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            logger.info("Starting database seeding...")

            roles = get_roles(cursor)
            program_id, class_ids, subject_ids = seed_academic_structure(cursor)
            teacher_ids, parent_ids, adult_users = seed_users(cursor, roles)
            student_ids, student_users = seed_students_and_enrollments(cursor, roles, parent_ids, class_ids, program_id)
            
            all_user_ids = adult_users + student_users
            
            seed_schedules_and_academics(cursor, teacher_ids, class_ids, subject_ids)
            seed_notifications(cursor)
            seed_posts(cursor, teacher_ids)
            seed_communications(cursor, all_user_ids)

            conn.commit()
            logger.info("Database seeding completed successfully.")
    except Exception as e:
        logger.error(f"Error during seeding: {e}")
        if 'conn' in locals():
            conn.rollback()

if __name__ == "__main__":
    seed_database()