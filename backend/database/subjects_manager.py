import mysql.connector
import logging
from typing import List, Dict, Optional

class SubjectsManager:
    def __init__(self, db_instance):
        self.db = db_instance

    def add_subject(self, subject_name: str, description: str = None) -> Optional[int]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO subjects (subject_name, description)
                    VALUES (%s, %s)
                """
                cursor.execute(query, (subject_name, description))
                subject_id = cursor.lastrowid
                conn.commit()
                logging.info(f"Subject added: [{subject_id}] {subject_name}")
                return subject_id
        except mysql.connector.IntegrityError as e:
            logging.warning(f"Duplicate subject [{subject_name}]: {e}")
            return None
        except mysql.connector.Error as e:
            logging.error(f"Error adding subject: {e}")
            return None

    def get_all_subjects(self) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM subjects ORDER BY subject_name ASC")
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error retrieving subjects: {e}")
            return []

    def get_subject_by_id(self, subject_id: int) -> Optional[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM subjects WHERE id = %s", (subject_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"Error retrieving subject #{subject_id}: {e}")
            return None

    def search_subjects(self, keyword: str) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT * FROM subjects
                    WHERE subject_name LIKE %s OR description LIKE %s
                    ORDER BY subject_name ASC
                """
                like = f"%{keyword}%"
                cursor.execute(query, (like, like))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error searching subjects: {e}")
            return []

    def get_subjects_with_teacher_count(self) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT
                        s.id,
                        s.subject_name,
                        s.description,
                        COUNT(DISTINCT ta.teacher_id) AS teacher_count,
                        COUNT(DISTINCT ta.class_id)   AS class_count
                    FROM subjects s
                    LEFT JOIN teacher_assignments ta ON ta.subject_id = s.id
                    GROUP BY s.id, s.subject_name, s.description
                    ORDER BY s.subject_name ASC
                """
                cursor.execute(query)
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error subject statistics: {e}")
            return []

    def update_subject(self, subject_id: int, subject_name: str = None, description: str = None) -> bool:
        if subject_name is None and description is None:
            logging.warning("update_subject: No fields provided to update.")
            return False
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                fields, params = [], []
                if subject_name is not None:
                    fields.append("subject_name = %s")
                    params.append(subject_name)
                if description is not None:
                    fields.append("description = %s")
                    params.append(description)
                params.append(subject_id)
                query = f"UPDATE subjects SET {', '.join(fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"Subject #{subject_id} updated.")
                else:
                    logging.warning(f"Subject #{subject_id} not found.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"Error updating subject #{subject_id}: {e}")
            return False

    def delete_subject(self, subject_id: int) -> tuple:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT COUNT(*) FROM teacher_assignments WHERE subject_id = %s",
                    (subject_id,)
                )
                count = cursor.fetchone()[0]
                if count > 0:
                    return False, f"Cannot delete: {count} assignment(s) linked to this subject."
                cursor.execute("DELETE FROM subjects WHERE id = %s", (subject_id,))
                conn.commit()
                if cursor.rowcount > 0:
                    logging.info(f"Subject #{subject_id} deleted.")
                    return True, "Subject deleted successfully."
                return False, "Subject not found."
        except mysql.connector.Error as e:
            logging.error(f"Error deleting subject #{subject_id}: {e}")
            return False, f"Database error: {e}"