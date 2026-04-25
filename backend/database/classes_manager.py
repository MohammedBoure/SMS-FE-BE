import mysql.connector
import logging
from typing import List, Dict, Optional

class ClassesManager:

    def __init__(self, db_instance):
        self.db = db_instance

    def add_class(self, class_name: str, level: str = None, 
                  age_group: str = None, capacity: int = None) -> Optional[int]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO classes (class_name, level, age_group, capacity)
                    VALUES (%s, %s, %s, %s)
                """
                cursor.execute(query, (class_name, level, age_group, capacity))
                class_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Classe ajoutée : [{class_id}] {class_name} (Niveau: {level})")
                return class_id
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur ajout classe : {e}")
            return None

    def get_all_classes(self, level: str = None) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = "SELECT * FROM classes WHERE 1=1"
                params = []
                if level:
                    query += " AND level = %s"
                    params.append(level)
                
                query += " ORDER BY level, class_name"
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération classes : {e}")
            return []

    def get_class_by_id(self, class_id: int) -> Optional[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM classes WHERE id = %s", (class_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"❌ Erreur récupération classe #{class_id} : {e}")
            return None

    def get_classes_occupancy(self) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        c.*,
                        COUNT(s.id) AS current_student_count,
                        (c.capacity - COUNT(s.id)) AS remaining_seats
                    FROM classes c
                    LEFT JOIN students s ON c.id = s.class_id
                    GROUP BY c.id
                    ORDER BY c.level, c.class_name
                """
                cursor.execute(query)
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur stats occupation classes : {e}")
            return []

    def update_class(self, class_id: int, **kwargs) -> bool:
        if not kwargs:
            return False

        allowed_fields = {'class_name', 'level', 'age_group', 'capacity'}
        update_fields = []
        params = []

        for key, value in kwargs.items():
            if key in allowed_fields:
                update_fields.append(f"{key} = %s")
                params.append(value)

        if not update_fields: return False
        params.append(class_id)

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = f"UPDATE classes SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
                return cursor.rowcount > 0
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour classe #{class_id} : {e}")
            return False

    def delete_class(self, class_id: int) -> tuple:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()

                cursor.execute("SELECT COUNT(*) FROM students WHERE class_id = %s", (class_id,))
                student_count = cursor.fetchone()[0]
                if student_count > 0:
                    return False, f"Impossible : {student_count} étudiant(s) affecté(s) à cette classe."

                cursor.execute("SELECT COUNT(*) FROM teacher_assignments WHERE class_id = %s", (class_id,))
                assignment_count = cursor.fetchone()[0]
                if assignment_count > 0:
                    return False, f"Impossible : {assignment_count} affectation(s) enseignant liée(s)."

                cursor.execute("DELETE FROM classes WHERE id = %s", (class_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Classe #{class_id} supprimée.")
                    return True, "Classe supprimée avec succès."
                return False, "Classe introuvable."

        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression classe #{class_id} : {e}")
            return False, f"Erreur base de données : {e}"