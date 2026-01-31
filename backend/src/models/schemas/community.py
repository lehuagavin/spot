"""
小区相关 Schema
"""
from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class CommunityCreate(BaseModel):
    """创建小区"""

    name: str = Field(..., min_length=1, max_length=128, description="小区名称")
    address: str = Field(..., min_length=1, max_length=256, description="详细地址")
    image: Optional[str] = Field(None, description="小区图片URL")
    latitude: Decimal = Field(..., description="纬度")
    longitude: Decimal = Field(..., description="经度")
    province: Optional[str] = Field(None, description="省份")
    city: Optional[str] = Field(None, description="城市")
    district: Optional[str] = Field(None, description="区县")


class CommunityUpdate(BaseModel):
    """更新小区"""

    name: Optional[str] = Field(None, min_length=1, max_length=128, description="小区名称")
    address: Optional[str] = Field(None, description="详细地址")
    image: Optional[str] = Field(None, description="小区图片URL")
    latitude: Optional[Decimal] = Field(None, description="纬度")
    longitude: Optional[Decimal] = Field(None, description="经度")
    province: Optional[str] = Field(None, description="省份")
    city: Optional[str] = Field(None, description="城市")
    district: Optional[str] = Field(None, description="区县")
    status: Optional[int] = Field(None, description="状态")


class CommunityResponse(BaseModel):
    """小区响应"""

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="小区ID")
    name: str = Field(..., description="小区名称")
    address: str = Field(..., description="详细地址")
    image: Optional[str] = Field(None, description="小区图片URL")
    latitude: Decimal = Field(..., description="纬度")
    longitude: Decimal = Field(..., description="经度")
    city: Optional[str] = Field(None, description="城市")
    status: int = Field(..., description="状态")
    created_at: datetime = Field(..., description="创建时间")
    distance: Optional[float] = Field(None, description="距离(米)")


class CommunityNearbyQuery(BaseModel):
    """附近小区查询"""

    latitude: Decimal = Field(..., description="纬度")
    longitude: Decimal = Field(..., description="经度")
    radius: Optional[int] = Field(10000, description="半径(米)")
