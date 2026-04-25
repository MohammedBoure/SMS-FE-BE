import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Optional

from .dependencies import get_resources_manager
from database import ResourcesManager

UPLOAD_DIR = "uploads/resources"
os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter(prefix="/resources", tags=["Resources"])

class ResourceCreate(BaseModel):
    title: str
    resource_type: str
    file_path_or_url: str
    description: Optional[str] = None
    file_size_mb: float = 0.0
    assignment_id: Optional[int] = None

class ResourceUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    resource_type: Optional[str] = None
    file_path_or_url: Optional[str] = None
    file_size_mb: Optional[float] = None
    assignment_id: Optional[int] = None

@router.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_resource(
    title: str = Form(...),
    resource_type: str = Form(...),
    description: Optional[str] = Form(None),
    assignment_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    manager: ResourcesManager = Depends(get_resources_manager)
):
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    
    resource_id = manager.create_resource(
        title=title,
        resource_type=resource_type,
        file_path_or_url=file_path,
        description=description,
        file_size_mb=round(file_size_mb, 2),
        assignment_id=assignment_id
    )
    
    if not resource_id:
        os.remove(file_path)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create resource record in database.")
        
    return {"message": "File uploaded successfully.", "resource_id": resource_id, "file_path": file_path}

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_resource_link(data: ResourceCreate, manager: ResourcesManager = Depends(get_resources_manager)):
    resource_id = manager.create_resource(**data.dict())
    if not resource_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Failed to create resource.")
    return {"message": "Resource created successfully.", "resource_id": resource_id}

@router.get("/search")
def search_resources(keyword: str, resource_type: Optional[str] = None, manager: ResourcesManager = Depends(get_resources_manager)):
    return manager.search_resources(keyword=keyword, resource_type=resource_type)

@router.get("/assignment/{assignment_id}")
def get_resources_by_assignment(assignment_id: int, manager: ResourcesManager = Depends(get_resources_manager)):
    return manager.get_resources_by_assignment(assignment_id)

@router.get("/")
def get_all_resources(manager: ResourcesManager = Depends(get_resources_manager)):
    return manager.get_all_resources()

@router.get("/{resource_id}")
def get_resource(resource_id: int, manager: ResourcesManager = Depends(get_resources_manager)):
    resource = manager.get_resource_by_id(resource_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")
    return resource

@router.get("/{resource_id}/download")
def download_resource(resource_id: int, manager: ResourcesManager = Depends(get_resources_manager)):
    resource = manager.get_resource_by_id(resource_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")
        
    file_path = resource.get("file_path_or_url")
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="File not found on the server.")
        
    return FileResponse(path=file_path, filename=os.path.basename(file_path))

@router.put("/{resource_id}")
def update_resource(resource_id: int, data: ResourceUpdate, manager: ResourcesManager = Depends(get_resources_manager)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No data provided for update.")
        
    success = manager.update_resource(resource_id, **update_data)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Failed to update. Resource not found.")
    return {"message": "Resource updated successfully."}

@router.delete("/{resource_id}")
def delete_resource(resource_id: int, manager: ResourcesManager = Depends(get_resources_manager)):
    resource = manager.get_resource_by_id(resource_id)
    if not resource:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resource not found.")

    success, message = manager.delete_resource(resource_id)
    
    if success:
        file_path = resource.get("file_path_or_url")
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass

    if not success:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)
        
    return {"message": message}