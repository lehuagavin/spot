"""
API v1 路由聚合
"""
from fastapi import APIRouter

from src.api.v1.endpoints import (
    health,
    # 小程序端路由
    auth,
    user,
    students,
    communities,
    courses,
    orders,
    payment,
    member,
    banners,
    upload,
    # 管理端路由
    admin_auth,
    admin_users,
    admin_students,
    admin_communities,
    admin_teachers,
    admin_courses,
    admin_orders,
    admin_member,
    admin_banners,
    admin_dashboard,
    ai_image,
    # 测试工具路由
    test_utils,
)

api_router = APIRouter()

# 注册健康检查路由
api_router.include_router(health.router)

# 小程序端路由
api_router.include_router(auth.router)
api_router.include_router(user.router)
api_router.include_router(students.router)
api_router.include_router(communities.router)
api_router.include_router(courses.router)
api_router.include_router(orders.router)
api_router.include_router(payment.router)
api_router.include_router(member.router)
api_router.include_router(banners.router)
api_router.include_router(upload.router)

# 管理端路由
api_router.include_router(admin_auth.router)
api_router.include_router(admin_users.router)
api_router.include_router(admin_students.router)
api_router.include_router(admin_communities.router)
api_router.include_router(admin_teachers.router)
api_router.include_router(admin_courses.router)
api_router.include_router(admin_orders.router)
api_router.include_router(admin_member.router)
api_router.include_router(admin_banners.router)
api_router.include_router(admin_dashboard.router)
api_router.include_router(ai_image.router)

# 测试工具路由（仅开发/测试环境使用）
api_router.include_router(test_utils.router)
