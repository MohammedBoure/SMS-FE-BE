import os
import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional

from .dependencies import get_resources_manager
from database import ResourcesManager

# =========================
# CONFIG
# =========================
UPLOAD_DIR = "uploads/resources"
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {".txt", ".pdf", ".png", ".jpg", ".jpeg"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

router = APIRouter(prefix="/resources", tags=["Resources"])

# =========================
# HELPERS
# =========================
def safe_filename(original_filename: str) -> str:
    ext = Path(original_filename).suffix.lower()
    return f"{uuid.uuid4().hex}{ext}"

def validate_extension(filename: str):
    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="File type not allowed")

def validate_path(file_path: str):
    real_upload_dir = os.path.realpath(UPLOAD_DIR)
    real_file_path = os.path.realpath(file_path)

    if not real_file_path.startswith(real_upload_dir):
        raise HTTPException(status_code=400, detail="Invalid file path detected")

# =========================
# MODELS
# =========================
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

# =========================
# UPLOAD
# =========================
@router.post("/upload", status_code=status.HTTP_201_CREATED)
def upload_resource(
    title: str = Form(...),
    resource_type: str = Form(...),
    description: Optional[str] = Form(None),
    assignment_id: Optional[int] = Form(None),
    file: UploadFile = File(...),
    manager: ResourcesManager = Depends(get_resources_manager)
):
    # 1. تحقق من الامتداد
    validate_extension(file.filename)

    # 2. اسم آمن
    safe_name = safe_filename(file.filename)
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    # 3. تحقق من المسار
    validate_path(file_path)

    # 4. قراءة الملف والتحقق من الحجم
    content = file.file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")

    # 5. حفظ الملف
    with open(file_path, "wb") as buffer:
        buffer.write(content)

    file_size_mb = len(content) / (1024 * 1024)

    # 6. حفظ في DB (نخزن فقط المسار النسبي)
    relative_path = os.path.join("uploads/resources", safe_name)

    resource_id = manager.create_resource(
        title=title,
        resource_type=resource_type,
        file_path_or_url=relative_path,
        description=description,
        file_size_mb=round(file_size_mb, 2),
        assignment_id=assignment_id
    )

    if not resource_id:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="Database error")

    return {
        "message": "File uploaded successfully.",
        "resource_id": resource_id,
        "file_path": relative_path
    }

# =========================
# CREATE LINK
# =========================
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_resource_link(data: ResourceCreate, manager: ResourcesManager = Depends(get_resources_manager)):
    resource_id = manager.create_resource(**data.dict())
    if not resource_id:
        raise HTTPException(status_code=400, detail="Failed to create resource.")
    return {"message": "Resource created successfully.", "resource_id": resource_id}

# =========================
# GET ALL
# =========================
@router.get("/")
def get_all_resources(manager: ResourcesManager = Depends(get_resources_manager)):
    return manager.get_all_resources()

# =========================
# GET ONE
# =========================
@router.get("/{resource_id}")
def get_resource(resource_id: int, manager: ResourcesManager = Depends(get_resources_manager)):
    resource = manager.get_resource_by_id(resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found.")
    return resource

# =========================
# DOWNLOAD (محمي)
# =========================
@router.get("/{resource_id}/download")
def download_resource(resource_id: int, manager: ResourcesManager = Depends(get_resources_manager)):
    resource = manager.get_resource_by_id(resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found.")

    file_path = resource.get("file_path_or_url")
    if not file_path:
        raise HTTPException(status_code=404, detail="File path missing")

    full_path = os.path.realpath(file_path)

    # حماية من path traversal
    validate_path(full_path)

    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(path=full_path, filename=os.path.basename(full_path))

# =========================
# UPDATE
# =========================
@router.put("/{resource_id}")
def update_resource(resource_id: int, data: ResourceUpdate, manager: ResourcesManager = Depends(get_resources_manager)):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided")

    success = manager.update_resource(resource_id, **update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Resource not found")

    return {"message": "Resource updated successfully."}

# =========================
# DELETE
# =========================
@router.delete("/{resource_id}")
def delete_resource(resource_id: int, manager: ResourcesManager = Depends(get_resources_manager)):
    resource = manager.get_resource_by_id(resource_id)
    if not resource:
        raise HTTPException(status_code=404, detail="Resource not found.")

    success, message = manager.delete_resource(resource_id)

    if success:
        file_path = resource.get("file_path_or_url")
        if file_path:
            full_path = os.path.realpath(file_path)

            # حماية
            try:
                validate_path(full_path)
                if os.path.exists(full_path):
                    os.remove(full_path)
            except Exception:
                pass

    if not success:
        raise HTTPException(status_code=400, detail=message)

    return {"message": message}