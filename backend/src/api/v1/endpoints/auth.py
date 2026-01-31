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

    支持三种方式:
    1. 直接传入 phone
    2. 传入 code 调用微信接口获取真实手机号（需配置 AppSecret）
    3. 开发环境：如果微信接口调用失败，使用固定测试手机号
    """
    from src.core.config import settings
    import httpx
    
    phone = data.phone
    
    if not phone and data.code:
        # 尝试调用微信接口获取真实手机号
        try:
            # 1. 先获取 access_token
            token_url = f"https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={settings.wechat_app_id}&secret={settings.wechat_app_secret}"
            async with httpx.AsyncClient() as client:
                token_resp = await client.get(token_url)
                token_data = token_resp.json()
                access_token = token_data.get("access_token")
                
                if access_token:
                    # 2. 使用 access_token 获取手机号
                    phone_url = f"https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token={access_token}"
                    phone_resp = await client.post(phone_url, json={"code": data.code})
                    phone_data = phone_resp.json()
                    
                    if phone_data.get("errcode") == 0:
                        phone_info = phone_data.get("phone_info", {})
                        phone = phone_info.get("phoneNumber") or phone_info.get("purePhoneNumber")
        except Exception as e:
            print(f"获取微信手机号失败: {e}")
    
    # 如果仍然没有手机号（开发环境或微信接口失败），使用用户已有手机号或测试手机号
    if not phone:
        if current_user.phone:
            # 保持用户现有手机号不变
            phone = current_user.phone
        else:
            # 开发环境：使用固定测试手机号
            phone = "13800138000"

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
