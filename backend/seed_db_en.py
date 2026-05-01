import hashlib
import logging
import random
from datetime import date, timedelta

from database import Database


logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

random.seed(20260501)

DEFAULT_PASSWORD = "python"
PASSWORD_HASH = hashlib.sha256(DEFAULT_PASSWORD.encode()).hexdigest()
TODAY = date.today()

ROOMS = [
    "Room 101",
    "Room 102",
    "Room 201",
    "Science Lab A",
    "Science Lab B",
    "Digital Lab",
]

SCHEDULE_SLOTS = [
    ("Sunday", "08:00", "09:30"),
    ("Sunday", "10:00", "11:30"),
    ("Sunday", "13:30", "15:00"),
    ("Monday", "08:00", "09:30"),
    ("Monday", "10:00", "11:30"),
    ("Monday", "15:00", "16:30"),
    ("Tuesday", "08:00", "09:30"),
    ("Tuesday", "10:00", "11:30"),
    ("Tuesday", "13:30", "15:00"),
    ("Wednesday", "08:00", "09:30"),
    ("Wednesday", "10:00", "11:30"),
    ("Wednesday", "15:00", "16:30"),
    ("Thursday", "08:00", "09:30"),
    ("Thursday", "10:00", "11:30"),
    ("Thursday", "13:30", "15:00"),
]

SUBJECTS = [
    ("Mathematics", "Algebra, functions, probability, and applied geometry."),
    ("Physics and Chemistry", "Mechanics, electricity, matter, and chemical reactions."),
    ("Life and Earth Sciences", "Genetics, immunity, geology, and scientific reasoning."),
    ("French Language", "Reading comprehension, writing, grammar, and oral practice."),
    ("English Language", "Reading, grammar, writing, and communication."),
    ("Arabic Language", "Text analysis, rhetoric, and structured writing."),
    ("Computer Science", "Algorithms, spreadsheets, and programming foundations."),
    ("Study Skills", "Planning, revision methods, and problem-solving strategies."),
]

PROGRAMS = [
    {
        "key": "math",
        "name": "Intensive Mathematics Program",
        "type": "Academic Support",
        "price_cash": 28000,
        "price_installments": 31000,
        "classes": [
            ("Mathematics Group A", "High School", "15-18", 18),
            ("Mathematics Group B", "High School", "15-18", 18),
        ],
        "subjects": ["Mathematics", "Study Skills"],
    },
    {
        "key": "languages",
        "name": "International Languages Program",
        "type": "Languages",
        "price_cash": 24000,
        "price_installments": 27000,
        "classes": [
            ("Languages Group A", "Middle/High School", "13-18", 16),
            ("Languages Group B", "Middle/High School", "13-18", 16),
        ],
        "subjects": ["French Language", "English Language", "Arabic Language"],
    },
    {
        "key": "exam_prep",
        "name": "National Exam Preparation Program",
        "type": "Exam Preparation",
        "price_cash": 45000,
        "price_installments": 50000,
        "classes": [
            ("Science Exam Prep Group A", "Final Year", "17-19", 20),
            ("Mathematics Exam Prep Group B", "Final Year", "17-19", 20),
        ],
        "subjects": ["Mathematics", "Physics and Chemistry", "Life and Earth Sciences", "Arabic Language"],
    },
    {
        "key": "science",
        "name": "Applied Science and Technology Program",
        "type": "Lab and Practice",
        "price_cash": 32000,
        "price_installments": 36000,
        "classes": [
            ("Applied Science Group A", "High School", "15-18", 16),
            ("Technology Lab Group B", "High School", "15-18", 16),
        ],
        "subjects": ["Physics and Chemistry", "Life and Earth Sciences", "Computer Science"],
    },
]

TEACHERS = [
    ("teacher.math.samira.en", "Samira Haddad", "Mathematics", "0551001101"),
    ("teacher.math.nabil.en", "Nabil Mansouri", "Mathematics", "0551001102"),
    ("teacher.physics.amine.en", "Amine Kasmi", "Physics and Chemistry", "0551001103"),
    ("teacher.science.lina.en", "Lina Bouchareb", "Life and Earth Sciences", "0551001104"),
    ("teacher.french.nadia.en", "Nadia Bensalem", "French Language", "0551001105"),
    ("teacher.english.ilyes.en", "Ilyes Rahmani", "English Language", "0551001106"),
    ("teacher.arabic.karim.en", "Karim Boukhari", "Arabic Language", "0551001107"),
    ("teacher.it.ryma.en", "Ryma Adel", "Computer Science", "0551001108"),
    ("teacher.skills.mourad.en", "Mourad Cherif", "Study Skills", "0551001109"),
]

