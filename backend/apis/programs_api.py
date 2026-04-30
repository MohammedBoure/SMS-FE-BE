from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_programs_manager
from database import ProgramsManager

router = APIRouter(prefix="/programs", tags=["Programs"])

class ProgramCreate(BaseModel):
    program_name: str
    program_type: str
    price_cash: int = 0
    price_installments: int = 0

class ProgramUpdate(BaseModel):
    program_name: Optional[str] = None
    program_type: Optional[str] = None
    price_cash: Optional[int] = None
    price_installments: Optional[int] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_program(data: ProgramCreate, manager: ProgramsManager = Depends(get_programs_manager)):
    program_id = manager.create_program(
        program_name=data.program_name,
        program_type=data.program_type,
        price_cash=data.price_cash,
        price_installments=data.price_installments
    )
    if not program_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error")
    return {"message": "Success", "program_id": program_id}

@router.get("/summary")
def get_programs_summary(manager: ProgramsManager = Depends(get_programs_manager)):
    return manager.get_programs_summary()

@router.get("/search")
def search_programs(keyword: str, manager: ProgramsManager = Depends(get_programs_manager)):
    if len(keyword) < 2:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error")
    return manager.search_programs(keyword)

@router.get("/")
def get_all_programs(program_type: Optional[str] = None, manager: ProgramsManager = Depends(get_programs_manager)):
    return manager.get_all_programs(program_type=program_type)

@router.get("/{program_id}")
def get_program(program_id: int, manager: ProgramsManager = Depends(get_programs_manager)):
    program = manager.get_program_by_id(program_id)
    if not program:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Error")
    return program

@router.put("/{program_id}")
def update_program(program_id: int, data: ProgramUpdate, manager: ProgramsManager = Depends(get_programs_manager)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error")
        
    success = manager.update_program(program_id, **update_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Error")
    return {"message": "Success"}

@router.delete("/{program_id}")
def delete_program(program_id: int, manager: ProgramsManager = Depends(get_programs_manager)):
    success, message = manager.delete_program(program_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}