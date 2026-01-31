"""
义城上门教育 - 后端主应用

FastAPI 应用入口
"""
from contextlib import asynccontextmanager
from datetime import datetime
from decimal import Decimal
import json
import time

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from loguru import logger

from src.api.v1.router import api_router
from src.core.config import settings
from src.core.errors import ErrorCode
from src.core.exceptions import AppException
from src.core.logging import setup_logging


# 自定义 JSON 编码器
class CustomJSONEncoder(json.JSONEncoder):
    """自定义 JSON 编码器，支持 Decimal 和 datetime"""

    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)


# 自定义 JSONResponse
class CustomJSONResponse(JSONResponse):
    """自定义 JSONResponse，使用自定义编码器"""

    def render(self, content) -> bytes:
        return json.dumps(
            content,
            ensure_ascii=False,
            allow_nan=False,
            indent=None,
            separators=(",", ":"),
            cls=CustomJSONEncoder,
        ).encode("utf-8")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时执行
    setup_logging()
    logger.info(f"应用启动 - 环境: {settings.app_env}")
    logger.info(f"调试模式: {settings.debug}")

    yield

    # 关闭时执行
    logger.info("应用关闭")


# 创建 FastAPI 应用
app = FastAPI(
    title=settings.app_name,
    description="义城上门教育 - 微信小程序后端 API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
    default_response_class=CustomJSONResponse,
)


# 请求日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """记录请求日志"""
    start_time = time.time()

    # 记录请求
    logger.info(f"请求开始: {request.method} {request.url.path}")

    # 处理请求
    response = await call_next(request)

    # 计算处理时间
    process_time = time.time() - start_time

    # 记录响应
    logger.info(
        f"请求完成: {request.method} {request.url.path} "
        f"状态码={response.status_code} 耗时={process_time:.3f}s"
    )

    # 添加处理时间头
    response.headers["X-Process-Time"] = str(process_time)

    return response


# 全局异常处理器
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    """应用异常处理"""
    logger.error(f"应用异常: {exc.message}")
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": exc.code,
            "message": exc.message,
            "data": exc.details,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """参数验证异常处理"""
    # 格式化错误信息，确保可以 JSON 序列化
    formatted_errors = []
    for error in exc.errors():
        formatted_error = {
            "type": error.get("type", "unknown"),
            "loc": error.get("loc", []),
            "msg": str(error.get("msg", "")),
        }
        # 如果有 input 字段，尝试序列化它
        if "input" in error:
            try:
                import json
                json.dumps(error["input"])
                formatted_error["input"] = error["input"]
            except (TypeError, ValueError):
                formatted_error["input"] = str(error["input"])
        formatted_errors.append(formatted_error)

    logger.error(f"参数验证失败: {formatted_errors}")
    return CustomJSONResponse(
        status_code=status.HTTP_200_OK,
        content={
            "code": ErrorCode.BAD_REQUEST,
            "message": "请求参数错误",
            "data": {"errors": formatted_errors},
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理"""
    logger.exception("未处理的异常")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": ErrorCode.INTERNAL_ERROR,
            "message": "服务器内部错误",
            "data": {"error": str(exc)} if settings.debug else {},
        },
    )


# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 配置静态文件服务
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# 注册路由
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """根路径"""
    return {
        "message": "义城上门教育 API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    """根路径健康检查（兼容测试脚本）"""
    from datetime import datetime
    from sqlalchemy import text
    from src.core.database import async_session_maker
    from src.core.errors import ErrorCode

    # 检查数据库连接
    try:
        async with async_session_maker() as db:
            await db.execute(text("SELECT 1"))
            db_status = "ok"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "code": ErrorCode.SUCCESS,
        "message": "success",
        "data": {
            "status": "ok" if db_status == "ok" else "degraded",
            "timestamp": datetime.now().isoformat(),
            "database": db_status,
        },
    }
