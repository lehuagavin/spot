"""
课程相关 Schema
"""
from datetime import datetime, date, time
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict


class CourseCreate(BaseModel):
    """创建课程"""

    community_id: str = Field(..., description="小区ID")
    teacher_id: str = Field(..., description="教练ID")
    name: str = Field(..., min_length=1, max_length=128, description="课程名称")
    image: Optional[str] = Field(None, description="课程图片URL")
    age_min: int = Field(..., ge=0, description="最小年龄")
    age_max: int = Field(..., ge=0, description="最大年龄")
    total_weeks: int = Field(..., ge=1, description="总周数")
    total_lessons: int = Field(..., ge=1, description="总课时")
    schedule_day: str = Field(..., description="上课日")
    schedule_start: time = Field(..., description="开始时间")
    schedule_end: time = Field(..., description="结束时间")
    location: Optional[str] = Field(None, description="上课地点详情")
    price: Decimal = Field(..., ge=0, description="原价")
    member_price: Decimal = Field(..., ge=0, description="会员价")
    min_students: int = Field(..., ge=1, description="最低开班人数")
    max_students: int = Field(..., ge=1, description="最大人数")
    deadline: datetime = Field(..., description="报名截止时间")
    start_date: Optional[date] = Field(None, description="开课日期")


class CourseUpdate(BaseModel):
    """更新课程"""

    name: Optional[str] = Field(None, description="课程名称")
    image: Optional[str] = Field(None, description="课程图片URL")
    price: Optional[Decimal] = Field(None, description="原价")
    member_price: Optional[Decimal] = Field(None, description="会员价")
    deadline: Optional[datetime] = Field(None, description="报名截止时间")
    start_date: Optional[date] = Field(None, description="开课日期")
    status: Optional[str] = Field(None, description="状态")


class CourseResponse(BaseModel):
    """课程响应"""

    model_config = ConfigDict(from_attributes=True)

    id: str = Field(..., description="课程ID")
    community_id: str = Field(..., description="小区ID")
    teacher_id: str = Field(..., description="教练ID")
    name: str = Field(..., description="课程名称")
    image: Optional[str] = Field(None, description="课程图片URL")
    age_min: int = Field(..., description="最小年龄")
    age_max: int = Field(..., description="最大年龄")
    total_weeks: int = Field(..., description="总周数")
    total_lessons: int = Field(..., description="总课时")
    schedule_day: str = Field(..., description="上课日")
    schedule_start: time = Field(..., description="开始时间")
    schedule_end: time = Field(..., description="结束时间")
    location: Optional[str] = Field(None, description="上课地点详情")
    price: Decimal = Field(..., description="原价")
    member_price: Decimal = Field(..., description="会员价")
    min_students: int = Field(..., description="最低开班人数")
    max_students: int = Field(..., description="最大人数")
    enrolled_count: int = Field(..., description="已报名人数")
    deadline: datetime = Field(..., description="报名截止时间")
    start_date: Optional[date] = Field(None, description="开课日期")
    status: str = Field(..., description="状态")
    created_at: datetime = Field(..., description="创建时间")


class CourseQuery(BaseModel):
    """课程查询"""

    community_id: Optional[str] = Field(None, description="小区ID")
    status: Optional[str] = Field(None, description="状态")
    page: int = Field(default=1, ge=1, description="页码")
    page_size: int = Field(default=20, ge=1, le=100, description="每页数量")
