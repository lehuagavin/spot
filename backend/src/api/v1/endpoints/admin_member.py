"""
管理端会员卡管理接口
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_admin
from src.core.database import get_db
from src.models.domain import Admin
from src.models.schemas import (
    ResponseSchema,
    PaginatedResponseSchema,
    MemberCardCreate,
    MemberCardUpdate,
    MemberCardResponse,
    UserMemberResponse,
)
from src.services import MemberCardService

router = APIRouter(prefix="/admin/member", tags=["管理端-会员管理"])


@router.get("/cards", response_model=ResponseSchema[list[MemberCardResponse]])
async def list_cards(
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取权益卡列表"""
    service = MemberCardService()
    cards = await service.list_cards(db, active_only=False)
    return ResponseSchema(data=cards)


@router.post("/cards", response_model=ResponseSchema[MemberCardResponse])
async def create_card(
    data: MemberCardCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """创建权益卡"""
    service = MemberCardService()
    card = await service.create_card(db, data)
    return ResponseSchema(data=card)


@router.get("/cards/{card_id}", response_model=ResponseSchema[MemberCardResponse])
async def get_card(
    card_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取权益卡详情"""
    service = MemberCardService()
    card = await service.get_card(db, card_id)
    return ResponseSchema(data=card)


@router.put("/cards/{card_id}", response_model=ResponseSchema[MemberCardResponse])
async def update_card(
    card_id: str,
    data: MemberCardUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """更新权益卡"""
    service = MemberCardService()
    card = await service.update_card(db, card_id, data)
    return ResponseSchema(data=card)


@router.delete("/cards/{card_id}", response_model=ResponseSchema[bool])
async def delete_card(
    card_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """删除权益卡"""
    service = MemberCardService()
    success = await service.delete_card(db, card_id)
    return ResponseSchema(data=success)


@router.get("/records", response_model=ResponseSchema[PaginatedResponseSchema[UserMemberResponse]])
async def list_member_records(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取会员购买记录"""
    service = MemberCardService()
    result = await service.list_user_member_records(db, page, page_size)
    return ResponseSchema(data=result)
