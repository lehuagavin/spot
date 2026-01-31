"""
课程服务
"""
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from src.core.exceptions import AppException
from src.core.errors import ErrorCode
from src.models.domain import Course, CourseStudent, Teacher, Community
from src.models.schemas import (
    CourseCreate,
    CourseUpdate,
    CourseResponse,
    CourseQuery,
    StudentResponse,
)
from src.repositories.base import BaseRepository
from src.utils.id_generator import generate_id


class CourseService:
    """课程服务"""

    def __init__(self):
        self.repo = BaseRepository[Course](Course)

    async def create_course(
        self, db: AsyncSession, data: CourseCreate
    ) -> CourseResponse:
        """创建课程"""
        # 验证小区是否存在
        community_repo = BaseRepository[Community](Community)
        community = await community_repo.get(db, data.community_id)
        if not community:
            raise AppException(
                code=ErrorCode.COMMUNITY_NOT_FOUND,
                message="小区不存在",
            )

        # 验证教练是否存在
        teacher_repo = BaseRepository[Teacher](Teacher)
        teacher = await teacher_repo.get(db, data.teacher_id)
        if not teacher:
            raise AppException(
                code=ErrorCode.TEACHER_NOT_FOUND,
                message="教练不存在",
            )

        # 校验 max_students >= min_students
        if data.max_students < data.min_students:
            raise AppException(
                code=ErrorCode.BAD_REQUEST,
                message="最大人数不能小于最小人数",
            )

        # 排除不需要存入数据库的字段
        course_data = data.model_dump(exclude={"age_range", "schedule", "end_date", "description"})

        # 确保 start_date 是 date 类型
        if course_data.get("start_date") and isinstance(course_data["start_date"], datetime):
            course_data["start_date"] = course_data["start_date"].date()

        course = await self.repo.create(
            db,
            {
                "id": generate_id(),
                "enrolled_count": 0,
                **course_data,
            },
        )
        await db.refresh(course)
        return CourseResponse.model_validate(course)

    async def update_course(
        self, db: AsyncSession, course_id: str, data: CourseUpdate
    ) -> CourseResponse:
        """更新课程"""
        course = await self.repo.get(db, course_id)
        if not course:
            raise AppException(
                code=ErrorCode.COURSE_NOT_FOUND,
                message="课程不存在",
            )

        # 排除不需要存入数据库的字段
        update_data = data.model_dump(exclude_unset=True, exclude={"age_range", "schedule", "end_date", "description"})

        await self.repo.update(db, course, update_data)
        await db.refresh(course)
        return CourseResponse.model_validate(course)

    async def get_course(self, db: AsyncSession, course_id: str) -> CourseResponse:
        """获取课程详情"""
        course = await self.repo.get(db, course_id)
        if not course:
            raise AppException(
                code=ErrorCode.COURSE_NOT_FOUND,
                message="课程不存在",
            )
        return CourseResponse.model_validate(course)

    async def list_courses(
        self, db: AsyncSession, query: CourseQuery
    ) -> dict:
        """获取课程列表"""
        filters = {}
        if query.community_id:
            filters["community_id"] = query.community_id
        if query.status:
            filters["status"] = query.status

        total = await self.repo.count(db, **filters)
        courses = await self.repo.get_multi(
            db,
            skip=(query.page - 1) * query.page_size,
            limit=query.page_size,
            **filters,
        )
        return {
            "items": [CourseResponse.model_validate(c) for c in courses],
            "total": total,
            "page": query.page,
            "page_size": query.page_size,
        }

    async def delete_course(self, db: AsyncSession, course_id: str) -> bool:
        """删除课程"""
        course = await self.repo.get(db, course_id)
        if not course:
            raise AppException(
                code=ErrorCode.COURSE_NOT_FOUND,
                message="课程不存在",
            )

        # 检查是否有已报名学员
        if course.enrolled_count > 0:
            raise AppException(
                code=ErrorCode.COURSE_HAS_STUDENTS,
                message="课程已有学员报名,无法删除",
            )

        return await self.repo.delete(db, course_id)

    async def get_course_students(
        self, db: AsyncSession, course_id: str
    ) -> list[dict]:
        """获取课程报名学员列表"""
        course = await self.repo.get(db, course_id)
        if not course:
            raise AppException(
                code=ErrorCode.COURSE_NOT_FOUND,
                message="课程不存在",
            )

        stmt = (
            select(CourseStudent)
            .where(CourseStudent.course_id == course_id)
            .order_by(CourseStudent.created_at.desc())
        )
        result = await db.execute(stmt)
        course_students = result.scalars().all()

        return [
            {
                "id": cs.id,
                "student_id": cs.student_id,
                "order_id": cs.order_id,
                "status": cs.status,
                "created_at": cs.created_at,
            }
            for cs in course_students
        ]

    async def update_course_status(
        self, db: AsyncSession, course_id: str, status: str
    ) -> CourseResponse:
        """更新课程状态"""
        # 校验状态值
        valid_statuses = ["pending", "enrolling", "ongoing", "completed", "cancelled"]
        if status not in valid_statuses:
            raise AppException(
                code=ErrorCode.BAD_REQUEST,
                message=f"无效的状态值，有效值为: {', '.join(valid_statuses)}",
            )

        course = await self.repo.get(db, course_id)
        if not course:
            raise AppException(
                code=ErrorCode.COURSE_NOT_FOUND,
                message="课程不存在",
            )
        await self.repo.update(db, course, {"status": status})
        await db.refresh(course)
        return CourseResponse.model_validate(course)
