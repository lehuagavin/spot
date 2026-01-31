"""
管理端小区管理接口
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_admin
from src.core.database import get_db
from src.models.domain import Admin
from src.models.schemas import (
    ResponseSchema,
    PaginatedResponseSchema,
    CommunityCreate,
    CommunityUpdate,
    CommunityResponse,
)
from src.services import CommunityService

router = APIRouter(prefix="/admin/communities", tags=["管理端-小区管理"])


@router.get("", response_model=ResponseSchema[PaginatedResponseSchema[CommunityResponse]])
async def list_communities(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    keyword: str = Query(None, description="搜索关键词"),
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取小区列表"""
    service = CommunityService()
    result = await service.list_communities(db, page, page_size, keyword=keyword)
    return ResponseSchema(data=result)


@router.post("", response_model=ResponseSchema[CommunityResponse])
async def create_community(
    data: CommunityCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """创建小区"""
    service = CommunityService()
    community = await service.create_community(db, data)
    return ResponseSchema(data=community)


@router.get("/{community_id}", response_model=ResponseSchema[CommunityResponse])
async def get_community(
    community_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取小区详情"""
    service = CommunityService()
    community = await service.get_community(db, community_id)
    return ResponseSchema(data=community)


@router.put("/{community_id}", response_model=ResponseSchema[CommunityResponse])
async def update_community(
    community_id: str,
    data: CommunityUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """更新小区"""
    service = CommunityService()
    community = await service.update_community(db, community_id, data)
    return ResponseSchema(data=community)


@router.delete("/{community_id}", response_model=ResponseSchema[bool])
async def delete_community(
    community_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """删除小区"""
    service = CommunityService()
    success = await service.delete_community(db, community_id)
    return ResponseSchema(data=success)
