"""
轮播图接口
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.models.schemas import ResponseSchema, BannerResponse
from src.services import BannerService

router = APIRouter(tags=["轮播图"])


@router.get("/banners", response_model=ResponseSchema[list[BannerResponse]])
async def list_banners(
    db: AsyncSession = Depends(get_db),
):
    """获取轮播图列表"""
    service = BannerService()
    banners = await service.list_banners(db, active_only=True)
    return ResponseSchema(data=banners)
