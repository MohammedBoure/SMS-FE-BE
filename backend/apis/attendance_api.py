from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_attendance_manager
from database import AttendanceManager

router = APIRouter(prefix="/attendance", tags=["Attendance"])

class AttendanceSave(BaseModel):
    student_id: int
    class_id: Optional[int] = None
    target_date: str
    status: str
    is_justified: bool = False
    justification_reason: Optional[str] = None

class JustificationUpdate(BaseModel):
    is_justified: bool
    justification_reason: Optional[str] = None

@router.post("/", status_code=status.HTTP_200_OK)
def save_attendance(data: AttendanceSave, manager: AttendanceManager = Depends(get_attendance_manager)):
    attendance_id = manager.save_attendance(
        student_id=data.student_id,
        class_id=data.class_id,
        target_date=data.target_date,
        status=data.status,
        is_justified=data.is_justified,
        justification_reason=data.justification_reason
    )
    if not attendance_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to save attendance record.")
    return {"message": "Attendance record saved successfully.", "attendance_id": attendance_id}

@router.get("/class/{class_id}/sheet")
def get_class_attendance_sheet(class_id: int, target_date: str, manager: AttendanceManager = Depends(get_attendance_manager)):
    return manager.get_class_attendance_sheet(class_id=class_id, target_date=target_date)

@router.get("/student/{student_id}")
def get_student_attendance(student_id: int, start_date: Optional[str] = None, end_date: Optional[str] = None, class_id: Optional[int] = None, manager: AttendanceManager = Depends(get_attendance_manager)):
    return manager.get_student_attendance(student_id=student_id, start_date=start_date, end_date=end_date, class_id=class_id)

@router.get("/student/{student_id}/statistics")
def get_attendance_statistics(student_id: int, class_id: Optional[int] = None, manager: AttendanceManager = Depends(get_attendance_manager)):
    return manager.get_attendance_statistics(student_id, class_id=class_id)

@router.patch("/{attendance_id}/justification")
def update_justification(attendance_id: int, data: JustificationUpdate, manager: AttendanceManager = Depends(get_attendance_manager)):
    success = manager.update_justification(
        attendance_id=attendance_id,
        is_justified=data.is_justified,
        justification_reason=data.justification_reason
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found.")
    return {"message": "Justification updated successfully."}

@router.delete("/{attendance_id}")
def delete_attendance(attendance_id: int, manager: AttendanceManager = Depends(get_attendance_manager)):
    success, message = manager.delete_attendance(attendance_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}
