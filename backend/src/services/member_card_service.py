"""
会员卡服务
"""
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from src.core.exceptions import AppException
from src.core.errors import ErrorCode
from src.models.domain import MemberCard, UserMember, User
from src.models.schemas import (
    MemberCardCreate,
    MemberCardUpdate,
    MemberCardResponse,
    MemberPurchaseRequest,
    UserMemberResponse,
)
from src.repositories.base import BaseRepository
from src.utils.id_generator import generate_id


class MemberCardService:
    """会员卡服务"""

    def __init__(self):
        self.repo = BaseRepository[MemberCard](MemberCard)

    async def create_card(
        self, db: AsyncSession, data: MemberCardCreate
    ) -> MemberCardResponse:
        """创建会员卡"""
        card = await self.repo.create(
            db,
            {
                "id": generate_id(),
                "status": 1,
                **data.model_dump(),
            },
        )
        await db.refresh(card)
        return MemberCardResponse.model_validate(card)

    async def update_card(
        self, db: AsyncSession, card_id: str, data: MemberCardUpdate
    ) -> MemberCardResponse:
        """更新会员卡"""
        card = await self.repo.get(db, card_id)
        if not card:
            raise AppException(
                code=ErrorCode.MEMBER_CARD_NOT_FOUND,
                message="会员卡不存在",
            )
        await self.repo.update(db, card, data.model_dump(exclude_unset=True))
        await db.refresh(card)
        return MemberCardResponse.model_validate(card)

    async def get_card(self, db: AsyncSession, card_id: str) -> MemberCardResponse:
        """获取会员卡详情"""
        card = await self.repo.get(db, card_id)
        if not card:
            raise AppException(
                code=ErrorCode.MEMBER_CARD_NOT_FOUND,
                message="会员卡不存在",
            )
        return MemberCardResponse.model_validate(card)

    async def list_cards(self, db: AsyncSession, active_only: bool = True) -> list[MemberCardResponse]:
        """获取会员卡列表"""
        filters = {}
        if active_only:
            filters["status"] = 1

        cards = await self.repo.get_multi(db, skip=0, limit=100, **filters)
        # 按排序字段排序
        sorted_cards = sorted(cards, key=lambda x: x.sort_order)
        return [MemberCardResponse.model_validate(c) for c in sorted_cards]

    async def purchase_card(
        self, db: AsyncSession, user_id: str, data: MemberPurchaseRequest
    ) -> UserMemberResponse:
        """购买会员卡"""
        # 验证会员卡
        card = await self.repo.get(db, data.card_id)
        if not card or card.status != 1:
            raise AppException(
                code=ErrorCode.MEMBER_CARD_NOT_FOUND,
                message="会员卡不存在或已下架",
            )

        # 检查用户是否已有有效会员
        user_member_repo = BaseRepository[UserMember](UserMember)
        stmt = select(UserMember).where(
            and_(
                UserMember.user_id == user_id,
                UserMember.status == 1,
                UserMember.expire_at > datetime.now(),
            )
        )
        result = await db.execute(stmt)
        existing = result.scalars().first()

        # 计算开始和过期时间
        start_at = datetime.now()
        if existing:
            # 如果已有会员,从现有会员过期时间开始计算
            start_at = existing.expire_at

        expire_at = start_at + timedelta(days=card.duration)

        # 创建会员记录
        user_member = await user_member_repo.create(
            db,
            {
                "id": generate_id(),
                "user_id": user_id,
                "card_id": data.card_id,
                "start_at": start_at,
                "expire_at": expire_at,
                "status": 1,
            },
        )

        # 更新用户会员状态
        user_repo = BaseRepository[User](User)
        user = await user_repo.get(db, user_id)
        if user:
            await user_repo.update(
                db,
                user,
                {
                    "is_member": 1,
                    "member_expire_at": expire_at,
                },
            )

        await db.refresh(user_member)
        return UserMemberResponse.model_validate(user_member)

    async def get_user_member_status(
        self, db: AsyncSession, user_id: str
    ) -> dict:
        """获取用户会员状态"""
        stmt = select(UserMember).where(
            and_(
                UserMember.user_id == user_id,
                UserMember.status == 1,
                UserMember.expire_at > datetime.now(),
            )
        ).order_by(UserMember.expire_at.desc())
        result = await db.execute(stmt)
        active_member = result.scalars().first()

        if active_member:
            return {
                "is_member": True,
                "expire_at": active_member.expire_at,
                "card_id": active_member.card_id,
            }
        else:
            return {
                "is_member": False,
                "expire_at": None,
                "card_id": None,
            }

    async def list_user_member_records(
        self, db: AsyncSession, page: int, page_size: int
    ) -> dict:
        """获取会员购买记录(管理端)"""
        user_member_repo = BaseRepository[UserMember](UserMember)
        total = await user_member_repo.count(db)
        records = await user_member_repo.get_multi(
            db, skip=(page - 1) * page_size, limit=page_size
        )
        return {
            "items": [UserMemberResponse.model_validate(r) for r in records],
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    async def delete_card(self, db: AsyncSession, card_id: str) -> bool:
        """删除会员卡"""
        card = await self.repo.get(db, card_id)
        if not card:
            raise AppException(
                code=ErrorCode.MEMBER_CARD_NOT_FOUND,
                message="会员卡不存在",
            )
        return await self.repo.delete(db, card_id)
