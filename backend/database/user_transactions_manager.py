# database/managers/user_transactions_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional


class UserTransactionsManager:
    """
    مدير جدول user_transactions.
    يُدير جميع الحركات المالية في النظام (دفع رسوم، رواتب، مصاريف) 
    ويربط بين حسابين (من وإلى).
    """

    VALID_STATUSES = ('pending', 'completed', 'cancelled')

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE
    # ================================================================

    def create_transaction(self, from_user_id: int, to_user_id: int, amount: int, 
                           transaction_type: str, reference_type: str = None, 
                           reference_id: int = None, notes: str = None, 
                           status: str = 'completed') -> Optional[int]:
        """
        إنشاء حركة مالية جديدة بين مستخدمين.
        """
        if status not in self.VALID_STATUSES:
            logging.warning(f"⚠️ Statut invalide '{status}'. Remplacé par 'pending'.")
            status = 'pending'

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO user_transactions (
                        from_user_id, to_user_id, amount, transaction_type, 
                        reference_type, reference_id, notes, status
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """
                params = (from_user_id, to_user_id, amount, transaction_type, 
                          reference_type, reference_id, notes, status)
                cursor.execute(query, params)
                transaction_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Transaction créée : [{transaction_id}] {amount} DZD ({transaction_type})")
                return transaction_id
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur création transaction : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_all_transactions(self, status: str = None, transaction_type: str = None) -> List[Dict]:
        """
        جلب جميع الحركات المالية مع أسماء المرسل والمستقبل.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                
                query = """
                    SELECT 
                        t.id AS transaction_id, t.amount, t.transaction_type, 
                        t.reference_type, t.reference_id, t.status, t.created_at, t.notes,
                        u1.id AS from_user_id, u1.full_name AS from_user_name,
                        u2.id AS to_user_id, u2.full_name AS to_user_name
                    FROM user_transactions t
                    JOIN users u1 ON t.from_user_id = u1.id
                    JOIN users u2 ON t.to_user_id = u2.id
                    WHERE 1=1
                """
                params = []

                if status:
                    query += " AND t.status = %s"
                    params.append(status)
                if transaction_type:
                    query += " AND t.transaction_type = %s"
                    params.append(transaction_type)

                query += " ORDER BY t.created_at DESC"
                
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération transactions : {e}")
            return []

    def get_transaction_by_id(self, transaction_id: int) -> Optional[Dict]:
        """
        جلب تفاصيل حركة مالية معينة.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        t.*,
                        u1.full_name AS from_user_name, u1.email AS from_user_email,
                        u2.full_name AS to_user_name, u2.email AS to_user_email
                    FROM user_transactions t
                    JOIN users u1 ON t.from_user_id = u1.id
                    JOIN users u2 ON t.to_user_id = u2.id
                    WHERE t.id = %s
                """
                cursor.execute(query, (transaction_id,))
                return cursor.fetchone()
        except Exception as e:
            logging.error(f"❌ Erreur récupération transaction #{transaction_id} : {e}")
            return None

    def get_user_statement(self, user_id: int) -> List[Dict]:
        """
        جلب "كشف حساب" لمستخدم معين (جميع الحركات التي أرسلها أو استقبلها).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        t.id AS transaction_id, t.amount, t.transaction_type, t.status, t.created_at,
                        CASE 
                            WHEN t.from_user_id = %s THEN 'OUT' 
                            ELSE 'IN' 
                        END AS flow_direction,
                        u1.full_name AS from_user_name,
                        u2.full_name AS to_user_name
                    FROM user_transactions t
                    JOIN users u1 ON t.from_user_id = u1.id
                    JOIN users u2 ON t.to_user_id = u2.id
                    WHERE t.from_user_id = %s OR t.to_user_id = %s
                    ORDER BY t.created_at DESC
                """
                cursor.execute(query, (user_id, user_id, user_id))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur relevé de compte (Utilisateur #{user_id}) : {e}")
            return []

    # ================================================================
    # UPDATE
    # ================================================================

    def update_transaction_status(self, transaction_id: int, status: str, notes: str = None) -> bool:
        """
        تحديث حالة الحركة المالية (مثلاً من معلقة pending إلى مكتملة completed).
        """
        if status not in self.VALID_STATUSES:
            logging.error(f"❌ Statut de transaction invalide : {status}")
            return False

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                
                query = "UPDATE user_transactions SET status = %s"
                params = [status]
                
                if notes:
                    query += ", notes = CONCAT(IFNULL(notes, ''), '\n', %s)"
                    params.append(notes)
                    
                query += " WHERE id = %s"
                params.append(transaction_id)
                
                cursor.execute(query, tuple(params))
                conn.commit()
                
                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"✅ Transaction #{transaction_id} passée en statut : {status}")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour transaction #{transaction_id} : {e}")
            return False

    # ================================================================
    # DELETE
    # ================================================================

    def delete_transaction(self, transaction_id: int) -> tuple:
        """
        حذف حركة مالية.
        تحذير: في الأنظمة المالية يُفضل تغيير الحالة إلى 'cancelled' بدلاً من الحذف الفعلي (Soft Delete).
        ولكن هذه الدالة متوفرة لتصحيح الأخطاء.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM user_transactions WHERE id = %s", (transaction_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.warning(f"🗑️ AVERTISSEMENT : Transaction #{transaction_id} définitivement supprimée.")
                    return True, "Transaction supprimée avec succès."
                return False, "Transaction introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression transaction #{transaction_id} : {e}")
            return False, f"Erreur base de données : {e}"