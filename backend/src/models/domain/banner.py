"""
轮播图模型
"""
from typing import Optional

from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin


class Banner(Base, TimestampMixin):
    """轮播图表"""

    __tablename__ = "banners"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, comment="ID")
    title: Mapped[Optional[str]] = mapped_column(
        String(128), nullable=True, comment="标题"
    )
    image: Mapped[str] = mapped_column(
        String(512), nullable=False, comment="图片URL"
    )
    link: Mapped[Optional[str]] = mapped_column(
        String(512), nullable=True, comment="跳转链接"
    )
    link_type: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, comment="链接类型"
    )
    sort_order: Mapped[int] = mapped_column(
        Integer, default=0, index=True, comment="排序"
    )
    status: Mapped[int] = mapped_column(
        Integer, default=1, index=True, comment="状态 1正常 0禁用"
    )

    def __repr__(self) -> str:
        return f"<Banner(id={self.id}, title={self.title})>"
