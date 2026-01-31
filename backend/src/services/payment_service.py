"""
支付服务
"""
import hashlib
import time
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.exceptions import AppException
from src.core.errors import ErrorCode
from src.models.domain import Payment, Order, Course
from src.models.schemas import PaymentPrepay, PaymentPrepayResponse
from src.repositories.base import BaseRepository
from src.utils.id_generator import generate_id


class PaymentService:
    """支付服务"""

    def __init__(self):
        self.repo = BaseRepository[Payment](Payment)

    async def create_prepay(
        self, db: AsyncSession, user_id: str, data: PaymentPrepay
    ) -> PaymentPrepayResponse:
        """创建预支付订单"""
        # 验证订单
        order_repo = BaseRepository[Order](Order)
        order = await order_repo.get(db, data.order_id)
        if not order:
            raise AppException(
                code=ErrorCode.ORDER_NOT_FOUND,
                message="订单不存在",
            )
        if order.user_id != user_id:
            raise AppException(
                code=ErrorCode.ORDER_NOT_BELONG,
                message="订单不属于当前用户",
            )
        if order.status != "pending":
            raise AppException(
                code=ErrorCode.ORDER_CANNOT_PAY,
                message="订单状态不允许支付",
            )

        # 检查订单是否已过期
        if order.expire_at < datetime.now():
            await order_repo.update(db, order, {"status": "expired"})
            raise AppException(
                code=ErrorCode.ORDER_EXPIRED,
                message="订单已过期",
            )

        # 创建支付记录
        payment = await self.repo.create(
            db,
            {
                "id": generate_id(),
                "order_id": order.id,
                "amount": order.pay_amount,
                "status": "pending",
            },
        )

        # 模拟支付预下单(本地开发环境)
        timestamp = str(int(time.time()))
        nonce_str = generate_id()[:16]
        prepay_id = f"prepay_{payment.id}"

        # 生成模拟签名
        sign_str = f"prepay_id={prepay_id}&timestamp={timestamp}&nonce={nonce_str}"
        sign = hashlib.md5(sign_str.encode()).hexdigest()

        return PaymentPrepayResponse(
            prepay_id=prepay_id,
            timestamp=timestamp,
            nonce_str=nonce_str,
            sign=sign,
        )

    async def handle_payment_callback(
        self, db: AsyncSession, order_id: str, transaction_id: str
    ) -> bool:
        """处理支付回调(内部接口)"""
        # 获取订单
        order_repo = BaseRepository[Order](Order)
        order = await order_repo.get(db, order_id)
        if not order:
            return False

        # 查找支付记录
        stmt = select(Payment).where(Payment.order_id == order_id, Payment.status == "pending")
        result = await db.execute(stmt)
        payment = result.scalars().first()
        if not payment:
            return False

        # 更新支付记录
        await self.repo.update(
            db,
            payment,
            {
                "transaction_id": transaction_id,
                "status": "success",
                "pay_time": datetime.now(),
            },
        )

        # 更新订单状态
        await order_repo.update(
            db,
            order,
            {
                "status": "paid",
                "pay_time": datetime.now(),
            },
        )

        # 更新课程报名人数
        from src.models.domain import CourseStudent
        stmt = select(CourseStudent).where(CourseStudent.order_id == order_id)
        result = await db.execute(stmt)
        course_students = result.scalars().all()

        for cs in course_students:
            cs.status = "active"

        course_repo = BaseRepository[Course](Course)
        course = await course_repo.get(db, order.course_id)
        if course:
            await course_repo.update(
                db,
                course,
                {"enrolled_count": course.enrolled_count + len(course_students)},
            )

        return True
