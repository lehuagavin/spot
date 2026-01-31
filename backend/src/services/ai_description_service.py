"""
AI 描述生成服务
"""
import httpx
from typing import Dict, Any, Tuple

from src.core.config import settings
from src.core.logging import logger


# 系统提示词
SYSTEM_PROMPT = """你是一个专业的图片描述生成助手，擅长根据结构化信息生成适合AI绘画的详细描述。

你的任务是生成专业的图片描述，用于 AI 图片生成（如 Stable Diffusion）。

要求：
1. 描述长度：100-200字
2. 包含场景、人物、动作、氛围
3. 突出指定的艺术风格
4. 描述要具体、生动、富有画面感
5. 适合用于AI图片生成

输出格式：
<场景描述，包含人物、动作、环境>。<风格描述，包含配色、氛围、质感等>。

注意：
- 直接输出描述，不要有"描述："、"图片："等前缀
- 不要有任何解释性文字
- 场景要积极向上，适合教育场景
"""

# 风格描述
STYLE_DESCRIPTIONS = {
    "ghibli": {
        "name": "吉卜力风格",
        "suffix": "吉卜力工作室风格，水彩画质感，柔和的色彩过渡，温暖治愈的氛围，充满童趣和想象力。"
    },
    "pixar": {
        "name": "皮克斯风格",
        "suffix": "皮克斯动画风格，3D渲染质感，圆润的角色设计，明亮温暖的配色，活泼可爱的氛围。"
    },
    "storybook": {
        "name": "童话绘本风格",
        "suffix": "童话绘本风格，梦幻温馨的画面，充满童趣的角色，鲜艳明快的色彩，富有故事性。"
    },
    "watercolor": {
        "name": "水彩画风格",
        "suffix": "水彩画风格，透明的色彩层次，自然的水色晕染，清新柔和的画面，充满艺术感。"
    },
    "flat-illustration": {
        "name": "扁平插画风格",
        "suffix": "扁平插画风格，简洁的几何造型，鲜明的色块对比，现代时尚的设计感。"
    },
    "japanese-illustration": {
        "name": "日系插画风格",
        "suffix": "日系插画风格，清新唯美的画面，柔和的光影效果，细腻温暖的色调。"
    },
    "cartoon-3d": {
        "name": "3D卡通风格",
        "suffix": "3D卡通风格，Q版可爱的角色造型，立体圆润的建模，活泼生动的表现。"
    },
    "comic": {
        "name": "漫画风格",
        "suffix": "漫画风格，清晰的线条勾勒，动感的构图，夸张生动的表现力。"
    },
    "impressionism": {
        "name": "印象派风格",
        "suffix": "印象派风格，斑斓的光影效果，丰富的色彩变化，捕捉瞬间的意境美感。"
    },
    "pop-art": {
        "name": "波普艺术风格",
        "suffix": "波普艺术风格，鲜艳明快的配色，大胆的色块对比，充满活力和现代感。"
    },
    "oil": {
        "name": "油画风格",
        "suffix": "油画风格，厚重的笔触质感，古典优雅的色调，丰富的明暗层次，艺术感十足。"
    },
    "chinese": {
        "name": "中国画风格",
        "suffix": "中国画风格，水墨渲染效果，注重留白与意境，淡雅清新的色彩，诗意的画面氛围。"
    },
    "minimalism": {
        "name": "极简主义风格",
        "suffix": "极简主义风格，简约纯粹的构图，丰富的留白空间，突出主体焦点。"
    },
    "cyberpunk": {
        "name": "赛博朋克风格",
        "suffix": "赛博朋克风格，霓虹色彩，科技感十足，未来城市氛围，炫酷动感。"
    },
    "futurism": {
        "name": "未来主义风格",
        "suffix": "未来主义风格，科技感十足，几何线条流畅，高饱和度色彩对比，充满现代感和活力。"
    },
}


class AIDescriptionError(Exception):
    """AI描述生成异常基类"""
    pass


class APIKeyMissingError(AIDescriptionError):
    """API Key未配置"""
    def __init__(self):
        super().__init__("AI description service is not configured")
        self.code = "API_KEY_MISSING"
        self.status_code = 503


class APIKeyInvalidError(AIDescriptionError):
    """API Key无效"""
    def __init__(self):
        super().__init__("Invalid API key")
        self.code = "API_KEY_INVALID"
        self.status_code = 401


class QuotaExceededError(AIDescriptionError):
    """配额超限"""
    def __init__(self):
        super().__init__("API quota exceeded")
        self.code = "QUOTA_EXCEEDED"
        self.status_code = 429


class GenerationError(AIDescriptionError):
    """生成失败"""
    def __init__(self, detail: str):
        super().__init__(f"Failed to generate description: {detail}")
        self.code = "GENERATION_ERROR"
        self.status_code = 500