PARENTS = [
    ("parent.benali.en", "Abdelkader Benali", "0552002101"),
    ("parent.saidi.en", "Fatima Saidi", "0552002102"),
    ("parent.mansouri.en", "Mourad Mansouri", "0552002103"),
    ("parent.brahimi.en", "Nawal Brahimi", "0552002104"),
    ("parent.khelil.en", "Youssef Khelil", "0552002105"),
    ("parent.touati.en", "Asma Touati", "0552002106"),
    ("parent.belhadj.en", "Said Belhadj", "0552002107"),
    ("parent.hamdi.en", "Meriem Hamdi", "0552002108"),
    ("parent.zerrouki.en", "Kamel Zerrouki", "0552002109"),
    ("parent.bennacer.en", "Leila Bennacer", "0552002110"),
    ("parent.djabou.en", "Salim Djabou", "0552002111"),
    ("parent.aitali.en", "Djamila Ait Ali", "0552002112"),
]

STUDENTS = [
    ("student.amira.benali.en", "Amira Benali", "2009-02-14", "O+"),
    ("student.yanis.saidi.en", "Yanis Saidi", "2008-11-03", "A+"),
    ("student.sarah.mansouri.en", "Sarah Mansouri", "2009-05-22", "B+"),
    ("student.ilyes.brahimi.en", "Ilyes Brahimi", "2008-08-17", "O-"),
    ("student.rania.khelil.en", "Rania Khelil", "2010-01-11", "A-"),
    ("student.mohamed.touati.en", "Mohamed Touati", "2009-03-29", "AB+"),
    ("student.lina.belhadj.en", "Lina Belhadj", "2008-12-07", "B-"),
    ("student.anis.hamdi.en", "Anis Hamdi", "2009-07-19", "O+"),
    ("student.chaima.zerrouki.en", "Chaima Zerrouki", "2008-04-05", "A+"),
    ("student.zaki.bennacer.en", "Zaki Bennacer", "2009-09-25", "B+"),
    ("student.manel.djabou.en", "Manel Djabou", "2008-06-13", "O+"),
    ("student.nassim.aitali.en", "Nassim Ait Ali", "2009-10-31", "A+"),
    ("student.khadija.benali.en", "Khadija Benali", "2010-02-18", "O+"),
    ("student.walid.saidi.en", "Walid Saidi", "2008-01-27", "AB-"),
    ("student.imane.mansouri.en", "Imane Mansouri", "2009-12-09", "B+"),
    ("student.aymen.brahimi.en", "Aymen Brahimi", "2008-03-16", "O+"),
    ("student.meriem.khelil.en", "Meriem Khelil", "2009-06-04", "A-"),
    ("student.karim.touati.en", "Karim Touati", "2008-09-12", "B+"),
    ("student.hiba.belhadj.en", "Hiba Belhadj", "2010-04-21", "O-"),
    ("student.adem.hamdi.en", "Adem Hamdi", "2009-08-30", "A+"),
    ("student.nour.zerrouki.en", "Nour Zerrouki", "2008-05-26", "O+"),
    ("student.amine.bennacer.en", "Amine Bennacer", "2009-11-20", "B-"),
    ("student.salma.djabou.en", "Salma Djabou", "2008-07-02", "A+"),
    ("student.anas.aitali.en", "Anas Ait Ali", "2009-01-23", "O+"),
    ("student.yasmine.benali.en", "Yasmine Benali", "2010-03-08", "AB+"),
    ("student.riad.saidi.en", "Riad Saidi", "2008-10-14", "B+"),
    ("student.malak.mansouri.en", "Malak Mansouri", "2009-05-01", "A+"),
    ("student.sofiane.brahimi.en", "Sofiane Brahimi", "2008-12-28", "O+"),
    ("student.ines.khelil.en", "Ines Khelil", "2009-07-07", "A-"),
    ("student.islam.touati.en", "Islam Touati", "2008-02-02", "B+"),
]


