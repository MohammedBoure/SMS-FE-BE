from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Dict, Optional

from .dependencies import get_grades_manager
from database import GradesManager

router = APIRouter(prefix="/grades", tags=["Grades"])

class GradeSave(BaseModel):
    student_id: int
    assessment_id: int
    grade_value: float = Field(..., ge=0, le=20)
    teacher_remarks: Optional[str] = None

@router.post("/", status_code=status.HTTP_200_OK)
def save_grade(data: GradeSave, manager: GradesManager = Depends(get_grades_manager)):
    grade_id = manager.save_grade(
        student_id=data.student_id,
        assessment_id=data.assessment_id,
        grade_value=data.grade_value,
        teacher_remarks=data.teacher_remarks
    )
    if not grade_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to save grade.")
    return {"message": "Grade saved successfully.", "grade_id": grade_id}

@router.get("/assessment/{assessment_id}")
def get_assessment_grades(assessment_id: int, manager: GradesManager = Depends(get_grades_manager)):
    return manager.get_assessment_grades(assessment_id)

@router.get("/student/{student_id}")
def get_student_grades(student_id: int, manager: GradesManager = Depends(get_grades_manager)):
    return manager.get_student_grades(student_id)

@router.get("/assessment/{assessment_id}/statistics")
def get_assessment_statistics(assessment_id: int, manager: GradesManager = Depends(get_grades_manager)):
    return manager.get_assessment_statistics(assessment_id)

@router.delete("/{grade_id}")
def delete_grade(grade_id: int, manager: GradesManager = Depends(get_grades_manager)):
    success, message = manager.delete_grade(grade_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}