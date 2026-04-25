# database/teacher_assignments_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional


class TeacherAssignmentsManager:
    """
    مدير جدول teacher_assignments.
    يدير التكليفات الأكاديمية: ربط الأستاذ بمادة دراسية وقسم معين.
    """

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE
    # ================================================================

    def assign_teacher(self, teacher_id: int, subject_id: int, class_id: int) -> Optional[int]:
        """
        إسناد مادة في قسم معين لأستاذ.
        يتحقق أولاً من عدم وجود هذا التكليف مسبقاً لتجنب التكرار.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                
                # 1. التحقق من عدم وجود التكليف مسبقاً
                check_query = """
                    SELECT id FROM teacher_assignments 
                    WHERE teacher_id = %s AND subject_id = %s AND class_id = %s
                """
                cursor.execute(check_query, (teacher_id, subject_id, class_id))
                if cursor.fetchone():
                    logging.warning(f"⚠️ Affectation en double bloquée : Ens={teacher_id}, Mat={subject_id}, Classe={class_id}")
                    return None

                # 2. إنشاء التكليف
                insert_query = """
                    INSERT INTO teacher_assignments (teacher_id, subject_id, class_id)
                    VALUES (%s, %s, %s)
                """
                cursor.execute(insert_query, (teacher_id, subject_id, class_id))
                assignment_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Affectation ajoutée : [{assignment_id}] Ens={teacher_id} -> Mat={subject_id} (Classe={class_id})")
                return assignment_id
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur lors de l'affectation : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_all_assignments(self) -> List[Dict]:
        """
        جلب جميع التكليفات مع التفاصيل الكاملة (اسم الأستاذ، المادة، والقسم).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        ta.id AS assignment_id,
                        t.id AS teacher_id, u.full_name AS teacher_name, t.specialty,
                        sub.id AS subject_id, sub.subject_name,
                        c.id AS class_id, c.class_name, c.level
                    FROM teacher_assignments ta
                    JOIN teachers t ON ta.teacher_id = t.id
                    JOIN users u ON t.user_id = u.id
                    JOIN subjects sub ON ta.subject_id = sub.id
                    JOIN classes c ON ta.class_id = c.id
                    ORDER BY c.level, c.class_name, sub.subject_name
                """
                cursor.execute(query)
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération affectations : {e}")
            return []

    def get_assignments_by_class(self, class_id: int) -> List[Dict]:
        """
        جلب قائمة الأساتذة والمواد لقسم معين (مفيد لواجهة "جدول القسم").
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        ta.id AS assignment_id,
                        u.full_name AS teacher_name, t.id AS teacher_id,
                        sub.subject_name, sub.id AS subject_id
                    FROM teacher_assignments ta
                    JOIN teachers t ON ta.teacher_id = t.id
                    JOIN users u ON t.user_id = u.id
                    JOIN subjects sub ON ta.subject_id = sub.id
                    WHERE ta.class_id = %s
                    ORDER BY sub.subject_name
                """
                cursor.execute(query, (class_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur affectations pour la classe #{class_id} : {e}")
            return []

    def get_assignments_by_teacher(self, teacher_id: int) -> List[Dict]:
        """
        جلب قائمة المواد والأقسام لأستاذ معين (مفيد لواجهة "جدول الأستاذ").
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        ta.id AS assignment_id,
                        sub.subject_name, sub.id AS subject_id,
                        c.class_name, c.level, c.id AS class_id
                    FROM teacher_assignments ta
                    JOIN subjects sub ON ta.subject_id = sub.id
                    JOIN classes c ON ta.class_id = c.id
                    WHERE ta.teacher_id = %s
                    ORDER BY c.level, c.class_name
                """
                cursor.execute(query, (teacher_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur affectations pour l'enseignant #{teacher_id} : {e}")
            return []

    # ================================================================
    # UPDATE
    # ================================================================

    def update_assignment(self, assignment_id: int, **kwargs) -> bool:
        """
        تغيير التكليف (مثل استبدال الأستاذ لمادة معينة في نفس القسم).
        """
        if not kwargs:
            return False

        allowed_fields = {'teacher_id', 'subject_id', 'class_id'}
        update_fields = []
        params = []

        for key, value in kwargs.items():
            if key in allowed_fields:
                update_fields.append(f"{key} = %s")
                params.append(value)

        if not update_fields: 
            return False
            
        params.append(assignment_id)

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = f"UPDATE teacher_assignments SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
                
                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"✅ Affectation #{assignment_id} mise à jour.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour affectation #{assignment_id} : {e}")
            return False

    # ================================================================
    # DELETE
    # ================================================================

    def delete_assignment(self, assignment_id: int) -> tuple:
        """
        إلغاء التكليف.
        تحذير: سيقوم هذا بحذف الجداول (schedules) والتقييمات (assessments) المرتبطة 
        بهذا التكليف تلقائياً بسبب ON DELETE CASCADE في قاعدة البيانات.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM teacher_assignments WHERE id = %s", (assignment_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Affectation #{assignment_id} supprimée (et ses dépendances en cascade).")
                    return True, "Affectation supprimée avec succès."
                return False, "Affectation introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression affectation #{assignment_id} : {e}")
            return False, f"Erreur base de données : {e}"