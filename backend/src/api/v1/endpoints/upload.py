"""
文件上传接口
"""
import os
import uuid
from datetime import datetime
from fastapi import APIRouter, UploadFile, File
from pathlib import Path

from src.models.schemas import ResponseSchema
from src.core.exceptions import AppException
from src.core.errors import ErrorCode

router = APIRouter(tags=["文件上传"])

# 上传目录
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# 允许的图片格式
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB


@router.post("/upload/image", response_model=ResponseSchema[dict])
async def upload_image(file: UploadFile = File(...)):
    """上传图片"""
    # 检查文件扩展名
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise AppException(
            code=ErrorCode.FILE_TYPE_ERROR,
            message=f"不支持的文件格式,仅支持: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # 检查文件大小
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise AppException(
            code=ErrorCode.FILE_TOO_LARGE,
            message=f"文件大小超过限制({MAX_FILE_SIZE / 1024 / 1024}MB)",
        )

    # 生成文件名
    date_path = datetime.now().strftime("%Y%m%d")
    filename = f"{uuid.uuid4().hex}{ext}"
    file_dir = UPLOAD_DIR / date_path
    file_dir.mkdir(parents=True, exist_ok=True)
    file_path = file_dir / filename

    # 保存文件
    with open(file_path, "wb") as f:
        f.write(contents)

    # 返回文件 URL
    url = f"/uploads/{date_path}/{filename}"
    return ResponseSchema(
        data={
            "url": url,
            "filename": file.filename,
            "size": len(contents),
        }
    )
