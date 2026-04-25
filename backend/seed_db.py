# seed_db.py

import random
import hashlib
from datetime import datetime, timedelta
from database import Database

FIRST_NAMES = ['Mohamed', 'Amine', 'Fatima', 'Sarah', 'Yassine', 'Imane', 'Aymen', 'Lina', 'Walid', 'Rania', 'Anis', 'Chaima', 'Ilyes', 'Manel', 'Zaki']
LAST_NAMES = ['Benali', 'Saidi', 'Mansouri', 'Brahimi', 'Khelil', 'Touati', 'Belkacem', 'Hamdi', 'Bousbaa', 'Zerrouki']
SUBJECTS = ['Mathématiques', 'Physique-Chimie', 'Sciences Naturelles', 'Langue Arabe', 'Langue Française', 'Anglais']
CLASSES = [('1 AS - Tronc Commun', 'Secondaire'), ('2 AS - Sciences', 'Secondaire'), ('3 AS - Mathématiques', 'Secondaire')]
ROOMS = ['Salle 01', 'Salle 02', 'Salle 03', 'Laboratoire A', 'Laboratoire B']

def hash_password(password="python"):
    return hashlib.sha256(password.encode()).hexdigest()

def generate_user(cursor, role_id, username_prefix, i):
    first = random.choice(FIRST_NAMES)
    last = random.choice(LAST_NAMES)
    full_name = f"{first} {last}"
    username = f"{username_prefix}{i}"
    email = f"{username}@school.local"
    
    cursor.execute("""
        INSERT INTO users (role_id, username, password, full_name, email, phone, is_active)
        VALUES (%s, %s, %s, %s, %s, %s, TRUE)
    """, (role_id, username, hash_password(), full_name, email, f"055{random.randint(100000, 999999)}"))
    return cursor.lastrowid

