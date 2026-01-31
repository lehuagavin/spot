"""
AI 描述生成接口
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Literal, Dict, Any

from src.models.schemas import ResponseSchema
from src.services.ai_description_service import (
    ai_description_service,
    APIKeyMissingError,
    APIKeyInvalidError,
    QuotaExceededError,
    GenerationError
)
from src.api.deps import get_current_admin
from src.core.logging import logger

router = APIRouter(tags=["AI 描述生成"])


class GenerateDescriptionRequest(BaseModel):
    """生成描述请求"""

    style: Literal[
        'ghibli', 'pixar', 'storybook', 'watercolor', 'flat-illustration',
        'japanese-illustration', 'cartoon-3d', 'comic', 'impressionism',
        'pop-art', 'oil', 'chinese', 'minimalism', 'cyberpunk', 'futurism'
    ] = Field(
        ...,
        description="艺术风格"
    )
    context_type: Literal['banner', 'course'] = Field(
        ...,
        description="上下文类型"
    )
    context_data: Dict[str, Any] = Field(
        ...,
        description="上下文数据"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "style": "ghibli",
                "context_type": "course",
                "context_data": {
                    "name": "体能+跳绳",
                    "age_range": "7-12岁",
                    "location": "碧海金阁小区运动场"
                }
            }
        }


class GenerateDescriptionResponse(BaseModel):
    """生成描述响应"""

    description: str = Field(..., description="生成的图片描述")
    tokens_used: int = Field(..., description="消耗的tokens数量")
    model: str = Field(..., description="使用的模型")


@router.post(
    "/ai/generate-description",
    response_model=ResponseSchema[GenerateDescriptionResponse],
    dependencies=[Depends(get_current_admin)],
    summary="生成图片描述",
    description="使用AI根据结构化信息生成图片描述"
)
async def generate_description(request: GenerateDescriptionRequest):
    """
    生成图片描述

    需要管理员权限

    支持的风格：
    - ghibli: 吉卜力风格
    - pixar: 皮克斯风格
    - storybook: 童话绘本风格
    - watercolor: 水彩画风格
    - flat-illustration: 扁平插画风格
    - japanese-illustration: 日系插画风格
    - cartoon-3d: 3D卡通风格
    - comic: 漫画风格
    - impressionism: 印象派风格
    - pop-art: 波普艺术风格
    - oil: 油画风格
    - chinese: 中国画风格
    - minimalism: 极简主义风格
    - cyberpunk: 赛博朋克风格
    - futurism: 未来主义风格

    支持的上下文类型：
    - banner: 轮播图（需要 title）
    - course: 课程（需要 name，可选 age_range, location 等）
    """
    logger.info(
        "generate_description_request",
        style=request.style,
        context_type=request.context_type
    )

    try:
        description, tokens_used = await ai_description_service.generate_description(
            style=request.style,
            context_type=request.context_type,
            context_data=request.context_data
        )

        logger.info(
            "generate_description_success",
            tokens_used=tokens_used,
            description_length=len(description)
        )

        return ResponseSchema(
            data=GenerateDescriptionResponse(
                description=description,
                tokens_used=tokens_used,
                model=ai_description_service.model
            )
        )

    except APIKeyMissingError as e:
        logger.error("generate_description_api_key_missing")
        raise HTTPException(status_code=e.status_code, detail={
            "code": e.code,
            "message": str(e)
        })

    except APIKeyInvalidError as e:
        logger.error("generate_description_api_key_invalid")
        raise HTTPException(status_code=e.status_code, detail={
            "code": e.code,
            "message": str(e)
        })

    except QuotaExceededError as e:
        logger.error("generate_description_quota_exceeded")
        raise HTTPException(status_code=e.status_code, detail={
            "code": e.code,
            "message": str(e)
        })

    except GenerationError as e:
        logger.error("generate_description_error", error=str(e))
        raise HTTPException(status_code=e.status_code, detail={
            "code": e.code,
            "message": str(e)
        })

    except ValueError as e:
        logger.error("generate_description_invalid_request", error=str(e))
        raise HTTPException(status_code=400, detail={
            "code": "INVALID_REQUEST",
            "message": str(e)
        })

    except Exception as e:
        logger.exception("generate_description_unexpected_error")
        raise HTTPException(status_code=500, detail={
            "code": "INTERNAL_ERROR",
            "message": "An unexpected error occurred"
        })
