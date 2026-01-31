"""
Repository 基类
"""
from typing import Generic, TypeVar, Type, Optional, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.domain.base import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Repository 基类"""

    def __init__(self, model: Type[ModelType]):
        """初始化

        Args:
            model: 模型类
        """
        self.model = model

    async def get(self, db: AsyncSession, id: str) -> Optional[ModelType]:
        """根据 ID 获取单条记录

        Args:
            db: 数据库会话
            id: 记录 ID

        Returns:
            模型实例或 None
        """
        result = await db.execute(select(self.model).filter(self.model.id == id))
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        **filters: Any,
    ) -> list[ModelType]:
        """获取多条记录

        Args:
            db: 数据库会话
            skip: 跳过记录数
            limit: 返回记录数
            **filters: 过滤条件

        Returns:
            模型实例列表
        """
        query = select(self.model)

        # 应用过滤条件
        for key, value in filters.items():
            if hasattr(self.model, key):
                query = query.filter(getattr(self.model, key) == value)

        query = query.offset(skip).limit(limit)
        result = await db.execute(query)
        return list(result.scalars().all())

    async def count(self, db: AsyncSession, **filters: Any) -> int:
        """统计记录数

        Args:
            db: 数据库会话
            **filters: 过滤条件

        Returns:
            记录数
        """
        query = select(func.count(self.model.id))

        # 应用过滤条件
        for key, value in filters.items():
            if hasattr(self.model, key):
                query = query.filter(getattr(self.model, key) == value)

        result = await db.execute(query)
        return result.scalar() or 0

    async def create(self, db: AsyncSession, obj_in: dict) -> ModelType:
        """创建记录

        Args:
            db: 数据库会话
            obj_in: 创建数据

        Returns:
            创建的模型实例
        """
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        await db.flush()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self, db: AsyncSession, db_obj: ModelType, obj_in: dict
    ) -> ModelType:
        """更新记录

        Args:
            db: 数据库会话
            db_obj: 数据库对象
            obj_in: 更新数据

        Returns:
            更新后的模型实例
        """
        for key, value in obj_in.items():
            if hasattr(db_obj, key):
                setattr(db_obj, key, value)

        db.add(db_obj)
        await db.flush()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, id: str) -> bool:
        """删除记录

        Args:
            db: 数据库会话
            id: 记录 ID

        Returns:
            是否删除成功
        """
        db_obj = await self.get(db, id)
        if db_obj:
            await db.delete(db_obj)
            await db.flush()
            return True
        return False
