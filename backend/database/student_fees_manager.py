import logging
from datetime import date
from typing import Dict, List, Optional

import mysql.connector


class StudentFeesManager:
    def __init__(self, db_instance):
        self.db = db_instance

    @staticmethod
    def _resolve_program_for_enrollment(cursor, student_id: int,
                                        enrollment_id: int = None,
                                        program_id: int = None) -> tuple:
        if enrollment_id is None:
            return True, program_id

        cursor.execute(
            "SELECT student_id, program_id FROM student_enrollments WHERE id = %s",
            (enrollment_id,)
        )
        enrollment = cursor.fetchone()
        if not enrollment:
            return False, program_id

        enrollment_student_id = enrollment['student_id']
        enrollment_program_id = enrollment['program_id']
        if enrollment_student_id != student_id:
            return False, program_id
        if program_id is not None and program_id != enrollment_program_id:
            return False, program_id
        return True, enrollment_program_id

    def create_fee(self, student_id: int, fee_type: str, amount_due: int,
                   enrollment_id: int = None, program_id: int = None,
                   applied_discount: int = 0, due_date: str = None,
                   transaction_id: int = None) -> Optional[int]:
        if not due_date:
            due_date = date.today().isoformat()

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                valid_link, resolved_program_id = self._resolve_program_for_enrollment(
                    cursor, student_id, enrollment_id, program_id
                )
                if not valid_link:
                    logging.warning(
                        "Fee creation blocked: enrollment #%s is not valid for student #%s",
                        enrollment_id, student_id
                    )
                    return None

                query = """
                    INSERT INTO student_fees (
                        student_id, enrollment_id, program_id, fee_type, amount_due,
                        applied_discount, due_date, transaction_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                params = (
                    student_id, enrollment_id, resolved_program_id, fee_type, amount_due,
                    applied_discount, due_date, transaction_id
                )
                cursor.execute(query, params)
                fee_id = cursor.lastrowid
                conn.commit()
                logging.info(f"Fee added: [{fee_id}] {amount_due} for student #{student_id}")
                return fee_id
        except mysql.connector.Error as e:
            logging.error(f"Error adding fee: {e}")
            return None

    def get_all_fees(self, fee_type: str = None) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT
                        sf.id AS fee_id,
                        sf.enrollment_id,
                        sf.fee_type,
                        sf.amount_due,
                        sf.applied_discount,
                        sf.due_date,
                        sf.transaction_id,
                        (sf.amount_due - sf.applied_discount) AS net_amount,
                        s.id AS student_id,
                        u.full_name AS student_name,
                        p.id AS program_id,
                        p.program_name,
                        p.program_type,
                        c.id AS class_id,
                        c.class_name
                    FROM student_fees sf
                    JOIN students s ON sf.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    LEFT JOIN student_enrollments se ON sf.enrollment_id = se.id
                    LEFT JOIN programs p ON p.id = COALESCE(sf.program_id, se.program_id)
                    LEFT JOIN classes c ON se.class_id = c.id
                    WHERE 1=1
                """
                params = []

                if fee_type:
                    query += " AND sf.fee_type = %s"
                    params.append(fee_type)

                query += " ORDER BY sf.due_date DESC"

                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching fees: {e}")
            return []

    def get_student_fees(self, student_id: int) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT
                        sf.id AS fee_id,
                        sf.enrollment_id,
                        sf.fee_type,
                        sf.amount_due,
                        sf.applied_discount,
                        sf.due_date,
                        (sf.amount_due - sf.applied_discount) AS net_amount,
                        sf.transaction_id,
                        p.id AS program_id,
                        p.program_name,
                        c.id AS class_id,
                        c.class_name
                    FROM student_fees sf
                    LEFT JOIN student_enrollments se ON sf.enrollment_id = se.id
                    LEFT JOIN programs p ON p.id = COALESCE(sf.program_id, se.program_id)
                    LEFT JOIN classes c ON se.class_id = c.id
                    WHERE sf.student_id = %s
                    ORDER BY sf.due_date ASC
                """
                cursor.execute(query, (student_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching fees for student #{student_id}: {e}")
            return []

    def get_overdue_fees(self) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT
                        sf.id AS fee_id,
                        sf.enrollment_id,
                        sf.fee_type,
                        sf.due_date,
                        (sf.amount_due - sf.applied_discount) AS net_amount,
                        u.full_name AS student_name,
                        u.phone,
                        p.program_name,
                        c.class_name
                    FROM student_fees sf
                    JOIN students s ON sf.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    LEFT JOIN student_enrollments se ON sf.enrollment_id = se.id
                    LEFT JOIN programs p ON p.id = COALESCE(sf.program_id, se.program_id)
                    LEFT JOIN classes c ON se.class_id = c.id
                    WHERE sf.due_date < CURDATE()
                    ORDER BY sf.due_date ASC
                """
                cursor.execute(query)
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching overdue fees: {e}")
            return []

    def update_fee(self, fee_id: int, **kwargs) -> bool:
        if not kwargs:
            return False

        allowed_fields = {
            'enrollment_id', 'program_id', 'fee_type', 'amount_due',
            'applied_discount', 'due_date', 'transaction_id'
        }
        filtered_kwargs = {key: value for key, value in kwargs.items() if key in allowed_fields}
        if not filtered_kwargs:
            return False

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                cursor.execute(
                    "SELECT student_id, enrollment_id, program_id FROM student_fees WHERE id = %s",
                    (fee_id,)
                )
                current = cursor.fetchone()
                if not current:
                    return False

                next_enrollment_id = filtered_kwargs.get('enrollment_id', current['enrollment_id'])
                next_program_id = filtered_kwargs.get('program_id', current['program_id'])
                valid_link, resolved_program_id = self._resolve_program_for_enrollment(
                    cursor, current['student_id'], next_enrollment_id, next_program_id
                )
                if not valid_link:
                    logging.warning("Fee update blocked: invalid enrollment link for fee #%s", fee_id)
                    return False
                if next_enrollment_id is not None and 'program_id' not in filtered_kwargs:
                    filtered_kwargs['program_id'] = resolved_program_id

                update_fields = []
                params = []
                for key, value in filtered_kwargs.items():
                    update_fields.append(f"{key} = %s")
                    params.append(value)

                params.append(fee_id)
                query = f"UPDATE student_fees SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()

                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"Fee #{fee_id} updated.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"Error updating fee #{fee_id}: {e}")
            return False

    def delete_fee(self, fee_id: int) -> tuple:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM student_fees WHERE id = %s", (fee_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"Fee #{fee_id} deleted.")
                    return True, "Fee deleted successfully."
                return False, "Fee not found."
        except mysql.connector.Error as e:
            logging.error(f"Error deleting fee #{fee_id}: {e}")
            return False, f"Database error: {e}"
