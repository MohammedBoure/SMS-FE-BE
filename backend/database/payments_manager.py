# database/payments_manager.py

import mysql.connector
import logging
import time
from typing import List, Dict, Optional


class PaymentsManager:
    """
    مدير جدول payments.
    يُدير تسديدات الطلاب للرسوم (الأقساط)، استخراج الإيصالات، وحساب المبالغ المتبقية.
    """

    def __init__(self, db_instance):
        self.db = db_instance

    # ================================================================
    # CREATE
    # ================================================================

    def record_payment(self, fee_id: int, amount_paid: int, 
                       installment_number: int = 1, transaction_id: int = None, 
                       receipt_number: str = None) -> Optional[int]:
        """
        تسجيل دفعة مالية جديدة.
        إذا لم يتم تمرير رقم إيصال، سيقوم النظام بتوليد رقم فريد تلقائياً.
        """
        # توليد رقم إيصال تلقائي إذا كان فارغاً
        if not receipt_number:
            receipt_number = f"REC-{int(time.time())}-{fee_id}"

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = """
                    INSERT INTO payments (
                        fee_id, transaction_id, amount_paid, 
                        installment_number, receipt_number
                    ) VALUES (%s, %s, %s, %s, %s)
                """
                params = (fee_id, transaction_id, amount_paid, installment_number, receipt_number)
                cursor.execute(query, params)
                payment_id = cursor.lastrowid
                conn.commit()
                logging.info(f"✅ Paiement enregistré : [{payment_id}] {amount_paid} DZD (Reçu: {receipt_number})")
                return payment_id
        except mysql.connector.IntegrityError as e:
            logging.error(f"❌ Erreur d'intégrité (Reçu ou Transaction en double) : {e}")
            return None
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur enregistrement paiement : {e}")
            return None

    # ================================================================
    # READ
    # ================================================================

    def get_all_payments(self) -> List[Dict]:
        """
        جلب جميع المدفوعات مع تفاصيل الطالب ونوع الرسم.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        p.id AS payment_id, p.amount_paid, p.payment_date, 
                        p.receipt_number, p.installment_number,
                        sf.fee_type,
                        u.full_name AS student_name, u.phone
                    FROM payments p
                    JOIN student_fees sf ON p.fee_id = sf.id
                    JOIN students s ON sf.student_id = s.id
                    JOIN users u ON s.user_id = u.id
                    ORDER BY p.payment_date DESC
                """
                cursor.execute(query)
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération paiements : {e}")
            return []

    def get_payments_by_fee(self, fee_id: int) -> List[Dict]:
        """
        جلب جميع الدفعات (الأقساط) الخاصة بفاتورة/رسم معين.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = "SELECT * FROM payments WHERE fee_id = %s ORDER BY payment_date ASC"
                cursor.execute(query, (fee_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération paiements (Frais #{fee_id}) : {e}")
            return []

    def get_student_payments(self, student_id: int) -> List[Dict]:
        """
        جلب السجل الكامل لمدفوعات طالب معين (مفيد لكشف حساب الطالب).
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        p.id AS payment_id, p.amount_paid, p.payment_date, p.receipt_number,
                        sf.fee_type, sf.id AS fee_id,
                        prog.program_name
                    FROM payments p
                    JOIN student_fees sf ON p.fee_id = sf.id
                    LEFT JOIN programs prog ON sf.program_id = prog.id
                    WHERE sf.student_id = %s
                    ORDER BY p.payment_date DESC
                """
                cursor.execute(query, (student_id,))
                return cursor.fetchall()
        except Exception as e:
            logging.error(f"❌ Erreur récupération paiements (Étudiant #{student_id}) : {e}")
            return []

    # ================================================================
    # SMART CALCULATION (Balance)
    # ================================================================

    def get_fee_balance(self, fee_id: int) -> Dict:
        """
        دالة محاسبية حاسمة: تحسب كم دفع الطالب وكم تبقى عليه لهذه الفاتورة.
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor(dictionary=True)
                query = """
                    SELECT 
                        sf.id AS fee_id, 
                        sf.amount_due, 
                        sf.applied_discount,
                        (sf.amount_due - sf.applied_discount) AS net_amount,
                        COALESCE(SUM(p.amount_paid), 0) AS total_paid,
                        ((sf.amount_due - sf.applied_discount) - COALESCE(SUM(p.amount_paid), 0)) AS remaining_balance
                    FROM student_fees sf
                    LEFT JOIN payments p ON sf.fee_id = p.fee_id
                    WHERE sf.id = %s
                    GROUP BY sf.id
                """
                cursor.execute(query, (fee_id,))
                result = cursor.fetchone()
                
                # إرجاع أصفار في حال لم تكن الفاتورة موجودة لتجنب الأخطاء
                if not result:
                    return {'net_amount': 0, 'total_paid': 0, 'remaining_balance': 0}
                return result
        except Exception as e:
            logging.error(f"❌ Erreur calcul solde (Frais #{fee_id}) : {e}")
            return {'net_amount': 0, 'total_paid': 0, 'remaining_balance': 0}

    # ================================================================
    # UPDATE
    # ================================================================

    def update_payment(self, payment_id: int, **kwargs) -> bool:
        """
        تحديث بيانات الدفعة (مثل تعديل المبلغ أو رقم الإيصال في حال وجود خطأ).
        """
        if not kwargs:
            return False

        allowed_fields = {'amount_paid', 'receipt_number', 'installment_number', 'transaction_id'}
        update_fields = []
        params = []

        for key, value in kwargs.items():
            if key in allowed_fields:
                update_fields.append(f"{key} = %s")
                params.append(value)

        if not update_fields: 
            return False
            
        params.append(payment_id)

        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                query = f"UPDATE payments SET {', '.join(update_fields)} WHERE id = %s"
                cursor.execute(query, tuple(params))
                conn.commit()
                
                updated = cursor.rowcount > 0
                if updated:
                    logging.info(f"✅ Paiement #{payment_id} mis à jour.")
                return updated
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur mise à jour paiement #{payment_id} : {e}")
            return False

    # ================================================================
    # DELETE
    # ================================================================

    def delete_payment(self, payment_id: int) -> tuple:
        """
        إلغاء دفعة مسجلة. 
        """
        try:
            with self.db.get_db_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("DELETE FROM payments WHERE id = %s", (payment_id,))
                conn.commit()

                if cursor.rowcount > 0:
                    logging.info(f"🗑️ Paiement #{payment_id} supprimé.")
                    return True, "Paiement supprimé avec succès."
                return False, "Paiement introuvable."
        except mysql.connector.Error as e:
            logging.error(f"❌ Erreur suppression paiement #{payment_id} : {e}")
            return False, f"Erreur base de données : {e}"