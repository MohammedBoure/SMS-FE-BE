import logging
from typing import Dict, List, Optional

import mysql.connector


class ParentsManager:

    def __init__(self, db_instance):
        self.db = db_instance

    def create_parent(self, user_id: int) -> Optional[int]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = "INSERT INTO parents (user_id) VALUES (%s)"
                cursor.execute(query, (user_id,))
                parent_id = cursor.lastrowid
                conn.commit()
                logging.info(f"Parent added: [{parent_id}] linked to user #{user_id}")
                return parent_id
        except mysql.connector.IntegrityError as e:
            logging.warning(f"User #{user_id} is already a parent or does not exist: {e}")
            return None
        except mysql.connector.Error as e:
            logging.error(f"Error adding parent: {e}")
            return None

    def get_all_parents(self) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT p.id AS parent_id, p.user_id,
                           u.full_name, u.phone, u.email, u.is_active
                    FROM parents p
                    JOIN users u ON p.user_id = u.id
                    ORDER BY u.full_name ASC
                """
                cursor.execute(query)
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching parents: {e}")
            return []

    def get_parent_by_id(self, parent_id: int) -> Optional[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT p.id AS parent_id, p.user_id,
                           u.full_name, u.phone, u.email, u.address, u.is_active
                    FROM parents p
                    JOIN users u ON p.user_id = u.id
                    WHERE p.id = %s
                """
                cursor.execute(query, (parent_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"Error fetching parent #{parent_id}: {e}")
            return None

    def get_parent_by_user_id(self, user_id: int) -> Optional[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM parents WHERE user_id = %s", (user_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"Error fetching parent for user #{user_id}: {e}")
            return None

    def get_parent_students(self, parent_id: int) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT
                        s.id AS student_id,
                        u.full_name AS student_name,
                        s.date_of_birth,
                        s.status,
                        es.class_names AS class_name,
                        es.class_names,
                        es.class_ids,
                        es.levels AS level,
                        es.program_names
                    FROM students s
                    JOIN users u ON s.user_id = u.id
                    LEFT JOIN (
                        SELECT
                            se.student_id,
                            GROUP_CONCAT(DISTINCT c.id ORDER BY c.class_name SEPARATOR ',') AS class_ids,
                            GROUP_CONCAT(DISTINCT c.class_name ORDER BY c.class_name SEPARATOR ', ') AS class_names,
                            GROUP_CONCAT(DISTINCT c.level ORDER BY c.level SEPARATOR ', ') AS levels,
                            GROUP_CONCAT(DISTINCT p.program_name ORDER BY p.program_name SEPARATOR ', ') AS program_names
                        FROM student_enrollments se
                        LEFT JOIN classes c ON se.class_id = c.id
                        LEFT JOIN programs p ON se.program_id = p.id
                        WHERE se.status = 'active'
                        GROUP BY se.student_id
                    ) es ON es.student_id = s.id
                    WHERE s.parent_id = %s
                    ORDER BY u.full_name ASC
                """
                cursor.execute(query, (parent_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching children for parent #{parent_id}: {e}")
            return []

    def delete_parent(self, parent_id: int) -> tuple:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()

                cursor.execute("SELECT COUNT(*) FROM students WHERE parent_id = %s", (parent_id,))
                children_count = cursor.fetchone()[0]
                if children_count > 0:
                    return False, f"Impossible: this parent still has {children_count} linked child record(s)."

                cursor.execute("DELETE FROM parents WHERE id = %s", (parent_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"Parent #{parent_id} deleted.")
                    return True, "Parent profile deleted successfully."
                return False, "Parent not found."
        except mysql.connector.Error as e:
            logging.error(f"Error deleting parent #{parent_id}: {e}")
            return False, f"Database error: {e}"
