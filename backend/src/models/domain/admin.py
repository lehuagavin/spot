"""
管理员模型
"""
from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base, TimestampMixin


class Admin(Base, TimestampMixin):
    """管理员表"""

    __tablename__ = "admins"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, comment="管理员ID")
    username: Mapped[str] = mapped_column(
        String(64), unique=True, nullable=False, index=True, comment="用户名"
    )
    password_hash: Mapped[str] = mapped_column(
        String(128), nullable=False, comment="密码哈希"
    )
    name: Mapped[str] = mapped_column(String(64), nullable=False, comment="姓名")
    status: Mapped[int] = mapped_column(
        Integer, default=1, comment="状态 1正常 0禁用"
    )

    def __repr__(self) -> str:
        return f"<Admin(id={self.id}, username={self.username})>"
