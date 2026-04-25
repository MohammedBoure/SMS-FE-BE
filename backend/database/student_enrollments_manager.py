# database/student_enrollments_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional
from datetime import date


class StudentEnrollmentsManager:
    """
    مدير جدول student_enrollments.
    يدير عمليات تسجيل الطلاب في البرامج الدراسية (الدورات/البرامج).
    يتضمن جلب التسجيلات مع بيانات الطالب والبرنامج التفصيلية.
    """

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE
    # ================================================================

    def create_enrollment(self, student_id: int, program_id: int, 
                          group_name: str = None, enrollment_date: str = None, 
                          status: str = 'active', notes: str = None) -> Optional[int]:
        """
        تسجيل طالب في برنامج دراسي.
        """
        if not enrollment_date:
            enrollment_date = date.today().isoformat()

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO student_enrollments (
                        student_id, program_id, group_name, 
                        enrollment_date, status, notes
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                """
                params = (student_id, program_id, group_name, enrollment_date, status, notes)
                cursor.execute(query, params)
                enrollment_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Inscription ajoutée : [{enrollment_id}] Étudiant #{student_id} -> Programme #{program_id}")
                return enrollment_id
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur lors de l'inscription : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_all_enrollments(self, status: str = None) -> List[Dict]:
        """
        جلب جميع التسجيلات مع اسم الطالب واسم البرنامج.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                
                query = """
                    SELECT 
                        se.id AS enrollment_id, se.group_name, se.enrollment_date, se.status, se.notes,
                        s.id AS student_id, u.full_name AS student_name, u.phone AS student_phone,
                        p.id AS program_id, p.program_name, p.program_type
                    FROM student_enrollments se
                    JOIN students s ON se.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    JOIN programs p ON se.program_id = p.id
                    WHERE 1=1
                """
                params = []

                if status:
                    query += " AND se.status = %s"
                    params.append(status)

                query += " ORDER BY se.enrollment_date DESC"
                
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération inscriptions : {e}")
            return []

    def get_student_enrollments(self, student_id: int) -> List[Dict]:
        """
        جلب جميع البرامج التي سجل فيها طالب معين (مفيد لملف الطالب).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        se.id AS enrollment_id, se.group_name, se.enrollment_date, se.status, se.notes,
                        p.id AS program_id, p.program_name, p.program_type, p.price_cash
                    FROM student_enrollments se
                    JOIN programs p ON se.program_id = p.id
                    WHERE se.student_id = %s
                    ORDER BY se.enrollment_date DESC
                """
                cursor.execute(query, (student_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération inscriptions (étudiant #{student_id}) : {e}")
            return []

    def get_program_enrollments(self, program_id: int, status: str = 'active') -> List[Dict]:
        """
        جلب قائمة الطلاب المسجلين في برنامج معين (مفيد لإدارة البرنامج أو الحضور).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        se.id AS enrollment_id, se.group_name, se.enrollment_date, se.status,
                        s.id AS student_id, u.full_name AS student_name, u.phone
                    FROM student_enrollments se
                    JOIN students s ON se.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    WHERE se.program_id = %s
                """
                params = [program_id]

                if status:
                    query += " AND se.status = %s"
                    params.append(status)
                    
                query += " ORDER BY u.full_name ASC"
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération étudiants du programme #{program_id} : {e}")
            return []

    # ================================================================
    # UPDATE
    # ================================================================

    def update_enrollment(self, enrollment_id: int, **kwargs) -> bool:
        """
        تحديث بيانات التسجيل (مثل تغيير المجموعة، الحالة، الملاحظات).
        """
        if not kwargs:
            return False

        allowed_fields = {'program_id', 'group_name', 'enrollment_date', 'status', 'notes'}
        update_fields = []
        params = []

        for key, value in kwargs.items():
            if key in allowed_fields:
                update_fields.append(f"{key} = %s")
                params.append(value)

        if not update_fields: 
            return False
            
        params.append(enrollment_id)

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = f"UPDATE student_enrollments SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
                
                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"✅ Inscription #{enrollment_id} mise à jour.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour inscription #{enrollment_id} : {e}")
            return False

    def change_enrollment_status(self, enrollment_id: int, status: str) -> bool:
        """اختصار لتغيير حالة التسجيل (مثلاً: 'active', 'completed', 'cancelled')"""
        return self.update_enrollment(enrollment_id, status=status)

    # ================================================================
    # DELETE
    # ================================================================

    def delete_enrollment(self, enrollment_id: int) -> tuple:
        """
        حذف التسجيل نهائياً. 
        (سيتم الحذف بنجاح لأن هذا الجدول لا يعتبر أباً لجداول أخرى بناءً على المخطط الحالي)
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM student_enrollments WHERE id = %s", (enrollment_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Inscription #{enrollment_id} supprimée.")
                    return True, "Inscription supprimée avec succès."
                return False, "Inscription introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression inscription #{enrollment_id} : {e}")
            return False, f"Erreur base de données : {e}"