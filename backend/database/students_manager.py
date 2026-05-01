from datetime import date
from typing import Dict, Optional


class StudentsManager:
    def __init__(self, db_instance):
        self.db = db_instance

    @staticmethod
    def _enrollment_summary_join() -> str:
        return """
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
        """

    @staticmethod
    def _class_filter_sql(class_id: int, params: list) -> str:
        if not class_id:
            return ""
        params.append(class_id)
        return """
            AND EXISTS (
                SELECT 1
                FROM student_enrollments se_filter
                WHERE se_filter.student_id = s.id
                  AND se_filter.class_id = %s
                  AND se_filter.status = 'active'
            )
        """

    def create_student(self, user_id: int, parent_id: int = None, class_id: int = None,
                       date_of_birth: str = None, registration_date: str = None,
                       blood_group: str = None, medical_info: str = None,
                       status: str = 'active') -> Optional[int]:
        if not registration_date:
            registration_date = date.today().isoformat()
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO students (
                        user_id, parent_id, class_id, date_of_birth,
                        registration_date, blood_group, medical_info, status
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                params = (
                    user_id, parent_id, class_id, date_of_birth,
                    registration_date, blood_group, medical_info, status
                )
                cursor.execute(query, params)
                student_id = cursor.lastrowid
                conn.commit()
                return student_id
        except Exception:
            return None

    def get_all_students(self, status: str = None, class_id: int = None,
                         limit: int = 50, offset: int = 0) -> Dict:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                base_from = f"""
                    FROM students s
                    JOIN users u ON s.user_id = u.id
                    LEFT JOIN parents p ON s.parent_id = p.id
                    LEFT JOIN users pu ON p.user_id = pu.id
                    {self._enrollment_summary_join()}
                    WHERE 1=1
                """
                select_query = f"""
                    SELECT
                        s.id AS student_id,
                        s.class_id AS legacy_class_id,
                        s.date_of_birth,
                        s.registration_date,
                        s.status,
                        s.blood_group,
                        u.full_name AS student_name,
                        u.email,
                        u.phone AS student_phone,
                        u.is_active AS user_active,
                        es.class_names AS class_name,
                        es.class_names,
                        es.class_ids,
                        es.levels AS level,
                        es.program_names,
                        pu.full_name AS parent_name,
                        pu.phone AS parent_phone
                    {base_from}
                """
                count_query = f"SELECT COUNT(*) AS total {base_from}"
                params = []

                if status:
                    select_query += " AND s.status = %s"
                    count_query += " AND s.status = %s"
                    params.append(status)

                class_filter = self._class_filter_sql(class_id, params)
                select_query += class_filter
                count_query += class_filter

                cursor.execute(count_query, tuple(params))
                total_count = cursor.fetchone()['total']

                select_query += " ORDER BY es.class_names, u.full_name ASC LIMIT %s OFFSET %s"
                params.extend([limit, offset])

                cursor.execute(select_query, tuple(params))
                return {"data": cursor.fetchall(), "total": total_count}
        except Exception:
            return {"data": [], "total": 0}

    def get_student_by_id(self, student_id: int) -> Optional[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = f"""
                    SELECT
                        s.*,
                        s.class_id AS legacy_class_id,
                        u.full_name AS student_name,
                        u.email,
                        u.phone AS student_phone,
                        u.address,
                        es.class_names AS class_name,
                        es.class_names,
                        es.class_ids,
                        es.levels AS level,
                        es.program_names,
                        pu.full_name AS parent_name,
                        pu.phone AS parent_phone,
                        pu.email AS parent_email
                    FROM students s
                    JOIN users u ON s.user_id = u.id
                    LEFT JOIN parents p ON s.parent_id = p.id
                    LEFT JOIN users pu ON p.user_id = pu.id
                    {self._enrollment_summary_join()}
                    WHERE s.id = %s
                """
                cursor.execute(query, (student_id,))
                return cursor.fetchone()
        except Exception:
            return None

    def search_students(self, keyword: str, limit: int = 50, offset: int = 0) -> Dict:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                like_pattern = f"%{keyword}%"
                base_from = f"""
                    FROM students s
                    JOIN users u ON s.user_id = u.id
                    LEFT JOIN parents p ON s.parent_id = p.id
                    LEFT JOIN users pu ON p.user_id = pu.id
                    {self._enrollment_summary_join()}
                    WHERE u.full_name LIKE %s
                       OR u.phone LIKE %s
                       OR pu.full_name LIKE %s
                """
                query = f"""
                    SELECT
                        s.id AS student_id,
                        u.full_name AS student_name,
                        s.status,
                        es.class_names AS class_name,
                        es.class_names,
                        es.program_names,
                        pu.full_name AS parent_name
                    {base_from}
                    ORDER BY u.full_name ASC
                """
                count_query = f"SELECT COUNT(*) AS total {base_from}"
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
        allowed_fields = {
            'parent_id', 'class_id', 'date_of_birth', 'registration_date',
            'blood_group', 'medical_info', 'status'
        }
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
                    if cursor.fetchone()[0] > 0:
                        return False, "Error"
                    cursor.execute("SELECT COUNT(*) FROM student_fees WHERE student_id = %s", (student_id,))
                    if cursor.fetchone()[0] > 0:
                        return False, "Error"
                    cursor.execute("SELECT COUNT(*) FROM student_enrollments WHERE student_id = %s", (student_id,))
                    if cursor.fetchone()[0] > 0:
                        return False, "Error"
                cursor.execute("DELETE FROM students WHERE id = %s", (student_id,))
                conn.commit()
                if cursor.rowcount > 0:
                    return True, "Success"
                return False, "Error"
        except Exception:
            return False, "Error"
