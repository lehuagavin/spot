"""
学员服务
"""
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.errors import ErrorCode
from src.core.exceptions import AppException
from src.models.domain import Student
from src.models.schemas import StudentCreate, StudentUpdate, StudentResponse
from src.repositories.base import BaseRepository
from src.utils import generate_id, encrypt_id_number, hash_id_number


class StudentService:
    """学员服务"""

    def __init__(self):
        self.repo = BaseRepository(Student)

    async def create_student(
        self, db: AsyncSession, user_id: str, data: StudentCreate
    ) -> StudentResponse:
        """创建学员

        Args:
            db: 数据库会话
            user_id: 用户 ID
            data: 创建数据

        Returns:
            学员信息
        """
        student_dict = data.model_dump()
        student_dict["id"] = generate_id()
        student_dict["user_id"] = user_id

        # 加密身份证号
        id_number = student_dict["id_number"]
        student_dict["id_number"] = encrypt_id_number(id_number)
        student_dict["id_number_hash"] = hash_id_number(id_number)

        student = await self.repo.create(db, student_dict)
        return StudentResponse.model_validate(student)

    async def update_student(
        self, db: AsyncSession, student_id: str, user_id: str, data: StudentUpdate
    ) -> StudentResponse:
        """更新学员

        Args:
            db: 数据库会话
            student_id: 学员 ID
            user_id: 用户 ID
            data: 更新数据

        Returns:
            学员信息
        """
        student = await self.repo.get(db, student_id)
        if not student:
            raise AppException(ErrorCode.STUDENT_NOT_FOUND)

        # 验证所有权
        if student.user_id != user_id:
            raise AppException(ErrorCode.FORBIDDEN)

        update_dict = data.model_dump(exclude_unset=True)
        student = await self.repo.update(db, student, update_dict)
        return StudentResponse.model_validate(student)

    async def list_students(
        self, db: AsyncSession, user_id: str
    ) -> list[StudentResponse]:
        """获取学员列表

        Args:
            db: 数据库会话
            user_id: 用户 ID

        Returns:
            学员列表
        """
        students = await self.repo.get_multi(db, limit=100, user_id=user_id, status=1)
        return [StudentResponse.model_validate(s) for s in students]

    async def get_student(
        self, db: AsyncSession, student_id: str, user_id: str
    ) -> StudentResponse:
        """获取学员详情

        Args:
            db: 数据库会话
            student_id: 学员 ID
            user_id: 用户 ID

        Returns:
            学员信息
        """
        student = await self.repo.get(db, student_id)
        if not student:
            raise AppException(ErrorCode.STUDENT_NOT_FOUND)

        # 验证所有权
        if student.user_id != user_id:
            raise AppException(ErrorCode.FORBIDDEN)

        return StudentResponse.model_validate(student)

    async def delete_student(
        self, db: AsyncSession, student_id: str, user_id: str
    ) -> bool:
        """删除学员

        Args:
            db: 数据库会话
            student_id: 学员 ID
            user_id: 用户 ID

        Returns:
            是否成功
        """
        student = await self.repo.get(db, student_id)
        if not student:
            raise AppException(ErrorCode.STUDENT_NOT_FOUND)

        # 验证所有权
        if student.user_id != user_id:
            raise AppException(ErrorCode.FORBIDDEN)

        success = await self.repo.delete(db, student_id)
        return success
