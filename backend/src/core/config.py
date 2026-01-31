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

    # 火山引擎 AI 图片生成配置
    volcano_api_key: str = Field(default="", alias="VOLCANO_API_KEY")
    volcano_base_url: str = Field(
        default="https://ark.cn-beijing.volces.com/api/v3",
        alias="VOLCANO_BASE_URL"
    )
    volcano_model_id: str = Field(
        default="doubao-seedream-4-5-251128",
        alias="VOLCANO_MODEL_ID"
    )

    # 硅基流动 AI 描述生成配置
    siliconflow_api_key: str = Field(default="", alias="SILICONFLOW_API_KEY")
    siliconflow_base_url: str = Field(
        default="https://api.siliconflow.cn/v1",
        alias="SILICONFLOW_BASE_URL"
    )
    siliconflow_model: str = Field(
        default="Qwen/Qwen2.5-7B-Instruct",
        alias="SILICONFLOW_MODEL"
    )
    siliconflow_timeout: int = Field(default=30, alias="SILICONFLOW_TIMEOUT")

    @property
    def is_siliconflow_enabled(self) -> bool:
        """检查硅基流动是否已配置"""
        return bool(self.siliconflow_api_key)


@lru_cache
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


settings = get_settings()
