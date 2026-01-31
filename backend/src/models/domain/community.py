"""
小区模型
"""
from typing import Optional
from decimal import Decimal

from sqlalchemy import String, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class Community(Base, TimestampMixin):
    """小区表"""

    __tablename__ = "communities"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, comment="小区ID")
    name: Mapped[str] = mapped_column(
        String(128), nullable=False, index=True, comment="小区名称"
    )
    address: Mapped[str] = mapped_column(
        String(256), nullable=False, comment="详细地址"
    )
    image: Mapped[Optional[str]] = mapped_column(
        String(512), nullable=True, comment="小区图片URL"
    )
    latitude: Mapped[Decimal] = mapped_column(
        Numeric(10, 7), nullable=False, comment="纬度"
    )
    longitude: Mapped[Decimal] = mapped_column(
        Numeric(10, 7), nullable=False, comment="经度"
    )
    province: Mapped[Optional[str]] = mapped_column(
        String(32), nullable=True, comment="省份"
    )
    city: Mapped[Optional[str]] = mapped_column(
        String(32), nullable=True, index=True, comment="城市"
    )
    district: Mapped[Optional[str]] = mapped_column(
        String(32), nullable=True, comment="区县"
    )
    status: Mapped[int] = mapped_column(
        Integer, default=1, comment="状态 1正常 0禁用"
    )

    # 关系
    courses = relationship("Course", back_populates="community", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Community(id={self.id}, name={self.name})>"
