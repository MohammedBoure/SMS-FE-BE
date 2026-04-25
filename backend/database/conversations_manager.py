# database/conversations_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional
from datetime import datetime



class ConversationsManager:
    """
    مدير جدول conversations.
    يُغطّي العمليات الكاملة: إنشاء / تعديل / حذف / جلب / بحث.
    """

    VALID_TYPES = ('individual', 'group', 'announcement')

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE
    # ================================================================

    def create_conversation(self, title: str = None,
                            conv_type: str = 'individual') -> Optional[int]:
        """
        إنشاء محادثة جديدة.
        conv_type: 'individual' | 'group' | 'announcement'
        يُعيد id المحادثة، أو None عند الفشل.
        """
        if conv_type not in self.VALID_TYPES:
            logging.warning(f"⚠️ Type conversation invalide : '{conv_type}'. Utilisé 'individual'.")
            conv_type = 'individual'
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO conversations (title, type, created_at)
                    VALUES (%s, %s, NOW())
                """
                cursor.execute(query, (title, conv_type))
                conv_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Conversation créée : [{conv_id}] type={conv_type} titre='{title}'")
                return conv_id
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur création conversation : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_all_conversations(self, conv_type: str = None,
                              limit: int = 100) -> List[Dict]:
        """
        جلب جميع المحادثات، مع إمكانية التصفية حسب النوع.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)

                query  = "SELECT * FROM conversations WHERE 1=1"
                params = []

                if conv_type and conv_type in self.VALID_TYPES:
                    query += " AND type = %s"
                    params.append(conv_type)

                query += " ORDER BY created_at DESC LIMIT %s"
                params.append(limit)

                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération conversations : {e}")
            return []

    def get_conversation_by_id(self, conv_id: int) -> Optional[Dict]:
        """
        جلب محادثة واحدة بواسطة معرّفها.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                cursor.execute("SELECT * FROM conversations WHERE id = %s", (conv_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"❌ Erreur récupération conversation #{conv_id} : {e}")
            return None

    def search_conversations(self, keyword: str,
                             conv_type: str = None) -> List[Dict]:
        """
        البحث في المحادثات بالعنوان مع إمكانية تصفية النوع.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)

                query  = "SELECT * FROM conversations WHERE title LIKE %s"
                params = [f"%{keyword}%"]

                if conv_type and conv_type in self.VALID_TYPES:
                    query += " AND type = %s"
                    params.append(conv_type)

                query += " ORDER BY created_at DESC"
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur recherche conversations : {e}")
            return []

    def get_recent_conversations(self, days: int = 7,
                                 limit: int = 50) -> List[Dict]:
        """
        جلب المحادثات الحديثة خلال عدد الأيام المحدد.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT * FROM conversations
                    WHERE created_at >= DATE_SUB(NOW(), INTERVAL %s DAY)
                    ORDER BY created_at DESC
                    LIMIT %s
                """
                cursor.execute(query, (days, limit))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur conversations récentes : {e}")
            return []

    def get_conversations_summary(self) -> Dict:
        """
        إحصائيات سريعة: إجمالي المحادثات مُصنَّفةً حسب النوع.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT
                        COUNT(*)                                   AS total,
                        SUM(type = 'individual')                   AS individual_count,
                        SUM(type = 'group')                        AS group_count,
                        SUM(type = 'announcement')                 AS announcement_count,
                        DATE(MAX(created_at))                      AS last_created_date
                    FROM conversations
                """
                cursor.execute(query)
                row = cursor.fetchone()
                return {
                    'total':              int(row['total'] or 0),
                    'individual_count':   int(row['individual_count'] or 0),
                    'group_count':        int(row['group_count'] or 0),
                    'announcement_count': int(row['announcement_count'] or 0),
                    'last_created_date':  row['last_created_date'],
                }
        except Exception as e:
            logging.error(f"❌ Erreur statistiques conversations : {e}")
            return {
                'total': 0, 'individual_count': 0,
                'group_count': 0, 'announcement_count': 0,
                'last_created_date': None,
            }

    # ================================================================
    # UPDATE
    # ================================================================

    def update_conversation(self, conv_id: int,
                            title: str = None,
                            conv_type: str = None) -> bool:
        """
        تحديث عنوان المحادثة أو نوعها (أو كليهما).
        يُعيد True عند النجاح، False عند الفشل.
        """
        if title is None and conv_type is None:
            logging.warning("update_conversation: aucun champ à mettre à jour.")
            return False

        if conv_type and conv_type not in self.VALID_TYPES:
            logging.warning(f"⚠️ Type invalide : '{conv_type}'.")
            return False

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()

                fields, params = [], []
                if title is not None:
                    fields.append("title = %s")
                    params.append(title)
                if conv_type is not None:
                    fields.append("type = %s")
                    params.append(conv_type)

                params.append(conv_id)
                query = f"UPDATE conversations SET {', '.join(fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()

                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"✅ Conversation #{conv_id} mise à jour.")
                else:
                    logging.warning(f"⚠️ Conversation #{conv_id} introuvable.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour conversation #{conv_id} : {e}")
            return False

    # ================================================================
    # DELETE
    # ================================================================

    def delete_conversation(self, conv_id: int) -> tuple:
        """
        حذف محادثة نهائياً.
        يُعيد (True, message) عند النجاح أو (False, message) عند الفشل.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM conversations WHERE id = %s", (conv_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Conversation #{conv_id} supprimée.")
                    return True, "Conversation supprimée avec succès."
                return False, "Conversation introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression conversation #{conv_id} : {e}")
            return False, f"Erreur base de données : {e}"

    def delete_old_conversations(self, days_old: int = 365) -> tuple:
        """
        حذف دفعي للمحادثات الأقدم من عدد الأيام المحدد.
        يُعيد (True, عدد المحذوفة) أو (False, رسالة الخطأ).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    DELETE FROM conversations
                    WHERE created_at < DATE_SUB(NOW(), INTERVAL %s DAY)
                """
                cursor.execute(query, (days_old,))
                conn.commit()
                deleted = cursor.rowcount
                logging.info(f"🗑️ {deleted} anciennes conversation(s) supprimée(s) (>{days_old}j).")
                return True, deleted
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression anciennes conversations : {e}")
            return False, f"Erreur : {e}"
