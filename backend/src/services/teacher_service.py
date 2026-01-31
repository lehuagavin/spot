"""
教练服务
"""
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import AppException
from src.core.errors import ErrorCode
from src.models.domain import Teacher
from src.models.schemas import TeacherCreate, TeacherUpdate, TeacherResponse
from src.repositories.base import BaseRepository
from src.utils.id_generator import generate_id


class TeacherService:
    """教练服务"""

    def __init__(self):
        self.repo = BaseRepository[Teacher](Teacher)

    async def create_teacher(
        self, db: AsyncSession, data: TeacherCreate
    ) -> TeacherResponse:
        """创建教练"""
        teacher = await self.repo.create(
            db,
            {
                "id": generate_id(),
                "status": 1,
                **data.model_dump(),
            },
        )
        await db.refresh(teacher)
        return TeacherResponse.model_validate(teacher)

    async def update_teacher(
        self, db: AsyncSession, teacher_id: str, data: TeacherUpdate
    ) -> TeacherResponse:
        """更新教练"""
        teacher = await self.repo.get(db, teacher_id)
        if not teacher:
            raise AppException(
                code=ErrorCode.TEACHER_NOT_FOUND,
                message="教练不存在",
            )
        await self.repo.update(db, teacher, data.model_dump(exclude_unset=True))
        await db.refresh(teacher)
        return TeacherResponse.model_validate(teacher)

    async def get_teacher(self, db: AsyncSession, teacher_id: str) -> TeacherResponse:
        """获取教练详情"""
        teacher = await self.repo.get(db, teacher_id)
        if not teacher:
            raise AppException(
                code=ErrorCode.TEACHER_NOT_FOUND,
                message="教练不存在",
            )
        return TeacherResponse.model_validate(teacher)

    async def list_teachers(
        self, db: AsyncSession, page: int, page_size: int
    ) -> dict:
        """获取教练列表"""
        total = await self.repo.count(db)
        teachers = await self.repo.get_multi(
            db, skip=(page - 1) * page_size, limit=page_size
        )
        return {
            "items": [TeacherResponse.model_validate(t) for t in teachers],
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    async def delete_teacher(self, db: AsyncSession, teacher_id: str) -> bool:
        """删除教练"""
        teacher = await self.repo.get(db, teacher_id)
        if not teacher:
            raise AppException(
                code=ErrorCode.TEACHER_NOT_FOUND,
                message="教练不存在",
            )
        return await self.repo.delete(db, teacher_id)
