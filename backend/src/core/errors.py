"""
错误码定义

错误码规范 (与测试脚本保持一致):
| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 10001 | 认证失败(用户名或密码错误) |
| 10002 | 参数错误(缺少必填字段、格式错误等) |
| 10003 | 未授权(无Token或Token无效) |
| 10004 | 资源不存在(404) |
| 10005 | 业务逻辑错误(如重复操作) |
| 10006 | 状态错误(如未支付订单申请退款) |
| 10007 | 文件过大 |
| 10008 | 文件类型错误 |
| 10009 | 服务器内部错误 |
"""
from enum import Enum


class ErrorCode(int, Enum):
    """错误码枚举"""

    # 成功
    SUCCESS = 0

    # 通用错误 (10001-10009)
    INVALID_CREDENTIALS = 10001  # 认证失败(用户名或密码错误)
    BAD_REQUEST = 10002  # 参数错误
    UNAUTHORIZED = 10003  # 未授权(无Token或Token无效)
    NOT_FOUND = 10004  # 资源不存在
    BUSINESS_ERROR = 10005  # 业务逻辑错误
    STATUS_ERROR = 10006  # 状态错误
    FILE_TOO_LARGE = 10007  # 文件过大
    FILE_TYPE_ERROR = 10008  # 文件类型错误
    INTERNAL_ERROR = 10009  # 服务器内部错误

    # 以下为兼容旧代码的别名
    FORBIDDEN = 10003  # 禁止访问(等同于未授权)

    # 用户相关错误 (使用通用错误码)
    USER_NOT_FOUND = 10004
    USER_ALREADY_EXISTS = 10005
    PHONE_ALREADY_BOUND = 10005

    # 学员相关错误 (使用通用错误码)
    STUDENT_NOT_FOUND = 10004
    STUDENT_ALREADY_EXISTS = 10005
    STUDENT_ALREADY_ENROLLED = 10005

    # 课程相关错误 (使用通用错误码)
    COURSE_NOT_FOUND = 10004
    COURSE_FULL = 10005
    COURSE_EXPIRED = 10005
    COURSE_NOT_ENROLLING = 10005
    COURSE_HAS_STUDENTS = 10005

    # 订单相关错误 (使用通用错误码)
    ORDER_NOT_FOUND = 10004
    ORDER_ALREADY_PAID = 10005
    ORDER_EXPIRED = 10005
    ORDER_CANNOT_REFUND = 10006
    ORDER_NOT_BELONG = 10004
    ORDER_CANNOT_PAY = 10006
    ORDER_CANNOT_CANCEL = 10005
    ORDER_NOT_REFUNDING = 10006

    # 支付相关错误 (使用通用错误码)
    PAYMENT_FAILED = 10005
    REFUND_FAILED = 10005

    # 小区相关错误 (使用通用错误码)
    COMMUNITY_NOT_FOUND = 10004

    # 管理员相关错误 (使用通用错误码)
    ADMIN_NOT_FOUND = 10004
    ADMIN_ALREADY_EXISTS = 10005

    # 教练相关错误 (使用通用错误码)
    TEACHER_NOT_FOUND = 10004

    # 会员卡相关错误 (使用通用错误码)
    MEMBER_CARD_NOT_FOUND = 10004

    # 轮播图相关错误 (使用通用错误码)
    BANNER_NOT_FOUND = 10004


# 错误消息映射
ERROR_MESSAGES = {
    ErrorCode.SUCCESS: "成功",
    ErrorCode.INVALID_CREDENTIALS: "用户名或密码错误",
    ErrorCode.BAD_REQUEST: "请求参数错误",
    ErrorCode.UNAUTHORIZED: "未授权",
    ErrorCode.NOT_FOUND: "资源不存在",
    ErrorCode.BUSINESS_ERROR: "业务逻辑错误",
    ErrorCode.STATUS_ERROR: "状态错误",
    ErrorCode.FILE_TOO_LARGE: "文件过大",
    ErrorCode.FILE_TYPE_ERROR: "文件类型错误",
    ErrorCode.INTERNAL_ERROR: "服务器内部错误",
}