def seed_database():
    db = Database()
    try:
        with db.get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            print("⏳ جاري توليد البيانات المدرسية الواقعية...")

            # 1. جلب معرّفات الأدوار
            cursor.execute("SELECT id, name FROM roles")
            roles = {row['name']: row['id'] for row in cursor.fetchall()}

            # 2. إنشاء البرامج والأقسام
            cursor.execute("INSERT INTO programs (program_name, program_type, price_cash) VALUES ('Programme Annuel', 'Standard', 45000)")
            program_id = cursor.lastrowid

            class_ids = []
            for c_name, c_level in CLASSES:
                cursor.execute("INSERT INTO classes (class_name, level, capacity) VALUES (%s, %s, 30)", (c_name, c_level))
                class_ids.append(cursor.lastrowid)

            # 3. إنشاء المواد
            subject_ids = []
            for sub in SUBJECTS:
                cursor.execute("INSERT INTO subjects (subject_name) VALUES (%s)", (sub,))
                subject_ids.append(cursor.lastrowid)

            # 4. إنشاء الأساتذة (3 أساتذة)
            teacher_ids = []
            for i in range(1, 4):
                user_id = generate_user(cursor, roles['teacher'], 'prof', i)
                cursor.execute("INSERT INTO teachers (user_id, specialty, hire_date) VALUES (%s, %s, %s)", 
                               (user_id, random.choice(SUBJECTS), '2023-09-01'))
                teacher_ids.append(cursor.lastrowid)

            # 5. إنشاء الأولياء (5 أولياء)
            parent_ids = []
            for i in range(1, 6):
                user_id = generate_user(cursor, roles['parent'], 'parent', i)
                cursor.execute("INSERT INTO parents (user_id) VALUES (%s)", (user_id,))
                parent_ids.append(cursor.lastrowid)

            # 6. إنشاء الطلاب (15 طالب) وتوزيعهم على الأقسام والأولياء
            student_ids = []
            for i in range(1, 16):
                user_id = generate_user(cursor, roles['student'], 'eleve', i)
                parent_id = random.choice(parent_ids)
                class_id = random.choice(class_ids)
                dob = f"{random.randint(2008, 2010)}-0{random.randint(1,9)}-15"
                
                cursor.execute("""
                    INSERT INTO students (user_id, parent_id, class_id, date_of_birth, registration_date, status)
                    VALUES (%s, %s, %s, %s, CURDATE(), 'active')
                """, (user_id, parent_id, class_id, dob))
                student_ids.append(cursor.lastrowid)

            # 7. التكليفات (Teacher Assignments) والجدول الزمني
            assignments = []
            days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
            times = [('08:00', '10:00'), ('10:00', '12:00'), ('13:00', '15:00')]
            
            for class_id in class_ids:
                # تعيين أستاذين لكل قسم
                for _ in range(2):
                    t_id = random.choice(teacher_ids)
                    s_id = random.choice(subject_ids)
                    cursor.execute("INSERT INTO teacher_assignments (teacher_id, subject_id, class_id) VALUES (%s, %s, %s)", (t_id, s_id, class_id))
                    assign_id = cursor.lastrowid
                    assignments.append({'assign_id': assign_id, 'class_id': class_id})
                    
                    # إضافة حصتين في الأسبوع لهذا التكليف
                    for _ in range(2):
                        day = random.choice(days)
                        t_start, t_end = random.choice(times)
                        room = random.choice(ROOMS)
                        cursor.execute("""
                            INSERT INTO schedules (assignment_id, day_of_week, start_time, end_time, room_number)
                            VALUES (%s, %s, %s, %s, %s)
                        """, (assign_id, day, t_start, t_end, room))

            # 8. الامتحانات، العلامات، الحضور، والرسوم
            today = datetime.now()
            for assign in assignments:
                # امتحان واحد لكل تكليف
                cursor.execute("INSERT INTO assessments (title, type, max_grade, assignment_id, due_date) VALUES (%s, 'exam', 20, %s, %s)", 
                               ("Devoir Surveillé 1", assign['assign_id'], (today + timedelta(days=7)).strftime('%Y-%m-%d')))
                assessment_id = cursor.lastrowid

                # جلب طلاب هذا القسم
                cursor.execute("SELECT id FROM students WHERE class_id = %s", (assign['class_id'],))
                class_students = cursor.fetchall()

                for stu in class_students:
                    student_id = stu['id']
                    
                    # 8.1 إدخال علامات عشوائية (بين 8.0 و 20.0)
                    grade = round(random.uniform(8.0, 20.0), 2)
                    remark = "Bon travail" if grade >= 14 else "Peut faire mieux"
                    cursor.execute("INSERT INTO grades (student_id, assessment_id, grade_value, teacher_remarks) VALUES (%s, %s, %s, %s)",
                                   (student_id, assessment_id, grade, remark))

                    # 8.2 غياب عشوائي
                    if random.random() > 0.8: # 20% نسبة غياب
                        date_abs = (today - timedelta(days=random.randint(1, 10))).strftime('%Y-%m-%d')
                        is_justified = random.choice([True, False])
                        cursor.execute("INSERT INTO attendance (student_id, date, status, is_justified) VALUES (%s, %s, 'absent', %s)",
                                       (student_id, date_abs, is_justified))

            # 9. الرسوم المالية للطلاب
            for stu_id in student_ids:
                cursor.execute("INSERT INTO student_fees (student_id, program_id, fee_type, amount_due, due_date) VALUES (%s, %s, 'Frais Scolaires', 45000, %s)",
                               (stu_id, program_id, (today + timedelta(days=30)).strftime('%Y-%m-%d')))

            # 10. إشعار عام
            cursor.execute("SELECT id FROM users")
            all_users = cursor.fetchall()
            for u in all_users:
                cursor.execute("INSERT INTO notifications (user_id, title, message) VALUES (%s, 'Bienvenue', 'La nouvelle année scolaire a commencé.')", (u['id'],))

            conn.commit()
            print("✅ اكتملت العملية! تم بنجاح إنشاء:")
            print(f"- {len(class_ids)} أقسام و {len(subject_ids)} مواد.")
            print(f"- {len(teacher_ids)} أساتذة، {len(parent_ids)} أولياء، و {len(student_ids)} طالب.")
            print("🔑 كلمة المرور لجميع الحسابات الجديدة هي: python")

    except Exception as e:
        print(f"❌ حدث خطأ أثناء التوليد: {e}")

if __name__ == "__main__":
    seed_database()