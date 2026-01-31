"""
健康检查接口
"""
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.errors import ErrorCode

router = APIRouter(tags=["健康检查"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)) -> dict:
    """健康检查接口

    Returns:
        dict: 健康状态信息，包含统一的 code 字段
    """
    # 检查数据库连接
    try:
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
