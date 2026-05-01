from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_schedules_manager
from database import SchedulesManager

router = APIRouter(prefix="/schedules", tags=["Schedules"])

class ScheduleCreate(BaseModel):
    assignment_id: int
    day_of_week: str
    start_time: str
    end_time: str
    room_number: Optional[str] = None

class ScheduleUpdate(BaseModel):
    assignment_id: Optional[int] = None
    day_of_week: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    room_number: Optional[str] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def add_schedule(data: ScheduleCreate, manager: SchedulesManager = Depends(get_schedules_manager)):
    schedule_id = manager.add_schedule(
        assignment_id=data.assignment_id,
        day_of_week=data.day_of_week,
        start_time=data.start_time,
        end_time=data.end_time,
        room_number=data.room_number
    )
    if not schedule_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create schedule. There might be a conflict or invalid day.")
    return {"message": "Schedule created successfully.", "schedule_id": schedule_id}

@router.get("/class/{class_id}")
def get_class_schedule(class_id: int, manager: SchedulesManager = Depends(get_schedules_manager)):
    return manager.get_class_schedule(class_id)

@router.get("/teacher/{teacher_id}")
def get_teacher_schedule(teacher_id: int, manager: SchedulesManager = Depends(get_schedules_manager)):
    return manager.get_teacher_schedule(teacher_id)

@router.get("/student/{student_id}")
def get_student_schedule(student_id: int, manager: SchedulesManager = Depends(get_schedules_manager)):
    return manager.get_student_schedule(student_id)

@router.put("/{schedule_id}")
def update_schedule(schedule_id: int, data: ScheduleUpdate, manager: SchedulesManager = Depends(get_schedules_manager)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No data provided for update.")
        
    success = manager.update_schedule(schedule_id, **update_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to update schedule. It may not exist or there is a scheduling conflict.")
    return {"message": "Schedule updated successfully."}

@router.delete("/{schedule_id}")
def delete_schedule(schedule_id: int, manager: SchedulesManager = Depends(get_schedules_manager)):
    success, message = manager.delete_schedule(schedule_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}
