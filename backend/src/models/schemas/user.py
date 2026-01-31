"""
用户相关 Schema
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class UserBase(BaseModel):
    """用户基础信息"""

    nickname: Optional[str] = Field(None, description="昵称")
    avatar: Optional[str] = Field(None, description="头像URL")


class UserCreate(UserBase):
    """创建用户"""

    openid: Optional[str] = Field(None, description="微信OpenID")
    unionid: Optional[str] = Field(None, description="微信UnionID")
    code: Optional[str] = Field(None, description="微信登录code（开发环境使用）")


class UserUpdate(BaseModel):
    """更新用户"""

    nickname: Optional[str] = Field(None, description="昵称")
    avatar: Optional[str] = Field(None, description="头像URL")
    phone: Optional[str] = Field(None, description="手机号")


class UserResponse(UserBase):
    """用户响应"""

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="用户ID")
    phone: Optional[str] = Field(None, description="手机号")
    health_beans: int = Field(..., description="健康豆")
    is_member: int = Field(..., description="是否会员")
    member_expire_at: Optional[datetime] = Field(None, description="会员过期时间")
    created_at: datetime = Field(..., description="创建时间")


class UserAssetsResponse(BaseModel):
    """用户资产响应"""

    health_beans: int = Field(..., description="健康豆")
    coupons: int = Field(default=0, description="优惠券数量")
    is_member: bool = Field(..., description="是否会员")
    member_expire_at: Optional[datetime] = Field(None, description="会员过期时间")
