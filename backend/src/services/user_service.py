"""
用户服务
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.exceptions import AppException
from src.core.errors import ErrorCode
from src.models.domain import User
from src.models.schemas import UserResponse, UserAssetsResponse, UserUpdate
from src.repositories.base import BaseRepository


class UserService:
    """用户服务"""

    def __init__(self):
        self.repo = BaseRepository[User](User)

    async def get_user_info(self, db: AsyncSession, user_id: str) -> UserResponse:
        """获取用户信息"""
        user = await self.repo.get(db, user_id)
        if not user:
            raise AppException(
                code=ErrorCode.USER_NOT_FOUND,
                message="用户不存在",
            )
        return UserResponse.model_validate(user)

    async def get_user_assets(self, db: AsyncSession, user_id: str) -> UserAssetsResponse:
        """获取用户资产"""
        user = await self.repo.get(db, user_id)
        if not user:
            raise AppException(
                code=ErrorCode.USER_NOT_FOUND,
                message="用户不存在",
            )
        return UserAssetsResponse(
            health_beans=user.health_beans,
            coupons=0,  # 优惠券功能暂未实现
            is_member=bool(user.is_member),
            member_expire_at=user.member_expire_at,
        )

    async def update_user_info(
        self, db: AsyncSession, user_id: str, data: UserUpdate
    ) -> UserResponse:
        """更新用户信息"""
        user = await self.repo.get(db, user_id)
        if not user:
            raise AppException(
                code=ErrorCode.USER_NOT_FOUND,
                message="用户不存在",
            )
        await self.repo.update(db, user, data.model_dump(exclude_unset=True))
        await db.refresh(user)
        return UserResponse.model_validate(user)

    async def update_user_status(
        self, db: AsyncSession, user_id: str, status: int
    ) -> UserResponse:
        """更新用户状态"""
        user = await self.repo.get(db, user_id)
        if not user:
            raise AppException(
                code=ErrorCode.USER_NOT_FOUND,
                message="用户不存在",
            )
        await self.repo.update(db, user, {"status": status})
        await db.refresh(user)
        return UserResponse.model_validate(user)

    async def list_users(
        self, db: AsyncSession, page: int, page_size: int, keyword: str = None
    ) -> dict:
        """获取用户列表"""
        # 构建基础查询
        query = select(User)
        
        # 如果有关键字，按昵称或手机号搜索
        if keyword:
            query = query.where(
                (User.nickname.contains(keyword)) | (User.phone.contains(keyword))
            )
        
        # 计算总数
        count_query = select(User)
        if keyword:
            count_query = count_query.where(
                (User.nickname.contains(keyword)) | (User.phone.contains(keyword))
            )
        result = await db.execute(count_query)
        total = len(result.scalars().all())
        
        # 分页查询
        query = query.offset((page - 1) * page_size).limit(page_size)
        result = await db.execute(query)
        users = result.scalars().all()
        
        return {
            "items": [UserResponse.model_validate(u) for u in users],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
