"""
学员管理接口
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.domain import User
from src.models.schemas import (
    ResponseSchema,
    StudentCreate,
    StudentUpdate,
    StudentResponse,
)
from src.services import StudentService

router = APIRouter(tags=["学员管理"])


@router.get("/students", response_model=ResponseSchema[list[StudentResponse]])
async def list_students(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取学员列表"""
    service = StudentService()
    students = await service.list_students(db, current_user.id)
    return ResponseSchema(data=students)


@router.post("/students", response_model=ResponseSchema[StudentResponse])
async def create_student(
    data: StudentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """创建学员"""
    service = StudentService()
    student = await service.create_student(db, current_user.id, data)
    return ResponseSchema(data=student)


@router.put("/students/{student_id}", response_model=ResponseSchema[StudentResponse])
async def update_student(
    student_id: str,
    data: StudentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """更新学员"""
    service = StudentService()
    student = await service.update_student(db, student_id, current_user.id, data)
    return ResponseSchema(data=student)


@router.delete("/students/{student_id}", response_model=ResponseSchema[bool])
async def delete_student(
    student_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """删除学员"""
    service = StudentService()
    success = await service.delete_student(db, student_id, current_user.id)
    return ResponseSchema(data=success)
