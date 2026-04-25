from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_teachers_manager
from database import TeachersManager

router = APIRouter(prefix="/teachers", tags=["Teachers"])

class TeacherCreate(BaseModel):
    user_id: int
    specialty: Optional[str] = None
    hire_date: Optional[str] = None

class TeacherUpdate(BaseModel):
    specialty: Optional[str] = None
    hire_date: Optional[str] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_teacher(data: TeacherCreate, manager: TeachersManager = Depends(get_teachers_manager)):
    teacher_id = manager.create_teacher(
        user_id=data.user_id, 
        specialty=data.specialty, 
        hire_date=data.hire_date
    )
    if not teacher_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create teacher. User might already be a teacher or does not exist.")
    return {"message": "Teacher created successfully.", "teacher_id": teacher_id}

@router.get("/search")
def search_teachers(keyword: str, manager: TeachersManager = Depends(get_teachers_manager)):
    if len(keyword) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Keyword must be at least 2 characters long.")
    return manager.search_teachers(keyword)

@router.get("/")
def get_all_teachers(manager: TeachersManager = Depends(get_teachers_manager)):
    return manager.get_all_teachers()

@router.get("/{teacher_id}")
def get_teacher(teacher_id: int, manager: TeachersManager = Depends(get_teachers_manager)):
    teacher = manager.get_teacher_by_id(teacher_id)
    if not teacher:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Teacher not found.")
    return teacher

@router.get("/{teacher_id}/assignments")
def get_teacher_assignments(teacher_id: int, manager: TeachersManager = Depends(get_teachers_manager)):
    return manager.get_teacher_assignments(teacher_id)

@router.put("/{teacher_id}")
def update_teacher(teacher_id: int, data: TeacherUpdate, manager: TeachersManager = Depends(get_teachers_manager)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No data provided for update.")
        
    success = manager.update_teacher(teacher_id, **update_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Failed to update. Teacher not found or data is identical.")
    return {"message": "Teacher updated successfully."}

@router.delete("/{teacher_id}")
def delete_teacher(teacher_id: int, manager: TeachersManager = Depends(get_teachers_manager)):
    success, message = manager.delete_teacher(teacher_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}