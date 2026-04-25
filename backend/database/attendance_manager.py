# database/managers/attendance_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional
from datetime import date


class AttendanceManager:
    """
    مدير جدول attendance.
    يُدير حضور وغياب الطلاب وتبريراتهم، مع ميزات مخصصة لقوائم المناداة اليومية والإحصائيات.
    """

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE & UPDATE (Upsert Logic)
    # ================================================================

    def save_attendance(self, student_id: int, target_date: str, status: str,
                        is_justified: bool = False, justification_reason: str = None) -> Optional[int]:
        """
        تسجيل أو تحديث حضور الطالب في يوم معين.
        إذا كان مسجلاً مسبقاً في هذا اليوم، سيتم تحديث حالته لتجنب التكرار.
        الحالات المتوقعة (status): 'present', 'absent', 'late'.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                
                # التحقق من وجود سجل في هذا اليوم
                check_query = "SELECT id FROM attendance WHERE student_id = %s AND date = %s"
                cursor.execute(check_query, (student_id, target_date))
                existing = cursor.fetchone()

                if existing:
                    # تحديث السجل الموجود
                    attendance_id = existing[0]
                    update_query = """
                        UPDATE attendance 
                        SET status = %s, is_justified = %s, justification_reason = %s 
                        WHERE id = %s
                    """
                    cursor.execute(update_query, (status, is_justified, justification_reason, attendance_id))
                    conn.commit()
                    logging.info(f"✅ Présence mise à jour : [{attendance_id}] Étudiant #{student_id} -> {status} ({target_date})")
                    return attendance_id
                else:
                    # إدخال سجل جديد
                    insert_query = """
                        INSERT INTO attendance (student_id, date, status, is_justified, justification_reason)
                        VALUES (%s, %s, %s, %s, %s)
                    """
                    cursor.execute(insert_query, (student_id, target_date, status, is_justified, justification_reason))
                    attendance_id = cursor.lastrowid
                    conn.commit()
                    logging.info(f"✅ Nouvelle présence : [{attendance_id}] Étudiant #{student_id} -> {status} ({target_date})")
                    return attendance_id

        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur lors de l'enregistrement de la présence : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_class_attendance_sheet(self, class_id: int, target_date: str) -> List[Dict]:
        """
        ميزة متقدمة: جلب 'ورقة المناداة' لقسم معين في يوم محدد.
        تُعيد جميع طلاب القسم، وتُظهر حالتهم إذا سُجلت، أو None إذا لم تُسجل بعد.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        s.id AS student_id, u.full_name AS student_name,
                        a.id AS attendance_id, a.date, a.status, 
                        a.is_justified, a.justification_reason
                    FROM students s
                    JOIN users u ON s.user_id = u.id
                    LEFT JOIN attendance a ON s.id = a.student_id AND a.date = %s
                    WHERE s.class_id = %s
                    ORDER BY u.full_name ASC
                """
                cursor.execute(query, (target_date, class_id))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur feuille de présence (Classe #{class_id}) : {e}")
            return []

    def get_student_attendance(self, student_id: int, 
                               start_date: str = None, end_date: str = None) -> List[Dict]:
        """
        جلب السجل التفصيلي لغياب/حضور طالب معين (مع إمكانية التحديد بفترة زمنية).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                
                query = "SELECT * FROM attendance WHERE student_id = %s"
                params = [student_id]

                if start_date:
                    query += " AND date >= %s"
                    params.append(start_date)
                if end_date:
                    query += " AND date <= %s"
                    params.append(end_date)

                query += " ORDER BY date DESC"
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération présences (Étudiant #{student_id}) : {e}")
            return []

    def get_attendance_statistics(self, student_id: int) -> Dict:
        """
        إحصائيات الغياب والحضور لطالب معين (تُستخدم في لوحة تحكم الولي أو الطالب).
        """
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
                cursor.execute(query, (student_id,))
                stats = cursor.fetchone()
                
                # التعامل مع القيم الفارغة في حال لم يكن للطالب أي سجلات
                return {
                    'total_sessions': int(stats['total_sessions'] or 0),
                    'present_count': int(stats['present_count'] or 0),
                    'absent_count': int(stats['absent_count'] or 0),
                    'late_count': int(stats['late_count'] or 0),
                    'justified_absences': int(stats['justified_absences'] or 0),
                }
        except Exception as e:
            logging.error(f"❌ Erreur statistiques présence (Étudiant #{student_id}) : {e}")
            return {}

    # ================================================================
    # UPDATE
    # ================================================================

    def update_justification(self, attendance_id: int, is_justified: bool, 
                             justification_reason: str = None) -> bool:
        """
        اختصار سريع لتحديث تبرير الغياب (مثلاً: إحضار شهادة طبية).
        """
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
                    logging.info(f"✅ Justification mise à jour pour l'absence #{attendance_id}.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour justification #{attendance_id} : {e}")
            return False

    # ================================================================
    # DELETE
    # ================================================================

    def delete_attendance(self, attendance_id: int) -> tuple:
        """
        حذف سجل حضور/غياب مُسجل بالخطأ.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM attendance WHERE id = %s", (attendance_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Présence #{attendance_id} supprimée.")
                    return True, "Enregistrement supprimé avec succès."
                return False, "Enregistrement introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression présence #{attendance_id} : {e}")
            return False, f"Erreur base de données : {e}"