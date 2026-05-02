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
    "Salle 01",
    "Salle 02",
    "Salle 03",
    "Laboratoire A",
    "Laboratoire B",
    "Atelier Numerique",
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
    ("الرياضيات", "الجبر، الدوال، الاحتمالات، والهندسة التطبيقية."),
    ("الفيزياء والكيمياء", "الميكانيك، الكهرباء، المادة والتحولات الكيميائية."),
    ("علوم الطبيعة والحياة", "المناعة، الوراثة، الجيولوجيا، والمنهج التجريبي."),
    ("اللغة الفرنسية", "فهم النصوص، التعبير الكتابي، والقواعد."),
    ("اللغة الإنجليزية", "Reading, grammar, writing, and communication."),
    ("اللغة العربية", "تحليل النصوص، البلاغة، والوضعيات الإدماجية."),
    ("الإعلام الآلي", "الخوارزميات، الجداول، وأساسيات البرمجة."),
    ("منهجية الدراسة", "تنظيم الوقت، المراجعة، واستراتيجيات حل التمارين."),
]

PROGRAMS = [
    {
        "key": "math",
        "name": "برنامج الرياضيات المكثف",
        "type": "دعم أكاديمي",
        "price_cash": 28000,
        "price_installments": 31000,
        "classes": [
            ("فوج رياضيات A", "ثانوي", "15-18", 18),
            ("فوج رياضيات B", "ثانوي", "15-18", 18),
        ],
        "subjects": ["الرياضيات", "منهجية الدراسة"],
    },
    {
        "key": "languages",
        "name": "برنامج اللغات الدولية",
        "type": "لغات",
        "price_cash": 24000,
        "price_installments": 27000,
        "classes": [
            ("فوج لغات A", "متوسط/ثانوي", "13-18", 16),
            ("فوج لغات B", "متوسط/ثانوي", "13-18", 16),
        ],
        "subjects": ["اللغة الفرنسية", "اللغة الإنجليزية", "اللغة العربية"],
    },
    {
        "key": "bac",
        "name": "برنامج التحضير للبكالوريا",
        "type": "تحضير امتحانات",
        "price_cash": 45000,
        "price_installments": 50000,
        "classes": [
            ("فوج باك علوم A", "3 AS", "17-19", 20),
            ("فوج باك رياضيات B", "3 AS", "17-19", 20),
        ],
        "subjects": ["الرياضيات", "الفيزياء والكيمياء", "علوم الطبيعة والحياة", "اللغة العربية"],
    },
    {
        "key": "science",
        "name": "برنامج العلوم والتقنية",
        "type": "تجارب وتطبيق",
        "price_cash": 32000,
        "price_installments": 36000,
        "classes": [
            ("فوج علوم تطبيقية A", "ثانوي", "15-18", 16),
            ("فوج تقنية ومخبر B", "ثانوي", "15-18", 16),
        ],
        "subjects": ["الفيزياء والكيمياء", "علوم الطبيعة والحياة", "الإعلام الآلي"],
    },
]

TEACHERS = [
    ("teacher.math.samira", "سميرة حداد", "الرياضيات", "0551001101"),
    ("teacher.math.nabil", "نبيل منصوري", "الرياضيات", "0551001102"),
    ("teacher.physics.amine", "أمين قاسمي", "الفيزياء والكيمياء", "0551001103"),
    ("teacher.science.lina", "لينا بوشارب", "علوم الطبيعة والحياة", "0551001104"),
    ("teacher.french.nadia", "نادية بن سالم", "اللغة الفرنسية", "0551001105"),
    ("teacher.english.ilyes", "إلياس رحماني", "اللغة الإنجليزية", "0551001106"),
    ("teacher.arabic.karim", "كريم بوخاري", "اللغة العربية", "0551001107"),
    ("teacher.it.ryma", "ريمة عادل", "الإعلام الآلي", "0551001108"),
    ("teacher.method.mourad", "مراد شريف", "منهجية الدراسة", "0551001109"),
]

