"""
管理端用户管理接口
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_admin
from src.core.database import get_db
from src.models.domain import Admin
from src.models.schemas import (
    ResponseSchema,
    PaginatedResponseSchema,
    UserResponse,
)
from src.services import UserService

router = APIRouter(prefix="/admin/users", tags=["管理端-用户管理"])


@router.get("", response_model=ResponseSchema[PaginatedResponseSchema[UserResponse]])
async def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取用户列表"""
    service = UserService()
    result = await service.list_users(db, page, page_size)
    return ResponseSchema(data=result)


@router.get("/{user_id}", response_model=ResponseSchema[UserResponse])
async def get_user(
    user_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取用户详情"""
    service = UserService()
    user = await service.get_user_info(db, user_id)
    return ResponseSchema(data=user)


@router.put("/{user_id}/status", response_model=ResponseSchema[UserResponse])
async def update_user_status(
    user_id: str,
    data: dict,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """更新用户状态"""
    service = UserService()
    user = await service.update_user_status(db, user_id, data.get("status", 1))
    return ResponseSchema(data=user)