def insert_user(cursor, role_id, username, full_name, phone, email=None, address=None):
    if email is None:
        email = f"{username}@academy.local"
    cursor.execute(
        """
        INSERT INTO users (role_id, username, password, email, full_name, phone, address, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE)
        """,
        (role_id, username, PASSWORD_HASH, email, full_name, phone, address),
    )
    return cursor.lastrowid


def get_roles(cursor):
    cursor.execute("SELECT id, name FROM roles")
    return {row["name"]: row["id"] for row in cursor.fetchall()}


def get_or_create_public_author(cursor, roles):
    cursor.execute("SELECT id FROM users WHERE username = 'admin' LIMIT 1")
    row = cursor.fetchone()
    if row:
        return row["id"]

    return insert_user(
        cursor,
        roles["admin"],
        "admin.seed.en",
        "Academy Administration",
        "0550000000",
        "admin.seed.en@academy.local",
        "Administration Office",
    )


def seed_staff_users(cursor, roles):
    staff = {}
    staff["reception"] = insert_user(
        cursor,
        roles["receptionist"],
        "seed.reception.en",
        "Huda Reception Officer",
        "0550001001",
        "reception.seed.en@academy.local",
        "Reception Desk",
    )
    staff["accountant"] = insert_user(
        cursor,
        roles["accountant"],
        "seed.accounting.en",
        "Salim Finance Officer",
        "0550001002",
        "accounting.seed.en@academy.local",
        "Finance Office",
    )
    return staff


def seed_subjects(cursor):
    subject_ids = {}
    for subject_name, description in SUBJECTS:
        cursor.execute(
            "INSERT INTO subjects (subject_name, description) VALUES (%s, %s)",
            (subject_name, description),
        )
        subject_ids[subject_name] = cursor.lastrowid
    return subject_ids


