"""
管理端轮播图管理接口
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from src.api.deps import get_current_admin
from src.core.database import get_db
from src.models.domain import Admin
from src.models.schemas import (
    ResponseSchema,
    BannerCreate,
    BannerUpdate,
    BannerResponse,
)
from src.services import BannerService

router = APIRouter(prefix="/admin/banners", tags=["管理端-轮播图管理"])


class BannerListResponse(BaseModel):
    """轮播图列表响应"""
    items: list[BannerResponse]
    total: int
    page: int
    page_size: int


@router.get("", response_model=ResponseSchema[BannerListResponse])
async def list_banners(
    page: int = 1,
    page_size: int = 10,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取轮播图列表"""
    service = BannerService()
    banners = await service.list_banners(db, active_only=False)
    total = len(banners)
    return ResponseSchema(data=BannerListResponse(
        items=banners,
        total=total,
        page=page,
        page_size=page_size,
    ))


@router.post("", response_model=ResponseSchema[BannerResponse])
async def create_banner(
    data: BannerCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """创建轮播图"""
    service = BannerService()
    banner = await service.create_banner(db, data)
    return ResponseSchema(data=banner)


@router.get("/{banner_id}", response_model=ResponseSchema[BannerResponse])
async def get_banner(
    banner_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取轮播图详情"""
    service = BannerService()
    banner = await service.get_banner(db, banner_id)
    return ResponseSchema(data=banner)


@router.put("/{banner_id}", response_model=ResponseSchema[BannerResponse])
async def update_banner(
    banner_id: str,
    data: BannerUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """更新轮播图"""
    service = BannerService()
    banner = await service.update_banner(db, banner_id, data)
    return ResponseSchema(data=banner)


@router.delete("/{banner_id}", response_model=ResponseSchema[bool])
async def delete_banner(
    banner_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """删除轮播图"""
    service = BannerService()
    success = await service.delete_banner(db, banner_id)
    return ResponseSchema(data=success)
