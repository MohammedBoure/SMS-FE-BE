from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_conversations_manager
from database import ConversationsManager

router = APIRouter(prefix="/conversations", tags=["Conversations"])

class ConversationCreate(BaseModel):
    title: Optional[str] = None
    conv_type: str = 'individual'

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    conv_type: Optional[str] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_conversation(data: ConversationCreate, manager: ConversationsManager = Depends(get_conversations_manager)):
    conv_id = manager.create_conversation(title=data.title, conv_type=data.conv_type)
    if not conv_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create conversation.")
    return {"message": "Conversation created successfully", "conversation_id": conv_id}

@router.get("/summary")
def get_summary(manager: ConversationsManager = Depends(get_conversations_manager)):
    return manager.get_conversations_summary()

@router.get("/search")
def search_conversations(keyword: str, conv_type: Optional[str] = None, manager: ConversationsManager = Depends(get_conversations_manager)):
    return manager.search_conversations(keyword=keyword, conv_type=conv_type)

@router.get("/recent")
def get_recent_conversations(days: int = 7, limit: int = 50, manager: ConversationsManager = Depends(get_conversations_manager)):
    return manager.get_recent_conversations(days=days, limit=limit)

@router.delete("/old")
def delete_old_conversations(days_old: int = 365, manager: ConversationsManager = Depends(get_conversations_manager)):
    success, result = manager.delete_old_conversations(days_old=days_old)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(result))
    return {"message": f"Deleted {result} old conversations successfully."}

@router.get("/")
def get_conversations(conv_type: Optional[str] = None, limit: int = 100, manager: ConversationsManager = Depends(get_conversations_manager)):
    return manager.get_all_conversations(conv_type=conv_type, limit=limit)

@router.get("/{conv_id}")
def get_conversation(conv_id: int, manager: ConversationsManager = Depends(get_conversations_manager)):
    conv = manager.get_conversation_by_id(conv_id)
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found.")
    return conv

@router.put("/{conv_id}")
def update_conversation(conv_id: int, data: ConversationUpdate, manager: ConversationsManager = Depends(get_conversations_manager)):
    if data.title is None and data.conv_type is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No data provided for update.")
        
    success = manager.update_conversation(conv_id, title=data.title, conv_type=data.conv_type)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Update failed. Conversation not found or invalid data.")
    return {"message": "Conversation updated successfully."}

@router.delete("/{conv_id}")
def delete_conversation(conv_id: int, manager: ConversationsManager = Depends(get_conversations_manager)):
    success, message = manager.delete_conversation(conv_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}