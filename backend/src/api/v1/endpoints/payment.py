"""
支付接口
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.domain import User
from src.models.schemas import ResponseSchema, PaymentPrepay, PaymentPrepayResponse
from src.services import PaymentService
from src.utils.id_generator import generate_id

router = APIRouter(tags=["支付"])


class PaymentConfirm(BaseModel):
    """确认支付请求"""
    order_id: str = Field(..., description="订单ID")


@router.post("/payment/prepay", response_model=ResponseSchema[PaymentPrepayResponse])
async def create_prepay(
    data: PaymentPrepay,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取支付参数"""
    service = PaymentService()
    result = await service.create_prepay(db, current_user.id, data)
    return ResponseSchema(data=result)


@router.post("/payment/confirm", response_model=ResponseSchema[dict])
async def confirm_payment(
    data: PaymentConfirm,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """确认支付（开发环境模拟支付回调）
    
    注意：此接口仅用于开发测试，生产环境应使用微信支付回调
    """
    service = PaymentService()
    # 生成模拟的微信支付单号
    mock_transaction_id = f"mock_{generate_id()}"
    success = await service.handle_payment_callback(db, data.order_id, mock_transaction_id)
    
    if not success:
        from src.core.exceptions import AppException
        from src.core.errors import ErrorCode
        raise AppException(code=ErrorCode.PAYMENT_FAILED, message="支付确认失败")
    
    return ResponseSchema(data={"success": True, "transaction_id": mock_transaction_id})
