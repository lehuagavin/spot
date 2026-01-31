"""
用户信息接口
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.domain import User
from src.models.schemas import ResponseSchema, UserResponse, UserAssetsResponse
from src.services import UserService

router = APIRouter(tags=["用户信息"])


@router.get("/user/info", response_model=ResponseSchema[UserResponse])
async def get_user_info(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取用户信息"""
    service = UserService()
    user = await service.get_user_info(db, current_user.id)
    return ResponseSchema(data=user)


@router.get("/user/assets", response_model=ResponseSchema[UserAssetsResponse])
async def get_user_assets(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取用户资产"""
    service = UserService()
    assets = await service.get_user_assets(db, current_user.id)
    return ResponseSchema(data=assets)
