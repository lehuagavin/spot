"""
轮播图相关 Schema
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class BannerCreate(BaseModel):
    """创建轮播图"""

    title: Optional[str] = Field(None, max_length=128, description="标题")
    image: str = Field(..., description="图片URL")
    link: Optional[str] = Field(None, description="跳转链接")
    sort_order: int = Field(default=0, description="排序")


class BannerUpdate(BaseModel):
    """更新轮播图"""

    title: Optional[str] = Field(None, description="标题")
    image: Optional[str] = Field(None, description="图片URL")
    link: Optional[str] = Field(None, description="跳转链接")
    sort_order: Optional[int] = Field(None, description="排序")
    status: Optional[int] = Field(None, description="状态")


class BannerResponse(BaseModel):
    """轮播图响应"""

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="轮播图ID")
    title: Optional[str] = Field(None, description="标题")
    image: str = Field(..., description="图片URL")
    link: Optional[str] = Field(None, description="跳转链接")
    sort_order: int = Field(..., description="排序")
    status: int = Field(..., description="状态 1启用 0禁用")
    created_at: datetime = Field(..., description="创建时间")