def seed_programs_and_classes(cursor):
    programs = {}
    class_load = {}

    for program in PROGRAMS:
        cursor.execute(
            """
            INSERT INTO programs (program_name, program_type, price_cash, price_installments)
            VALUES (%s, %s, %s, %s)
            """,
            (
                program["name"],
                program["type"],
                program["price_cash"],
                program["price_installments"],
            ),
        )
        program_id = cursor.lastrowid
        programs[program["key"]] = {
            **program,
            "id": program_id,
            "class_ids": [],
            "classes_by_id": {},
        }

        for class_name, level, age_group, capacity in program["classes"]:
            cursor.execute(
                """
                INSERT INTO classes (program_id, class_name, level, age_group, capacity)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (program_id, class_name, level, age_group, capacity),
            )
            class_id = cursor.lastrowid
            programs[program["key"]]["class_ids"].append(class_id)
            programs[program["key"]]["classes_by_id"][class_id] = {
                "class_name": class_name,
                "level": level,
                "capacity": capacity,
            }
            class_load[class_id] = 0

    return programs, class_load


def seed_teachers(cursor, roles, subject_ids):
    teachers = []
    teacher_by_subject = {}

    for username, full_name, subject_name, phone in TEACHERS:
        user_id = insert_user(
            cursor,
            roles["teacher"],
            username,
            full_name,
            phone,
            f"{username}@academy.local",
            "Teachers Room",
        )
        cursor.execute(
            "INSERT INTO teachers (user_id, specialty, hire_date) VALUES (%s, %s, %s)",
            (user_id, subject_name, "2023-09-03"),
        )
        teacher = {
            "id": cursor.lastrowid,
            "user_id": user_id,
            "subject_name": subject_name,
            "subject_id": subject_ids[subject_name],
            "full_name": full_name,
        }
        teachers.append(teacher)
        teacher_by_subject.setdefault(subject_name, []).append(teacher)

    return teachers, teacher_by_subject


def seed_parents(cursor, roles):
    parents = []
    for username, full_name, phone in PARENTS:
        user_id = insert_user(
            cursor,
            roles["parent"],
            username,
            full_name,
            phone,
            f"{username}@academy.local",
            "Algiers",
        )
        cursor.execute("INSERT INTO parents (user_id) VALUES (%s)", (user_id,))
        parents.append({"id": cursor.lastrowid, "user_id": user_id, "full_name": full_name})
    return parents


def choose_class_for_program(program, class_load):
    return min(program["class_ids"], key=lambda class_id: class_load[class_id])


def planned_program_keys(index):
    base_cycle = ["math", "languages", "exam_prep", "science"]
    keys = [base_cycle[index % len(base_cycle)]]

    if index % 4 == 0 and "languages" not in keys:
        keys.append("languages")
    if index % 5 == 0 and "math" not in keys:
        keys.append("math")
    if index % 7 == 0 and "science" not in keys:
        keys.append("science")
    if index % 9 == 0 and "exam_prep" not in keys:
        keys.append("exam_prep")

    return keys


def seed_students_enrollments_and_fees(cursor, roles, parents, programs, class_load, accountant_user_id):
    students = []
    enrollments = []
    fees = []

    for index, (username, full_name, birth_date, blood_group) in enumerate(STUDENTS):
        parent = parents[index % len(parents)]
        user_id = insert_user(
            cursor,
            roles["student"],
            username,
            full_name,
            f"056{1000000 + index}",
            f"{username}@academy.local",
            "Algiers",
        )
        cursor.execute(
            """
            INSERT INTO students (
                user_id, parent_id, date_of_birth, registration_date,
                blood_group, medical_info, status
            ) VALUES (%s, %s, %s, %s, %s, %s, 'active')
            """,
            (
                user_id,
                parent["id"],
                birth_date,
                (TODAY - timedelta(days=35 + (index % 15))).isoformat(),
                blood_group,
                "No specific medical notes",
            ),
        )
        student_id = cursor.lastrowid
        student = {
            "id": student_id,
            "user_id": user_id,
            "full_name": full_name,
            "parent_id": parent["id"],
            "program_keys": [],
        }
        students.append(student)

        for program_key in planned_program_keys(index):
            program = programs[program_key]
            class_id = choose_class_for_program(program, class_load)
            class_load[class_id] += 1
            class_name = program["classes_by_id"][class_id]["class_name"]

            cursor.execute(
                """
                INSERT INTO student_enrollments (
                    student_id, program_id, class_id, group_name,
                    enrollment_date, status, notes
                ) VALUES (%s, %s, %s, %s, %s, 'active', %s)
                """,
                (
                    student_id,
                    program["id"],
                    class_id,
                    class_name,
                    (TODAY - timedelta(days=30 + (index % 10))).isoformat(),
                    "Valid seed enrollment linked to program and class",
                ),
            )
            enrollment_id = cursor.lastrowid
            enrollments.append(
                {
                    "id": enrollment_id,
                    "student_id": student_id,
                    "student_user_id": user_id,
                    "program_id": program["id"],
                    "program_key": program_key,
                    "class_id": class_id,
                }
            )
            student["program_keys"].append(program_key)

            discount = 2500 if len(student["program_keys"]) > 1 else 0
            due_date = TODAY + timedelta(days=20 + (index % 12))
            cursor.execute(
                """
                INSERT INTO student_fees (
                    student_id, enrollment_id, program_id, fee_type,
                    amount_due, applied_discount, due_date
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    student_id,
                    enrollment_id,
                    program["id"],
                    "Program subscription",
                    program["price_cash"],
                    discount,
                    due_date.isoformat(),
                ),
            )
            fee_id = cursor.lastrowid
            net_amount = program["price_cash"] - discount
            fees.append({"id": fee_id, "student_user_id": user_id, "net_amount": net_amount})

            if index % 4 != 3:
                paid_amount = net_amount if index % 3 != 0 else max(net_amount // 2, 1000)
                cursor.execute(
                    """
                    INSERT INTO user_transactions (
                        from_user_id, to_user_id, amount, transaction_type,
                        reference_type, reference_id, notes, status
                    ) VALUES (%s, %s, %s, 'fee_payment', 'student_fee', %s, %s, 'completed')
                    """,
                    (
                        user_id,
                        accountant_user_id,
                        paid_amount,
                        fee_id,
                        f"Seed payment for {program['name']}",
                    ),
                )
                transaction_id = cursor.lastrowid
                cursor.execute(
                    """
                    INSERT INTO payments (
                        fee_id, transaction_id, amount_paid,
                        installment_number, receipt_number
                    ) VALUES (%s, %s, %s, %s, %s)
                    """,
                    (
                        fee_id,
                        transaction_id,
                        paid_amount,
                        1,
                        f"EN-REC-{TODAY.strftime('%Y%m')}-{fee_id:04d}",
                    ),
                )
                cursor.execute(
                    "UPDATE student_fees SET transaction_id = %s WHERE id = %s",
                    (transaction_id, fee_id),
                )

    return students, enrollments, fees


def public_resource_url(subject_name):
    urls = {
        "Mathematics": "https://www.khanacademy.org/math",
        "Physics and Chemistry": "https://www.khanacademy.org/science/physics",
        "Life and Earth Sciences": "https://www.khanacademy.org/science/biology",
        "French Language": "https://apprendre.tv5monde.com/en",
        "English Language": "https://learnenglish.britishcouncil.org/",
        "Arabic Language": "https://www.aljazeera.net/encyclopedia",
        "Computer Science": "https://www.w3schools.com/python/",
        "Study Skills": "https://learningcenter.unc.edu/tips-and-tools/",
    }
    return urls.get(subject_name, "https://www.khanacademy.org/")


def seed_assignments_schedules_resources(cursor, programs, subject_ids, teacher_by_subject):
    assignments = []
    used_teacher_slots = set()
    used_class_slots = set()
    used_room_slots = set()
    room_index = 0

    for program in programs.values():
        for class_id in program["class_ids"]:
            for subject_name in program["subjects"]:
                teachers = teacher_by_subject[subject_name]
                teacher = teachers[(class_id + subject_ids[subject_name]) % len(teachers)]

                cursor.execute(
                    """
                    INSERT INTO teacher_assignments (teacher_id, subject_id, class_id)
                    VALUES (%s, %s, %s)
                    """,
                    (teacher["id"], subject_ids[subject_name], class_id),
                )
                assignment_id = cursor.lastrowid
                assignment = {
                    "id": assignment_id,
                    "teacher_id": teacher["id"],
                    "subject_name": subject_name,
                    "class_id": class_id,
                }
                assignments.append(assignment)

                for day, start_time, end_time in SCHEDULE_SLOTS:
                    room = ROOMS[room_index % len(ROOMS)]
                    slot_key = (day, start_time)
                    if (
                        (teacher["id"], *slot_key) in used_teacher_slots
                        or (class_id, *slot_key) in used_class_slots
                        or (room, *slot_key) in used_room_slots
                    ):
                        room_index += 1
                        continue

                    cursor.execute(
                        """
                        INSERT INTO schedules (
                            assignment_id, day_of_week, start_time, end_time, room_number
                        ) VALUES (%s, %s, %s, %s, %s)
                        """,
                        (assignment_id, day, start_time, end_time, room),
                    )
                    used_teacher_slots.add((teacher["id"], *slot_key))
                    used_class_slots.add((class_id, *slot_key))
                    used_room_slots.add((room, *slot_key))
                    room_index += 1
                    break

                cursor.execute(
                    """
                    INSERT INTO resources (
                        title, description, resource_type, file_path_or_url,
                        file_size_mb, assignment_id
                    ) VALUES (%s, %s, 'link', %s, 0, %s)
                    """,
                    (
                        f"{subject_name} Review Pack",
                        f"A curated public resource for organized revision in {subject_name}.",
                        public_resource_url(subject_name),
                        assignment_id,
                    ),
                )

    return assignments


def get_active_students_by_class(cursor):
    cursor.execute(
        """
        SELECT se.class_id, se.student_id
        FROM student_enrollments se
        WHERE se.status = 'active'
        ORDER BY se.class_id, se.student_id
        """
    )
    by_class = {}
    for row in cursor.fetchall():
        by_class.setdefault(row["class_id"], []).append(row["student_id"])
    return by_class


def seed_assessments_grades_and_attendance(cursor, assignments):
    students_by_class = get_active_students_by_class(cursor)
    attendance_dates = [
        TODAY - timedelta(days=2),
        TODAY - timedelta(days=5),
        TODAY - timedelta(days=9),
        TODAY - timedelta(days=14),
    ]

    for index, assignment in enumerate(assignments):
        assessment_type = "exam" if index % 3 == 0 else "quiz"
        cursor.execute(
            """
            INSERT INTO assessments (title, type, max_grade, assignment_id, due_date)
            VALUES (%s, %s, 20, %s, %s)
            """,
            (
                f"{assignment['subject_name']} {'Exam' if assessment_type == 'exam' else 'Quiz'}",
                assessment_type,
                assignment["id"],
                (TODAY - timedelta(days=7 + (index % 20))).isoformat(),
            ),
        )
        assessment_id = cursor.lastrowid

        for student_id in students_by_class.get(assignment["class_id"], []):
            raw_grade = random.gauss(13.2, 3.1)
            grade = round(max(4.0, min(19.75, raw_grade)), 2)
            if grade >= 16:
                remark = "Excellent, consistent and well-organized work"
            elif grade >= 12:
                remark = "Good progress, continue practicing"
            elif grade >= 9:
                remark = "Average result, additional exercises recommended"
            else:
                remark = "Needs individual follow-up and a support plan"

            cursor.execute(
                """
                INSERT INTO grades (student_id, assessment_id, grade_value, teacher_remarks)
                VALUES (%s, %s, %s, %s)
                """,
                (student_id, assessment_id, grade, remark),
            )

    for class_id, student_ids in students_by_class.items():
        for target_date in attendance_dates:
            for student_id in student_ids:
                status = random.choices(
                    ["present", "late", "absent"],
                    weights=[82, 10, 8],
                    k=1,
                )[0]
                is_justified = status == "absent" and random.random() < 0.45
                reason = "Documented medical justification" if is_justified else None
                cursor.execute(
                    """
                    INSERT INTO attendance (
                        student_id, class_id, date, status,
                        is_justified, justification_reason
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                    """,
                    (student_id, class_id, target_date.isoformat(), status, is_justified, reason),
                )


def seed_notifications(cursor):
    cursor.execute("SELECT id FROM users")
    notifications = [
        ("Welcome", "The new academic term has been activated on the platform."),
        ("Profile Reminder", "Please verify phone numbers and email addresses this week."),
        ("Attendance Tracking", "Attendance records are now available from your dashboard."),
        ("Assessment Calendar", "Upcoming assessments are published by program and class group."),
    ]

    for row in cursor.fetchall():
        title, message = random.choice(notifications)
        cursor.execute(
            "INSERT INTO notifications (user_id, title, message, is_read) VALUES (%s, %s, %s, %s)",
            (row["id"], title, message, random.choice([False, False, True])),
        )


def seed_public_markdown_posts(cursor, author_user_id):
    posts = [
        {
            "title": "Weekly Study Plan: Turning Effort Into Progress",
            "image": "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
            "content": """# Weekly Study Plan

![Students studying in a library](https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80)

A clear weekly plan turns revision from random effort into measurable progress. Students may also use [Khan Academy](https://www.khanacademy.org/) for structured practice by topic.

| Day | Main Goal | Duration | Output |
|---|---:|---:|---|
| Sunday | Review a new lesson | 45 min | 8-line summary |
| Tuesday | Solve exercises | 60 min | 10 corrected tasks |
| Thursday | Review mistakes | 30 min | Error checklist |

Progress can be measured with:

$$
R = \\frac{\\text{completed sessions}}{\\text{planned sessions}} \\times 100
$$

When $R \\ge 80\\%$, the student is building a reliable study routine.""",
        },
        {
            "title": "Mathematics Workshop: From Formula to Meaning",
            "image": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
            "content": """# Mathematics Workshop

![Mathematics board](https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80)

This public workshop focuses on quadratic equations and the meaning of the discriminant. For extra practice, students can visit [Math is Fun](https://www.mathsisfun.com/algebra/quadratic-equation.html).

| Concept | Formula | Meaning |
|---|---|---|
| General form | $ax^2 + bx + c = 0$ | Equation structure |
| Discriminant | $\\Delta = b^2 - 4ac$ | Number of real solutions |
| Axis of symmetry | $x = -\\frac{b}{2a}$ | Position of the vertex |

If:

$$
\\Delta > 0
$$

then the equation has two distinct real solutions.""",
        },
        {
            "title": "Public Announcement: Science and Languages Club",
            "image": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
            "content": """# Science and Languages Club

![Science experiment](https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80)

The club is an open space for experiments, discussion, and scientific vocabulary practice. For English vocabulary, learners can explore [British Council LearnEnglish](https://learnenglish.britishcouncil.org/).

| Activity | Language Focus | Example |
|---|---|---|
| Speed experiment | English vocabulary | speed, distance, time |
| Short presentation | French communication | presenter une experience |
| Scientific poster | Arabic terminology | hypothesis, observation, result |

For speed experiments, students use:

$$
v = \\frac{d}{t}
$$

where $v$ is speed, $d$ is distance, and $t$ is time. The goal is to use the formula in a real situation, not only memorize it.""",
        },
    ]

    for post in posts:
        cursor.execute(
            """
            INSERT INTO posts (title, content, image, user_id)
            VALUES (%s, %s, %s, %s)
            """,
            (post["title"], post["content"], post["image"], author_user_id),
        )


def seed_conversations_and_messages(cursor):
    cursor.execute("SELECT id FROM users ORDER BY id")
    user_ids = [row["id"] for row in cursor.fetchall()]
    if len(user_ids) < 2:
        return

    conversations = [
        ("Mathematics Homework Follow-up", "individual"),
        ("Attendance Clarification", "individual"),
        ("Payment Schedule Coordination", "individual"),
        ("Languages Program Notes", "individual"),
    ]
    for title, conversation_type in conversations:
        cursor.execute(
            "INSERT INTO conversations (title, type) VALUES (%s, %s)",
            (title, conversation_type),
        )

    messages = [
        "Hello, could you please confirm the next session time?",
        "The group schedule has been updated on the platform.",
        "Please review the notes from the latest assessment.",
        "Thank you, the notification has been received.",
        "Could you send the revision resource link?",
        "The first installment has been recorded successfully.",
    ]

    for index in range(36):
        sender = user_ids[index % len(user_ids)]
        receiver = user_ids[(index * 3 + 5) % len(user_ids)]
        if sender == receiver:
            receiver = user_ids[(index + 1) % len(user_ids)]
        cursor.execute(
            """
            INSERT INTO messages (content, sender_id, receiver_id)
            VALUES (%s, %s, %s)
            """,
            (messages[index % len(messages)], sender, receiver),
        )


def seed_database():
    db = Database()
    try:
        with db.get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            logger.info("Starting English seed data generation...")

            roles = get_roles(cursor)
            author_user_id = get_or_create_public_author(cursor, roles)
            staff = seed_staff_users(cursor, roles)
            subject_ids = seed_subjects(cursor)
            programs, class_load = seed_programs_and_classes(cursor)
            teachers, teacher_by_subject = seed_teachers(cursor, roles, subject_ids)
            parents = seed_parents(cursor, roles)
            students, enrollments, fees = seed_students_enrollments_and_fees(
                cursor,
                roles,
                parents,
                programs,
                class_load,
                staff["accountant"],
            )
            assignments = seed_assignments_schedules_resources(
                cursor,
                programs,
                subject_ids,
                teacher_by_subject,
            )
            seed_assessments_grades_and_attendance(cursor, assignments)
            seed_notifications(cursor)
            seed_public_markdown_posts(cursor, author_user_id)
            seed_conversations_and_messages(cursor)

            conn.commit()
            logger.info("English seed completed successfully.")
            logger.info("Programs: %s", len(programs))
            logger.info("Classes: %s", sum(len(program["class_ids"]) for program in programs.values()))
            logger.info("Teachers: %s", len(teachers))
            logger.info("Parents: %s", len(parents))
            logger.info("Students: %s", len(students))
            logger.info("Enrollments: %s", len(enrollments))
            logger.info("Fees: %s", len(fees))
            logger.info("Default generated password: %s", DEFAULT_PASSWORD)
    except Exception as exc:
        logger.error("English seed failed: %s", exc)
        raise


if __name__ == "__main__":
    seed_database()
