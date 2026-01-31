"""
订单相关 Schema
"""
from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class OrderCreate(BaseModel):
    """创建订单"""

    course_id: str = Field(..., description="课程ID")
    student_ids: list[str] = Field(..., min_length=1, description="学员ID列表")
    coupon_id: Optional[str] = Field(None, description="优惠券ID")


class OrderResponse(BaseModel):
    """订单响应"""

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="订单ID")
    order_no: str = Field(..., description="订单号")
    user_id: str = Field(..., description="用户ID")
    course_id: str = Field(..., description="课程ID")
    total_amount: Decimal = Field(..., description="订单总额")
    discount_amount: Decimal = Field(..., description="优惠金额")
    pay_amount: Decimal = Field(..., description="实付金额")
    coupon_id: Optional[str] = Field(None, description="优惠券ID")
    status: str = Field(..., description="订单状态")
    pay_time: Optional[datetime] = Field(None, description="支付时间")
    expire_at: datetime = Field(..., description="过期时间")
    refund_time: Optional[datetime] = Field(None, description="退款时间")
    refund_amount: Optional[Decimal] = Field(None, description="退款金额")
    remark: Optional[str] = Field(None, description="备注")
    created_at: datetime = Field(..., description="创建时间")


class RefundRequest(BaseModel):
    """退款请求"""

    reason: str = Field(..., min_length=1, max_length=256, description="退款原因")
