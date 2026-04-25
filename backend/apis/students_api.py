from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional
from .dependencies import get_students_manager
from database import StudentsManager

router = APIRouter(prefix="/students", tags=["Students"])

class StudentCreate(BaseModel):
    user_id: int
    parent_id: Optional[int] = None
    class_id: Optional[int] = None
    date_of_birth: Optional[str] = None
    registration_date: Optional[str] = None
    blood_group: Optional[str] = None
    medical_info: Optional[str] = None
    status: str = 'active'

class StudentUpdate(BaseModel):
    parent_id: Optional[int] = None
    class_id: Optional[int] = None
    date_of_birth: Optional[str] = None
    registration_date: Optional[str] = None
    blood_group: Optional[str] = None
    medical_info: Optional[str] = None
    status: Optional[str] = None

class StudentStatusUpdate(BaseModel):
    status: str

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_student(data: StudentCreate, manager: StudentsManager = Depends(get_students_manager)):
    student_id = manager.create_student(**data.dict())
    if not student_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error")
    return {"message": "Success", "student_id": student_id}

@router.get("/search")
def search_students(keyword: str, page: int = 1, limit: int = 50, manager: StudentsManager = Depends(get_students_manager)):
    if len(keyword) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error")
    offset = (page - 1) * limit
    result = manager.search_students(keyword, limit=limit, offset=offset)
    return {"data": result["data"], "total": result["total"], "page": page, "limit": limit}

@router.get("/")
def get_all_students(status: Optional[str] = None, class_id: Optional[int] = None, page: int = 1, limit: int = 50, manager: StudentsManager = Depends(get_students_manager)):
    offset = (page - 1) * limit
    result = manager.get_all_students(status=status, class_id=class_id, limit=limit, offset=offset)
    return {"data": result["data"], "total": result["total"], "page": page, "limit": limit}

@router.get("/{student_id}")
def get_student(student_id: int, manager: StudentsManager = Depends(get_students_manager)):
    student = manager.get_student_by_id(student_id)
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Error")
    return student

@router.put("/{student_id}")
def update_student(student_id: int, data: StudentUpdate, manager: StudentsManager = Depends(get_students_manager)):
    update_data = data.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error")
    success = manager.update_student(student_id, **update_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Error")
    return {"message": "Success"}

@router.patch("/{student_id}/status")
def change_status(student_id: int, data: StudentStatusUpdate, manager: StudentsManager = Depends(get_students_manager)):
    success = manager.change_student_status(student_id, data.status)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Error")
    return {"message": "Success"}

@router.delete("/{student_id}")
def delete_student(student_id: int, force: bool = False, manager: StudentsManager = Depends(get_students_manager)):
    success, message = manager.delete_student(student_id, force=force)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}