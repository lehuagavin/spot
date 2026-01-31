"""
管理端仪表盘接口
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from src.api.deps import get_current_admin
from src.core.database import get_db
from src.models.domain import Admin, User, Order, Course
from src.models.schemas import ResponseSchema

router = APIRouter(prefix="/admin/dashboard", tags=["管理端-仪表盘"])


@router.get("/stats", response_model=ResponseSchema[dict])
async def get_dashboard_stats(
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取统计数据"""
    # 统计用户总数
    stmt = select(func.count(User.id))
    result = await db.execute(stmt)
    total_users = result.scalar() or 0

    # 统计订单总数
    stmt = select(func.count(Order.id))
    result = await db.execute(stmt)
    total_orders = result.scalar() or 0

    # 统计已支付订单数
    stmt = select(func.count(Order.id)).where(Order.status == "paid")
    result = await db.execute(stmt)
    paid_orders = result.scalar() or 0

    # 统计总收入
    stmt = select(func.sum(Order.pay_amount)).where(Order.status == "paid")
    result = await db.execute(stmt)
    total_revenue = result.scalar() or 0

    # 统计课程总数
    stmt = select(func.count(Course.id))
    result = await db.execute(stmt)
    total_courses = result.scalar() or 0

    # 统计进行中的课程
    stmt = select(func.count(Course.id)).where(Course.status == "enrolling")
    result = await db.execute(stmt)
    enrolling_courses = result.scalar() or 0

    return ResponseSchema(
        data={
            "total_users": total_users,
            "total_orders": total_orders,
            "paid_orders": paid_orders,
            "total_revenue": float(total_revenue),
            "total_courses": total_courses,
            "enrolling_courses": enrolling_courses,
        }
    )


@router.get("/recent-orders", response_model=ResponseSchema[list[dict]])
async def get_recent_orders(
    current_admin: Admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """获取最近订单"""
    stmt = (
        select(Order)
        .order_by(Order.created_at.desc())
        .limit(10)
    )
    result = await db.execute(stmt)
    orders = result.scalars().all()

    return ResponseSchema(
        data=[
            {
                "id": o.id,
                "order_no": o.order_no,
                "user_id": o.user_id,
                "course_id": o.course_id,
                "pay_amount": float(o.pay_amount),
                "status": o.status,
                "created_at": o.created_at.isoformat(),
            }
            for o in orders
        ]
    )