PARENTS = [
    ("parent.benali", "عبد القادر بن علي", "0552002101"),
    ("parent.saidi", "فاطمة ساعدي", "0552002102"),
    ("parent.mansouri", "مراد منصوري", "0552002103"),
    ("parent.brahimi", "نوال براهيمي", "0552002104"),
    ("parent.khelil", "يوسف خليل", "0552002105"),
    ("parent.touati", "أسماء تواتي", "0552002106"),
    ("parent.belhadj", "سعيد بلحاج", "0552002107"),
    ("parent.hamdi", "مريم حمدي", "0552002108"),
    ("parent.zerrouki", "كمال زروقي", "0552002109"),
    ("parent.bennacer", "ليلى بن ناصر", "0552002110"),
    ("parent.djabou", "سليم جابو", "0552002111"),
    ("parent.aitali", "جميلة آيت علي", "0552002112"),
]

STUDENTS = [
    ("student.amira.benali", "أميرة بن علي", "2009-02-14", "O+"),
    ("student.yanis.saidi", "يانيس ساعدي", "2008-11-03", "A+"),
    ("student.sarah.mansouri", "سارة منصوري", "2009-05-22", "B+"),
    ("student.ilyes.brahimi", "إلياس براهيمي", "2008-08-17", "O-"),
    ("student.rania.khelil", "رانيا خليل", "2010-01-11", "A-"),
    ("student.mohamed.touati", "محمد تواتي", "2009-03-29", "AB+"),
    ("student.lina.belhadj", "لينا بلحاج", "2008-12-07", "B-"),
    ("student.anis.hamdi", "أنيس حمدي", "2009-07-19", "O+"),
    ("student.chaima.zerrouki", "شيماء زروقي", "2008-04-05", "A+"),
    ("student.zaki.bennacer", "زكي بن ناصر", "2009-09-25", "B+"),
    ("student.manel.djabou", "منال جابو", "2008-06-13", "O+"),
    ("student.nassim.aitali", "نسيم آيت علي", "2009-10-31", "A+"),
    ("student.khadija.benali", "خديجة بن علي", "2010-02-18", "O+"),
    ("student.walid.saidi", "وليد ساعدي", "2008-01-27", "AB-"),
    ("student.imane.mansouri", "إيمان منصوري", "2009-12-09", "B+"),
    ("student.aymen.brahimi", "أيمن براهيمي", "2008-03-16", "O+"),
    ("student.meriem.khelil", "مريم خليل", "2009-06-04", "A-"),
    ("student.karim.touati", "كريم تواتي", "2008-09-12", "B+"),
    ("student.hiba.belhadj", "هبة بلحاج", "2010-04-21", "O-"),
    ("student.adem.hamdi", "آدم حمدي", "2009-08-30", "A+"),
    ("student.nour.zerrouki", "نور زروقي", "2008-05-26", "O+"),
    ("student.amine.bennacer", "أمين بن ناصر", "2009-11-20", "B-"),
    ("student.salma.djabou", "سلمى جابو", "2008-07-02", "A+"),
    ("student.anas.aitali", "أنس آيت علي", "2009-01-23", "O+"),
    ("student.yasmine.benali", "ياسمين بن علي", "2010-03-08", "AB+"),
    ("student.riad.saidi", "رياض ساعدي", "2008-10-14", "B+"),
    ("student.malak.mansouri", "ملاك منصوري", "2009-05-01", "A+"),
    ("student.sofiane.brahimi", "سفيان براهيمي", "2008-12-28", "O+"),
    ("student.ines.khelil", "إيناس خليل", "2009-07-07", "A-"),
    ("student.islam.touati", "إسلام تواتي", "2008-02-02", "B+"),
    ("student.sirine.belhadj", "سيرين بلحاج", "2010-06-15", "O+"),
    ("student.fares.hamdi", "فارس حمدي", "2009-09-01", "AB+"),
    ("student.houda.zerrouki", "هدى زروقي", "2008-04-22", "A+"),
    ("student.rayane.bennacer", "ريان بن ناصر", "2009-10-10", "O-"),
    ("student.marwa.djabou", "مروة جابو", "2008-08-08", "B+"),
    ("student.bilal.aitali", "بلال آيت علي", "2009-12-24", "O+"),
]


