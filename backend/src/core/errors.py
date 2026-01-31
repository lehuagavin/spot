"""
错误码定义
"""
from enum import Enum


class ErrorCode(int, Enum):
    """错误码枚举"""

    # 成功
    SUCCESS = 0

    # 通用错误 (1000-1999)
    BAD_REQUEST = 1000
    UNAUTHORIZED = 1001
    FORBIDDEN = 1003
    NOT_FOUND = 1004
    INTERNAL_ERROR = 1500

    # 用户相关错误 (2000-2999)
    USER_NOT_FOUND = 2001
    USER_ALREADY_EXISTS = 2002
    INVALID_CREDENTIALS = 2003
    PHONE_ALREADY_BOUND = 2004

    # 学员相关错误 (3000-3999)
    STUDENT_NOT_FOUND = 3001
    STUDENT_ALREADY_EXISTS = 3002
    STUDENT_ALREADY_ENROLLED = 3003

    # 课程相关错误 (4000-4999)
    COURSE_NOT_FOUND = 4001
    COURSE_FULL = 4002
    COURSE_EXPIRED = 4003
    COURSE_NOT_ENROLLING = 4004
    COURSE_HAS_STUDENTS = 4005

    # 订单相关错误 (5000-5999)
    ORDER_NOT_FOUND = 5001
    ORDER_ALREADY_PAID = 5002
    ORDER_EXPIRED = 5003
    ORDER_CANNOT_REFUND = 5004
    ORDER_NOT_BELONG = 5005
    ORDER_CANNOT_PAY = 5006
    ORDER_CANNOT_CANCEL = 5007
    ORDER_NOT_REFUNDING = 5008

    # 支付相关错误 (6000-6999)
    PAYMENT_FAILED = 6001
    REFUND_FAILED = 6002

    # 小区相关错误 (7000-7999)
    COMMUNITY_NOT_FOUND = 7001

    # 管理员相关错误 (8000-8999)
    ADMIN_NOT_FOUND = 8001
    ADMIN_ALREADY_EXISTS = 8002

    # 教练相关错误 (9000-9999)
    TEACHER_NOT_FOUND = 9001

    # 会员卡相关错误 (10000-10999)
    MEMBER_CARD_NOT_FOUND = 10001

    # 轮播图相关错误 (11000-11999)
    BANNER_NOT_FOUND = 11001


# 错误消息映射
ERROR_MESSAGES = {
    ErrorCode.SUCCESS: "成功",
    ErrorCode.BAD_REQUEST: "请求参数错误",
    ErrorCode.UNAUTHORIZED: "未授权",
    ErrorCode.FORBIDDEN: "禁止访问",
    ErrorCode.NOT_FOUND: "资源不存在",
    ErrorCode.INTERNAL_ERROR: "服务器内部错误",
    ErrorCode.USER_NOT_FOUND: "用户不存在",
    ErrorCode.USER_ALREADY_EXISTS: "用户已存在",
    ErrorCode.INVALID_CREDENTIALS: "用户名或密码错误",
    ErrorCode.PHONE_ALREADY_BOUND: "手机号已绑定",
    ErrorCode.STUDENT_NOT_FOUND: "学员不存在",
    ErrorCode.STUDENT_ALREADY_EXISTS: "学员已存在",
    ErrorCode.STUDENT_ALREADY_ENROLLED: "学员已报名该课程",
    ErrorCode.COURSE_NOT_FOUND: "课程不存在",
    ErrorCode.COURSE_FULL: "课程已满",
    ErrorCode.COURSE_EXPIRED: "课程已过期",
    ErrorCode.COURSE_NOT_ENROLLING: "课程未开放报名",
    ErrorCode.COURSE_HAS_STUDENTS: "课程已有学员报名,无法删除",
    ErrorCode.ORDER_NOT_FOUND: "订单不存在",
    ErrorCode.ORDER_ALREADY_PAID: "订单已支付",
    ErrorCode.ORDER_EXPIRED: "订单已过期",
    ErrorCode.ORDER_CANNOT_REFUND: "订单不可退款",
    ErrorCode.ORDER_NOT_BELONG: "订单不属于当前用户",
    ErrorCode.ORDER_CANNOT_PAY: "订单状态不允许支付",
    ErrorCode.ORDER_CANNOT_CANCEL: "订单状态不允许取消",
    ErrorCode.ORDER_NOT_REFUNDING: "订单不在退款中状态",
    ErrorCode.PAYMENT_FAILED: "支付失败",
    ErrorCode.REFUND_FAILED: "退款失败",
    ErrorCode.COMMUNITY_NOT_FOUND: "小区不存在",
    ErrorCode.ADMIN_NOT_FOUND: "管理员不存在",
    ErrorCode.ADMIN_ALREADY_EXISTS: "管理员已存在",
    ErrorCode.TEACHER_NOT_FOUND: "教练不存在",
    ErrorCode.MEMBER_CARD_NOT_FOUND: "会员卡不存在",
    ErrorCode.BANNER_NOT_FOUND: "轮播图不存在",
}
