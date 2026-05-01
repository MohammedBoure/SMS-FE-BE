from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_assessments_manager
from database import AssessmentsManager

router = APIRouter(prefix="/assessments", tags=["Assessments"])

class AssessmentCreate(BaseModel):
    title: str
    type: str
    assignment_id: int
    max_grade: float = 20.0
    due_date: Optional[str] = None

class AssessmentUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    assignment_id: Optional[int] = None
    max_grade: Optional[float] = None
    due_date: Optional[str] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_assessment(data: AssessmentCreate, manager: AssessmentsManager = Depends(get_assessments_manager)):
    assessment_id = manager.create_assessment(
        title=data.title,
        type=data.type,
        assignment_id=data.assignment_id,
        max_grade=data.max_grade,
        due_date=data.due_date
    )
    if not assessment_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create assessment.")
    return {"message": "Assessment created successfully.", "assessment_id": assessment_id}

@router.get("/")
def get_all_assessments(manager: AssessmentsManager = Depends(get_assessments_manager)):
    return manager.get_all_assessments()

@router.get("/class/{class_id}")
def get_assessments_by_class(class_id: int, manager: AssessmentsManager = Depends(get_assessments_manager)):
    return manager.get_assessments_by_class(class_id)

@router.get("/student/{student_id}")
def get_assessments_by_student(student_id: int, manager: AssessmentsManager = Depends(get_assessments_manager)):
    return manager.get_assessments_by_student(student_id)

@router.get("/assignment/{assignment_id}")
def get_assessments_by_assignment(assignment_id: int, manager: AssessmentsManager = Depends(get_assessments_manager)):
    return manager.get_assessments_by_assignment(assignment_id)

@router.get("/{assessment_id}")
def get_assessment(assessment_id: int, manager: AssessmentsManager = Depends(get_assessments_manager)):
    assessment = manager.get_assessment_by_id(assessment_id)
    if not assessment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assessment not found.")
    return assessment

@router.put("/{assessment_id}")
def update_assessment(assessment_id: int, data: AssessmentUpdate, manager: AssessmentsManager = Depends(get_assessments_manager)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No data provided for update.")
        
    success = manager.update_assessment(assessment_id, **update_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Failed to update. Assessment not found.")
    return {"message": "Assessment updated successfully."}

@router.delete("/{assessment_id}")
def delete_assessment(assessment_id: int, manager: AssessmentsManager = Depends(get_assessments_manager)):
    success, message = manager.delete_assessment(assessment_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}
