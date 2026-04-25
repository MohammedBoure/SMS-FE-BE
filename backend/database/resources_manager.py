# database/resources_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional


class ResourcesManager:
    """
    مدير جدول resources.
    يُدير الموارد التعليمية (ملفات، روابط، دروس) المرتبطة بالتكليفات الأكاديمية.
    """

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE
    # ================================================================

    def create_resource(self, title: str, resource_type: str, file_path_or_url: str,
                        description: str = None, file_size_mb: float = 0.0,
                        assignment_id: int = None) -> Optional[int]:
        """
        إضافة مورد تعليمي جديد (ملف PDF، رابط فيديو، إلخ) وربطه بتكليف أستاذ إذا وجد.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO resources (
                        title, description, resource_type, 
                        file_path_or_url, file_size_mb, assignment_id
                    ) VALUES (%s, %s, %s, %s, %s, %s)
                """
                params = (title, description, resource_type, file_path_or_url, file_size_mb, assignment_id)
                cursor.execute(query, params)
                resource_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Ressource ajoutée : [{resource_id}] '{title}' (Type: {resource_type})")
                return resource_id
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur ajout ressource : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_all_resources(self) -> List[Dict]:
        """
        جلب جميع الموارد مع تفاصيل التكليف المرتبط بها (المادة والقسم).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        r.id AS resource_id, r.title, r.description, r.resource_type, 
                        r.file_path_or_url, r.file_size_mb, r.upload_date,
                        ta.id AS assignment_id,
                        sub.subject_name,
                        c.class_name, c.level,
                        u.full_name AS teacher_name
                    FROM resources r
                    LEFT JOIN teacher_assignments ta ON r.assignment_id = ta.id
                    LEFT JOIN subjects sub ON ta.subject_id = sub.id
                    LEFT JOIN classes c ON ta.class_id = c.id
                    LEFT JOIN teachers t ON ta.teacher_id = t.id
                    LEFT JOIN users u ON t.user_id = u.id
                    ORDER BY r.upload_date DESC
                """
                cursor.execute(query)
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération ressources : {e}")
            return []

    def get_resource_by_id(self, resource_id: int) -> Optional[Dict]:
        """
        جلب تفاصيل مورد واحد بواسطة معرّفه.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = "SELECT * FROM resources WHERE id = %s"
                cursor.execute(query, (resource_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"❌ Erreur récupération ressource #{resource_id} : {e}")
            return None

    def get_resources_by_assignment(self, assignment_id: int) -> List[Dict]:
        """
        جلب جميع الموارد المرتبطة بتكليف أكاديمي معين (مادة/قسم لأستاذ).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT * FROM resources 
                    WHERE assignment_id = %s 
                    ORDER BY upload_date DESC
                """
                cursor.execute(query, (assignment_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération ressources pour l'affectation #{assignment_id} : {e}")
            return []

    def search_resources(self, keyword: str, resource_type: str = None) -> List[Dict]:
        """
        البحث في الموارد بالعنوان أو الوصف، مع إمكانية التصفية حسب نوع المورد (فيديو، كتاب، إلخ).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT r.*, sub.subject_name, c.class_name
                    FROM resources r
                    LEFT JOIN teacher_assignments ta ON r.assignment_id = ta.id
                    LEFT JOIN subjects sub ON ta.subject_id = sub.id
                    LEFT JOIN classes c ON ta.class_id = c.id
                    WHERE (r.title LIKE %s OR r.description LIKE %s)
                """
                params = [f"%{keyword}%", f"%{keyword}%"]

                if resource_type:
                    query += " AND r.resource_type = %s"
                    params.append(resource_type)
                    
                query += " ORDER BY r.upload_date DESC"
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur recherche ressources : {e}")
            return []

    # ================================================================
    # UPDATE
    # ================================================================

    def update_resource(self, resource_id: int, **kwargs) -> bool:
        """
        تحديث بيانات المورد (الاسم، الوصف، مسار الملف).
        """
        if not kwargs:
            return False

        allowed_fields = {'title', 'description', 'resource_type', 
                          'file_path_or_url', 'file_size_mb', 'assignment_id'}
        update_fields = []
        params = []

        for key, value in kwargs.items():
            if key in allowed_fields:
                update_fields.append(f"{key} = %s")
                params.append(value)

        if not update_fields: 
            return False
            
        params.append(resource_id)

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = f"UPDATE resources SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
                
                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"✅ Ressource #{resource_id} mise à jour.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour ressource #{resource_id} : {e}")
            return False

    # ================================================================
    # DELETE
    # ================================================================

    def delete_resource(self, resource_id: int) -> tuple:
        """
        حذف المورد من قاعدة البيانات. 
        ملاحظة: هذه الدالة تحذف السجل فقط، يجب التأكد من حذف الملف الفعلي من القرص (Disk) في مكان آخر من التطبيق إذا لزم الأمر.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM resources WHERE id = %s", (resource_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Ressource #{resource_id} supprimée.")
                    return True, "Ressource supprimée avec succès."
                return False, "Ressource introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression ressource #{resource_id} : {e}")
            return False, f"Erreur base de données : {e}"