"""
管理员相关 Schema
"""
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class AdminLogin(BaseModel):
    """管理员登录"""

    username: str = Field(..., min_length=1, max_length=64, description="用户名")
    password: str = Field(..., min_length=6, max_length=32, description="密码")


class AdminResponse(BaseModel):
    """管理员响应"""

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="管理员ID")
    username: str = Field(..., description="用户名")
    name: str = Field(..., description="姓名")
    status: int = Field(..., description="状态")
    created_at: datetime = Field(..., description="创建时间")


class AdminTokenResponse(BaseModel):
    """管理员Token响应"""

    token: str = Field(..., description="访问令牌")
    expires_in: int = Field(..., description="过期时间(秒)")
    admin: AdminResponse = Field(..., description="管理员信息")
