# database/parents_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional


class ParentsManager:
    """
    مدير جدول parents.
    يربط بين حساب المستخدم (User) ودور ولي الأمر (Parent).
    يتضمن دوال متقدمة لجلب بيانات الولي وأبنائه (الطلاب).
    """

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE
    # ================================================================

    def create_parent(self, user_id: int) -> Optional[int]:
        """
        إنشاء ملف ولي أمر جديد وربطه بمستخدم موجود.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = "INSERT INTO parents (user_id) VALUES (%s)"
                cursor.execute(query, (user_id,))
                parent_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Parent ajouté : [{parent_id}] lié à l'utilisateur #{user_id}")
                return parent_id
        except mysql.connector.IntegrityError as e:
            logging.warning(f"⚠️ L'utilisateur #{user_id} est déjà un parent ou n'existe pas : {e}")
            return None
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur ajout parent : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_all_parents(self) -> List[Dict]:
        """
        جلب جميع أولياء الأمور مع بياناتهم الأساسية من جدول المستخدمين.
        """
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
            logging.error(f"❌ Erreur récupération parents : {e}")
            return []

    def get_parent_by_id(self, parent_id: int) -> Optional[Dict]:
        """
        جلب بيانات ولي أمر واحد بواسطة معرّفه (مع بيانات المستخدم).
        """
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
            logging.error(f"❌ Erreur récupération parent #{parent_id} : {e}")
            return None

    def get_parent_by_user_id(self, user_id: int) -> Optional[Dict]:
        """
        جلب بيانات الولي باستخدام معرّف المستخدم (مفيد جداً عند تسجيل الدخول).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM parents WHERE user_id = %s", (user_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"❌ Erreur récupération parent (user #{user_id}) : {e}")
            return None

    def get_parent_students(self, parent_id: int) -> List[Dict]:
        """
        جلب قائمة الطلاب (الأبناء) المرتبطين بولي الأمر هذا، مع بيانات القسم.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT s.id AS student_id, u.full_name AS student_name, 
                           s.date_of_birth, s.status,
                           c.class_name, c.level
                    FROM students s
                    JOIN users u ON s.user_id = u.id
                    LEFT JOIN classes c ON s.class_id = c.id
                    WHERE s.parent_id = %s
                """
                cursor.execute(query, (parent_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération enfants du parent #{parent_id} : {e}")
            return []

    # ================================================================
    # UPDATE
    # ================================================================
    
    # ملاحظة هامة: لم أقم بإضافة دالة update_parent هنا.
    # لأن جدول parents لا يحتوي على بيانات فعلية (الاسم، الهاتف، الخ).
    # إذا أردت تحديث اسم الولي أو هاتفه، يجب استخدام UsersManager.update_user(user_id, ...)

    # ================================================================
    # DELETE
    # ================================================================

    def delete_parent(self, parent_id: int) -> tuple:
        """
        حذف ارتباط "ولي الأمر". 
        ملاحظة: هذا لن يحذف حساب المستخدم الأصلي (User)، بل يسحب منه صفة الولي فقط.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                
                # التحقق مما إذا كان لديه أبناء مسجلين
                cursor.execute("SELECT COUNT(*) FROM students WHERE parent_id = %s", (parent_id,))
                children_count = cursor.fetchone()[0]
                if children_count > 0:
                    return False, f"Impossible : Ce parent a encore {children_count} enfant(s) inscrit(s)."

                cursor.execute("DELETE FROM parents WHERE id = %s", (parent_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Parent #{parent_id} supprimé.")
                    return True, "Profil parent supprimé avec succès."
                return False, "Parent introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression parent #{parent_id} : {e}")
            return False, f"Erreur base de données : {e}"