"""
小区管理接口
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.models.schemas import (
    ResponseSchema,
    PaginatedResponseSchema,
    CommunityResponse,
    CommunityNearbyQuery,
)
from src.services import CommunityService

router = APIRouter(tags=["小区管理"])


@router.get("/communities", response_model=ResponseSchema[PaginatedResponseSchema[CommunityResponse]])
async def list_communities(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    keyword: str = Query(None, description="搜索关键词"),
    db: AsyncSession = Depends(get_db),
):
    """获取小区列表"""
    service = CommunityService()
    result = await service.list_communities(db, page, page_size, keyword=keyword)
    return ResponseSchema(data=result)


@router.get("/communities/nearby", response_model=ResponseSchema[list[CommunityResponse]])
async def get_nearby_communities(
    latitude: float = Query(..., ge=-90, le=90, description="纬度"),
    longitude: float = Query(..., ge=-180, le=180, description="经度"),
    radius: int = Query(10000, ge=1, le=100000, description="半径(米)"),
    db: AsyncSession = Depends(get_db),
):
    """获取附近小区"""
    from decimal import Decimal

    query = CommunityNearbyQuery(
        latitude=Decimal(str(latitude)),
        longitude=Decimal(str(longitude)),
        radius=radius,
    )
    service = CommunityService()
    communities = await service.get_nearby_communities(db, query)
    return ResponseSchema(data=communities)


@router.get("/communities/{community_id}", response_model=ResponseSchema[CommunityResponse])
async def get_community(
    community_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取小区详情"""
    service = CommunityService()
    community = await service.get_community(db, community_id)
    return ResponseSchema(data=community)
