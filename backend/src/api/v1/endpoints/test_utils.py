"""
测试工具接口

仅用于开发和测试环境，生产环境应该禁用
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime
from pydantic import BaseModel

from src.api.deps import get_current_admin
from src.core.database import get_db
from src.core.config import settings
from src.core.exceptions import AppException
from src.core.errors import ErrorCode
from src.models.domain import Admin, Order, Course, CourseStudent
from src.models.schemas import ResponseSchema, OrderResponse
from src.repositories.base import BaseRepository
from sqlalchemy import select

router = APIRouter(prefix="/test", tags=["测试工具"])


class PayOrderRequest(BaseModel):
    """模拟支付请求"""
    order_id: str


@router.post("/pay-order", response_model=ResponseSchema[OrderResponse])
async def mock_pay_order(
    data: PayOrderRequest,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    模拟订单支付成功
    
    仅用于测试环境，生产环境应禁用
    """
    # 检查是否是开发环境
    if settings.app_env not in ["development", "test"]:
        raise AppException(
            code=ErrorCode.FORBIDDEN,
            message="此接口仅在测试环境可用",
        )
    
    order_repo = BaseRepository[Order](Order)
    order = await order_repo.get(db, data.order_id)
    
    if not order:
        raise AppException(
            code=ErrorCode.ORDER_NOT_FOUND,
            message="订单不存在",
        )
    
    if order.status != "pending":
        raise AppException(
            code=ErrorCode.ORDER_CANNOT_PAY,
            message="订单状态不允许支付",
        )
    
    # 更新订单状态为已支付
    await order_repo.update(
        db,
        order,
        {
            "status": "paid",
            "pay_time": datetime.now(),
            "transaction_id": f"TEST_{data.order_id}",
        },
    )
    
    # 更新课程学员状态为已激活
    stmt = select(CourseStudent).where(CourseStudent.order_id == data.order_id)
    result = await db.execute(stmt)
    course_students = result.scalars().all()
    for cs in course_students:
        cs.status = "active"
    
    # 更新课程报名人数
    if course_students:
        course_repo = BaseRepository[Course](Course)
        course = await course_repo.get(db, order.course_id)
        if course:
            await course_repo.update(
                db, course, {"enrolled_count": course.enrolled_count + len(course_students)}
            )
    
    await db.refresh(order)
    return ResponseSchema(data=OrderResponse.model_validate(order))
