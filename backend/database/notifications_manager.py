# database/notifications_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional


class NotificationsManager:
    """
    مدير جدول notifications.
    يُدير إرسال الإشعارات للمستخدمين، قراءتها، وتنظيف الإشعارات القديمة.
    """

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE
    # ================================================================

    def create_notification(self, user_id: int, title: str, message: str) -> Optional[int]:
        """
        إرسال إشعار لمستخدم واحد.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO notifications (user_id, title, message)
                    VALUES (%s, %s, %s)
                """
                cursor.execute(query, (user_id, title, message))
                notification_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Notification envoyée à l'utilisateur #{user_id} : '{title}'")
                return notification_id
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur envoi notification : {e}")
            return None

    def create_bulk_notifications(self, user_ids: List[int], title: str, message: str) -> bool:
        """
        إرسال إشعار جماعي لقائمة من المستخدمين (مثال: إشعار لجميع طلاب قسم).
        """
        if not user_ids:
            return False

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = "INSERT INTO notifications (user_id, title, message) VALUES (%s, %s, %s)"
                # تحضير البيانات للإدخال الدفعي (Batch Insert)
                data = [(uid, title, message) for uid in user_ids]
                
                cursor.executemany(query, data)
                conn.commit()
                logging.info(f"✅ {cursor.rowcount} notifications de masse envoyées. Titre : '{title}'")
                return True
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur envoi notifications de masse : {e}")
            return False

    # ================================================================
    # READ
    # ================================================================

    def get_user_notifications(self, user_id: int, unread_only: bool = False, limit: int = 50) -> List[Dict]:
        """
        جلب إشعارات مستخدم معين (مرتبة من الأحدث للأقدم).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = "SELECT * FROM notifications WHERE user_id = %s"
                params = [user_id]

                if unread_only:
                    query += " AND is_read = FALSE"

                query += " ORDER BY created_at DESC LIMIT %s"
                params.append(limit)

                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération notifications (Utilisateur #{user_id}) : {e}")
            return []

    def get_unread_count(self, user_id: int) -> int:
        """
        جلب عدد الإشعارات غير المقروءة (مفيد لواجهة المستخدم Badge).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = "SELECT COUNT(*) FROM notifications WHERE user_id = %s AND is_read = FALSE"
                cursor.execute(query, (user_id,))
                return cursor.fetchone()[0]
        except Exception as e:
            logging.error(f"❌ Erreur comptage notifications non lues : {e}")
            return 0

    # ================================================================
    # UPDATE
    # ================================================================

    def mark_as_read(self, notification_id: int) -> bool:
        """
        تحديد إشعار واحد كمقروء.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("UPDATE notifications SET is_read = TRUE WHERE id = %s", (notification_id,))
                conn.commit()
                return cursor.rowcount > 0
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur marquage notification #{notification_id} comme lue : {e}")
            return False

    def mark_all_as_read(self, user_id: int) -> bool:
        """
        تحديد جميع إشعارات المستخدم كمقروءة دفعة واحدة.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("UPDATE notifications SET is_read = TRUE WHERE user_id = %s AND is_read = FALSE", (user_id,))
                conn.commit()
                
                updated = cursor.rowcount
                if updated > 0:
                    logging.info(f"✅ {updated} notifications marquées comme lues pour l'utilisateur #{user_id}.")
                return True
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur marquage toutes notifications comme lues (Utilisateur #{user_id}) : {e}")
            return False

    # ================================================================
    # DELETE
    # ================================================================

    def delete_notification(self, notification_id: int) -> tuple:
        """
        حذف إشعار محدد.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM notifications WHERE id = %s", (notification_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    return True, "Notification supprimée."
                return False, "Notification introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression notification #{notification_id} : {e}")
            return False, f"Erreur base de données : {e}"

    def delete_old_notifications(self, days_old: int = 30) -> tuple:
        """
        تنظيف قاعدة البيانات بحذف الإشعارات المقروءة والقديمة (مثلاً أقدم من 30 يوماً).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    DELETE FROM notifications 
                    WHERE is_read = TRUE 
                    AND created_at < DATE_SUB(NOW(), INTERVAL %s DAY)
                """
                cursor.execute(query, (days_old,))
                conn.commit()
                
                deleted = cursor.rowcount
                logging.info(f"🗑️ Nettoyage : {deleted} anciennes notifications supprimées.")
                return True, deleted
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur nettoyage anciennes notifications : {e}")
            return False, f"Erreur : {e}"