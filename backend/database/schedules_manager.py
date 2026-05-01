# database/schedules_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional


class SchedulesManager:
    """
    مدير جدول schedules.
    يُدير الجداول الزمنية للحصص مع ميزة اكتشاف التعارض (القاعات، الأساتذة، الأقسام).
    """

    # التحكم في الأيام عبر Python لتجنب مشاكل الـ ENUM في قاعدة البيانات
    VALID_DAYS = ('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')

    def __init__(self, db_instance):
        self.db = db_instance

    def get_student_schedule(self, student_id: int) -> List[Dict]:
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT DISTINCT
                        s.id AS schedule_id, s.day_of_week, s.start_time, s.end_time, s.room_number,
                        sub.subject_name,
                        c.id AS class_id, c.class_name, c.level,
                        p.id AS program_id, p.program_name,
                        u.full_name AS teacher_name
                    FROM student_enrollments se
                    JOIN classes c ON se.class_id = c.id
                    JOIN programs p ON se.program_id = p.id
                    JOIN teacher_assignments ta ON ta.class_id = se.class_id
                    JOIN schedules s ON s.assignment_id = ta.id
                    JOIN subjects sub ON ta.subject_id = sub.id
                    JOIN teachers t ON ta.teacher_id = t.id
                    JOIN users u ON t.user_id = u.id
                    WHERE se.student_id = %s
                      AND se.status = 'active'
                    ORDER BY
                        FIELD(s.day_of_week, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
                        s.start_time ASC,
                        c.class_name ASC
                """
                cursor.execute(query, (student_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"Error fetching schedule for student #{student_id}: {e}")
            return []

    # ================================================================
    # SMART CONFLICT CHECK
    # ================================================================

    def _check_conflict(self, cursor, assignment_id: int, day_of_week: str, 
                        start_time: str, end_time: str, room_number: str, 
                        exclude_schedule_id: int = None) -> Optional[str]:
        """
        دالة داخلية للتحقق من التعارضات قبل الإضافة أو التعديل.
        تتحقق مما إذا كانت: القاعة محجوزة، الأستاذ مشغول، أو القسم مشغول.
        """
        # جلب بيانات التكليف الحالي لمعرفة الأستاذ والقسم
        cursor.execute("SELECT teacher_id, class_id FROM teacher_assignments WHERE id = %s", (assignment_id,))
        assignment = cursor.fetchone()
        if not assignment:
            return "Affectation introuvable."
        
        teacher_id, class_id = assignment[0], assignment[1]

        query = """
            SELECT s.id, s.room_number, ta.teacher_id, ta.class_id
            FROM schedules s
            JOIN teacher_assignments ta ON s.assignment_id = ta.id
            WHERE s.day_of_week = %s
              AND (s.start_time < %s AND s.end_time > %s)
        """
        params = [day_of_week, end_time, start_time]

        if exclude_schedule_id:
            query += " AND s.id != %s"
            params.append(exclude_schedule_id)

        cursor.execute(query, tuple(params))
        conflicts = cursor.fetchall()

        for conflict in conflicts:
            c_id, c_room, c_teacher, c_class = conflict
            if c_room == room_number and room_number:
                return f"Conflit de salle : La salle {room_number} est déjà occupée."
            if c_teacher == teacher_id:
                return "Conflit d'enseignant : L'enseignant a déjà un cours programmé à cette heure."
            if c_class == class_id:
                return "Conflit de classe : La classe a déjà un cours programmé à cette heure."
        
        return None

    # ================================================================
    # CREATE
    # ================================================================

    def add_schedule(self, assignment_id: int, day_of_week: str, 
                     start_time: str, end_time: str, room_number: str = None) -> Optional[int]:
        """
        إضافة حصة للجدول الزمني مع التحقق من عدم وجود تعارض.
        """
        if day_of_week not in self.VALID_DAYS:
            logging.error(f"❌ Jour invalide : {day_of_week}")
            return None

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                
                # التحقق من التعارضات
                conflict_msg = self._check_conflict(cursor, assignment_id, day_of_week, start_time, end_time, room_number)
                if conflict_msg:
                    logging.warning(f"⚠️ Création bloquée ({conflict_msg})")
                    return None

                query = """
                    INSERT INTO schedules (assignment_id, day_of_week, start_time, end_time, room_number)
                    VALUES (%s, %s, %s, %s, %s)
                """
                cursor.execute(query, (assignment_id, day_of_week, start_time, end_time, room_number))
                schedule_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Séance ajoutée : [{schedule_id}] {day_of_week} ({start_time}-{end_time}) en salle {room_number}")
                return schedule_id
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur ajout séance : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_class_schedule(self, class_id: int) -> List[Dict]:
        """
        جلب الجدول الزمني الأسبوعي لقسم معين (مفيد لواجهة جدول القسم).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        s.id AS schedule_id, s.day_of_week, s.start_time, s.end_time, s.room_number,
                        sub.subject_name,
                        u.full_name AS teacher_name
                    FROM schedules s
                    JOIN teacher_assignments ta ON s.assignment_id = ta.id
                    JOIN subjects sub ON ta.subject_id = sub.id
                    JOIN teachers t ON ta.teacher_id = t.id
                    JOIN users u ON t.user_id = u.id
                    WHERE ta.class_id = %s
                    ORDER BY 
                        FIELD(s.day_of_week, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
                        s.start_time ASC
                """
                cursor.execute(query, (class_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération emploi du temps (Classe #{class_id}) : {e}")
            return []

    def get_teacher_schedule(self, teacher_id: int) -> List[Dict]:
        """
        جلب الجدول الزمني الأسبوعي لأستاذ معين (مفيد للوحة تحكم الأستاذ).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        s.id AS schedule_id, s.day_of_week, s.start_time, s.end_time, s.room_number,
                        sub.subject_name,
                        c.class_name, c.level
                    FROM schedules s
                    JOIN teacher_assignments ta ON s.assignment_id = ta.id
                    JOIN subjects sub ON ta.subject_id = sub.id
                    JOIN classes c ON ta.class_id = c.id
                    WHERE ta.teacher_id = %s
                    ORDER BY 
                        FIELD(s.day_of_week, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
                        s.start_time ASC
                """
                cursor.execute(query, (teacher_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération emploi du temps (Enseignant #{teacher_id}) : {e}")
            return []

    # ================================================================
    # UPDATE
    # ================================================================

    def update_schedule(self, schedule_id: int, **kwargs) -> bool:
        """
        تحديث موعد الحصة أو القاعة. (يتضمن التحقق من التعارضات في حال تغيير الوقت/المكان).
        """
        if not kwargs:
            return False

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                
                # جلب البيانات الحالية للحصة للمقارنة في فحص التعارض
                cursor.execute("SELECT * FROM schedules WHERE id = %s", (schedule_id,))
                current = cursor.fetchone()
                if not current:
                    return False

                # دمج القيم الجديدة مع القديمة للتحقق من التعارض
                test_assign_id = kwargs.get('assignment_id', current['assignment_id'])
                test_day       = kwargs.get('day_of_week', current['day_of_week'])
                test_start     = kwargs.get('start_time', current['start_time'])
                test_end       = kwargs.get('end_time', current['end_time'])
                test_room      = kwargs.get('room_number', current['room_number'])

                if 'day_of_week' in kwargs and test_day not in self.VALID_DAYS:
                    logging.error(f"❌ Jour invalide : {test_day}")
                    return False

                # التحقق من التعارض قبل التحديث
                conflict_msg = self._check_conflict(cursor, test_assign_id, test_day, test_start, test_end, test_room, exclude_schedule_id=schedule_id)
                if conflict_msg:
                    logging.warning(f"⚠️ Mise à jour bloquée ({conflict_msg})")
                    return False

                # تنفيذ التحديث
                allowed_fields = {'assignment_id', 'day_of_week', 'start_time', 'end_time', 'room_number'}
                update_fields, params = [], []

                for key, value in kwargs.items():
                    if key in allowed_fields:
                        update_fields.append(f"{key} = %s")
                        params.append(value)

                params.append(schedule_id)
                query = f"UPDATE schedules SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
                
                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"✅ Séance #{schedule_id} mise à jour.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour séance #{schedule_id} : {e}")
            return False

    # ================================================================
    # DELETE
    # ================================================================

    def delete_schedule(self, schedule_id: int) -> tuple:
        """
        إلغاء حصة من الجدول الزمني.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM schedules WHERE id = %s", (schedule_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Séance #{schedule_id} supprimée.")
                    return True, "Séance supprimée de l'emploi du temps."
                return False, "Séance introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression séance #{schedule_id} : {e}")
            return False, f"Erreur base de données : {e}"
