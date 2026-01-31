"""
管理端订单管理接口
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.api.deps import get_current_admin
from src.core.database import get_db
from src.models.domain import Admin
from src.models.schemas import (
    ResponseSchema,
    PaginatedResponseSchema,
    OrderResponse,
)
from src.services import OrderService

router = APIRouter(prefix="/admin/orders", tags=["管理端-订单管理"])


@router.get("", response_model=ResponseSchema[PaginatedResponseSchema[OrderResponse]])
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取订单列表"""
    service = OrderService()
    result = await service.list_all_orders(db, page, page_size)
    return ResponseSchema(data=result)


@router.get("/{order_id}", response_model=ResponseSchema[OrderResponse])
async def get_order(
    order_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取订单详情"""
    service = OrderService()
    order = await service.get_order(db, order_id)
    return ResponseSchema(data=order)


@router.post("/{order_id}/refund", response_model=ResponseSchema[OrderResponse])
async def process_refund(
    order_id: str,
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """处理退款"""
    service = OrderService()
    order = await service.process_refund(db, order_id)
    return ResponseSchema(data=order)
