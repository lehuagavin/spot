"""
支付相关 Schema
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class PaymentPrepay(BaseModel):
    """支付预下单请求"""

    order_id: str = Field(..., description="订单ID")


class PaymentPrepayResponse(BaseModel):
    """支付预下单响应"""

    prepay_id: str = Field(..., description="预支付ID")
    timestamp: str = Field(..., description="时间戳")
    nonce_str: str = Field(..., description="随机字符串")
    sign: str = Field(..., description="签名")


class PaymentResponse(BaseModel):
    """支付记录响应"""

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="支付ID")
    order_id: str = Field(..., description="订单ID")
    transaction_id: Optional[str] = Field(None, description="微信支付单号")
    amount: Decimal = Field(..., description="支付金额")
    status: str = Field(..., description="支付状态")
    pay_time: Optional[datetime] = Field(None, description="支付时间")
    created_at: datetime = Field(..., description="创建时间")
