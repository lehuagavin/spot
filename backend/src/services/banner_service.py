"""
轮播图服务
"""
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import AppException
from src.core.errors import ErrorCode
from src.models.domain import Banner
from src.models.schemas import BannerCreate, BannerUpdate, BannerResponse
from src.repositories.base import BaseRepository
from src.utils.id_generator import generate_id


class BannerService:
    """轮播图服务"""

    def __init__(self):
        self.repo = BaseRepository[Banner](Banner)

    async def create_banner(
        self, db: AsyncSession, data: BannerCreate
    ) -> BannerResponse:
        """创建轮播图"""
        banner = await self.repo.create(
            db,
            {
                "id": generate_id(),
                "status": 1,
                **data.model_dump(),
            },
        )
        await db.refresh(banner)
        return BannerResponse.model_validate(banner)

    async def update_banner(
        self, db: AsyncSession, banner_id: str, data: BannerUpdate
    ) -> BannerResponse:
        """更新轮播图"""
        banner = await self.repo.get(db, banner_id)
        if not banner:
            raise AppException(
                code=ErrorCode.BANNER_NOT_FOUND,
                message="轮播图不存在",
            )
        await self.repo.update(db, banner, data.model_dump(exclude_unset=True))
        await db.refresh(banner)
        return BannerResponse.model_validate(banner)

    async def get_banner(self, db: AsyncSession, banner_id: str) -> BannerResponse:
        """获取轮播图详情"""
        banner = await self.repo.get(db, banner_id)
        if not banner:
            raise AppException(
                code=ErrorCode.BANNER_NOT_FOUND,
                message="轮播图不存在",
            )
        return BannerResponse.model_validate(banner)

    async def list_banners(self, db: AsyncSession, active_only: bool = True) -> list[BannerResponse]:
        """获取轮播图列表"""
        filters = {}
        if active_only:
            filters["status"] = 1

        banners = await self.repo.get_multi(db, skip=0, limit=100, **filters)
        # 按排序字段排序
        sorted_banners = sorted(banners, key=lambda x: x.sort_order)
        return [BannerResponse.model_validate(b) for b in sorted_banners]

    async def delete_banner(self, db: AsyncSession, banner_id: str) -> bool:
        """删除轮播图"""
        banner = await self.repo.get(db, banner_id)
        if not banner:
            raise AppException(
                code=ErrorCode.BANNER_NOT_FOUND,
                message="轮播图不存在",
            )
        return await self.repo.delete(db, banner_id)
