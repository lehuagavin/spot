"""
AI 图片生成服务
基于火山引擎 Seedream 4.5 模型
"""
import os
import uuid
import asyncio
import httpx
from datetime import datetime
from pathlib import Path
from typing import Optional
from loguru import logger

from volcenginesdkarkruntime import Ark

from src.core.config import settings
from src.core.exceptions import AppException
from src.core.errors import ErrorCode


class AIImageService:
    """AI 图片生成服务"""

    def __init__(self):
        """初始化服务"""
        self.api_key = settings.volcano_api_key
        self.base_url = settings.volcano_base_url
        self.model_id = settings.volcano_model_id
        self._client: Optional[Ark] = None

    @property
    def client(self) -> Ark:
        """获取 Ark 客户端（懒加载）"""
        if self._client is None:
            if not self.api_key:
                raise AppException(
                    code=ErrorCode.INTERNAL_ERROR,
                    message="未配置火山引擎 API Key，请设置环境变量 VOLCANO_API_KEY",
                )
            self._client = Ark(
                base_url=self.base_url,
                api_key=self.api_key,
            )
        return self._client

    async def generate_image(
        self,
        prompt: str,
        size: str = "2K",
        watermark: bool = False,
    ) -> dict:
        """
        生成图片

        Args:
            prompt: 图片描述提示词
            size: 图片尺寸，支持 "2K", "1080P", "720P", "480P" 等预设值
            watermark: 是否添加水印

        Returns:
            包含图片 URL 的字典
        """
        if not prompt or not prompt.strip():
            raise AppException(
                code=ErrorCode.BAD_REQUEST,
                message="图片描述不能为空",
            )

        if len(prompt) > 300:
            raise AppException(
                code=ErrorCode.BAD_REQUEST,
                message="图片描述不能超过300字",
            )

        logger.info(f"开始生成图片，提示词: {prompt[:50]}...")

        try:
            # 在线程池中执行同步调用
            loop = asyncio.get_event_loop()
            response = await loop.run_in_executor(
                None,
                lambda: self.client.images.generate(
                    model=self.model_id,
                    prompt=prompt,
                    size=size,
                    watermark=watermark,
                ),
            )

            if not response or not response.data:
                raise AppException(
                    code=ErrorCode.INTERNAL_ERROR,
                    message="AI 图片生成服务返回空结果",
                )

            # 获取图片 URL
            image_url = response.data[0].url
            logger.info(f"图片生成成功，URL: {image_url}")

            # 下载图片并保存到本地
            saved_url = await self._download_and_save_image(image_url)

            return {
                "url": saved_url,
                "original_url": image_url,
                "model": self.model_id,
                "size": size,
            }

        except AppException:
            raise
        except Exception as e:
            logger.error(f"AI 图片生成失败: {str(e)}")
            raise AppException(
                code=ErrorCode.INTERNAL_ERROR,
                message=f"AI 图片生成失败: {str(e)}",
            )

    async def _download_and_save_image(self, image_url: str) -> str:
        """
        下载图片并保存到本地

        Args:
            image_url: 图片 URL

        Returns:
            本地保存的图片路径
        """
        try:
            # 下载图片
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.get(image_url)
                response.raise_for_status()
                image_data = response.content

            # 生成文件名
            date_path = datetime.now().strftime("%Y%m%d")
            filename = f"ai_{uuid.uuid4().hex}.png"

            # 确保目录存在
            upload_dir = Path("uploads") / date_path
            upload_dir.mkdir(parents=True, exist_ok=True)

            # 保存文件
            file_path = upload_dir / filename
            with open(file_path, "wb") as f:
                f.write(image_data)

            logger.info(f"图片已保存到: {file_path}")

            # 返回相对 URL
            return f"/uploads/{date_path}/{filename}"

        except Exception as e:
            logger.error(f"下载并保存图片失败: {str(e)}")
            raise AppException(
                code=ErrorCode.INTERNAL_ERROR,
                message=f"下载图片失败: {str(e)}",
            )


# 创建服务单例
ai_image_service = AIImageService()
