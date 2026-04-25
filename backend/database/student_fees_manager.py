# database/managers/student_fees_manager.py

import mysql.connector
import logging
from typing import List, Dict, Optional
from datetime import date


class StudentFeesManager:
    """
    مدير جدول student_fees.
    يُدير الرسوم المستحقة على الطلاب (الفواتير، الديون)، الخصومات، ومواعيد الاستحقاق.
    """

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE
    # ================================================================

    def create_fee(self, student_id: int, fee_type: str, amount_due: int, 
                   program_id: int = None, applied_discount: int = 0, 
                   due_date: str = None, transaction_id: int = None) -> Optional[int]:
        """
        إضافة رسم مستحق (فاتورة/دين) على طالب.
        """
        if not due_date:
            due_date = date.today().isoformat()

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO student_fees (
                        student_id, program_id, fee_type, amount_due, 
                        applied_discount, due_date, transaction_id
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                params = (student_id, program_id, fee_type, amount_due, 
                          applied_discount, due_date, transaction_id)
                cursor.execute(query, params)
                fee_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Frais ajouté : [{fee_id}] {amount_due} DZD pour l'étudiant #{student_id} ({fee_type})")
                return fee_id
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur ajout frais : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_all_fees(self, fee_type: str = None) -> List[Dict]:
        """
        جلب جميع الرسوم المستحقة في المدرسة مع حساب المبلغ الصافي (net_amount).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        sf.id AS fee_id, sf.fee_type, sf.amount_due, sf.applied_discount, sf.due_date,
                        (sf.amount_due - sf.applied_discount) AS net_amount,
                        s.id AS student_id, u.full_name AS student_name,
                        p.program_name, p.program_type
                    FROM student_fees sf
                    JOIN students s ON sf.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    LEFT JOIN programs p ON sf.program_id = p.id
                    WHERE 1=1
                """
                params = []

                if fee_type:
                    query += " AND sf.fee_type = %s"
                    params.append(fee_type)

                query += " ORDER BY sf.due_date DESC"
                
                cursor.execute(query, tuple(params))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération frais : {e}")
            return []

    def get_student_fees(self, student_id: int) -> List[Dict]:
        """
        جلب قائمة الرسوم الخاصة بطالب معين (كشف الديون).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        sf.id AS fee_id, sf.fee_type, sf.amount_due, sf.applied_discount, sf.due_date,
                        (sf.amount_due - sf.applied_discount) AS net_amount,
                        sf.transaction_id,
                        p.program_name
                    FROM student_fees sf
                    LEFT JOIN programs p ON sf.program_id = p.id
                    WHERE sf.student_id = %s
                    ORDER BY sf.due_date ASC
                """
                cursor.execute(query, (student_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération frais (Étudiant #{student_id}) : {e}")
            return []

    def get_overdue_fees(self) -> List[Dict]:
        """
        ميزة متقدمة: جلب الرسوم المتأخرة (التي تجاوزت تاريخ الاستحقاق).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        sf.id AS fee_id, sf.fee_type, sf.due_date, 
                        (sf.amount_due - sf.applied_discount) AS net_amount,
                        u.full_name AS student_name, u.phone
                    FROM student_fees sf
                    JOIN students s ON sf.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    WHERE sf.due_date < CURDATE()
                    ORDER BY sf.due_date ASC
                """
                cursor.execute(query)
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération frais en retard : {e}")
            return []

    # ================================================================
    # UPDATE
    # ================================================================

    def update_fee(self, fee_id: int, **kwargs) -> bool:
        """
        تحديث بيانات الرسم (مثلاً إضافة خصم، تغيير تاريخ الاستحقاق، أو ربطه بحركة مالية).
        """
        if not kwargs:
            return False

        allowed_fields = {'fee_type', 'amount_due', 'applied_discount', 'due_date', 'transaction_id'}
        update_fields = []
        params = []

        for key, value in kwargs.items():
            if key in allowed_fields:
                update_fields.append(f"{key} = %s")
                params.append(value)

        if not update_fields: 
            return False
            
        params.append(fee_id)

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = f"UPDATE student_fees SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
                
                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"✅ Frais #{fee_id} mis à jour.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour frais #{fee_id} : {e}")
            return False

    # ================================================================
    # DELETE
    # ================================================================

    def delete_fee(self, fee_id: int) -> tuple:
        """
        حذف رسم مستحق.
        تحذير: إذا كان هذا الرسم مرتبطاً بجدول المدفوعات (payments)، سيتم حذف الدفعات 
        المرتبطة به تلقائياً (بسبب ON DELETE CASCADE في جدول المدفوعات).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM student_fees WHERE id = %s", (fee_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Frais #{fee_id} supprimé.")
                    return True, "Frais supprimé avec succès."
                return False, "Frais introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression frais #{fee_id} : {e}")
            return False, f"Erreur base de données : {e}"