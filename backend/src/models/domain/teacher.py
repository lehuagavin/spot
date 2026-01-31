"""
教练模型
"""
from typing import Optional

from sqlalchemy import String, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class Teacher(Base, TimestampMixin):
    """教练表"""

    __tablename__ = "teachers"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, comment="教练ID")
    name: Mapped[str] = mapped_column(
        String(64), nullable=False, index=True, comment="姓名"
    )
    avatar: Mapped[Optional[str]] = mapped_column(
        String(512), nullable=True, comment="头像URL"
    )
    phone: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, comment="手机号"
    )
    intro: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="简介"
    )
    status: Mapped[int] = mapped_column(
        Integer, default=1, comment="状态 1正常 0禁用"
    )

    # 关系
    courses = relationship("Course", back_populates="teacher", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Teacher(id={self.id}, name={self.name})>"
