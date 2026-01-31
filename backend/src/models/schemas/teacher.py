"""
教练相关 Schema
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TeacherCreate(BaseModel):
    """创建教练"""

    name: str = Field(..., min_length=1, max_length=64, description="姓名")
    avatar: Optional[str] = Field(None, description="头像URL")
    phone: Optional[str] = Field(None, description="手机号")
    intro: Optional[str] = Field(None, description="简介")


class TeacherUpdate(BaseModel):
    """更新教练"""

    name: Optional[str] = Field(None, description="姓名")
    avatar: Optional[str] = Field(None, description="头像URL")
    phone: Optional[str] = Field(None, description="手机号")
    intro: Optional[str] = Field(None, description="简介")
    status: Optional[int] = Field(None, description="状态")


class TeacherResponse(BaseModel):
    """教练响应"""

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="教练ID")
    name: str = Field(..., description="姓名")
    avatar: Optional[str] = Field(None, description="头像URL")
    phone: Optional[str] = Field(None, description="手机号")
    intro: Optional[str] = Field(None, description="简介")
    status: int = Field(..., description="状态 1正常 0禁用")
    created_at: datetime = Field(..., description="创建时间")
