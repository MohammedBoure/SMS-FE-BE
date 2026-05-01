import logging
from datetime import date
from typing import Dict, List, Optional

import mysql.connector


class StudentEnrollmentsManager:
    def __init__(self, db_instance):
        self.db = db_instance

    @staticmethod
    def _class_matches_program(cursor, class_id: int, program_id: int) -> bool:
        if class_id is None:
            return True
        cursor.execute("SELECT program_id FROM classes WHERE id = %s", (class_id,))
        row = cursor.fetchone()
        if not row:
            return False
        class_program_id = row[0] if not isinstance(row, dict) else row.get('program_id')
        return class_program_id is None or program_id is None or class_program_id == program_id

    def create_enrollment(self, student_id: int, program_id: int,
                          class_id: int = None, group_name: str = None,
                          enrollment_date: str = None, status: str = 'active',
                          notes: str = None) -> Optional[int]:
        if not enrollment_date:
            enrollment_date = date.today().isoformat()

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                if not self._class_matches_program(cursor, class_id, program_id):
                    logging.warning(
                        "Enrollment blocked: class #%s does not belong to program #%s",
                        class_id, program_id
                    )
                    return None

                query = """
                    INSERT INTO student_enrollments (
                        student_id, program_id, class_id, group_name,
                        enrollment_date, status, notes
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                params = (student_id, program_id, class_id, group_name, enrollment_date, status, notes)
                cursor.execute(query, params)
                enrollment_id = cursor.lastrowid
                conn.commit()
                logging.info(
                    "Enrollment added: [%s] student #%s -> program #%s / class #%s",
                    enrollment_id, student_id, program_id, class_id
                )
                return enrollment_id
        except mysql.connector.Error as e:
            logging.error(f"Error creating enrollment: {e}")
            return None

    def get_all_enrollments(self, status: str = None, program_id: int = None,
                            class_id: int = None) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)

                query = """
                    SELECT
                        se.id AS enrollment_id,
                        se.group_name,
                        se.enrollment_date,
                        se.status,
                        se.notes,
                        s.id AS student_id,
                        u.full_name AS student_name,
                        u.phone AS student_phone,
                        p.id AS program_id,
                        p.program_name,
                        p.program_type,
                        c.id AS class_id,
                        c.class_name,
                        c.level
                    FROM student_enrollments se
                    JOIN students s ON se.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    JOIN programs p ON se.program_id = p.id
                    LEFT JOIN classes c ON se.class_id = c.id
                    WHERE 1=1
                """
                params = []

                if status:
                    query += " AND se.status = %s"
                    params.append(status)
                if program_id:
                    query += " AND se.program_id = %s"
                    params.append(program_id)
                if class_id:
                    query += " AND se.class_id = %s"
                    params.append(class_id)

                query += " ORDER BY se.enrollment_date DESC, u.full_name ASC"

                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching enrollments: {e}")
            return []

    def get_student_enrollments(self, student_id: int) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT
                        se.id AS enrollment_id,
                        se.group_name,
                        se.enrollment_date,
                        se.status,
                        se.notes,
                        p.id AS program_id,
                        p.program_name,
                        p.program_type,
                        p.price_cash,
                        c.id AS class_id,
                        c.class_name,
                        c.level
                    FROM student_enrollments se
                    JOIN programs p ON se.program_id = p.id
                    LEFT JOIN classes c ON se.class_id = c.id
                    WHERE se.student_id = %s
                    ORDER BY se.enrollment_date DESC
                """
                cursor.execute(query, (student_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching enrollments for student #{student_id}: {e}")
            return []

    def get_program_enrollments(self, program_id: int, status: str = 'active',
                                class_id: int = None) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT
                        se.id AS enrollment_id,
                        se.group_name,
                        se.enrollment_date,
                        se.status,
                        s.id AS student_id,
                        u.full_name AS student_name,
                        u.phone,
                        c.id AS class_id,
                        c.class_name,
                        c.level
                    FROM student_enrollments se
                    JOIN students s ON se.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    LEFT JOIN classes c ON se.class_id = c.id
                    WHERE se.program_id = %s
                """
                params = [program_id]

                if status:
                    query += " AND se.status = %s"
                    params.append(status)
                if class_id:
                    query += " AND se.class_id = %s"
                    params.append(class_id)

                query += " ORDER BY u.full_name ASC"
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching enrollments for program #{program_id}: {e}")
            return []

    def get_class_enrollments(self, class_id: int, status: str = 'active') -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT
                        se.id AS enrollment_id,
                        se.program_id,
                        se.group_name,
                        se.enrollment_date,
                        se.status,
                        s.id AS student_id,
                        u.full_name AS student_name,
                        u.phone,
                        p.program_name
                    FROM student_enrollments se
                    JOIN students s ON se.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    JOIN programs p ON se.program_id = p.id
                    WHERE se.class_id = %s
                """
                params = [class_id]
                if status:
                    query += " AND se.status = %s"
                    params.append(status)
                query += " ORDER BY u.full_name ASC"
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching enrollments for class #{class_id}: {e}")
            return []

    def update_enrollment(self, enrollment_id: int, **kwargs) -> bool:
        if not kwargs:
            return False

        allowed_fields = {'program_id', 'class_id', 'group_name', 'enrollment_date', 'status', 'notes'}
        update_fields = []
        params = []

        for key, value in kwargs.items():
            if key in allowed_fields:
                update_fields.append(f"{key} = %s")
                params.append(value)

        if not update_fields:
            return False

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                cursor.execute(
                    "SELECT program_id, class_id FROM student_enrollments WHERE id = %s",
                    (enrollment_id,)
                )
                current = cursor.fetchone()
                if not current:
                    return False

                next_program_id = kwargs.get('program_id', current['program_id'])
                next_class_id = kwargs.get('class_id', current['class_id'])
                if not self._class_matches_program(cursor, next_class_id, next_program_id):
                    logging.warning(
                        "Enrollment update blocked: class #%s does not belong to program #%s",
                        next_class_id, next_program_id
                    )
                    return False

                params.append(enrollment_id)
                query = f"UPDATE student_enrollments SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()

                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"Enrollment #{enrollment_id} updated.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"Error updating enrollment #{enrollment_id}: {e}")
            return False

    def change_enrollment_status(self, enrollment_id: int, status: str) -> bool:
        return self.update_enrollment(enrollment_id, status=status)

    def delete_enrollment(self, enrollment_id: int) -> tuple:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM student_enrollments WHERE id = %s", (enrollment_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"Enrollment #{enrollment_id} deleted.")
                    return True, "Enrollment deleted successfully."
                return False, "Enrollment not found."
        except mysql.connector.Error as e:
            logging.error(f"Error deleting enrollment #{enrollment_id}: {e}")
            return False, f"Database error: {e}"