class AIDescriptionService:
    """AI描述生成服务"""

    def __init__(self):
        self.api_key = settings.siliconflow_api_key
        self.base_url = settings.siliconflow_base_url
        self.model = settings.siliconflow_model
        self.timeout = settings.siliconflow_timeout

    async def generate_description(
        self,
        style: str,
        context_type: str,
        context_data: Dict[str, Any]
    ) -> Tuple[str, int]:
        """
        生成图片描述

        Args:
            style: 风格代码
            context_type: 上下文类型 (banner/course)
            context_data: 上下文数据

        Returns:
            (description, tokens_used)

        Raises:
            APIKeyMissingError: API Key未配置
            QuotaExceededError: 配额超限
            GenerationError: 生成失败
        """
        # 检查API Key
        if not self.api_key:
            raise APIKeyMissingError()

        # 构建提示词
        prompt = self._build_prompt(style, context_type, context_data)

        logger.info(
            "ai_description_generate_start",
            style=style,
            context_type=context_type,
            prompt_length=len(prompt)
        )

        # 调用API
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "system",
                                "content": SYSTEM_PROMPT
                            },
                            {
                                "role": "user",
                                "content": prompt
                            }
                        ],
                        "temperature": 0.7,
                        "max_tokens": 500,
                    }
                )

                if response.status_code == 401:
                    logger.error("ai_description_api_key_invalid")
                    raise APIKeyInvalidError()
                elif response.status_code == 429:
                    logger.error("ai_description_quota_exceeded")
                    raise QuotaExceededError()
                elif response.status_code != 200:
                    logger.error(
                        "ai_description_api_error",
                        status_code=response.status_code,
                        response=response.text
                    )
                    raise GenerationError(f"API error: {response.status_code}")

                result = response.json()
                description = result['choices'][0]['message']['content'].strip()
                tokens_used = result['usage']['total_tokens']

                logger.info(
                    "ai_description_generate_success",
                    tokens_used=tokens_used,
                    description_length=len(description)
                )

                return description, tokens_used

        except httpx.TimeoutException:
            logger.error("ai_description_timeout")
            raise GenerationError("Request timeout")
        except httpx.RequestError as e:
            logger.error("ai_description_request_error", error=str(e))
            raise GenerationError(f"Request error: {str(e)}")

    def _build_prompt(
        self,
        style: str,
        context_type: str,
        context_data: Dict[str, Any]
    ) -> str:
        """构建提示词"""
        style_info = STYLE_DESCRIPTIONS.get(style)
        if not style_info:
            raise ValueError(f"Unknown style: {style}")

        if context_type == 'banner':
            return self._build_banner_prompt(style_info, context_data)
        elif context_type == 'course':
            return self._build_course_prompt(style_info, context_data)
        else:
            raise ValueError(f"Unknown context_type: {context_type}")

    def _build_banner_prompt(
        self,
        style_info: Dict[str, str],
        context_data: Dict[str, Any]
    ) -> str:
        """构建轮播图提示词"""
        title = context_data.get('title', '')

        return f"""
请为以下轮播图生成一段图片描述：

标题：{title}
风格：{style_info['name']}

要求：
- 基于标题内容展开想象，描绘一个生动的教育或运动场景
- 体现{style_info['name']}的艺术特点
- 场景要温馨、有活力、富有教育意义
- 适合家庭和儿童
- 描述长度：100-200字
- 包含场景、人物、动作、氛围
- 最后加上风格描述：{style_info['suffix']}

请直接输出描述，不要有其他说明文字。
"""

    def _build_course_prompt(
        self,
        style_info: Dict[str, str],
        context_data: Dict[str, Any]
    ) -> str:
        """构建课程提示词"""
        # 提取数据
        name = context_data.get('name', '')
        age_range = context_data.get('age_range', '')
        location = context_data.get('location', '社区运动场')
        min_students = context_data.get('min_students')
        max_students = context_data.get('max_students')
        total_weeks = context_data.get('total_weeks')
        total_lessons = context_data.get('total_lessons')

        # 构建课程规模描述
        class_size = ''
        if min_students and max_students:
            class_size = f"{min_students}-{max_students}人小班"

        # 构建课程周期描述
        duration = ''
        if total_weeks and total_lessons:
            duration = f"{total_weeks}周，共{total_lessons}课时"

        # 构建提示词
        prompt_parts = [
            "请为以下课程生成一段图片描述：\n",
            "课程信息：",
            f"- 名称：{name}",
        ]

        if age_range:
            prompt_parts.append(f"- 适合年龄：{age_range}")

        if location:
            prompt_parts.append(f"- 上课地点：{location}")

        if class_size:
            prompt_parts.append(f"- 课程规模：{class_size}")

        if duration:
            prompt_parts.append(f"- 课程周期：{duration}")

        prompt_parts.extend([
            f"\n风格要求：{style_info['name']}\n",
            "要求：",
            f"- 描绘孩子们在{location}上课的场景",
            f"- 突出{name}的特点和动作",
        ])

        if age_range:
            prompt_parts.append(f"- 体现{age_range}儿童的活力和成长")

        prompt_parts.extend([
            "- 画面要阳光、积极、有教育意义",
            f"- 符合{style_info['name']}的艺术风格",
            "- 描述长度：100-200字",
            "- 包含场景、人物、动作、氛围",
            f"- 最后加上风格描述：{style_info['suffix']}\n",
            "请直接输出描述，不要有其他说明文字。"
        ])

        return "\n".join(prompt_parts)


# 服务实例
ai_description_service = AIDescriptionService()
