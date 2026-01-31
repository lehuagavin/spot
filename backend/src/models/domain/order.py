"""
订单模型
"""
from datetime import datetime
from typing import Optional
from decimal import Decimal

from sqlalchemy import String, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class Order(Base, TimestampMixin):
    """订单表"""

    __tablename__ = "orders"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, comment="订单ID")
    order_no: Mapped[str] = mapped_column(
        String(32), unique=True, nullable=False, index=True, comment="订单号"
    )
    user_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True, comment="用户ID"
    )
    course_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True, comment="课程ID"
    )
    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, comment="订单总额"
    )
    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), default=0.00, comment="优惠金额"
    )
    pay_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, comment="实付金额"
    )
    coupon_id: Mapped[Optional[str]] = mapped_column(
        String(32), nullable=True, comment="优惠券ID"
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, index=True, comment="订单状态"
    )
    pay_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="支付时间"
    )
    expire_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, comment="过期时间"
    )
    refund_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="退款时间"
    )
    refund_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2), nullable=True, comment="退款金额"
    )
    remark: Mapped[Optional[str]] = mapped_column(
        String(256), nullable=True, comment="备注"
    )

    # 关系
    user = relationship("User", back_populates="orders")
    course = relationship("Course", back_populates="orders")
    course_students = relationship("CourseStudent", back_populates="order", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="order", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Order(id={self.id}, order_no={self.order_no})>"
