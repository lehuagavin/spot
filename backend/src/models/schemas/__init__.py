"""
Pydantic Schema 包
"""
from .common import ResponseSchema, PaginationSchema, PaginatedResponseSchema
from .admin import AdminLogin, AdminResponse, AdminTokenResponse
from .user import UserCreate, UserUpdate, UserResponse, UserAssetsResponse
from .student import StudentCreate, StudentUpdate, StudentResponse
from .community import (
    CommunityCreate,
    CommunityUpdate,
    CommunityResponse,
    CommunityNearbyQuery,
)
from .course import CourseCreate, CourseUpdate, CourseResponse, CourseQuery
from .teacher import TeacherCreate, TeacherUpdate, TeacherResponse
from .order import OrderCreate, OrderResponse, RefundRequest
from .payment import PaymentPrepay, PaymentPrepayResponse, PaymentResponse
from .member_card import (
    MemberCardCreate,
    MemberCardUpdate,
    MemberCardResponse,
    MemberPurchaseRequest,
    UserMemberResponse,
)
from .banner import BannerCreate, BannerUpdate, BannerResponse

__all__ = [
    "ResponseSchema",
    "PaginationSchema",
    "PaginatedResponseSchema",
    "AdminLogin",
    "AdminResponse",
    "AdminTokenResponse",
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserAssetsResponse",
    "StudentCreate",
    "StudentUpdate",
    "StudentResponse",
    "CommunityCreate",
    "CommunityUpdate",
    "CommunityResponse",
    "CommunityNearbyQuery",
    "CourseCreate",
    "CourseUpdate",
    "CourseResponse",
    "CourseQuery",
    "TeacherCreate",
    "TeacherUpdate",
    "TeacherResponse",
    "OrderCreate",
    "OrderResponse",
    "RefundRequest",
    "PaymentPrepay",
    "PaymentPrepayResponse",
    "PaymentResponse",
    "MemberCardCreate",
    "MemberCardUpdate",
    "MemberCardResponse",
    "MemberPurchaseRequest",
    "UserMemberResponse",
    "BannerCreate",
    "BannerUpdate",
    "BannerResponse",
]
