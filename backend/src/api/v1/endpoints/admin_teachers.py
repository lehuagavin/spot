"""
管理端教练管理接口
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_admin
from src.core.database import get_db
from src.models.domain import Admin
from src.models.schemas import (
    ResponseSchema,
    PaginatedResponseSchema,
    TeacherCreate,
    TeacherUpdate,
    TeacherResponse,
)
from src.services import TeacherService

router = APIRouter(prefix="/admin/teachers", tags=["管理端-教练管理"])


@router.get("", response_model=ResponseSchema[PaginatedResponseSchema[TeacherResponse]])
async def list_teachers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取教练列表"""
    service = TeacherService()
    result = await service.list_teachers(db, page, page_size)
    return ResponseSchema(data=result)


@router.post("", response_model=ResponseSchema[TeacherResponse])
async def create_teacher(
    data: TeacherCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """创建教练"""
    service = TeacherService()
    teacher = await service.create_teacher(db, data)
    return ResponseSchema(data=teacher)


@router.get("/{teacher_id}", response_model=ResponseSchema[TeacherResponse])
async def get_teacher(
    teacher_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取教练详情"""
    service = TeacherService()
    teacher = await service.get_teacher(db, teacher_id)
    return ResponseSchema(data=teacher)


@router.put("/{teacher_id}", response_model=ResponseSchema[TeacherResponse])
async def update_teacher(
    teacher_id: str,
    data: TeacherUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """更新教练"""
    service = TeacherService()
    teacher = await service.update_teacher(db, teacher_id, data)
    return ResponseSchema(data=teacher)


@router.delete("/{teacher_id}", response_model=ResponseSchema[bool])
async def delete_teacher(
    teacher_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """删除教练"""
    service = TeacherService()
    success = await service.delete_teacher(db, teacher_id)
    return ResponseSchema(data=success)
