"""
微信认证接口
"""
from fastapi import APIRouter, Depends
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
    """微信登录"""
    from src.repositories.base import BaseRepository
    from sqlalchemy import select

    # 查找用户
    user_repo = BaseRepository[User](User)
    stmt = select(User).where(User.openid == credentials.openid)
    result = await db.execute(stmt)
    user = result.scalars().first()

    if not user:
        # 创建新用户
        user = await user_repo.create(
            db,
            {
                "id": generate_id(),
                "openid": credentials.openid,
                "unionid": credentials.unionid,
                "nickname": credentials.nickname,
                "avatar": credentials.avatar,
                "health_beans": 0,
                "is_member": 0,
                "status": 1,
            },
        )
        await db.refresh(user)

    # 生成 token
    token = create_access_token({"user_id": user.id, "type": "user"})

    return ResponseSchema(
        data={
            "token": token,
            "user": UserResponse.model_validate(user),
        }
    )


@router.post("/auth/wechat/bindPhone", response_model=ResponseSchema[UserResponse])
async def bind_phone(
    data: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """绑定手机号"""
    service = UserService()
    user = await service.update_user_info(
        db, current_user.id, UserUpdate(phone=data.get("phone"))
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
