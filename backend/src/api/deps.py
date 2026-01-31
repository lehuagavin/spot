"""
API 依赖注入
"""
from typing import Optional

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.exceptions import UnauthorizedException
from src.core.security import decode_access_token
from src.models.domain import User, Admin
from src.repositories.base import BaseRepository


async def get_current_user_id(
    authorization: Optional[str] = Header(None),
) -> str:
    """获取当前用户 ID

    Args:
        authorization: Authorization 请求头

    Returns:
        用户 ID

    Raises:
        UnauthorizedException: 认证失败
    """
    if not authorization:
        raise UnauthorizedException("缺少认证令牌")

    # 解析 Bearer Token
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise UnauthorizedException("无效的认证令牌格式")

    token = parts[1]
    payload = decode_access_token(token)

    if not payload:
        raise UnauthorizedException("无效的认证令牌")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("无效的认证令牌")

    return user_id


async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> User:
    """获取当前用户

    Args:
        user_id: 用户 ID
        db: 数据库会话

    Returns:
        用户对象

    Raises:
        UnauthorizedException: 用户不存在
    """
    user_repo = BaseRepository(User)
    user = await user_repo.get(db, user_id)

    if not user:
        raise UnauthorizedException("用户不存在")

    if user.status != 1:
        raise UnauthorizedException("用户已被禁用")

    return user


async def get_current_admin_id(
    authorization: Optional[str] = Header(None),
) -> str:
    """获取当前管理员 ID

    Args:
        authorization: Authorization 请求头

    Returns:
        管理员 ID

    Raises:
        UnauthorizedException: 认证失败
    """
    if not authorization:
        raise UnauthorizedException("缺少认证令牌")

    # 解析 Bearer Token
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise UnauthorizedException("无效的认证令牌格式")

    token = parts[1]
    payload = decode_access_token(token)

    if not payload:
        raise UnauthorizedException("无效的认证令牌")

    admin_id = payload.get("sub")
    user_type = payload.get("type")

    if not admin_id or user_type != "admin":
        raise UnauthorizedException("无效的认证令牌")

    return admin_id


async def get_current_admin(
    admin_id: str = Depends(get_current_admin_id),
    db: AsyncSession = Depends(get_db),
) -> Admin:
    """获取当前管理员

    Args:
        admin_id: 管理员 ID
        db: 数据库会话

    Returns:
        管理员对象

    Raises:
        UnauthorizedException: 管理员不存在
    """
    admin_repo = BaseRepository(Admin)
    admin = await admin_repo.get(db, admin_id)

    if not admin:
        raise UnauthorizedException("管理员不存在")

    if admin.status != 1:
        raise UnauthorizedException("管理员已被禁用")

    return admin
