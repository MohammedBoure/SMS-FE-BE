# database/teachers_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional
from datetime import date


class TeachersManager:
    """
    مدير جدول teachers.
    يربط بين حساب المستخدم (User) ودور الأستاذ.
    يتضمن دوال لجلب بيانات الأستاذ، البحث عنه، ومعرفة تكليفاته الأكاديمية.
    """

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE
    # ================================================================

    def create_teacher(self, user_id: int, specialty: str = None, 
                       hire_date: str = None) -> Optional[int]:
        """
        إنشاء ملف أستاذ جديد وربطه بمستخدم موجود.
        """
        if not hire_date:
            hire_date = date.today().isoformat()

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO teachers (user_id, specialty, hire_date)
                    VALUES (%s, %s, %s)
                """
                cursor.execute(query, (user_id, specialty, hire_date))
                teacher_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Enseignant ajouté : [{teacher_id}] lié à l'utilisateur #{user_id}")
                return teacher_id
        except mysql.connector.IntegrityError as e:
            logging.warning(f"⚠️ L'utilisateur #{user_id} est déjà enseignant ou n'existe pas : {e}")
            return None
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur ajout enseignant : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_all_teachers(self) -> List[Dict]:
        """
        جلب جميع الأساتذة مع بياناتهم الشخصية من جدول المستخدمين.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        t.id AS teacher_id, t.specialty, t.hire_date,
                        u.id AS user_id, u.full_name, u.email, u.phone, u.is_active
                    FROM teachers t
                    JOIN users u ON t.user_id = u.id
                    ORDER BY u.full_name ASC
                """
                cursor.execute(query)
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération enseignants : {e}")
            return []

    def get_teacher_by_id(self, teacher_id: int) -> Optional[Dict]:
        """
        جلب بيانات أستاذ واحد بواسطة معرّفه (مع بيانات المستخدم الخاصة به).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        t.*,
                        u.full_name, u.email, u.phone, u.address, u.is_active
                    FROM teachers t
                    JOIN users u ON t.user_id = u.id
                    WHERE t.id = %s
                """
                cursor.execute(query, (teacher_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"❌ Erreur récupération enseignant #{teacher_id} : {e}")
            return None

    def search_teachers(self, keyword: str) -> List[Dict]:
        """
        البحث عن الأساتذة بالاسم أو التخصص.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        t.id AS teacher_id, t.specialty, 
                        u.full_name, u.phone, u.is_active
                    FROM teachers t
                    JOIN users u ON t.user_id = u.id
                    WHERE u.full_name LIKE %s OR t.specialty LIKE %s
                    ORDER BY u.full_name ASC
                """
                like_pattern = f"%{keyword}%"
                cursor.execute(query, (like_pattern, like_pattern))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur recherche enseignants : {e}")
            return []

    def get_teacher_assignments(self, teacher_id: int) -> List[Dict]:
        """
        ميزة متقدمة: جلب جميع الأقسام والمواد التي يُدرسها هذا الأستاذ.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        ta.id AS assignment_id,
                        sub.subject_name,
                        c.class_name, c.level
                    FROM teacher_assignments ta
                    JOIN subjects sub ON ta.subject_id = sub.id
                    JOIN classes c ON ta.class_id = c.id
                    WHERE ta.teacher_id = %s
                    ORDER BY c.level, c.class_name
                """
                cursor.execute(query, (teacher_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération affectations de l'enseignant #{teacher_id} : {e}")
            return []

    # ================================================================
    # UPDATE
    # ================================================================

    def update_teacher(self, teacher_id: int, **kwargs) -> bool:
        """
        تحديث بيانات ملف الأستاذ (التخصص، تاريخ التوظيف).
        (لتحديث الاسم أو الهاتف، يتم استخدام UsersManager).
        """
        if not kwargs:
            return False

        allowed_fields = {'specialty', 'hire_date'}
        update_fields = []
        params = []

        for key, value in kwargs.items():
            if key in allowed_fields:
                update_fields.append(f"{key} = %s")
                params.append(value)

        if not update_fields: 
            return False
            
        params.append(teacher_id)

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = f"UPDATE teachers SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
                
                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"✅ Dossier enseignant #{teacher_id} mis à jour.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour enseignant #{teacher_id} : {e}")
            return False

    # ================================================================
    # DELETE
    # ================================================================

    def delete_teacher(self, teacher_id: int) -> tuple:
        """
        حذف ملف الأستاذ.
        يمنع الحذف إذا كان الأستاذ مرتبطاً بتكليفات جداول (حماية البيانات).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()

                # التحقق من وجود تكليفات (Assignments)
                cursor.execute("SELECT COUNT(*) FROM teacher_assignments WHERE teacher_id = %s", (teacher_id,))
                if cursor.fetchone()[0] > 0:
                    return False, "Impossible : Cet enseignant a des affectations (classes/matières). Retirez-les d'abord."

                cursor.execute("DELETE FROM teachers WHERE id = %s", (teacher_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Dossier enseignant #{teacher_id} supprimé.")
                    return True, "Enseignant supprimé avec succès."
                return False, "Enseignant introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression enseignant #{teacher_id} : {e}")
            return False, f"Erreur base de données : {e}"