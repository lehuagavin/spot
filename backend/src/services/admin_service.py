"""
管理员服务
"""
from datetime import timedelta
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.errors import ErrorCode
from src.core.exceptions import AppException
from src.core.security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from src.models.domain import Admin
from src.models.schemas import AdminLogin, AdminTokenResponse, AdminResponse
from src.repositories.base import BaseRepository
from src.utils import hash_password, verify_password


class AdminService:
    """管理员服务"""

    def __init__(self):
        self.repo = BaseRepository(Admin)

    async def login(
        self, db: AsyncSession, credentials: AdminLogin
    ) -> AdminTokenResponse:
        """管理员登录

        Args:
            db: 数据库会话
            credentials: 登录凭证

        Returns:
            Token 响应

        Raises:
            AppException: 认证失败
        """
        # 查询管理员
        result = await db.execute(
            select(Admin).filter(Admin.username == credentials.username)
        )
        admin = result.scalar_one_or_none()

        if not admin:
            raise AppException(ErrorCode.INVALID_CREDENTIALS)

        # 验证密码
        if not verify_password(credentials.password, admin.password_hash):
            raise AppException(ErrorCode.INVALID_CREDENTIALS)

        # 检查状态
        if admin.status != 1:
            raise AppException(ErrorCode.FORBIDDEN, "管理员已被禁用")

        # 创建 Token
        access_token = create_access_token(
            data={"sub": admin.id, "type": "admin"}
        )

        return AdminTokenResponse(
            token=access_token,
            expires_in=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            admin=AdminResponse.model_validate(admin),
        )

    async def get_admin_info(self, db: AsyncSession, admin_id: str) -> AdminResponse:
        """获取管理员信息

        Args:
            db: 数据库会话
            admin_id: 管理员 ID

        Returns:
            管理员信息
        """
        admin = await self.repo.get(db, admin_id)
        if not admin:
            raise AppException(ErrorCode.ADMIN_NOT_FOUND)

        return AdminResponse.model_validate(admin)
