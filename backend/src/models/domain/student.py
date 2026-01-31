"""
学员模型
"""
from datetime import date
from typing import Optional

from sqlalchemy import String, Integer, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class Student(Base, TimestampMixin):
    """学员表"""

    __tablename__ = "students"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, comment="学员ID")
    user_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="用户ID"
    )
    id_type: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="证件类型"
    )
    id_name: Mapped[str] = mapped_column(
        String(64), nullable=False, comment="证件姓名"
    )
    id_number: Mapped[str] = mapped_column(
        String(64), nullable=False, comment="证件号码(加密)"
    )
    id_number_hash: Mapped[str] = mapped_column(
        String(64), nullable=False, index=True, comment="证件号码哈希"
    )
    photo: Mapped[Optional[str]] = mapped_column(
        String(512), nullable=True, comment="照片URL"
    )
    birthday: Mapped[date] = mapped_column(
        Date, nullable=False, comment="出生日期"
    )
    gender: Mapped[str] = mapped_column(
        String(10), nullable=False, comment="性别"
    )
    member_type: Mapped[str] = mapped_column(
        String(20), default="normal", comment="会员类型"
    )
    status: Mapped[int] = mapped_column(
        Integer, default=1, comment="状态 1正常 0禁用"
    )

    # 关系
    user = relationship("User", back_populates="students")
    course_students = relationship("CourseStudent", back_populates="student", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Student(id={self.id}, name={self.id_name})>"
