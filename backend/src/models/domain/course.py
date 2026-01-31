"""
课程模型
"""
from datetime import datetime, date, time
from typing import Optional
from decimal import Decimal

from sqlalchemy import String, Integer, Numeric, DateTime, Date, Time, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class Course(Base, TimestampMixin):
    """课程表"""

    __tablename__ = "courses"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, comment="课程ID")
    community_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("communities.id", ondelete="CASCADE"), nullable=False, index=True, comment="小区ID"
    )
    teacher_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("teachers.id", ondelete="CASCADE"), nullable=False, index=True, comment="教练ID"
    )
    name: Mapped[str] = mapped_column(
        String(128), nullable=False, comment="课程名称"
    )
    image: Mapped[Optional[str]] = mapped_column(
        String(512), nullable=True, comment="课程图片URL"
    )
    age_min: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="最小年龄"
    )
    age_max: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="最大年龄"
    )
    total_weeks: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="总周数"
    )
    total_lessons: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="总课时"
    )
    schedule_day: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="上课日(如:周六)"
    )
    schedule_start: Mapped[time] = mapped_column(
        Time, nullable=False, comment="开始时间"
    )
    schedule_end: Mapped[time] = mapped_column(
        Time, nullable=False, comment="结束时间"
    )
    location: Mapped[Optional[str]] = mapped_column(
        String(256), nullable=True, comment="上课地点详情"
    )
    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, comment="原价"
    )
    member_price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, comment="会员价"
    )
    min_students: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="最低开班人数"
    )
    max_students: Mapped[int] = mapped_column(
        Integer, nullable=False, comment="最大人数"
    )
    enrolled_count: Mapped[int] = mapped_column(
        Integer, default=0, comment="已报名人数"
    )
    deadline: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, index=True, comment="报名截止时间"
    )
    start_date: Mapped[Optional[date]] = mapped_column(
        Date, nullable=True, comment="开课日期"
    )
    status: Mapped[str] = mapped_column(
        String(20), default="enrolling", index=True, comment="状态"
    )

    # 关系
    community = relationship("Community", back_populates="courses")
    teacher = relationship("Teacher", back_populates="courses")
    orders = relationship("Order", back_populates="course", cascade="all, delete-orphan")
    course_students = relationship("CourseStudent", back_populates="course", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Course(id={self.id}, name={self.name})>"
