from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_notifications_manager
from database import NotificationsManager

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class NotificationCreate(BaseModel):
    user_id: int
    title: str
    message: str

class BulkNotificationCreate(BaseModel):
    user_ids: List[int]
    title: str
    message: str

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_notification(data: NotificationCreate, manager: NotificationsManager = Depends(get_notifications_manager)):
    notification_id = manager.create_notification(
        user_id=data.user_id,
        title=data.title,
        message=data.message
    )
    if not notification_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create notification.")
    return {"message": "Notification created successfully.", "notification_id": notification_id}

@router.post("/bulk", status_code=status.HTTP_201_CREATED)
def create_bulk_notifications(data: BulkNotificationCreate, manager: NotificationsManager = Depends(get_notifications_manager)):
    success = manager.create_bulk_notifications(
        user_ids=data.user_ids,
        title=data.title,
        message=data.message
    )
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to send bulk notifications.")
    return {"message": "Bulk notifications sent successfully."}

@router.get("/user/{user_id}/unread-count")
def get_unread_count(user_id: int, manager: NotificationsManager = Depends(get_notifications_manager)):
    count = manager.get_unread_count(user_id)
    return {"unread_count": count}

@router.get("/user/{user_id}")
def get_user_notifications(user_id: int, unread_only: bool = False, limit: int = 50, manager: NotificationsManager = Depends(get_notifications_manager)):
    return manager.get_user_notifications(user_id=user_id, unread_only=unread_only, limit=limit)

@router.patch("/{notification_id}/read")
def mark_as_read(notification_id: int, manager: NotificationsManager = Depends(get_notifications_manager)):
    success = manager.mark_as_read(notification_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    return {"message": "Notification marked as read."}

@router.patch("/user/{user_id}/read-all")
def mark_all_as_read(user_id: int, manager: NotificationsManager = Depends(get_notifications_manager)):
    success = manager.mark_all_as_read(user_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to mark all notifications as read.")
    return {"message": "All notifications marked as read."}

@router.delete("/old")
def delete_old_notifications(days_old: int = 30, manager: NotificationsManager = Depends(get_notifications_manager)):
    success, result = manager.delete_old_notifications(days_old=days_old)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(result))
    return {"message": f"Successfully deleted {result} old notifications."}

@router.delete("/{notification_id}")
def delete_notification(notification_id: int, manager: NotificationsManager = Depends(get_notifications_manager)):
    success, message = manager.delete_notification(notification_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
    return {"message": message}