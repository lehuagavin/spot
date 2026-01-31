"""
会员卡相关 Schema
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class MemberCardCreate(BaseModel):
    """创建会员卡"""

    name: str = Field(..., min_length=1, max_length=64, description="权益卡名称")
    duration: int = Field(..., ge=1, description="有效天数")
    price: Decimal = Field(..., ge=0, description="售价")
    original_price: Decimal = Field(..., ge=0, description="原价")
    benefits: Optional[dict] = Field(None, description="权益列表")
    is_recommended: int = Field(default=0, description="是否推荐")
    sort_order: int = Field(default=0, description="排序")


class MemberCardUpdate(BaseModel):
    """更新会员卡"""

    name: Optional[str] = Field(None, description="权益卡名称")
    duration: Optional[int] = Field(None, description="有效天数")
    price: Optional[Decimal] = Field(None, description="售价")
    original_price: Optional[Decimal] = Field(None, description="原价")
    benefits: Optional[dict] = Field(None, description="权益列表")
    is_recommended: Optional[int] = Field(None, description="是否推荐")
    sort_order: Optional[int] = Field(None, description="排序")
    status: Optional[int] = Field(None, description="状态")


class MemberCardResponse(BaseModel):
    """会员卡响应"""

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="权益卡ID")
    name: str = Field(..., description="权益卡名称")
    duration: int = Field(..., description="有效天数")
    price: Decimal = Field(..., description="售价")
    original_price: Decimal = Field(..., description="原价")
    benefits: Optional[dict] = Field(None, description="权益列表")
    is_recommended: int = Field(..., description="是否推荐")
    sort_order: int = Field(..., description="排序")
    status: int = Field(..., description="状态 1启用 0禁用")
    created_at: datetime = Field(..., description="创建时间")


class MemberPurchaseRequest(BaseModel):
    """购买会员卡请求"""

    card_id: str = Field(..., description="权益卡ID")


class UserMemberResponse(BaseModel):
    """用户会员响应"""

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="记录ID")
    user_id: str = Field(..., description="用户ID")
    card_id: str = Field(..., description="权益卡ID")
    start_at: datetime = Field(..., description="开始时间")
    expire_at: datetime = Field(..., description="过期时间")
    status: int = Field(..., description="状态 1正常 0已过期")
    created_at: datetime = Field(..., description="购买时间")
