# database/programs_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional


class ProgramsManager:
    """
    مدير جدول programs.
    يُغطّي العمليات الكاملة: إضافة / تعديل / حذف / جلب وبحث.
    """

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE
    # ================================================================

    def create_program(self, program_name: str, program_type: str, 
                       price_cash: int = 0, price_installments: int = 0) -> Optional[int]:
        """
        إضافة برنامج دراسي جديد مع تحديد الأسعار.
        يُعيد id البرنامج الجديد، أو None عند الفشل.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO programs (program_name, program_type, price_cash, price_installments)
                    VALUES (%s, %s, %s, %s)
                """
                params = (program_name, program_type, price_cash, price_installments)
                cursor.execute(query, params)
                program_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Programme ajouté : [{program_id}] {program_name} ({program_type})")
                return program_id
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur ajout programme : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_all_programs(self, program_type: str = None) -> List[Dict]:
        """
        جلب جميع البرامج الدراسية مع إمكانية التصفية حسب النوع.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                
                query = "SELECT * FROM programs WHERE 1=1"
                params = []

                if program_type:
                    query += " AND program_type = %s"
                    params.append(program_type)

                query += " ORDER BY program_name ASC"
                
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération programmes : {e}")
            return []

    def get_program_by_id(self, program_id: int) -> Optional[Dict]:
        """
        جلب بيانات برنامج واحد بناءً على المعرّف (ID).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM programs WHERE id = %s", (program_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"❌ Erreur récupération programme #{program_id} : {e}")
            return None

    def search_programs(self, keyword: str) -> List[Dict]:
        """
        البحث عن البرامج بالاسم أو النوع.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT * FROM programs
                    WHERE program_name LIKE %s OR program_type LIKE %s
                    ORDER BY program_name ASC
                """
                like_pattern = f"%{keyword}%"
                cursor.execute(query, (like_pattern, like_pattern))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur recherche programmes : {e}")
            return []

    def get_programs_summary(self) -> List[Dict]:
        """
        إحصائيات متقدمة: جلب البرامج مع عدد الطلاب المسجلين في كل برنامج.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        p.id, p.program_name, p.program_type, 
                        p.price_cash, p.price_installments,
                        COUNT(se.id) AS enrolled_students_count
                    FROM programs p
                    LEFT JOIN student_enrollments se ON p.id = se.program_id AND se.status = 'active'
                    GROUP BY p.id
                    ORDER BY p.program_name ASC
                """
                cursor.execute(query)
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur statistiques programmes : {e}")
            return []

    # ================================================================
    # UPDATE
    # ================================================================

    def update_program(self, program_id: int, **kwargs) -> bool:
        """
        تحديث بيانات البرنامج بشكل ديناميكي.
        مثال: update_program(1, price_cash=50000, program_name="Nouveau Nom")
        """
        if not kwargs:
            logging.warning("update_program: aucun champ à mettre à jour.")
            return False

        allowed_fields = {'program_name', 'program_type', 'price_cash', 'price_installments'}
        update_fields = []
        params = []

        for key, value in kwargs.items():
            if key in allowed_fields:
                update_fields.append(f"{key} = %s")
                params.append(value)

        if not update_fields:
            return False

        params.append(program_id)
        
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = f"UPDATE programs SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()

                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"✅ Programme #{program_id} mis à jour.")
                else:
                    logging.warning(f"⚠️ Programme #{program_id} introuvable ou aucune modification.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour programme #{program_id} : {e}")
            return False

    # ================================================================
    # DELETE
    # ================================================================

    def delete_program(self, program_id: int) -> tuple:
        """
        حذف برنامج دراسي.
        يمنع الحذف إذا كان هناك طلاب مسجلين في هذا البرنامج.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                
                # 1. التحقق من وجود تسجيلات مرتبطة بهذا البرنامج
                cursor.execute(
                    "SELECT COUNT(*) FROM student_enrollments WHERE program_id = %s", 
                    (program_id,)
                )
                count = cursor.fetchone()[0]
                if count > 0:
                    logging.warning(f"⚠️ Impossible de supprimer le programme #{program_id}: {count} inscription(s) liée(s).")
                    return False, f"Impossible : {count} étudiant(s) inscrit(s) dans ce programme."

                # 2. الحذف إذا لم يكن هناك ارتباطات
                cursor.execute("DELETE FROM programs WHERE id = %s", (program_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Programme #{program_id} supprimé.")
                    return True, "Programme supprimé avec succès."
                return False, "Programme introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression programme #{program_id} : {e}")
            return False, f"Erreur base de données : {e}"