def hash_password(password=DEFAULT_PASSWORD):
    return hashlib.sha256(password.encode()).hexdigest()


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
        "admin.seed",
        "إدارة الأكاديمية",
        "0550000000",
        "admin.seed@academy.local",
        "مكتب الإدارة",
    )


def seed_staff_users(cursor, roles):
    staff = {}

    staff["reception"] = insert_user(
        cursor,
        roles["receptionist"],
        "seed.reception",
        "هدى مكتب الاستقبال",
        "0550001001",
        "reception.seed@academy.local",
        "مكتب الاستقبال",
    )
    staff["accountant"] = insert_user(
        cursor,
        roles["accountant"],
        "seed.accounting",
        "سليم المحاسب",
        "0550001002",
        "accounting.seed@academy.local",
        "المكتب المالي",
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
            "قاعة الأساتذة",
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
            "الجزائر",
        )
        cursor.execute("INSERT INTO parents (user_id) VALUES (%s)", (user_id,))
        parents.append({"id": cursor.lastrowid, "user_id": user_id, "full_name": full_name})
    return parents


def choose_class_for_program(program, class_load):
    return min(program["class_ids"], key=lambda class_id: class_load[class_id])


def planned_program_keys(index):
    base_cycle = ["math", "languages", "bac", "science"]
    keys = [base_cycle[index % len(base_cycle)]]

    if index % 4 == 0 and "languages" not in keys:
        keys.append("languages")
    if index % 5 == 0 and "math" not in keys:
        keys.append("math")
    if index % 7 == 0 and "science" not in keys:
        keys.append("science")
    if index % 9 == 0 and "bac" not in keys:
        keys.append("bac")

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
            "الجزائر",
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
                "لا توجد ملاحظات صحية خاصة",
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
                    "تسجيل تجريبي صحيح مرتبط بالبرنامج والفوج",
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
                    "اشتراك برنامج",
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
                        f"دفع تجريبي لرسوم {program['name']}",
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
                        f"REC-{TODAY.strftime('%Y%m')}-{fee_id:04d}",
                    ),
                )
                cursor.execute(
                    "UPDATE student_fees SET transaction_id = %s WHERE id = %s",
                    (transaction_id, fee_id),
                )

    return students, enrollments, fees


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
                        f"ملخص {subject_name}",
                        f"رابط دعم للمراجعة المنظمة في مادة {subject_name}.",
                        public_resource_url(subject_name),
                        assignment_id,
                    ),
                )

    return assignments


