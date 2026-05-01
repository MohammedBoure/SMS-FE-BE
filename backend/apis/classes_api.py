from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_classes_manager
from database import ClassesManager

router = APIRouter(prefix="/classes", tags=["Classes"])

class ClassCreate(BaseModel):
    program_id: Optional[int] = None
    class_name: str
    level: Optional[str] = None
    age_group: Optional[str] = None
    capacity: Optional[int] = None

class ClassUpdate(BaseModel):
    program_id: Optional[int] = None
    class_name: Optional[str] = None
    level: Optional[str] = None
    age_group: Optional[str] = None
    capacity: Optional[int] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def add_class(data: ClassCreate, manager: ClassesManager = Depends(get_classes_manager)):
    class_id = manager.add_class(
        class_name=data.class_name,
        level=data.level,
        age_group=data.age_group,
        capacity=data.capacity,
        program_id=data.program_id
    )
    if not class_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create class.")
    return {"message": "Class created successfully.", "class_id": class_id}

@router.get("/occupancy")
def get_classes_occupancy(manager: ClassesManager = Depends(get_classes_manager)):
    return manager.get_classes_occupancy()

@router.get("/")
def get_all_classes(level: Optional[str] = None, program_id: Optional[int] = None, manager: ClassesManager = Depends(get_classes_manager)):
    return manager.get_all_classes(level=level, program_id=program_id)

@router.get("/{class_id}")
def get_class(class_id: int, manager: ClassesManager = Depends(get_classes_manager)):
    class_data = manager.get_class_by_id(class_id)
    if not class_data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Class not found.")
    return class_data

@router.put("/{class_id}")
def update_class(class_id: int, data: ClassUpdate, manager: ClassesManager = Depends(get_classes_manager)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No data provided for update.")
        
    success = manager.update_class(class_id, **update_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Failed to update. Class not found or data is identical.")
    return {"message": "Class updated successfully."}

@router.delete("/{class_id}")
def delete_class(class_id: int, manager: ClassesManager = Depends(get_classes_manager)):
    success, message = manager.delete_class(class_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}
