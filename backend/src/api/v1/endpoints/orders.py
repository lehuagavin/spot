"""
订单接口
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_user
from src.core.database import get_db
from src.models.domain import User
from src.models.schemas import (
    ResponseSchema,
    PaginatedResponseSchema,
    OrderCreate,
    OrderResponse,
    RefundRequest,
)
from src.services import OrderService

router = APIRouter(tags=["订单管理"])


@router.post("/orders", response_model=ResponseSchema[OrderResponse])
async def create_order(
    data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """创建订单"""
    service = OrderService()
    order = await service.create_order(db, current_user.id, data)
    return ResponseSchema(data=order)


@router.get("/orders", response_model=ResponseSchema[PaginatedResponseSchema[OrderResponse]])
async def list_orders(
    status: str = Query(None, description="订单状态"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取订单列表"""
    service = OrderService()
    result = await service.list_orders(db, current_user.id, status, page, page_size)
    return ResponseSchema(data=result)


@router.get("/orders/{order_id}", response_model=ResponseSchema[OrderResponse])
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """获取订单详情"""
    service = OrderService()
    order = await service.get_order(db, order_id, current_user.id)
    return ResponseSchema(data=order)


@router.post("/orders/{order_id}/cancel", response_model=ResponseSchema[OrderResponse])
async def cancel_order(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """取消订单"""
    service = OrderService()
    order = await service.cancel_order(db, order_id, current_user.id)
    return ResponseSchema(data=order)


@router.post("/orders/{order_id}/refund", response_model=ResponseSchema[OrderResponse])
async def request_refund(
    order_id: str,
    data: RefundRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """申请退款"""
    service = OrderService()
    order = await service.request_refund(db, order_id, current_user.id, data)
    return ResponseSchema(data=order)
