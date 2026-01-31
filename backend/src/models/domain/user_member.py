"""
用户会员记录模型
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class UserMember(Base):
    """用户会员记录表"""

    __tablename__ = "user_members"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, comment="ID")
    user_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="用户ID"
    )
    card_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("member_cards.id", ondelete="CASCADE"), nullable=False, comment="权益卡ID"
    )
    order_id: Mapped[Optional[str]] = mapped_column(
        String(32), nullable=True, comment="购买订单ID"
    )
    start_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, comment="开始时间"
    )
    expire_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, index=True, comment="过期时间"
    )
    status: Mapped[int] = mapped_column(
        Integer, default=1, comment="状态 1正常 0已过期"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now, comment="创建时间"
    )

    # 关系
    user = relationship("User", back_populates="user_members")
    card = relationship("MemberCard", back_populates="user_members")

    def __repr__(self) -> str:
        return f"<UserMember(user_id={self.user_id}, card_id={self.card_id})>"
