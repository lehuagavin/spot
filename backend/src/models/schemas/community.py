"""
小区相关 Schema
"""
from datetime import datetime
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict, field_validator


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

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: Decimal) -> Decimal:
        if v < -90 or v > 90:
            raise ValueError("纬度必须在 -90 到 90 之间")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: Decimal) -> Decimal:
        if v < -180 or v > 180:
            raise ValueError("经度必须在 -180 到 180 之间")
        return v


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

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and (v < -90 or v > 90):
            raise ValueError("纬度必须在 -90 到 90 之间")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and (v < -180 or v > 180):
            raise ValueError("经度必须在 -180 到 180 之间")
        return v


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
