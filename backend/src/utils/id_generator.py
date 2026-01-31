"""
ID 生成工具
"""
import uuid
from datetime import datetime


def generate_id(prefix: str = "") -> str:
    """生成唯一 ID

    Args:
        prefix: ID 前缀

    Returns:
        生成的唯一 ID
    """
    if prefix:
        # 使用前缀 + 时间戳 + 随机部分
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_part = uuid.uuid4().hex[:8]
        return f"{prefix}_{timestamp}_{random_part}"
    else:
        # 纯 UUID
        return uuid.uuid4().hex


def generate_order_no() -> str:
    """生成订单号

    Returns:
        订单号
    """
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_part = uuid.uuid4().hex[:8].upper()
    return f"ORD{timestamp}{random_part}"
