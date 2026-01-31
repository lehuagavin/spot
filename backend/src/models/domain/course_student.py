"""
课程学员关联模型
"""
from decimal import Decimal

from sqlalchemy import String, Numeric, Integer, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from .base import Base


class CourseStudent(Base):
    """课程学员关联表"""

    __tablename__ = "course_students"
    __table_args__ = (
        UniqueConstraint('course_id', 'student_id', name='uk_course_student'),
    )

    id: Mapped[str] = mapped_column(String(32), primary_key=True, comment="ID")
    course_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True, comment="课程ID"
    )
    student_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, index=True, comment="学员ID"
    )
    order_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True, comment="订单ID"
    )
    price: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, comment="单价"
    )
    is_new_user: Mapped[int] = mapped_column(
        Integer, default=0, comment="是否新人价 1是 0否"
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="状态"
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, default=datetime.now, comment="创建时间"
    )

    # 关系
    course = relationship("Course", back_populates="course_students")
    student = relationship("Student", back_populates="course_students")
    order = relationship("Order", back_populates="course_students")

    def __repr__(self) -> str:
        return f"<CourseStudent(course_id={self.course_id}, student_id={self.student_id})>"
