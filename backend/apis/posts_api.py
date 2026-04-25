from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_posts_manager
from database import PostsManager

router = APIRouter(prefix="/posts", tags=["Posts"])

class PostCreate(BaseModel):
    title: str
    content: str
    user_id: int
    image: Optional[str] = None

class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    image: Optional[str] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_post(data: PostCreate, manager: PostsManager = Depends(get_posts_manager)):
    post_id = manager.create_post(
        title=data.title,
        content=data.content,
        user_id=data.user_id,
        image=data.image
    )
    if not post_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create post.")
    return {"message": "Post created successfully.", "post_id": post_id}

@router.get("/")
def get_all_posts(manager: PostsManager = Depends(get_posts_manager)):
    return manager.get_all_posts()

@router.get("/user/{user_id}")
def get_posts_by_user(user_id: int, manager: PostsManager = Depends(get_posts_manager)):
    return manager.get_posts_by_user(user_id)

@router.get("/{post_id}")
def get_post(post_id: int, manager: PostsManager = Depends(get_posts_manager)):
    post = manager.get_post_by_id(post_id)
    if not post:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Post not found.")
    return post

@router.put("/{post_id}")
def update_post(post_id: int, data: PostUpdate, manager: PostsManager = Depends(get_posts_manager)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No data provided for update.")
        
    success = manager.update_post(post_id, **update_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Failed to update. Post not found.")
    return {"message": "Post updated successfully."}

@router.delete("/{post_id}")
def delete_post(post_id: int, manager: PostsManager = Depends(get_posts_manager)):
    success, message = manager.delete_post(post_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}