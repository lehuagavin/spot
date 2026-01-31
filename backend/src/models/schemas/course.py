"""
课程相关 Schema
"""
from datetime import datetime, date, time
from typing import Optional, Union
from decimal import Decimal
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator
import re


class CourseCreate(BaseModel):
    """创建课程

    支持两种格式:
    1. 分开的字段: age_min/age_max, schedule_day/schedule_start/schedule_end
    2. 组合的字段: age_range (如"7-12岁"), schedule (如"周六 08:00-09:00")
    """

    community_id: str = Field(..., description="小区ID")
    teacher_id: str = Field(..., description="教练ID")
    name: str = Field(..., min_length=1, max_length=128, description="课程名称")
    image: Optional[str] = Field(None, description="课程图片URL")

    # 年龄范围 - 支持两种方式
    age_min: Optional[int] = Field(None, ge=0, description="最小年龄")
    age_max: Optional[int] = Field(None, ge=0, description="最大年龄")
    age_range: Optional[str] = Field(None, description="年龄范围（如 7-12岁）")

    total_weeks: int = Field(..., ge=1, description="总周数")
    total_lessons: int = Field(..., ge=1, description="总课时")

    # 时间安排 - 支持两种方式
    schedule_day: Optional[str] = Field(None, description="上课日")
    schedule_start: Optional[time] = Field(None, description="开始时间")
    schedule_end: Optional[time] = Field(None, description="结束时间")
    schedule: Optional[str] = Field(None, description="上课时间（如 周六 08:00-09:00）")

    location: Optional[str] = Field(None, description="上课地点详情")
    price: Decimal = Field(..., ge=0, description="原价")
    member_price: Decimal = Field(..., ge=0, description="会员价")
    min_students: int = Field(..., ge=1, description="最低开班人数")
    max_students: int = Field(..., ge=1, description="最大人数")
    deadline: datetime = Field(..., description="报名截止时间")
    start_date: Optional[Union[date, datetime]] = Field(None, description="开课日期")
    end_date: Optional[Union[date, datetime]] = Field(None, description="结课日期")
    description: Optional[str] = Field(None, description="课程描述")
    status: Optional[str] = Field(default="enrolling", description="状态")

    @model_validator(mode="after")
    def parse_combined_fields(self):
        """解析组合字段"""
        # 解析 age_range
        if self.age_range and (self.age_min is None or self.age_max is None):
            match = re.search(r"(\d+)-(\d+)", self.age_range)
            if match:
                self.age_min = int(match.group(1))
                self.age_max = int(match.group(2))
            else:
                self.age_min = self.age_min or 0
                self.age_max = self.age_max or 18

        # 默认年龄范围
        if self.age_min is None:
            self.age_min = 7
        if self.age_max is None:
            self.age_max = 12

        # 解析 schedule
        if self.schedule and (self.schedule_day is None or self.schedule_start is None):
            # 匹配 "周六 08:00-09:00" 格式
            match = re.match(r"(周[一二三四五六日])\s*(\d{1,2}:\d{2})-(\d{1,2}:\d{2})", self.schedule)
            if match:
                self.schedule_day = match.group(1)
                self.schedule_start = datetime.strptime(match.group(2), "%H:%M").time()
                self.schedule_end = datetime.strptime(match.group(3), "%H:%M").time()
            else:
                self.schedule_day = self.schedule_day or "周六"
                self.schedule_start = self.schedule_start or time(8, 0)
                self.schedule_end = self.schedule_end or time(9, 0)

        # 默认时间安排
        if self.schedule_day is None:
            self.schedule_day = "周六"
        if self.schedule_start is None:
            self.schedule_start = time(8, 0)
        if self.schedule_end is None:
            self.schedule_end = time(9, 0)

        # 处理 start_date 如果是 datetime 则转换为 date
        if isinstance(self.start_date, datetime):
            self.start_date = self.start_date.date()
        if isinstance(self.end_date, datetime):
            self.end_date = self.end_date.date()

        return self


class CourseUpdate(BaseModel):
    """更新课程"""

    community_id: Optional[str] = Field(None, description="小区ID")
    teacher_id: Optional[str] = Field(None, description="教练ID")
    name: Optional[str] = Field(None, description="课程名称")
    image: Optional[str] = Field(None, description="课程图片URL")
    age_range: Optional[str] = Field(None, description="年龄范围")
    total_weeks: Optional[int] = Field(None, description="总周数")
    total_lessons: Optional[int] = Field(None, description="总课时")
    schedule: Optional[str] = Field(None, description="上课时间")
    location: Optional[str] = Field(None, description="上课地点详情")
    price: Optional[Decimal] = Field(None, description="原价")
    member_price: Optional[Decimal] = Field(None, description="会员价")
    min_students: Optional[int] = Field(None, description="最低开班人数")
    max_students: Optional[int] = Field(None, description="最大人数")
    deadline: Optional[datetime] = Field(None, description="报名截止时间")
    start_date: Optional[Union[date, datetime]] = Field(None, description="开课日期")
    end_date: Optional[Union[date, datetime]] = Field(None, description="结课日期")
    description: Optional[str] = Field(None, description="课程描述")
    status: Optional[str] = Field(None, description="状态")

    @model_validator(mode="after")
    def parse_fields(self):
        """处理日期格式"""
        if isinstance(self.start_date, datetime):
            self.start_date = self.start_date.date()
        if isinstance(self.end_date, datetime):
            self.end_date = self.end_date.date()
        return self


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
