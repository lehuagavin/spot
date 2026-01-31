"""
AI 图片生成接口
"""
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from src.models.schemas import ResponseSchema
from src.services.ai_image_service import ai_image_service
from src.api.deps import get_current_admin

router = APIRouter(tags=["AI 图片生成"])


class ImageGenerateRequest(BaseModel):
    """图片生成请求"""

    prompt: str = Field(..., min_length=1, max_length=300, description="图片描述提示词")
    size: str = Field(default="2K", description="图片尺寸，支持 2K, 1080P, 720P, 480P 等")


class ImageGenerateResponse(BaseModel):
    """图片生成响应"""

    url: str = Field(..., description="图片相对 URL")
    original_url: str = Field(..., description="原始图片 URL")
    model: str = Field(..., description="使用的模型")
    size: str = Field(..., description="图片尺寸")


@router.post(
    "/ai/generate-image",
    response_model=ResponseSchema[ImageGenerateResponse],
    dependencies=[Depends(get_current_admin)],
)
async def generate_image(request: ImageGenerateRequest):
    """
    使用 AI 生成图片

    需要管理员权限
    """
    result = await ai_image_service.generate_image(
        prompt=request.prompt,
        size=request.size,
    )
    return ResponseSchema(data=ImageGenerateResponse(**result))
