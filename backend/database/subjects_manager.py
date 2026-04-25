# database/subjects_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional


class SubjectsManager:
    """
    مدير جدول subjects.
    يُغطّي العمليات الكاملة: إضافة / تعديل / حذف / جلب.
    """

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE
    # ================================================================
    def add_subject(self, subject_name: str, description: str = None) -> Optional[int]:
        """
        إضافة مادة دراسية جديدة.
        يُعيد id المادة الجديدة، أو None عند الفشل.
        """
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
                logging.info(f"✅ Matière ajoutée : [{subject_id}] {subject_name}")
                return subject_id
        except mysql.connector.IntegrityError as e:
            logging.warning(f"⚠️ Doublon matière [{subject_name}]: {e}")
            return None
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur ajout matière : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_all_subjects(self) -> List[Dict]:
        """
        جلب جميع المواد الدراسية مرتّبةً أبجدياً.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM subjects ORDER BY subject_name ASC")
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération matières : {e}")
            return []

    def get_subject_by_id(self, subject_id: int) -> Optional[Dict]:
        """
        جلب مادة واحدة بواسطة معرّفها.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM subjects WHERE id = %s", (subject_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"❌ Erreur récupération matière #{subject_id} : {e}")
            return None

    def search_subjects(self, keyword: str) -> List[Dict]:
        """
        البحث في المواد الدراسية بالاسم أو الوصف.
        """
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
            logging.error(f"❌ Erreur recherche matières : {e}")
            return []

    def get_subjects_with_teacher_count(self) -> List[Dict]:
        """
        جلب المواد مع عدد الأساتذة المكلّفين بكل مادة.
        مفيد لشاشات الإدارة والتقارير.
        """
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
            logging.error(f"❌ Erreur stats matières : {e}")
            return []

    # ================================================================
    # UPDATE
    # ================================================================
    def update_subject(self, subject_id: int,
                       subject_name: str = None,
                       description: str = None) -> bool:
        """
        تحديث اسم المادة أو وصفها (أو كليهما).
        يُعيد True عند النجاح، False عند الفشل.
        """
        if subject_name is None and description is None:
            logging.warning("update_subject: aucun champ à mettre à jour.")
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
                    logging.info(f"✅ Matière #{subject_id} mise à jour.")
                else:
                    logging.warning(f"⚠️ Matière #{subject_id} introuvable.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour matière #{subject_id} : {e}")
            return False

    # ================================================================
    # DELETE
    # ================================================================
    def delete_subject(self, subject_id: int) -> tuple:
        """
        حذف مادة دراسية.
        يُعيد (True, message) عند النجاح أو (False, message) عند الفشل.
        يرفض الحذف إذا كانت المادة مرتبطة بتكليفات أساتذة.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()

                # التحقق من وجود تكليفات مرتبطة
                cursor.execute(
                    "SELECT COUNT(*) FROM teacher_assignments WHERE subject_id = %s",
                    (subject_id,)
                )
                count = cursor.fetchone()[0]
                if count > 0:
                    return False, f"Impossible : {count} affectation(s) liée(s) à cette matière."

                cursor.execute("DELETE FROM subjects WHERE id = %s", (subject_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Matière #{subject_id} supprimée.")
                    return True, "Matière supprimée avec succès."
                return False, "Matière introuvable."

        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression matière #{subject_id} : {e}")
            return False, f"Erreur base de données : {e}"
