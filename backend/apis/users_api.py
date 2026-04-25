from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from .dependencies import get_users_manager
from database import UsersManager

router = APIRouter(prefix="/users", tags=["Users"])

class UserCreate(BaseModel):
    role_id: int
    username: str
    password: str
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True

class UserUpdate(BaseModel):
    role_id: Optional[int] = None
    username: Optional[str] = None
    password: Optional[str] = None
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: Optional[bool] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserStatusUpdate(BaseModel):
    is_active: bool

@router.post("/login")
def login(credentials: UserLogin, manager: UsersManager = Depends(get_users_manager)):
    user = manager.authenticate_user(credentials.username, credentials.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Error")
    if 'password' in user:
        del user['password']
    return {"message": "Success", "user": user}

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, manager: UsersManager = Depends(get_users_manager)):
    user_id = manager.create_user(**user.dict())
    if not user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error")
    return {"message": "Success", "user_id": user_id}

@router.get("/")
def get_users(role_name: Optional[str] = None, is_active: Optional[bool] = None, page: int = 1, limit: int = 50, manager: UsersManager = Depends(get_users_manager)):
    offset = (page - 1) * limit
    result = manager.get_all_users(role_name=role_name, is_active=is_active, limit=limit, offset=offset)
    for u in result["data"]:
        u.pop('password', None)
    return {"data": result["data"], "total": result["total"], "page": page, "limit": limit}

@router.get("/search")
def search_users(keyword: str, page: int = 1, limit: int = 50, manager: UsersManager = Depends(get_users_manager)):
    if len(keyword) < 2:
        raise HTTPException(status_code=400, detail="Error")
    offset = (page - 1) * limit
    result = manager.search_users(keyword, limit=limit, offset=offset)
    for u in result["data"]:
        u.pop('password', None)
    return {"data": result["data"], "total": result["total"], "page": page, "limit": limit}

@router.get("/{user_id}")
def get_user(user_id: int, manager: UsersManager = Depends(get_users_manager)):
    user = manager.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Error")
    user.pop('password', None)
    return user

@router.put("/{user_id}")
def update_user(user_id: int, user_data: UserUpdate, manager: UsersManager = Depends(get_users_manager)):
    update_data = user_data.dict(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error")
    success = manager.update_user(user_id, **update_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Error")
    return {"message": "Success"}

@router.patch("/{user_id}/status")
def change_status(user_id: int, status_data: UserStatusUpdate, manager: UsersManager = Depends(get_users_manager)):
    success = manager.change_user_status(user_id, status_data.is_active)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Error")
    return {"message": "Success"}

@router.delete("/{user_id}")
def delete_user(user_id: int, manager: UsersManager = Depends(get_users_manager)):
    success, message = manager.delete_user(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}