# inject_data.py
from database import Database

def inject_test_data():
    db = Database()
    try:
        with db.get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)
            
            print("⏳ جاري تحضير البيانات التجريبية لطالب...")

            # 1. جلب حساب الطالب الافتراضي
            cursor.execute("SELECT id FROM users WHERE username = 'student_user'")
            student_user_id = cursor.fetchone()['id']
            
            # جلب أو إنشاء ملف الطالب
            cursor.execute("INSERT IGNORE INTO students (user_id, status) VALUES (%s, 'active')", (student_user_id,))
            cursor.execute("SELECT id FROM students WHERE user_id = %s", (student_user_id,))
            student_id = cursor.fetchone()['id']

            # 2. إنشاء قسم ومادة
            cursor.execute("INSERT INTO classes (class_name, level) VALUES ('1 AS - Sci', 'Secondaire')")
            class_id = cursor.lastrowid
            
            cursor.execute("INSERT INTO subjects (subject_name) VALUES ('Mathématiques')")
            subject_id = cursor.lastrowid

            # 3. ربط الطالب بالقسم
            cursor.execute("UPDATE students SET class_id = %s WHERE id = %s", (class_id, student_id))

            # 4. جلب الأستاذ الافتراضي وربطه بالقسم والمادة
            cursor.execute("SELECT id FROM users WHERE username = 'teacher_user'")
            teacher_user_id = cursor.fetchone()['id']
            cursor.execute("SELECT id FROM teachers WHERE user_id = %s", (teacher_user_id,))
            teacher_id = cursor.fetchone()['id']

            cursor.execute("""
                INSERT INTO teacher_assignments (teacher_id, subject_id, class_id) 
                VALUES (%s, %s, %s)
            """, (teacher_id, subject_id, class_id))
            assignment_id = cursor.lastrowid

            # 5. إضافة جدول زمني للطالب
            cursor.execute("""
                INSERT INTO schedules (assignment_id, day_of_week, start_time, end_time, room_number) 
                VALUES (%s, 'Monday', '08:00', '10:00', 'Salle 12')
            """, (assignment_id,))

            # 6. إضافة امتحان وعلامة ممتازة للطالب
            cursor.execute("""
                INSERT INTO assessments (title, type, max_grade, assignment_id, due_date) 
                VALUES ('Devoir 1', 'exam', 20, %s, '2026-05-15')
            """, (assignment_id,))
            assessment_id = cursor.lastrowid
            
            cursor.execute("""
                INSERT INTO grades (student_id, assessment_id, grade_value, teacher_remarks) 
                VALUES (%s, %s, 18.5, 'Excellent travail !')
            """, (student_id, assessment_id))

            # 7. إضافة رسوم مستحقة
            cursor.execute("""
                INSERT INTO student_fees (student_id, fee_type, amount_due, due_date) 
                VALUES (%s, 'Frais Mensuels', 5000, '2026-06-01')
            """, (student_id,))

            # 8. إشعار ترحيبي
            cursor.execute("""
                INSERT INTO notifications (user_id, title, message) 
                VALUES (%s, 'مرحباً بك!', 'تم تفعيل حسابك بنجاح، وربطك بقسم 1 AS - Sci.')
            """, (student_user_id,))

            conn.commit()
            print("✅ تم حقن البيانات بنجاح! يمكنك الآن تسجيل الدخول بحساب الطالب.")

    except Exception as e:
        print(f"❌ حدث خطأ: {e}")

if __name__ == "__main__":
    inject_test_data()