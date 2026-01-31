"""
学员相关 Schema
"""
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class StudentCreate(BaseModel):
    """创建学员"""

    id_type: str = Field(default="身份证", description="证件类型")
    id_name: str = Field(..., min_length=1, max_length=64, description="证件姓名")
    id_number: str = Field(..., description="证件号码")
    photo: Optional[str] = Field(None, description="照片URL")
    birthday: date = Field(..., description="出生日期")
    gender: str = Field(..., description="性别")


class StudentUpdate(BaseModel):
    """更新学员"""

    photo: Optional[str] = Field(None, description="照片URL")


class StudentResponse(BaseModel):
    """学员响应"""

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="学员ID")
    id_type: str = Field(..., description="证件类型")
    id_name: str = Field(..., description="证件姓名")
    photo: Optional[str] = Field(None, description="照片URL")
    birthday: date = Field(..., description="出生日期")
    gender: str = Field(..., description="性别")
    member_type: str = Field(..., description="会员类型")
    created_at: datetime = Field(..., description="创建时间")
