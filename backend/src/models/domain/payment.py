"""
支付记录模型
"""
from datetime import datetime
from typing import Optional
from decimal import Decimal

from sqlalchemy import String, Numeric, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class Payment(Base, TimestampMixin):
    """支付记录表"""

    __tablename__ = "payments"

    id: Mapped[str] = mapped_column(String(32), primary_key=True, comment="支付ID")
    order_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True, comment="订单ID"
    )
    transaction_id: Mapped[Optional[str]] = mapped_column(
        String(64), nullable=True, index=True, comment="微信支付交易号"
    )
    amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2), nullable=False, comment="支付金额"
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, comment="状态"
    )
    pay_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="支付时间"
    )
    refund_id: Mapped[Optional[str]] = mapped_column(
        String(64), nullable=True, comment="退款单号"
    )
    refund_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(10, 2), nullable=True, comment="退款金额"
    )
    refund_time: Mapped[Optional[datetime]] = mapped_column(
        DateTime, nullable=True, comment="退款时间"
    )
    raw_data: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="原始数据"
    )

    # 关系
    order = relationship("Order", back_populates="payments")

    def __repr__(self) -> str:
        return f"<Payment(id={self.id}, order_id={self.order_id})>"
