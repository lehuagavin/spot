"""
课程接口
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.models.schemas import (
    ResponseSchema,
    PaginatedResponseSchema,
    CourseResponse,
    CourseQuery,
)
from src.services import CourseService

router = APIRouter(tags=["课程管理"])


@router.get("/courses", response_model=ResponseSchema[PaginatedResponseSchema[CourseResponse]])
async def list_courses(
    community_id: str = Query(None, description="小区ID"),
    status: str = Query(None, description="状态"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """获取课程列表"""
    service = CourseService()
    query = CourseQuery(
        community_id=community_id,
        status=status,
        page=page,
        page_size=page_size,
    )
    result = await service.list_courses(db, query)
    return ResponseSchema(data=result)


@router.get("/courses/{course_id}", response_model=ResponseSchema[CourseResponse])
async def get_course(
    course_id: str,
    db: AsyncSession = Depends(get_db),
):
    """获取课程详情"""
    service = CourseService()
    course = await service.get_course(db, course_id)
    return ResponseSchema(data=course)
