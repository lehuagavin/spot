"""
会员卡接口
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.domain import User
from src.models.schemas import (
    ResponseSchema,
    MemberCardResponse,
    MemberPurchaseRequest,
    UserMemberResponse,
)
from src.services import MemberCardService

router = APIRouter(tags=["会员卡"])


@router.get("/member/cards", response_model=ResponseSchema[list[MemberCardResponse]])
async def list_member_cards(
    db: AsyncSession = Depends(get_db),
):
    """获取权益卡列表"""
    service = MemberCardService()
    cards = await service.list_cards(db, active_only=True)
    return ResponseSchema(data=cards)


@router.post("/member/purchase", response_model=ResponseSchema[UserMemberResponse])
async def purchase_member_card(
    data: MemberPurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """购买权益卡"""
    service = MemberCardService()
    result = await service.purchase_card(db, current_user.id, data)
    return ResponseSchema(data=result)


@router.get("/member/status", response_model=ResponseSchema[dict])
async def get_member_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取会员状态"""
    service = MemberCardService()
    status = await service.get_user_member_status(db, current_user.id)
    return ResponseSchema(data=status)
