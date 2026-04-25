from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict

from .dependencies import get_parents_manager
from database import ParentsManager

router = APIRouter(prefix="/parents", tags=["Parents"])

class ParentCreate(BaseModel):
    user_id: int

@router.post("/", status_code=status.HTTP_201_CREATED, summary="Create a new parent profile")
def create_parent(parent_data: ParentCreate, manager: ParentsManager = Depends(get_parents_manager)):
    """
    Creates a new parent profile and links it to an existing user account.
    """
    parent_id = manager.create_parent(user_id=parent_data.user_id)
    if not parent_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to add parent. User may not exist or is already registered as a parent."
        )
    return {"message": "Parent added successfully", "parent_id": parent_id}

@router.get("/", summary="Get all parents")
def get_parents(manager: ParentsManager = Depends(get_parents_manager)):
    """
    Retrieves a list of all parents with basic information from the users table.
    """
    return manager.get_all_parents()

@router.get("/{parent_id}", summary="Get parent by ID")
def get_parent(parent_id: int, manager: ParentsManager = Depends(get_parents_manager)):
    """
    Retrieves full details for a parent based on their parent ID.
    """
    parent = manager.get_parent_by_id(parent_id)
    if not parent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Parent not found.")
    return parent

@router.get("/user/{user_id}", summary="Get parent by User ID")
def get_parent_by_user(user_id: int, manager: ParentsManager = Depends(get_parents_manager)):
    """
    Retrieves parent profile based on User ID. Useful for identifying the parent_id after login.
    """
    parent = manager.get_parent_by_user_id(user_id)
    if not parent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No parent profile found for this user.")
    return parent

@router.get("/{parent_id}/students", summary="Get parent's students (children)")
def get_parent_students(parent_id: int, manager: ParentsManager = Depends(get_parents_manager)):
    """
    Retrieves the list of students associated with this parent.
    """
    return manager.get_parent_students(parent_id)

@router.delete("/{parent_id}", summary="Delete parent role")
def delete_parent(parent_id: int, manager: ParentsManager = Depends(get_parents_manager)):
    """
    Deletes the parent record. This does not delete the user account.
    Deletion is prevented if students are still linked to this parent.
    """
    success, message = manager.delete_parent(parent_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
        
    return {"message": message}