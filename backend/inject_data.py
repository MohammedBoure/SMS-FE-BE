# inject_data.py
from database import Database


def inject_test_data():
    db = Database()
    try:
        with db.get_db_connection() as conn:
            cursor = conn.cursor(dictionary=True)

            print("Preparing test data for the default student...")

            cursor.execute("SELECT id FROM users WHERE username = 'student_user'")
            student_user = cursor.fetchone()
            if not student_user:
                raise RuntimeError("Default user 'student_user' was not found.")
            student_user_id = student_user['id']

            cursor.execute(
                "INSERT IGNORE INTO students (user_id, status) VALUES (%s, 'active')",
                (student_user_id,)
            )
            cursor.execute("SELECT id FROM students WHERE user_id = %s", (student_user_id,))
            student_id = cursor.fetchone()['id']

            cursor.execute("""
                INSERT INTO programs (program_name, program_type, price_cash)
                VALUES ('Programme Scientifique', 'Standard', 5000)
            """)
            program_id = cursor.lastrowid

            cursor.execute("""
                INSERT INTO classes (program_id, class_name, level)
                VALUES (%s, '1 AS - Sci', 'Secondaire')
            """, (program_id,))
            class_id = cursor.lastrowid

            cursor.execute("INSERT INTO subjects (subject_name) VALUES ('Mathematiques')")
            subject_id = cursor.lastrowid

            cursor.execute("""
                INSERT INTO student_enrollments (student_id, program_id, class_id, group_name, enrollment_date, status)
                VALUES (%s, %s, %s, 'Groupe A', CURDATE(), 'active')
            """, (student_id, program_id, class_id))
            enrollment_id = cursor.lastrowid

            cursor.execute("SELECT id FROM users WHERE username = 'teacher_user'")
            teacher_user = cursor.fetchone()
            if not teacher_user:
                raise RuntimeError("Default user 'teacher_user' was not found.")
            teacher_user_id = teacher_user['id']

            cursor.execute("SELECT id FROM teachers WHERE user_id = %s", (teacher_user_id,))
            teacher = cursor.fetchone()
            if not teacher:
                raise RuntimeError("Default teacher profile was not found.")
            teacher_id = teacher['id']

            cursor.execute("""
                INSERT INTO teacher_assignments (teacher_id, subject_id, class_id)
                VALUES (%s, %s, %s)
            """, (teacher_id, subject_id, class_id))
            assignment_id = cursor.lastrowid

            cursor.execute("""
                INSERT INTO schedules (assignment_id, day_of_week, start_time, end_time, room_number)
                VALUES (%s, 'Monday', '08:00', '10:00', 'Salle 12')
            """, (assignment_id,))

            cursor.execute("""
                INSERT INTO assessments (title, type, max_grade, assignment_id, due_date)
                VALUES ('Devoir 1', 'exam', 20, %s, '2026-05-15')
            """, (assignment_id,))
            assessment_id = cursor.lastrowid

            cursor.execute("""
                INSERT INTO grades (student_id, assessment_id, grade_value, teacher_remarks)
                VALUES (%s, %s, 18.5, 'Excellent travail !')
            """, (student_id, assessment_id))

            cursor.execute("""
                INSERT INTO student_fees (student_id, enrollment_id, program_id, fee_type, amount_due, due_date)
                VALUES (%s, %s, %s, 'Frais Mensuels', 5000, '2026-06-01')
            """, (student_id, enrollment_id, program_id))

            cursor.execute("""
                INSERT INTO notifications (user_id, title, message)
                VALUES (%s, 'Bienvenue', 'Votre compte est actif et lie a votre groupe.')
            """, (student_user_id,))

            conn.commit()
            print("Test data injected successfully.")

    except Exception as e:
        print(f"Error: {e}")


if __name__ == "__main__":
    inject_test_data()
