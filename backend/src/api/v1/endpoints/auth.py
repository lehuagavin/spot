"""
微信认证接口
"""
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.domain import User
from src.models.schemas import ResponseSchema, UserCreate, UserUpdate, UserResponse
from src.services import UserService
from src.core.security import create_access_token
from src.utils.id_generator import generate_id

router = APIRouter(tags=["微信认证"])


@router.post("/auth/wechat/login", response_model=ResponseSchema[dict])
async def wechat_login(
    credentials: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """微信登录

    支持两种方式:
    1. 直接传入 openid（真实微信环境）
    2. 传入 code（开发测试环境，自动生成模拟 openid）
    """
    from src.repositories.base import BaseRepository
    from sqlalchemy import select
    import hashlib

    # 处理 openid：如果没有提供，则从 code 生成模拟的 openid
    openid = credentials.openid
    if not openid and credentials.code:
        # 开发环境：使用 code 生成模拟的 openid
        openid = "mock_openid_" + hashlib.md5(credentials.code.encode()).hexdigest()[:16]

    if not openid:
        from src.core.exceptions import AppException
        from src.core.errors import ErrorCode
        raise AppException(code=ErrorCode.BAD_REQUEST, message="请提供 openid 或 code")

    # 查找用户
    user_repo = BaseRepository[User](User)
    stmt = select(User).where(User.openid == openid)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        # 创建新用户
        user = await user_repo.create(
            db,
            {
                "id": generate_id(),
                "openid": openid,
                "unionid": credentials.unionid,
                "nickname": credentials.nickname,
                "avatar": credentials.avatar,
                "health_beans": 0,
                "is_member": 0,
                "status": 1,
            },
        )
        await db.refresh(user)

    # 生成 token (使用 sub 作为标准的 JWT claim)
    token = create_access_token({"sub": user.id, "type": "user"})

    return ResponseSchema(
        data={
            "token": token,
            "user_id": user.id,
            "user": UserResponse.model_validate(user),
        }
    )


class PhoneBindRequest(BaseModel):
    """绑定手机号请求"""
    code: Optional[str] = Field(None, description="微信获取手机号的code（开发环境使用）")
    phone: Optional[str] = Field(None, description="手机号（直接传入）")


@router.post("/auth/wechat/bindPhone", response_model=ResponseSchema[UserResponse])
async def bind_phone(
    data: PhoneBindRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """绑定手机号

    支持两种方式:
    1. 直接传入 phone
    2. 传入 code（开发测试环境，自动生成模拟手机号）
    """
    phone = data.phone
    if not phone and data.code:
        # 开发环境：从 code 生成模拟手机号
        import hashlib
        hash_val = hashlib.md5(data.code.encode()).hexdigest()[:8]
        phone = "138" + hash_val[:8].upper()[:8].translate(str.maketrans("ABCDEF", "012345"))[:8]

    if not phone:
        from src.core.exceptions import AppException
        from src.core.errors import ErrorCode
        raise AppException(code=ErrorCode.BAD_REQUEST, message="请提供 phone 或 code")

    service = UserService()
    user = await service.update_user_info(
        db, current_user.id, UserUpdate(phone=phone)
    )
    return ResponseSchema(data=user)


@router.put("/auth/user/info", response_model=ResponseSchema[UserResponse])
async def update_user_info(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """更新用户信息"""
    service = UserService()
    user = await service.update_user_info(db, current_user.id, data)
    return ResponseSchema(data=user)
