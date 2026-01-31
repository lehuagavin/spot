"""
权益卡模型
"""
from typing import Optional
from decimal import Decimal

from sqlalchemy import String, Integer, Numeric, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class MemberCard(Base, TimestampMixin):
    """权益卡表"""

    __tablename__ = "member_cards"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, comment="卡ID")
    name: Mapped[str] = mapped_column(
        String(64), nullable=False, comment="卡名称"
    )
    duration: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="有效天数"
    )
    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, comment="售价"
    )
    original_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, comment="原价"
    )
    benefits: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="权益列表"
    )
    is_recommended: Mapped[int] = mapped_column(
        Integer, default=0, comment="是否推荐 1是 0否"
    )
    sort_order: Mapped[int] = mapped_column(
        Integer, default=0, index=True, comment="排序"
    )
    status: Mapped[int] = mapped_column(
        Integer, default=1, index=True, comment="状态 1正常 0禁用"
    )

    # 关系
    user_members = relationship("UserMember", back_populates="card", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<MemberCard(id={self.id}, name={self.name})>"
