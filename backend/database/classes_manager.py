import logging
from typing import Dict, List, Optional

import mysql.connector


class ClassesManager:

    def __init__(self, db_instance):
        self.db = db_instance

    def add_class(self, class_name: str, level: str = None,
                  age_group: str = None, capacity: int = None,
                  program_id: int = None) -> Optional[int]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO classes (program_id, class_name, level, age_group, capacity)
                    VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(query, (program_id, class_name, level, age_group, capacity))
                class_id = cursor.lastrowid
                conn.commit()
                logging.info(f"Class added: [{class_id}] {class_name}")
                return class_id
        except mysql.connector.Error as e:
            logging.error(f"Error adding class: {e}")
            return None

    def get_all_classes(self, level: str = None, program_id: int = None) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT c.*, p.program_name, p.program_type
                    FROM classes c
                    LEFT JOIN programs p ON c.program_id = p.id
                    WHERE 1=1
                """
                params = []

                if level:
                    query += " AND c.level = %s"
                    params.append(level)
                if program_id:
                    query += " AND c.program_id = %s"
                    params.append(program_id)

                query += " ORDER BY p.program_name, c.level, c.class_name"
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching classes: {e}")
            return []

    def get_class_by_id(self, class_id: int) -> Optional[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT c.*, p.program_name, p.program_type
                    FROM classes c
                    LEFT JOIN programs p ON c.program_id = p.id
                    WHERE c.id = %s
                """
                cursor.execute(query, (class_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"Error fetching class #{class_id}: {e}")
            return None

    def get_classes_occupancy(self) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT
                        c.*,
                        MAX(p.program_name) AS program_name,
                        MAX(p.program_type) AS program_type,
                        COUNT(se.id) AS current_student_count,
                        (c.capacity - COUNT(se.id)) AS remaining_seats
                    FROM classes c
                    LEFT JOIN programs p ON c.program_id = p.id
                    LEFT JOIN student_enrollments se
                        ON se.class_id = c.id
                       AND se.status = 'active'
                    GROUP BY c.id
                    ORDER BY p.program_name, c.level, c.class_name
                """
                cursor.execute(query)
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching class occupancy: {e}")
            return []

    def update_class(self, class_id: int, **kwargs) -> bool:
        if not kwargs:
            return False

        allowed_fields = {'program_id', 'class_name', 'level', 'age_group', 'capacity'}
        update_fields = []
        params = []

        for key, value in kwargs.items():
            if key in allowed_fields:
                update_fields.append(f"{key} = %s")
                params.append(value)

        if not update_fields:
            return False
        params.append(class_id)

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = f"UPDATE classes SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
                return cursor.rowcount > 0
        except mysql.connector.Error as e:
            logging.error(f"Error updating class #{class_id}: {e}")
            return False

    def delete_class(self, class_id: int) -> tuple:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()

                cursor.execute("SELECT COUNT(*) FROM student_enrollments WHERE class_id = %s", (class_id,))
                enrollment_count = cursor.fetchone()[0]
                if enrollment_count > 0:
                    return False, f"Impossible: {enrollment_count} enrollment(s) are linked to this class."

                cursor.execute("SELECT COUNT(*) FROM teacher_assignments WHERE class_id = %s", (class_id,))
                assignment_count = cursor.fetchone()[0]
                if assignment_count > 0:
                    return False, f"Impossible: {assignment_count} teacher assignment(s) are linked."

                cursor.execute("DELETE FROM classes WHERE id = %s", (class_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"Class #{class_id} deleted.")
                    return True, "Class deleted successfully."
                return False, "Class not found."

        except mysql.connector.Error as e:
            logging.error(f"Error deleting class #{class_id}: {e}")
            return False, f"Database error: {e}"
