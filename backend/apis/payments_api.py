from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_payments_manager
from database import PaymentsManager

router = APIRouter(prefix="/payments", tags=["Payments"])

class PaymentCreate(BaseModel):
    fee_id: int
    amount_paid: int
    installment_number: int = 1
    transaction_id: Optional[int] = None
    receipt_number: Optional[str] = None

class PaymentUpdate(BaseModel):
    amount_paid: Optional[int] = None
    receipt_number: Optional[str] = None
    installment_number: Optional[int] = None
    transaction_id: Optional[int] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def record_payment(data: PaymentCreate, manager: PaymentsManager = Depends(get_payments_manager)):
    payment_id = manager.record_payment(
        fee_id=data.fee_id,
        amount_paid=data.amount_paid,
        installment_number=data.installment_number,
        transaction_id=data.transaction_id,
        receipt_number=data.receipt_number
    )
    if not payment_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to record payment. Check for duplicate receipt or transaction.")
    return {"message": "Payment recorded successfully.", "payment_id": payment_id}

@router.get("/")
def get_all_payments(manager: PaymentsManager = Depends(get_payments_manager)):
    return manager.get_all_payments()

@router.get("/fee/{fee_id}")
def get_payments_by_fee(fee_id: int, manager: PaymentsManager = Depends(get_payments_manager)):
    return manager.get_payments_by_fee(fee_id)

@router.get("/student/{student_id}")
def get_student_payments(student_id: int, manager: PaymentsManager = Depends(get_payments_manager)):
    return manager.get_student_payments(student_id)

@router.get("/fee/{fee_id}/balance")
def get_fee_balance(fee_id: int, manager: PaymentsManager = Depends(get_payments_manager)):
    return manager.get_fee_balance(fee_id)

@router.put("/{payment_id}")
def update_payment(payment_id: int, data: PaymentUpdate, manager: PaymentsManager = Depends(get_payments_manager)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No data provided for update.")
        
    success = manager.update_payment(payment_id, **update_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Failed to update. Payment not found.")
    return {"message": "Payment updated successfully."}

@router.delete("/{payment_id}")
def delete_payment(payment_id: int, manager: PaymentsManager = Depends(get_payments_manager)):
    success, message = manager.delete_payment(payment_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}