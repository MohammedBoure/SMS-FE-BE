from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_student_fees_manager
from database import StudentFeesManager

router = APIRouter(prefix="/student-fees", tags=["Student Fees"])

class FeeCreate(BaseModel):
    student_id: int
    fee_type: str
    amount_due: int
    program_id: Optional[int] = None
    applied_discount: int = 0
    due_date: Optional[str] = None
    transaction_id: Optional[int] = None

class FeeUpdate(BaseModel):
    fee_type: Optional[str] = None
    amount_due: Optional[int] = None
    applied_discount: Optional[int] = None
    due_date: Optional[str] = None
    transaction_id: Optional[int] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_fee(data: FeeCreate, manager: StudentFeesManager = Depends(get_student_fees_manager)):
    fee_id = manager.create_fee(
        student_id=data.student_id,
        fee_type=data.fee_type,
        amount_due=data.amount_due,
        program_id=data.program_id,
        applied_discount=data.applied_discount,
        due_date=data.due_date,
        transaction_id=data.transaction_id
    )
    if not fee_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="فشل في إنشاء السجل المالي.")
    return {"message": "تمت إضافة الرسوم بنجاح.", "fee_id": fee_id}

@router.get("/overdue")
def get_overdue_fees(manager: StudentFeesManager = Depends(get_student_fees_manager)):
    return manager.get_overdue_fees()

@router.get("/")
def get_all_fees(fee_type: Optional[str] = None, manager: StudentFeesManager = Depends(get_student_fees_manager)):
    return manager.get_all_fees(fee_type=fee_type)

@router.get("/student/{student_id}")
def get_student_fees(student_id: int, manager: StudentFeesManager = Depends(get_student_fees_manager)):
    return manager.get_student_fees(student_id)

@router.put("/{fee_id}")
def update_fee(fee_id: int, data: FeeUpdate, manager: StudentFeesManager = Depends(get_student_fees_manager)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="لم يتم تقديم أي بيانات للتحديث.")
        
    success = manager.update_fee(fee_id, **update_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="فشل التحديث. السجل غير موجود.")
    return {"message": "تم تحديث الرسوم بنجاح."}

@router.delete("/{fee_id}")
def delete_fee(fee_id: int, manager: StudentFeesManager = Depends(get_student_fees_manager)):
    success, message = manager.delete_fee(fee_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}