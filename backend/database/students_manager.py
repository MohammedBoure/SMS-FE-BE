import mysql.connector
import logging
from typing import List, Dict, Optional
from datetime import date

class StudentsManager:
    def __init__(self, db_instance):
        self.db = db_instance

    def create_student(self, user_id: int, parent_id: int = None, class_id: int = None, date_of_birth: str = None, registration_date: str = None, blood_group: str = None, medical_info: str = None, status: str = 'active') -> Optional[int]:
        if not registration_date:
            registration_date = date.today().isoformat()
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = "INSERT INTO students (user_id, parent_id, class_id, date_of_birth, registration_date, blood_group, medical_info, status) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)"
                params = (user_id, parent_id, class_id, date_of_birth, registration_date, blood_group, medical_info, status)
                cursor.execute(query, params)
                student_id = cursor.lastrowid
                conn.commit()
                return student_id
        except Exception:
            return None

    def get_all_students(self, status: str = None, class_id: int = None, limit: int = 50, offset: int = 0) -> Dict:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = "SELECT s.id AS student_id, s.date_of_birth, s.registration_date, s.status, s.blood_group, u.full_name AS student_name, u.email, u.phone AS student_phone, u.is_active AS user_active, c.class_name, c.level, pu.full_name AS parent_name, pu.phone AS parent_phone FROM students s JOIN users u ON s.user_id = u.id LEFT JOIN classes c ON s.class_id = c.id LEFT JOIN parents p ON s.parent_id = p.id LEFT JOIN users pu ON p.user_id = pu.id WHERE 1=1"
                count_query = "SELECT COUNT(*) as total FROM students s JOIN users u ON s.user_id = u.id LEFT JOIN classes c ON s.class_id = c.id LEFT JOIN parents p ON s.parent_id = p.id LEFT JOIN users pu ON p.user_id = pu.id WHERE 1=1"
                params = []

                if status:
                    query += " AND s.status = %s"
                    count_query += " AND s.status = %s"
                    params.append(status)
                if class_id:
                    query += " AND s.class_id = %s"
                    count_query += " AND s.class_id = %s"
                    params.append(class_id)

                cursor.execute(count_query, tuple(params))
                total_count = cursor.fetchone()['total']

                query += " ORDER BY c.level, c.class_name, u.full_name ASC LIMIT %s OFFSET %s"
                params.extend([limit, offset])

                cursor.execute(query, tuple(params))
                return {"data": cursor.fetchall(), "total": total_count}
        except Exception:
            return {"data": [], "total": 0}

    def get_student_by_id(self, student_id: int) -> Optional[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = "SELECT s.*, u.full_name AS student_name, u.email, u.phone AS student_phone, u.address, c.class_name, c.level, pu.full_name AS parent_name, pu.phone AS parent_phone, pu.email AS parent_email FROM students s JOIN users u ON s.user_id = u.id LEFT JOIN classes c ON s.class_id = c.id LEFT JOIN parents p ON s.parent_id = p.id LEFT JOIN users pu ON p.user_id = pu.id WHERE s.id = %s"
                cursor.execute(query, (student_id,))
                return cursor.fetchone()
        except Exception:
            return None

    def search_students(self, keyword: str, limit: int = 50, offset: int = 0) -> Dict:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = "SELECT s.id AS student_id, u.full_name AS student_name, s.status, c.class_name, pu.full_name AS parent_name FROM students s JOIN users u ON s.user_id = u.id LEFT JOIN classes c ON s.class_id = c.id LEFT JOIN parents p ON s.parent_id = p.id LEFT JOIN users pu ON p.user_id = pu.id WHERE u.full_name LIKE %s OR u.phone LIKE %s OR pu.full_name LIKE %s ORDER BY u.full_name ASC"
                count_query = "SELECT COUNT(*) as total FROM students s JOIN users u ON s.user_id = u.id LEFT JOIN classes c ON s.class_id = c.id LEFT JOIN parents p ON s.parent_id = p.id LEFT JOIN users pu ON p.user_id = pu.id WHERE u.full_name LIKE %s OR u.phone LIKE %s OR pu.full_name LIKE %s"
                like_pattern = f"%{keyword}%"
                params = [like_pattern, like_pattern, like_pattern]

                cursor.execute(count_query, tuple(params))
                total_count = cursor.fetchone()['total']

                query += " LIMIT %s OFFSET %s"
                params.extend([limit, offset])

                cursor.execute(query, tuple(params))
                return {"data": cursor.fetchall(), "total": total_count}
        except Exception:
            return {"data": [], "total": 0}

    def update_student(self, student_id: int, **kwargs) -> bool:
        if not kwargs:
            return False
        allowed_fields = {'parent_id', 'class_id', 'date_of_birth', 'registration_date', 'blood_group', 'medical_info', 'status'}
        update_fields = []
        params = []
        for key, value in kwargs.items():
            if key in allowed_fields:
                update_fields.append(f"{key} = %s")
                params.append(value)
        if not update_fields: 
            return False
        params.append(student_id)
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = f"UPDATE students SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
                return cursor.rowcount > 0
        except Exception:
            return False

    def change_student_status(self, student_id: int, status: str) -> bool:
        return self.update_student(student_id, status=status)

    def delete_student(self, student_id: int, force: bool = False) -> tuple:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                if not force:
                    cursor.execute("SELECT COUNT(*) FROM grades WHERE student_id = %s", (student_id,))
                    if cursor.fetchone()[0] > 0: return False, "Error"
                    cursor.execute("SELECT COUNT(*) FROM student_fees WHERE student_id = %s", (student_id,))
                    if cursor.fetchone()[0] > 0: return False, "Error"
                cursor.execute("DELETE FROM students WHERE id = %s", (student_id,))
                conn.commit()
                if cursor.rowcount > 0:
                    return True, "Success"
                return False, "Error"
        except Exception:
            return False, "Error"