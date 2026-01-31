"""
订单服务
"""
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.exceptions import AppException
from src.core.errors import ErrorCode
from src.models.domain import Order, Course, CourseStudent, Student, User
from src.models.schemas import OrderCreate, OrderResponse, RefundRequest
from src.repositories.base import BaseRepository
from src.utils.id_generator import generate_id, generate_order_no


class OrderService:
    """订单服务"""

    def __init__(self):
        self.repo = BaseRepository[Order](Order)

    async def create_order(
        self, db: AsyncSession, user_id: str, data: OrderCreate
    ) -> OrderResponse:
        """创建订单"""
        # 验证课程是否存在
        course_repo = BaseRepository[Course](Course)
        course = await course_repo.get(db, data.course_id)
        if not course:
            raise AppException(
                code=ErrorCode.COURSE_NOT_FOUND,
                message="课程不存在",
            )

        # 验证课程状态
        if course.status not in ["pending", "enrolling"]:
            raise AppException(
                code=ErrorCode.COURSE_NOT_ENROLLING,
                message="课程当前不可报名",
            )

        # 验证学员是否属于当前用户
        student_repo = BaseRepository[Student](Student)
        students = []
        for student_id in data.student_ids:
            student = await student_repo.get(db, student_id)
            if not student or student.user_id != user_id:
                raise AppException(
                    code=ErrorCode.STUDENT_NOT_FOUND,
                    message=f"学员{student_id}不存在或不属于当前用户",
                )
            students.append(student)

        # 检查是否已报名（排除已取消和已退款的记录）
        stmt = select(CourseStudent).where(
            CourseStudent.course_id == data.course_id,
            CourseStudent.student_id.in_(data.student_ids),
            CourseStudent.status.notin_(["cancelled", "refunded"]),
        )
        result = await db.execute(stmt)
        existing = result.scalars().first()
        if existing:
            raise AppException(
                code=ErrorCode.STUDENT_ALREADY_ENROLLED,
                message="学员已报名该课程",
            )

        # 检查课程名额
        if course.enrolled_count + len(students) > course.max_students:
            raise AppException(
                code=ErrorCode.COURSE_FULL,
                message="课程名额不足",
            )

        # 获取用户会员状态
        user_repo = BaseRepository[User](User)
        user = await user_repo.get(db, user_id)
        is_member = bool(user.is_member) if user else False

        # 计算价格
        unit_price = course.member_price if is_member else course.price
        total_amount = unit_price * len(students)
        discount_amount = Decimal("0.00")
        pay_amount = total_amount - discount_amount

        # 创建订单
        order = await self.repo.create(
            db,
            {
                "id": generate_id(),
                "order_no": generate_order_no(),
                "user_id": user_id,
                "course_id": data.course_id,
                "total_amount": total_amount,
                "discount_amount": discount_amount,
                "pay_amount": pay_amount,
                "coupon_id": data.coupon_id,
                "status": "pending",
                "expire_at": datetime.now() + timedelta(minutes=30),
            },
        )

        # 创建课程学员关联
        course_student_repo = BaseRepository[CourseStudent](CourseStudent)
        for student in students:
            await course_student_repo.create(
                db,
                {
                    "id": generate_id(),
                    "course_id": data.course_id,
                    "student_id": student.id,
                    "order_id": order.id,
                    "price": unit_price,
                    "is_new_user": 0,
                    "status": "pending",
                },
            )

        await db.refresh(order)
        return OrderResponse.model_validate(order)

    async def get_order(self, db: AsyncSession, order_id: str, user_id: str = None) -> OrderResponse:
        """获取订单详情"""
        order = await self.repo.get(db, order_id)
        if not order:
            raise AppException(
                code=ErrorCode.ORDER_NOT_FOUND,
                message="订单不存在",
            )
        if user_id and order.user_id != user_id:
            raise AppException(
                code=ErrorCode.ORDER_NOT_BELONG,
                message="订单不属于当前用户",
            )
        return OrderResponse.model_validate(order)

    async def list_orders(
        self, db: AsyncSession, user_id: str, status: str = None, page: int = 1, page_size: int = 20
    ) -> dict:
        """获取订单列表"""
        filters = {"user_id": user_id}
        if status:
            filters["status"] = status

        total = await self.repo.count(db, **filters)
        orders = await self.repo.get_multi(
            db, skip=(page - 1) * page_size, limit=page_size, **filters
        )
        return {
            "items": [OrderResponse.model_validate(o) for o in orders],
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    async def cancel_order(
        self, db: AsyncSession, order_id: str, user_id: str
    ) -> OrderResponse:
        """取消订单"""
        order = await self.repo.get(db, order_id)
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
                code=ErrorCode.ORDER_CANNOT_CANCEL,
                message="订单状态不允许取消",
            )

        await self.repo.update(db, order, {"status": "cancelled"})
        
        # 删除课程学员关联记录，允许学员后续重新报名
        stmt = select(CourseStudent).where(CourseStudent.order_id == order_id)
        result = await db.execute(stmt)
        course_students = result.scalars().all()
        for cs in course_students:
            await db.delete(cs)
        
        await db.refresh(order)
        return OrderResponse.model_validate(order)

    async def request_refund(
        self, db: AsyncSession, order_id: str, user_id: str, data: RefundRequest
    ) -> OrderResponse:
        """申请退款"""
        order = await self.repo.get(db, order_id)
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
        if order.status != "paid":
            raise AppException(
                code=ErrorCode.ORDER_CANNOT_REFUND,
                message="订单状态不允许退款",
            )

        await self.repo.update(
            db, order, {"status": "refunding", "remark": data.reason}
        )
        await db.refresh(order)
        return OrderResponse.model_validate(order)

    async def process_refund(
        self, db: AsyncSession, order_id: str
    ) -> OrderResponse:
        """处理退款(管理端)"""
        order = await self.repo.get(db, order_id)
        if not order:
            raise AppException(
                code=ErrorCode.ORDER_NOT_FOUND,
                message="订单不存在",
            )
        if order.status != "refunding":
            raise AppException(
                code=ErrorCode.ORDER_NOT_REFUNDING,
                message="订单不在退款中状态",
            )

        # 更新订单状态和课程学员关联
        await self.repo.update(
            db,
            order,
            {
                "status": "refunded",
                "refund_time": datetime.now(),
                "refund_amount": order.pay_amount,
            },
        )

        # 更新课程学员状态
        stmt = select(CourseStudent).where(CourseStudent.order_id == order_id)
        result = await db.execute(stmt)
        course_students = result.scalars().all()
        for cs in course_students:
            cs.status = "refunded"

        # 更新课程报名人数
        course_repo = BaseRepository[Course](Course)
        course = await course_repo.get(db, order.course_id)
        if course:
            await course_repo.update(
                db, course, {"enrolled_count": course.enrolled_count - len(course_students)}
            )

        await db.refresh(order)
        return OrderResponse.model_validate(order)

    async def list_all_orders(
        self, db: AsyncSession, page: int, page_size: int
    ) -> dict:
        """获取所有订单(管理端)"""
        total = await self.repo.count(db)
        orders = await self.repo.get_multi(
            db, skip=(page - 1) * page_size, limit=page_size
        )
        return {
            "items": [OrderResponse.model_validate(o) for o in orders],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
