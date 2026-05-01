import logging
from typing import Dict, List, Optional

import mysql.connector


class AttendanceManager:
    def __init__(self, db_instance):
        self.db = db_instance

    @staticmethod
    def _student_has_active_class_enrollment(cursor, student_id: int, class_id: int) -> bool:
        if class_id is None:
            return True
        cursor.execute(
            """
            SELECT 1
            FROM student_enrollments
            WHERE student_id = %s
              AND class_id = %s
              AND status = 'active'
            LIMIT 1
            """,
            (student_id, class_id)
        )
        return cursor.fetchone() is not None

    def save_attendance(self, student_id: int, target_date: str, status: str,
                        class_id: int = None, is_justified: bool = False,
                        justification_reason: str = None) -> Optional[int]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                if not self._student_has_active_class_enrollment(cursor, student_id, class_id):
                    logging.warning(
                        "Attendance blocked: student #%s is not actively enrolled in class #%s",
                        student_id, class_id
                    )
                    return None

                if class_id is None:
                    check_query = """
                        SELECT id
                        FROM attendance
                        WHERE student_id = %s
                          AND date = %s
                          AND class_id IS NULL
                    """
                    cursor.execute(check_query, (student_id, target_date))
                else:
                    check_query = """
                        SELECT id
                        FROM attendance
                        WHERE student_id = %s
                          AND date = %s
                          AND class_id = %s
                    """
                    cursor.execute(check_query, (student_id, target_date, class_id))
                existing = cursor.fetchone()

                if existing:
                    attendance_id = existing[0]
                    update_query = """
                        UPDATE attendance
                        SET status = %s, is_justified = %s, justification_reason = %s
                        WHERE id = %s
                    """
                    cursor.execute(update_query, (status, is_justified, justification_reason, attendance_id))
                    conn.commit()
                    logging.info(
                        "Attendance updated: [%s] student #%s / class #%s -> %s (%s)",
                        attendance_id, student_id, class_id, status, target_date
                    )
                    return attendance_id

                insert_query = """
                    INSERT INTO attendance (
                        student_id, class_id, date, status, is_justified, justification_reason
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                """
                cursor.execute(
                    insert_query,
                    (student_id, class_id, target_date, status, is_justified, justification_reason)
                )
                attendance_id = cursor.lastrowid
                conn.commit()
                logging.info(
                    "Attendance created: [%s] student #%s / class #%s -> %s (%s)",
                    attendance_id, student_id, class_id, status, target_date
                )
                return attendance_id

        except mysql.connector.Error as e:
            logging.error(f"Error saving attendance: {e}")
            return None

    def get_class_attendance_sheet(self, class_id: int, target_date: str) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT
                        se.id AS enrollment_id,
                        se.program_id,
                        se.class_id,
                        s.id AS student_id,
                        u.full_name AS student_name,
                        a.id AS attendance_id,
                        a.date,
                        a.status,
                        a.is_justified,
                        a.justification_reason
                    FROM student_enrollments se
                    JOIN students s ON se.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    LEFT JOIN attendance a
                        ON a.student_id = s.id
                       AND a.class_id = se.class_id
                       AND a.date = %s
                    WHERE se.class_id = %s
                      AND se.status = 'active'
                    ORDER BY u.full_name ASC
                """
                cursor.execute(query, (target_date, class_id))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching attendance sheet for class #{class_id}: {e}")
            return []

    def get_student_attendance(self, student_id: int, start_date: str = None,
                               end_date: str = None, class_id: int = None) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)

                query = """
                    SELECT
                        a.*,
                        c.class_name,
                        c.level
                    FROM attendance a
                    LEFT JOIN classes c ON a.class_id = c.id
                    WHERE a.student_id = %s
                """
                params = [student_id]

                if class_id:
                    query += " AND a.class_id = %s"
                    params.append(class_id)
                if start_date:
                    query += " AND a.date >= %s"
                    params.append(start_date)
                if end_date:
                    query += " AND a.date <= %s"
                    params.append(end_date)

                query += " ORDER BY a.date DESC, c.class_name ASC"
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching attendance for student #{student_id}: {e}")
            return []

    def get_attendance_statistics(self, student_id: int, class_id: int = None) -> Dict:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT
                        COUNT(id) AS total_sessions,
                        SUM(status = 'present') AS present_count,
                        SUM(status = 'absent') AS absent_count,
                        SUM(status = 'late') AS late_count,
                        SUM(is_justified = TRUE AND status = 'absent') AS justified_absences
                    FROM attendance
                    WHERE student_id = %s
                """
                params = [student_id]
                if class_id:
                    query += " AND class_id = %s"
                    params.append(class_id)

                cursor.execute(query, tuple(params))
                stats = cursor.fetchone()

                return {
                    'total_sessions': int(stats['total_sessions'] or 0),
                    'present_count': int(stats['present_count'] or 0),
                    'absent_count': int(stats['absent_count'] or 0),
                    'late_count': int(stats['late_count'] or 0),
                    'justified_absences': int(stats['justified_absences'] or 0),
                }
        except Exception as e:
            logging.error(f"Error fetching attendance statistics for student #{student_id}: {e}")
            return {}

    def update_justification(self, attendance_id: int, is_justified: bool,
                             justification_reason: str = None) -> bool:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    UPDATE attendance
                    SET is_justified = %s, justification_reason = %s
                    WHERE id = %s
                """
                cursor.execute(query, (is_justified, justification_reason, attendance_id))
                conn.commit()

                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"Attendance justification updated for #{attendance_id}.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"Error updating attendance justification #{attendance_id}: {e}")
            return False

    def delete_attendance(self, attendance_id: int) -> tuple:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM attendance WHERE id = %s", (attendance_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"Attendance #{attendance_id} deleted.")
                    return True, "Attendance record deleted successfully."
                return False, "Attendance record not found."
        except mysql.connector.Error as e:
            logging.error(f"Error deleting attendance #{attendance_id}: {e}")
            return False, f"Database error: {e}"