def public_resource_url(subject_name):
    urls = {
        "الرياضيات": "https://www.khanacademy.org/math",
        "الفيزياء والكيمياء": "https://www.khanacademy.org/science/physics",
        "علوم الطبيعة والحياة": "https://www.khanacademy.org/science/biology",
        "اللغة الفرنسية": "https://apprendre.tv5monde.com/fr",
        "اللغة الإنجليزية": "https://learnenglish.britishcouncil.org/",
        "اللغة العربية": "https://www.aljazeera.net/encyclopedia",
        "الإعلام الآلي": "https://www.w3schools.com/python/",
        "منهجية الدراسة": "https://learningcenter.unc.edu/tips-and-tools/",
    }
    return urls.get(subject_name, "https://www.khanacademy.org/")


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
                f"{'اختبار' if assessment_type == 'exam' else 'فرض'} {assignment['subject_name']}",
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
                remark = "ممتاز، أداء ثابت ومنظم"
            elif grade >= 12:
                remark = "جيد، يحتاج فقط إلى تثبيت المكتسبات"
            elif grade >= 9:
                remark = "متوسط، ينصح بتمارين إضافية"
            else:
                remark = "يحتاج إلى متابعة فردية وخطة دعم"

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
                reason = "مبرر طبي موثق" if is_justified else None
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
    cursor.execute("SELECT id, role_id FROM users")
    notifications = [
        ("مرحبا بكم", "تم تفعيل السنة الدراسية الجديدة على المنصة."),
        ("تذكير إداري", "يرجى التأكد من صحة أرقام الهاتف والبريد الإلكتروني."),
        ("متابعة الحضور", "يمكنكم مراجعة الحضور والغياب من لوحة التحكم."),
        ("رزنامة التقييمات", "تم نشر التقييمات القادمة حسب الفوج والبرنامج."),
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
            "title": "خطة مراجعة عامة: كيف نستثمر الأسبوع الدراسي؟",
            "image": "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80",
            "content": r"""# خطة مراجعة أسبوعية للطلاب

![دفتر مراجعة مع ملاحظات دراسية](https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80)

> الخطة الدراسية تصبح مفيدة عندما تكون مرئية، قابلة للقياس، وواقعية.

يمكن للطلاب الاستفادة من [Khan Academy](https://www.khanacademy.org/) للتدريب حسب الموضوع، لكن المدرسة تقترح إيقاعا متوازنا:

- [x] 20 دقيقة لإعادة قراءة الدرس
- [x] 25 دقيقة لحل تمارين مركزة
- [ ] 10 دقائق لكتابة خطأ واحد وتصحيحه

## مؤشر التقدم

$$
S = 0.45H + 0.35E + 0.20R
$$

حيث \(H\) إنجاز الواجبات، و\(E\) دقة التمارين، و\(R\) انتظام المراجعة.

![طالب يكتب ملخصا مركزا](https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=1200&q=80)

**تحدي صغير:** حافظ على \(S \ge 0.80\) أسبوعين متتاليين، ثم ارفع مستوى صعوبة التمارين.""",
        },
        {
            "title": "إعلان المدرسة: رزنامة التقييمات",
            "image": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80",
            "content": r"""# رزنامة التقييمات للفصل الحالي

![تنظيم مواعيد التقييمات الأسبوعية](https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=1200&q=80)

نشرت إدارة المدرسة رزنامة التقييمات حتى يتمكن الطلاب والأولياء من التحضير المبكر وتجنب ضغط اللحظات الأخيرة.[^1]

| الفترة | نوع التقييم | طريقة التحضير |
|---|---|---|
| الأسبوع 1 | الطلاقة في القراءة | تسجيل قراءة قصيرة في البيت |
| الأسبوع 2 | اختبار رياضيات | مراجعة أخطاء آخر ورقة |
| الأسبوع 3 | ملف العلوم | إحضار الملاحظات والصور |
| الأسبوع 4 | عرض شفوي | تدريب على جملة افتتاح وجملة ختام |

![تقويم لمتابعة مواعيد المدرسة](https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=1200&q=80)

### ملاحظات للأولياء

1. تحققوا من فوج الطالب قبل طباعة أي وثيقة.
2. تواصلوا مع الاستقبال فقط عند وجود غياب موثق.
3. اجعلوا المراجعة قصيرة ومتكررة.

[^1]: قد يتم تعديل تفاصيل كل فوج من طرف الأساتذة عبر المنصة.""",
        },
        {
            "title": "ورشة الرياضيات: من المعادلة إلى الفهم",
            "image": "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
            "content": r"""# ورشة مفتوحة في الرياضيات

![نشاط رياضيات تطبيقي](https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=80)

تنتقل هذه الورشة من التعويض الآلي إلى تفسير المعنى. سيقارن الطلاب بين التمثيل الجبري، البياني، واللفظي.

| العنصر | التعبير الرياضي | المعنى |
|---|---|---|
| رأس المنحنى | \(V\left(-\frac{b}{2a}, f\left(-\frac{b}{2a}\right)\right)\) | نقطة التحول |
| المميز | \(\Delta = b^2 - 4ac\) | عدد الجذور الحقيقية |
| المساحة تحت المنحنى | \(\int_0^1 (ax^2 + bx + c)\,dx\) | قيمة متراكمة |

$$
\int_0^1 (ax^2 + bx + c)\,dx = \frac{a}{3} + \frac{b}{2} + c
$$

![حل تمارين رياضيات خطوة بخطوة](https://images.unsplash.com/photo-1596495577886-d920f1fb7238?auto=format&fit=crop&w=1200&q=80)

```text
سؤال شفهي:
إذا كان المنحنى مفتوحا للأعلى وكان المميز سالبا، ماذا نقول عن نقاط تقاطعه مع محور x؟
```

يمكن للطلاب مراجعة الأساسيات من [Math is Fun](https://www.mathsisfun.com/algebra/quadratic-equation.html).""",
        },
        {
            "title": "إعلان عام: نادي العلوم واللغات",
            "image": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
            "content": r"""# نادي العلوم واللغات

![ملاحظة بالمجهر خلال نادي العلوم](https://images.unsplash.com/photo-1554475901-4538ddfbccc2?auto=format&fit=crop&w=1200&q=80)

النادي فضاء مفتوح للتجريب، الحوار، وتعلم المصطلحات العلمية بلغات مختلفة.

## بروتوكول هذا الأسبوع

1. توقّع النتيجة.
2. قِس مرتين.
3. قارن بين القياسين.
4. اعرض النتيجة بالعربية ولغة أجنبية واحدة.

في تجارب الحركة يميز الطلاب بين السرعة المتوسطة والسرعة اللحظية:

$$
\bar v = \frac{\Delta d}{\Delta t}
\qquad
v(t) = \frac{d}{dt}s(t)
$$

![طلاب يحضرون نشاطا مخبريا](https://images.unsplash.com/photo-1581093458791-9d15482442f6?auto=format&fit=crop&w=1200&q=80)

**مفردات التركيز:** فرضية، متغير، قياس، هامش خطأ. للمصطلحات الإنجليزية يمكن زيارة [British Council LearnEnglish](https://learnenglish.britishcouncil.org/).""",
        },
        {
            "title": "تحدي القراءة: كتاب واحد ومهارات متعددة",
            "image": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80",
            "content": r"""# تحدي القراءة الشهري

![كتب مفتوحة للقراءة اليومية](https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80)

> نقرأ أولا لفهم المعنى، ثم نقرأ مرة ثانية للبحث عن الدليل.

يدعو التحدي كل طالب إلى قراءة كتاب مناسب لعمره ثم إنجاز بطاقة قصيرة.

### بنية بطاقة الرأي

- **الفكرة:** جملة واحدة تشرح رأيك.
- **الدليل:** حدث أو مقطع قصير من الكتاب.
- **التعليل:** لماذا يدعم الدليل فكرتك؟

```markdown
أرى أن الشخصية تغيرت لأن ...
أقوى دليل هو ...
هذا مهم لأن ...
```

![رفوف مكتبة وكتب مطبوعة](https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80)

علامة القراءة لا ترتبط بطول الملخص فقط، بل بوضوح الفكرة ودعمها بدليل.""",
        },
        {
            "title": "درس السلامة الرقمية: فكّر قبل أن تضغط",
            "image": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
            "content": r"""# السلامة الرقمية للطلاب

![حاسوب محمول للتعلم عبر الإنترنت](https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80)

أصبحت الأدوات الرقمية جزءا من التعلم اليومي، لذلك يحتاج الطلاب إلى عادات عملية تحمي الحسابات والخصوصية والتركيز.

## فكرة قوة كلمة المرور

عدد كلمات المرور الممكنة يكبر بسرعة:

$$
N = a^L
$$

حيث \(a\) عدد الرموز الممكنة و\(L\) طول كلمة المرور.

```text
عادة جيدة:
ثلاث كلمات + رقم + رمز
نمط مثال:
river-book-sun-42!
```

![مساحة عمل مدرسية مع أدوات رقمية](https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80)

**قاعدة التوقف:** توقف، تحقق من المرسل، تحقق من الرابط، ثم قرر.""",
        },
        {
            "title": "مشروع المدرسة الخضراء: نتعلم بالرعاية",
            "image": "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80",
            "content": r"""# مشروع المدرسة الخضراء

![شتلات جاهزة للغرس](https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80)

سيعمل الطلاب في فرق صغيرة على غرس نباتات صفية ومتابعة نموها. يربط المشروع بين العلوم، المسؤولية، والكتابة اليومية.

| الدور | الدليل المطلوب |
|---|---|
| الملاحظ | جدول الطول الأسبوعي |
| المصور | صورة واحدة كل أسبوع |
| الكاتب | تأمل من 80 كلمة |

يمكن نمذجة نمو النبات بمنحنى لوجستي مبسط:

$$
h(t)=\frac{K}{1+Ae^{-rt}}
$$

لا يحتاج الطلاب إلى حفظ الصيغة، بل استعمالها لمناقشة سبب تباطؤ النمو بعد البداية السريعة.

![نمو نبات أخضر عن قرب](https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80)

السؤال النهائي: **ما الشيء الذي احتاجته النبتة ولا يستطيع الجدول وحده توفيره؟**""",
        },
        {
            "title": "إعلان المدرسة: لقاء أولياء الأمور",
            "image": "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1200&q=80",
            "content": r"""# لقاء أولياء الأمور والأساتذة

![أساتذة يراجعون تقدم الطلاب](https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80)

تدعو المدرسة الأولياء إلى لقاء الأساتذة لمناقشة الحضور، عادات إنجاز الواجبات، والتقدم في المواد الأساسية.

### يرجى إحضار

- دفاتر الأسابيع الأخيرة
- مبررات الغياب إن وجدت
- سؤال واحد يريد الطالب معرفة إجابته

> يكون اللقاء أكثر فائدة عندما ينتهي بإجراء عملي واحد للأسبوعين القادمين.

![طاولة اجتماع للنقاش بين الأسرة والمدرسة](https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80)

ستناقش أولويات الدعم اعتمادا على الحضور، إنجاز الواجبات، واتجاه نتائج التقييمات الأخيرة.""",
        },
        {
            "title": "نادي اللغات: التحدث بثقة",
            "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
            "content": r"""# نادي اللغات

![طلاب يتدربون في مجموعة](https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80)

يوفر نادي اللغات فرصا قصيرة ومنخفضة الضغط للتحدث، الاستماع، وتعلم عبارات عملية.

| المهارة | قالب الجملة |
|---|---|
| الموافقة | I agree with ... because ... |
| الاعتراض المهذب | I see your point, but ... |
| طلب التوضيح | Could you explain what you mean by ...? |

### مناظرة مصغرة

يختار الطلاب عبارة واحدة ويتحدثون لمدة **45 ثانية**:

- الواجبات القصيرة المنتظمة أفضل من الواجب الطويل.
- القراءة بصوت مسموع تقوي الثقة.
- العمل الجماعي ينجح عندما يكون لكل طالب دور.

![تعلم لغات بشكل تعاوني باستعمال الحواسيب](https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80)

الهدف ليس لهجة مثالية، بل رسالة واضحة واحترام دور المتحدث.""",
        },
        {
            "title": "معرض المشاريع: من الفكرة إلى العرض",
            "image": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
            "content": r"""# معرض مشاريع الطلاب

![طلاب يحضرون مشروعا جماعيا](https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80)

سيعرض المعرض أعمال الطلاب في العلوم، اللغات، الفنون، والمهارات الرقمية. ينبغي لكل مشروع أن يوضح مشكلة، طريقة عمل، ونتيجة.

```mermaid
flowchart LR
    Idea --> Research
    Research --> Prototype
    Prototype --> Feedback
    Feedback --> Presentation
```

سيتم تقييم العرض باستعمال سلم موزون:

$$
G = 0.30C + 0.25M + 0.25E + 0.20P
$$

حيث \(C\) وضوح الفكرة، و\(M\) طريقة العمل، و\(E\) قوة الدليل، و\(P\) جودة التقديم.

![نقاش جماعي قبل تقديم العرض](https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1200&q=80)

أفضل العروض تكون واضحة، صادقة بشأن الصعوبات، ومدعمة بأدلة مرئية.""",
        },
        {
            "title": "درس في الفيزياء: الحركة والمتجهات والرسوم",
            "image": "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80",
            "content": r"""# درس في الفيزياء

![ملاحظات فيزيائية وحسابات](https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=1200&q=80)

يربط هذا الدرس بين مخططات الحركة، المتجهات، والمعادلات. يقارن الطلاب بين ما تقوله الصيغة وما يظهره الرسم البياني.

$$
\vec r(t)=\vec r_0+\vec v_0t+\frac{1}{2}\vec at^2
$$

في حركة المقذوفات:

$$
y(x)=x\tan(\theta)-\frac{gx^2}{2v_0^2\cos^2(\theta)}
$$

![طلاب يستعملون أدوات علمية](https://images.unsplash.com/photo-1581093588401-fbb62a02f120?auto=format&fit=crop&w=1200&q=80)

**تذكرة الخروج:** اشرح لماذا يغير رفع \(v_0\) المدى بشكل أقوى من رفع الزاوية بعد حد معين.""",
        },
        {
            "title": "درس إحصاء مصغر: البيانات تحكي قصة",
            "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
            "content": r"""# درس إحصاء مصغر

![تحليل بيانات على شاشة حاسوب](https://images.unsplash.com/photo-1556155092-490a1ba16284?auto=format&fit=crop&w=1200&q=80)

سيحلل الطلاب بيانات صفية مجهولة الهوية ويتعلمون لماذا قد يخفي المتوسط وحده تفاصيل مهمة.

$$
\mu = \frac{1}{n}\sum_{i=1}^{n}x_i
\qquad
\sigma^2 = \frac{1}{n}\sum_{i=1}^{n}(x_i-\mu)^2
$$

### قارن

| المقياس | السؤال الذي يجيب عنه |
|---|---|
| المتوسط | أين نقطة التوازن؟ |
| الوسيط | ما القيمة الوسطى؟ |
| الانحراف المعياري | ما مدى تشتت النتائج؟ |

![رسوم بيانية وتحليلات مدرسية](https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80)

ينهي الطلاب النشاط بجملة تبدأ بـ: **تشير البيانات إلى... لكنها لا تثبت...**""",
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
        ("متابعة واجب الرياضيات", "individual"),
        ("استفسار حول الحضور", "individual"),
        ("تنسيق موعد دفع الرسوم", "individual"),
        ("ملاحظات حول برنامج اللغات", "individual"),
    ]
    for title, conversation_type in conversations:
        cursor.execute(
            "INSERT INTO conversations (title, type) VALUES (%s, %s)",
            (title, conversation_type),
        )

    messages = [
        "السلام عليكم، هل يمكن تأكيد موعد الحصة القادمة؟",
        "تم تحديث جدول الفوج على المنصة.",
        "يرجى مراجعة ملاحظات التقييم الأخير.",
        "شكرا لكم، تم استلام الإشعار.",
        "هل يمكن إرسال رابط مورد المراجعة؟",
        "تم تسجيل الدفعة الأولى بنجاح.",
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
            logger.info("Starting professional seed data generation...")

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
            logger.info("Seed completed successfully.")
            logger.info("Programs: %s", len(programs))
            logger.info("Classes: %s", sum(len(program["class_ids"]) for program in programs.values()))
            logger.info("Teachers: %s", len(teachers))
            logger.info("Parents: %s", len(parents))
            logger.info("Students: %s", len(students))
            logger.info("Enrollments: %s", len(enrollments))
            logger.info("Fees: %s", len(fees))
            logger.info("Default generated password: %s", DEFAULT_PASSWORD)
    except Exception as exc:
        logger.error("Seed failed: %s", exc)
        raise


if __name__ == "__main__":
    seed_database()
