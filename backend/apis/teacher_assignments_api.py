from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_teacher_assignments_manager
from database import TeacherAssignmentsManager

router = APIRouter(prefix="/assignments", tags=["Teacher Assignments"])

class AssignmentCreate(BaseModel):
    teacher_id: int
    subject_id: int
    class_id: int

class AssignmentUpdate(BaseModel):
    teacher_id: Optional[int] = None
    subject_id: Optional[int] = None
    class_id: Optional[int] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_assignment(data: AssignmentCreate, manager: TeacherAssignmentsManager = Depends(get_teacher_assignments_manager)):
    assignment_id = manager.assign_teacher(
        teacher_id=data.teacher_id,
        subject_id=data.subject_id,
        class_id=data.class_id
    )
    if not assignment_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create assignment. It may already exist.")
    return {"message": "Assignment created successfully.", "assignment_id": assignment_id}

@router.get("/")
def get_all_assignments(manager: TeacherAssignmentsManager = Depends(get_teacher_assignments_manager)):
    return manager.get_all_assignments()

@router.get("/class/{class_id}")
def get_assignments_by_class(class_id: int, manager: TeacherAssignmentsManager = Depends(get_teacher_assignments_manager)):
    return manager.get_assignments_by_class(class_id)

@router.get("/teacher/{teacher_id}")
def get_assignments_by_teacher(teacher_id: int, manager: TeacherAssignmentsManager = Depends(get_teacher_assignments_manager)):
    return manager.get_assignments_by_teacher(teacher_id)

@router.put("/{assignment_id}")
def update_assignment(assignment_id: int, data: AssignmentUpdate, manager: TeacherAssignmentsManager = Depends(get_teacher_assignments_manager)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No data provided for update.")
        
    success = manager.update_assignment(assignment_id, **update_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Failed to update. Assignment not found.")
    return {"message": "Assignment updated successfully."}

@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: int, manager: TeacherAssignmentsManager = Depends(get_teacher_assignments_manager)):
    success, message = manager.delete_assignment(assignment_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}