"""
管理员认证接口
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_admin
from src.core.database import get_db
from src.models.domain import Admin
from src.models.schemas import (
    ResponseSchema,
    AdminLogin,
    AdminTokenResponse,
    AdminResponse,
)
from src.services import AdminService

router = APIRouter(prefix="/admin/auth", tags=["管理员认证"])


@router.post("/login", response_model=ResponseSchema[AdminTokenResponse])
async def admin_login(
    credentials: AdminLogin,
    db: AsyncSession = Depends(get_db),
):
    """管理员登录"""
    service = AdminService()
    result = await service.login(db, credentials)
    return ResponseSchema(data=result)


@router.post("/logout", response_model=ResponseSchema[bool])
async def admin_logout(
    current_admin: Admin = Depends(get_current_admin),
):
    """管理员登出"""
    # Token 是无状态的，客户端删除即可
    return ResponseSchema(data=True)


@router.get("/info", response_model=ResponseSchema[AdminResponse])
async def get_admin_info(
    current_admin: Admin = Depends(get_current_admin),
):
    """获取管理员信息"""
    return ResponseSchema(data=AdminResponse.model_validate(current_admin))
