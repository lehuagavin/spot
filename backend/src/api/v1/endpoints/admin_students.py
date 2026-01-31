"""
管理端学员管理接口
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_admin
from src.core.database import get_db
from src.models.domain import Admin
from src.models.schemas import (
    ResponseSchema,
    PaginatedResponseSchema,
    StudentResponse,
)
from src.repositories.base import BaseRepository
from src.models.domain import Student

router = APIRouter(prefix="/admin/students", tags=["管理端-学员管理"])


@router.get("", response_model=ResponseSchema[PaginatedResponseSchema[StudentResponse]])
async def list_students(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取学员列表"""
    repo = BaseRepository[Student](Student)
    total = await repo.count(db)
    students = await repo.get_multi(db, skip=(page - 1) * page_size, limit=page_size)
    return ResponseSchema(
        data={
            "items": [StudentResponse.model_validate(s) for s in students],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    )


@router.get("/{student_id}", response_model=ResponseSchema[StudentResponse])
async def get_student(
    student_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取学员详情"""
    from src.core.exceptions import AppException
    from src.core.errors import ErrorCode

    repo = BaseRepository[Student](Student)
    student = await repo.get(db, student_id)
    if not student:
        raise AppException(
            code=ErrorCode.STUDENT_NOT_FOUND,
            message="学员不存在",
        )
    return ResponseSchema(data=StudentResponse.model_validate(student))
