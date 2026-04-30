from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import List, Dict, Optional
import json

from .dependencies import get_messages_manager
from database import MessagesManager

router = APIRouter(prefix="/messages", tags=["Messages"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            await websocket.send_json(message)

ws_manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int, db_manager: MessagesManager = Depends(get_messages_manager)):
    await ws_manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            receiver_id = message_data.get("receiver_id")
            content = message_data.get("content")

            if receiver_id and content:
                msg_id = db_manager.send_message(sender_id=user_id, receiver_id=receiver_id, content=content)
                if msg_id:
                    payload = {
                        "id": msg_id,
                        "sender_id": user_id,
                        "receiver_id": receiver_id,
                        "content": content,
                        "status": "new_message"
                    }
                    await ws_manager.send_personal_message(payload, receiver_id)
                    await ws_manager.send_personal_message({"status": "sent", "message_id": msg_id}, user_id)
    except WebSocketDisconnect:
        ws_manager.disconnect(user_id)
    except Exception as e:
        ws_manager.disconnect(user_id)

class MessageUpdate(BaseModel):
    content: str

class MessageCreate(BaseModel):
    sender_id: int
    receiver_id: int
    content: str

@router.post("/", status_code=status.HTTP_201_CREATED)
def send_message(data: MessageCreate, manager: MessagesManager = Depends(get_messages_manager)):
    msg_id = manager.send_message(
        sender_id=data.sender_id,
        receiver_id=data.receiver_id,
        content=data.content
    )
    if not msg_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to send message.")
    return {"message": "Message sent successfully.", "message_id": msg_id}

@router.get("/conversation/{user1_id}/{user2_id}")
def get_conversation(user1_id: int, user2_id: int, manager: MessagesManager = Depends(get_messages_manager)):
    return manager.get_conversation(user1_id, user2_id)

@router.get("/inbox/{user_id}")
def get_inbox(user_id: int, manager: MessagesManager = Depends(get_messages_manager)):
    return manager.get_user_inbox(user_id)

@router.put("/{message_id}")
def update_message(message_id: int, data: MessageUpdate, manager: MessagesManager = Depends(get_messages_manager)):
    success = manager.update_message(message_id, data.content)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found.")
    return {"message": "Message updated successfully."}

@router.delete("/{message_id}")
def delete_message(message_id: int, manager: MessagesManager = Depends(get_messages_manager)):
    success, msg = manager.delete_message(message_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=msg)
    return {"message": msg}
