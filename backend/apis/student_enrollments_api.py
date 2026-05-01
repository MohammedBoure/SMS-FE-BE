from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_student_enrollments_manager
from database import StudentEnrollmentsManager

router = APIRouter(prefix="/enrollments", tags=["Student Enrollments"])

class EnrollmentCreate(BaseModel):
    student_id: int
    program_id: int
    class_id: Optional[int] = None
    group_name: Optional[str] = None
    enrollment_date: Optional[str] = None
    status: str = 'active'
    notes: Optional[str] = None

class EnrollmentUpdate(BaseModel):
    program_id: Optional[int] = None
    class_id: Optional[int] = None
    group_name: Optional[str] = None
    enrollment_date: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class EnrollmentStatusUpdate(BaseModel):
    status: str

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_enrollment(data: EnrollmentCreate, manager: StudentEnrollmentsManager = Depends(get_student_enrollments_manager)):
    enrollment_id = manager.create_enrollment(**data.dict())
    if not enrollment_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create enrollment.")
    return {"message": "Enrollment created successfully.", "enrollment_id": enrollment_id}

@router.get("/")
def get_all_enrollments(status: Optional[str] = None, program_id: Optional[int] = None, class_id: Optional[int] = None, manager: StudentEnrollmentsManager = Depends(get_student_enrollments_manager)):
    return manager.get_all_enrollments(status=status, program_id=program_id, class_id=class_id)

@router.get("/student/{student_id}")
def get_student_enrollments(student_id: int, manager: StudentEnrollmentsManager = Depends(get_student_enrollments_manager)):
    return manager.get_student_enrollments(student_id)

@router.get("/program/{program_id}")
def get_program_enrollments(program_id: int, status: str = 'active', class_id: Optional[int] = None, manager: StudentEnrollmentsManager = Depends(get_student_enrollments_manager)):
    return manager.get_program_enrollments(program_id=program_id, status=status, class_id=class_id)

@router.get("/class/{class_id}")
def get_class_enrollments(class_id: int, status: str = 'active', manager: StudentEnrollmentsManager = Depends(get_student_enrollments_manager)):
    return manager.get_class_enrollments(class_id=class_id, status=status)

@router.put("/{enrollment_id}")
def update_enrollment(enrollment_id: int, data: EnrollmentUpdate, manager: StudentEnrollmentsManager = Depends(get_student_enrollments_manager)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No data provided for update.")
        
    success = manager.update_enrollment(enrollment_id, **update_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Failed to update. Enrollment not found or data identical.")
    return {"message": "Enrollment updated successfully."}

@router.patch("/{enrollment_id}/status")
def change_enrollment_status(enrollment_id: int, data: EnrollmentStatusUpdate, manager: StudentEnrollmentsManager = Depends(get_student_enrollments_manager)):
    success = manager.change_enrollment_status(enrollment_id, data.status)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found.")
    return {"message": f"Enrollment status changed to: {data.status}"}

@router.delete("/{enrollment_id}")
def delete_enrollment(enrollment_id: int, manager: StudentEnrollmentsManager = Depends(get_student_enrollments_manager)):
    success, message = manager.delete_enrollment(enrollment_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}
