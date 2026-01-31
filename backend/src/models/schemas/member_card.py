"""
会员卡相关 Schema
"""
from datetime import datetime
from decimal import Decimal
from typing import Optional, Union
from pydantic import BaseModel, Field, ConfigDict, model_validator


class MemberCardCreate(BaseModel):
    """创建会员卡

    支持多种参数格式:
    - duration 或 duration_days
    - benefits 可以是 dict 或 list
    - is_recommended 可以是 bool 或 int
    """

    name: str = Field(..., min_length=1, max_length=64, description="权益卡名称")
    type: Optional[str] = Field(None, description="卡片类型（可选）")
    duration: Optional[int] = Field(None, ge=1, description="有效天数")
    duration_days: Optional[int] = Field(None, ge=1, description="有效天数（兼容字段）")
    price: Decimal = Field(..., ge=0, description="售价")
    original_price: Optional[Decimal] = Field(None, ge=0, description="原价")
    benefits: Optional[Union[dict, list]] = Field(None, description="权益列表")
    description: Optional[str] = Field(None, description="描述")
    is_recommended: Optional[Union[bool, int]] = Field(default=0, description="是否推荐")
    sort_order: int = Field(default=0, description="排序")
    status: int = Field(default=1, description="状态")

    @model_validator(mode="after")
    def validate_fields(self):
        """处理兼容字段"""
        # 处理 duration
        if self.duration is None and self.duration_days:
            self.duration = self.duration_days
        if self.duration is None:
            self.duration = 30  # 默认30天

        # 处理 original_price
        if self.original_price is None:
            self.original_price = self.price  # 默认原价等于售价

        # 处理 benefits
        if isinstance(self.benefits, list):
            self.benefits = {"items": self.benefits}

        # 处理 is_recommended
        if isinstance(self.is_recommended, bool):
            self.is_recommended = 1 if self.is_recommended else 0

        return self


class MemberCardUpdate(BaseModel):
    """更新会员卡"""

    name: Optional[str] = Field(None, description="权益卡名称")
    type: Optional[str] = Field(None, description="卡片类型（可选）")
    duration: Optional[int] = Field(None, description="有效天数")
    duration_days: Optional[int] = Field(None, description="有效天数（兼容字段）")
    price: Optional[Decimal] = Field(None, description="售价")
    original_price: Optional[Decimal] = Field(None, description="原价")
    benefits: Optional[Union[dict, list]] = Field(None, description="权益列表")
    description: Optional[str] = Field(None, description="描述")
    is_recommended: Optional[Union[bool, int]] = Field(None, description="是否推荐")
    sort_order: Optional[int] = Field(None, description="排序")
    status: Optional[int] = Field(None, description="状态")

    @model_validator(mode="after")
    def validate_fields(self):
        """处理兼容字段"""
        if self.duration is None and self.duration_days:
            self.duration = self.duration_days
        if isinstance(self.benefits, list):
            self.benefits = {"items": self.benefits}
        if isinstance(self.is_recommended, bool):
            self.is_recommended = 1 if self.is_recommended else 0
        return self


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
