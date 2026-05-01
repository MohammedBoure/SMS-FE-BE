# database/grades_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional


class GradesManager:
    """
    مدير جدول grades.
    يُدير علامات الطلاب وتقييماتهم، مع ميزات متقدمة لجلب كشوف النقاط وإحصائيات الامتحانات.
    """

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE & UPDATE (Upsert Logic)
    # ================================================================

    def save_grade(self, student_id: int, assessment_id: int, 
                   grade_value: float, teacher_remarks: str = None) -> Optional[int]:
        """
        إضافة أو تحديث علامة الطالب في تقييم معين.
        إذا كانت العلامة موجودة مسبقاً، سيتم تحديثها. وإذا لم تكن موجودة، سيتم إنشاؤها.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute(
                    """
                    SELECT ta.class_id
                    FROM assessments a
                    JOIN teacher_assignments ta ON a.assignment_id = ta.id
                    WHERE a.id = %s
                    """,
                    (assessment_id,)
                )
                assessment_class = cursor.fetchone()
                if not assessment_class:
                    return None

                cursor.execute(
                    """
                    SELECT 1
                    FROM student_enrollments
                    WHERE student_id = %s
                      AND class_id = %s
                      AND status = 'active'
                    LIMIT 1
                    """,
                    (student_id, assessment_class[0])
                )
                if not cursor.fetchone():
                    logging.warning(
                        "Grade blocked: student #%s is not enrolled in assessment class #%s",
                        student_id, assessment_class[0]
                    )
                    return None
                
                # التحقق مما إذا كانت العلامة موجودة مسبقاً
                check_query = "SELECT id FROM grades WHERE student_id = %s AND assessment_id = %s"
                cursor.execute(check_query, (student_id, assessment_id))
                existing = cursor.fetchone()

                if existing:
                    # تحديث العلامة الموجودة
                    grade_id = existing[0]
                    update_query = """
                        UPDATE grades SET grade_value = %s, teacher_remarks = %s 
                        WHERE id = %s
                    """
                    cursor.execute(update_query, (grade_value, teacher_remarks, grade_id))
                    conn.commit()
                    logging.info(f"✅ Note mise à jour : [{grade_id}] Étudiant #{student_id} -> Note: {grade_value}")
                    return grade_id
                else:
                    # إدخال علامة جديدة
                    insert_query = """
                        INSERT INTO grades (student_id, assessment_id, grade_value, teacher_remarks)
                        VALUES (%s, %s, %s, %s)
                    """
                    cursor.execute(insert_query, (student_id, assessment_id, grade_value, teacher_remarks))
                    grade_id = cursor.lastrowid
                    conn.commit()
                    logging.info(f"✅ Nouvelle note ajoutée : [{grade_id}] Étudiant #{student_id} -> Note: {grade_value}")
                    return grade_id

        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur lors de l'enregistrement de la note : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_assessment_grades(self, assessment_id: int) -> List[Dict]:
        """
        جلب جميع علامات الطلاب في امتحان/تقييم معين (مفيد لواجهة رصد العلامات للأستاذ).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        g.id AS grade_id, g.grade_value, g.teacher_remarks,
                        s.id AS student_id, u.full_name AS student_name,
                        a.max_grade
                    FROM grades g
                    JOIN students s ON g.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    JOIN assessments a ON g.assessment_id = a.id
                    WHERE g.assessment_id = %s
                    ORDER BY u.full_name ASC
                """
                cursor.execute(query, (assessment_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération notes de l'évaluation #{assessment_id} : {e}")
            return []

    def get_student_grades(self, student_id: int) -> List[Dict]:
        """
        جلب كشف النقاط الشامل لطالب معين مع تفاصيل المواد والأساتذة.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        g.id AS grade_id, g.grade_value, g.teacher_remarks,
                        a.title AS assessment_title, a.type AS assessment_type, 
                        a.max_grade, a.due_date,
                        sub.subject_name,
                        c.id AS class_id, c.class_name,
                        p.program_name,
                        u.full_name AS teacher_name
                    FROM grades g
                    JOIN assessments a ON g.assessment_id = a.id
                    JOIN teacher_assignments ta ON a.assignment_id = ta.id
                    JOIN subjects sub ON ta.subject_id = sub.id
                    JOIN classes c ON ta.class_id = c.id
                    LEFT JOIN student_enrollments se
                        ON se.student_id = g.student_id
                       AND se.class_id = ta.class_id
                       AND se.status = 'active'
                    LEFT JOIN programs p ON se.program_id = p.id
                    JOIN teachers t ON ta.teacher_id = t.id
                    JOIN users u ON t.user_id = u.id
                    WHERE g.student_id = %s
                    ORDER BY a.due_date DESC
                """
                cursor.execute(query, (student_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération notes de l'étudiant #{student_id} : {e}")
            return []

    def get_assessment_statistics(self, assessment_id: int) -> Dict:
        """
        جلب إحصائيات سريعة لامتحان معين (أعلى علامة، أدنى علامة، والمتوسط).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        COUNT(id) AS total_grades,
                        ROUND(AVG(grade_value), 2) AS average_grade,
                        MAX(grade_value) AS highest_grade,
                        MIN(grade_value) AS lowest_grade
                    FROM grades
                    WHERE assessment_id = %s
                """
                cursor.execute(query, (assessment_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"❌ Erreur statistiques de l'évaluation #{assessment_id} : {e}")
            return {'total_grades': 0, 'average_grade': 0, 'highest_grade': 0, 'lowest_grade': 0}

    # ================================================================
    # DELETE
    # ================================================================

    def delete_grade(self, grade_id: int) -> tuple:
        """
        حذف علامة معينة بالخطأ.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM grades WHERE id = %s", (grade_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Note #{grade_id} supprimée.")
                    return True, "Note supprimée avec succès."
                return False, "Note introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression note #{grade_id} : {e}")
            return False, f"Erreur base de données : {e}"
