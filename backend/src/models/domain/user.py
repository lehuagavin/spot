"""
用户模型
"""
from datetime import datetime
from typing import Optional

from sqlalchemy import String, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """用户表"""

    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, comment="用户ID")
    openid: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True, comment="微信OpenID"
    )
    unionid: Mapped[Optional[str]] = mapped_column(
        String(64), unique=True, nullable=True, index=True, comment="微信UnionID"
    )
    phone: Mapped[Optional[str]] = mapped_column(
        String(20), unique=True, nullable=True, index=True, comment="手机号"
    )
    nickname: Mapped[Optional[str]] = mapped_column(
        String(64), nullable=True, comment="昵称"
    )
    avatar: Mapped[Optional[str]] = mapped_column(
        String(512), nullable=True, comment="头像URL"
    )
    health_beans: Mapped[int] = mapped_column(
        Integer, default=0, comment="健康豆"
    )
    is_member: Mapped[int] = mapped_column(
        Integer, default=0, comment="是否会员 1是 0否"
    )
    member_expire_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="会员过期时间"
    )
    status: Mapped[int] = mapped_column(
        Integer, default=1, comment="状态 1正常 0禁用"
    )

    # 关系
    students = relationship("Student", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    user_members = relationship("UserMember", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, nickname={self.nickname})>"
