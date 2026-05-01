# database/assessments_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional


class AssessmentsManager:
    """
    مدير جدول assessments.
    يُدير الامتحانات والتقييمات (فروض، اختبارات، واجبات) المرتبطة بتكليف أكاديمي.
    """

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE
    # ================================================================

    def create_assessment(self, title: str, type: str, assignment_id: int, 
                          max_grade: float = 20.0, due_date: str = None) -> Optional[int]:
        """
        إضافة تقييم جديد (امتحان أو واجب) وربطه بتكليف أستاذ/مادة.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO assessments (title, type, max_grade, assignment_id, due_date)
                    VALUES (%s, %s, %s, %s, %s)
                """
                params = (title, type, max_grade, assignment_id, due_date)
                cursor.execute(query, params)
                assessment_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Évaluation ajoutée : [{assessment_id}] '{title}' (Type: {type})")
                return assessment_id
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur ajout évaluation : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_all_assessments(self) -> List[Dict]:
        """
        جلب جميع التقييمات مع تفاصيل التكليف المرتبط بها (المادة، القسم، والأستاذ).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        a.id AS assessment_id, a.title, a.type, a.max_grade, a.due_date,
                        ta.id AS assignment_id,
                        sub.subject_name,
                        c.class_name, c.level, c.id AS class_id,
                        u.full_name AS teacher_name
                    FROM assessments a
                    JOIN teacher_assignments ta ON a.assignment_id = ta.id
                    JOIN subjects sub ON ta.subject_id = sub.id
                    JOIN classes c ON ta.class_id = c.id
                    JOIN teachers t ON ta.teacher_id = t.id
                    JOIN users u ON t.user_id = u.id
                    ORDER BY a.due_date DESC
                """
                cursor.execute(query)
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération évaluations : {e}")
            return []

    def get_assessment_by_id(self, assessment_id: int) -> Optional[Dict]:
        """
        جلب تفاصيل تقييم واحد بواسطة معرّفه.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        a.*,
                        sub.subject_name, c.class_name, c.level, u.full_name AS teacher_name
                    FROM assessments a
                    JOIN teacher_assignments ta ON a.assignment_id = ta.id
                    JOIN subjects sub ON ta.subject_id = sub.id
                    JOIN classes c ON ta.class_id = c.id
                    JOIN teachers t ON ta.teacher_id = t.id
                    JOIN users u ON t.user_id = u.id
                    WHERE a.id = %s
                """
                cursor.execute(query, (assessment_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"❌ Erreur récupération évaluation #{assessment_id} : {e}")
            return None

    def get_assessments_by_class(self, class_id: int) -> List[Dict]:
        """
        جلب جميع الامتحانات/التقييمات المقررة لقسم معين (مفيد لجدول امتحانات القسم).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        a.id AS assessment_id, a.title, a.type, a.due_date, a.max_grade,
                        sub.subject_name, u.full_name AS teacher_name
                    FROM assessments a
                    JOIN teacher_assignments ta ON a.assignment_id = ta.id
                    JOIN subjects sub ON ta.subject_id = sub.id
                    JOIN teachers t ON ta.teacher_id = t.id
                    JOIN users u ON t.user_id = u.id
                    WHERE ta.class_id = %s
                    ORDER BY a.due_date ASC
                """
                cursor.execute(query, (class_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération évaluations pour la classe #{class_id} : {e}")
            return []

    def get_assessments_by_student(self, student_id: int) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT DISTINCT
                        a.id AS assessment_id, a.title, a.type, a.due_date, a.max_grade,
                        sub.subject_name,
                        c.id AS class_id, c.class_name, c.level,
                        p.id AS program_id, p.program_name,
                        u.full_name AS teacher_name
                    FROM student_enrollments se
                    JOIN classes c ON se.class_id = c.id
                    JOIN programs p ON se.program_id = p.id
                    JOIN teacher_assignments ta ON ta.class_id = se.class_id
                    JOIN assessments a ON a.assignment_id = ta.id
                    JOIN subjects sub ON ta.subject_id = sub.id
                    JOIN teachers t ON ta.teacher_id = t.id
                    JOIN users u ON t.user_id = u.id
                    WHERE se.student_id = %s
                      AND se.status = 'active'
                    ORDER BY a.due_date ASC, c.class_name ASC
                """
                cursor.execute(query, (student_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching assessments for student #{student_id}: {e}")
            return []

    def get_assessments_by_assignment(self, assignment_id: int) -> List[Dict]:
        """
        جلب التقييمات الخاصة بتكليف معين لأستاذ معين (مفيد لواجهة إدارة علامات الأستاذ).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = "SELECT * FROM assessments WHERE assignment_id = %s ORDER BY due_date DESC"
                cursor.execute(query, (assignment_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération évaluations pour l'affectation #{assignment_id} : {e}")
            return []

    # ================================================================
    # UPDATE
    # ================================================================

    def update_assessment(self, assessment_id: int, **kwargs) -> bool:
        """
        تحديث بيانات التقييم (العنوان، النوع، العلامة القصوى، أو تاريخ الاستحقاق).
        """
        if not kwargs:
            return False

        allowed_fields = {'title', 'type', 'max_grade', 'due_date', 'assignment_id'}
        update_fields = []
        params = []

        for key, value in kwargs.items():
            if key in allowed_fields:
                update_fields.append(f"{key} = %s")
                params.append(value)

        if not update_fields: 
            return False
            
        params.append(assessment_id)

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = f"UPDATE assessments SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
                
                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"✅ Évaluation #{assessment_id} mise à jour.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour évaluation #{assessment_id} : {e}")
            return False

    # ================================================================
    # DELETE
    # ================================================================

    def delete_assessment(self, assessment_id: int) -> tuple:
        """
        حذف التقييم. 
        تحذير: سيقوم هذا بحذف جميع العلامات (Grades) المرتبطة بهذا التقييم تلقائياً 
        بسبب القيود المفروضة في قاعدة البيانات (ON DELETE CASCADE).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM assessments WHERE id = %s", (assessment_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Évaluation #{assessment_id} supprimée (et les notes associées).")
                    return True, "Évaluation supprimée avec succès."
                return False, "Évaluation introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression évaluation #{assessment_id} : {e}")
            return False, f"Erreur base de données : {e}"
