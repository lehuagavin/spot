"""
自定义异常
"""
from typing import Any, Optional
from .errors import ErrorCode, ERROR_MESSAGES


class AppException(Exception):
    """应用异常基类"""

    def __init__(
        self,
        code: ErrorCode,
        message: Optional[str] = None,
        details: Optional[Any] = None,
    ):
        """初始化

        Args:
            code: 错误码
            message: 错误消息（可选，默认使用错误码对应的消息）
            details: 错误详情
        """
        self.code = code
        self.message = message or ERROR_MESSAGES.get(code, "未知错误")
        self.details = details or {}
        super().__init__(self.message)


class NotFoundException(AppException):
    """资源不存在异常"""

    def __init__(self, resource: str, id: Any):
        super().__init__(
            code=ErrorCode.NOT_FOUND,
            message=f"{resource} with id {id} not found",
        )


class BadRequestException(AppException):
    """请求参数错误异常"""

    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            code=ErrorCode.BAD_REQUEST,
            message=message,
            details=details,
        )


class UnauthorizedException(AppException):
    """未授权异常"""

    def __init__(self, message: str = "未授权"):
        super().__init__(
            code=ErrorCode.UNAUTHORIZED,
            message=message,
        )


class ForbiddenException(AppException):
    """禁止访问异常"""

    def __init__(self, message: str = "禁止访问"):
        super().__init__(
            code=ErrorCode.FORBIDDEN,
            message=message,
        )
