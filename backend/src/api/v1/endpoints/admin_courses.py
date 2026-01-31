"""
管理端课程管理接口
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_admin
from src.core.database import get_db
from src.models.domain import Admin
from src.models.schemas import (
    ResponseSchema,
    PaginatedResponseSchema,
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CourseQuery,
)
from src.services import CourseService

router = APIRouter(prefix="/admin/courses", tags=["管理端-课程管理"])


@router.get("", response_model=ResponseSchema[PaginatedResponseSchema[CourseResponse]])
async def list_courses(
    community_id: str = Query(None, description="小区ID"),
    status: str = Query(None, description="状态"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_admin: Admin = Depends(get_current_admin),
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


@router.post("", response_model=ResponseSchema[CourseResponse])
async def create_course(
    data: CourseCreate,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """创建课程"""
    service = CourseService()
    course = await service.create_course(db, data)
    return ResponseSchema(data=course)


@router.get("/{course_id}", response_model=ResponseSchema[CourseResponse])
async def get_course(
    course_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取课程详情"""
    service = CourseService()
    course = await service.get_course(db, course_id)
    return ResponseSchema(data=course)


@router.put("/{course_id}", response_model=ResponseSchema[CourseResponse])
async def update_course(
    course_id: str,
    data: CourseUpdate,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """更新课程"""
    service = CourseService()
    course = await service.update_course(db, course_id, data)
    return ResponseSchema(data=course)


@router.put("/{course_id}/status", response_model=ResponseSchema[CourseResponse])
async def update_course_status(
    course_id: str,
    data: dict,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """更新课程状态"""
    service = CourseService()
    course = await service.update_course_status(db, course_id, data.get("status"))
    return ResponseSchema(data=course)


@router.get("/{course_id}/students", response_model=ResponseSchema[list[dict]])
async def get_course_students(
    course_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取课程报名学员列表"""
    service = CourseService()
    students = await service.get_course_students(db, course_id)
    return ResponseSchema(data=students)


@router.delete("/{course_id}", response_model=ResponseSchema[bool])
async def delete_course(
    course_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """删除课程"""
    service = CourseService()
    success = await service.delete_course(db, course_id)
    return ResponseSchema(data=success)
