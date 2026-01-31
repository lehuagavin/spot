"""
应用配置模块
"""
from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """应用配置"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # 应用配置
    app_name: str = Field(default="spot", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    debug: bool = Field(default=True, alias="DEBUG")
    secret_key: str = Field(default="", alias="SECRET_KEY")

    # 数据库配置
    database_url: str = Field(alias="DATABASE_URL")

    # 文件上传配置
    upload_dir: str = Field(default="./uploads", alias="UPLOAD_DIR")
    max_upload_size: int = Field(default=10485760, alias="MAX_UPLOAD_SIZE")

    # 微信小程序配置
    wechat_app_id: str = Field(default="", alias="WECHAT_APP_ID")
    wechat_app_secret: str = Field(default="", alias="WECHAT_APP_SECRET")

    # 微信支付配置
    wechat_mch_id: Optional[str] = Field(default=None, alias="WECHAT_MCH_ID")
    wechat_api_key: Optional[str] = Field(default=None, alias="WECHAT_API_KEY")

    # 日志配置
    log_level: str = Field(default="DEBUG", alias="LOG_LEVEL")
    log_dir: str = Field(default="./logs", alias="LOG_DIR")

    # CORS 配置
    cors_origins: list[str] = Field(
        default=["http://localhost:5173", "http://127.0.0.1:5173"]
    )


@lru_cache
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


settings = get_settings()
