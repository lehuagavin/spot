"""
支付接口
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.domain import User
from src.models.schemas import ResponseSchema, PaymentPrepay, PaymentPrepayResponse
from src.services import PaymentService

router = APIRouter(tags=["支付"])


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
