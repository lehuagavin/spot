"""
小区服务
"""
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.errors import ErrorCode
from src.core.exceptions import AppException
from src.models.domain import Community
from src.models.schemas import (
    CommunityCreate,
    CommunityUpdate,
    CommunityResponse,
    CommunityNearbyQuery,
    PaginatedResponseSchema,
)
from src.repositories.base import BaseRepository
from src.utils import generate_id, haversine_distance


class CommunityService:
    """小区服务"""

    def __init__(self):
        self.repo = BaseRepository(Community)

    async def create_community(
        self, db: AsyncSession, data: CommunityCreate
    ) -> CommunityResponse:
        """创建小区

        Args:
            db: 数据库会话
            data: 创建数据

        Returns:
            小区信息
        """
        community_dict = data.model_dump()
        community_dict["id"] = generate_id()

        community = await self.repo.create(db, community_dict)
        return CommunityResponse.model_validate(community)

    async def update_community(
        self, db: AsyncSession, community_id: str, data: CommunityUpdate
    ) -> CommunityResponse:
        """更新小区

        Args:
            db: 数据库会话
            community_id: 小区 ID
            data: 更新数据

        Returns:
            小区信息
        """
        community = await self.repo.get(db, community_id)
        if not community:
            raise AppException(ErrorCode.COMMUNITY_NOT_FOUND)

        update_dict = data.model_dump(exclude_unset=True)
        community = await self.repo.update(db, community, update_dict)
        return CommunityResponse.model_validate(community)

    async def get_community(
        self, db: AsyncSession, community_id: str
    ) -> CommunityResponse:
        """获取小区详情

        Args:
            db: 数据库会话
            community_id: 小区 ID

        Returns:
            小区信息
        """
        community = await self.repo.get(db, community_id)
        if not community:
            raise AppException(ErrorCode.COMMUNITY_NOT_FOUND)

        return CommunityResponse.model_validate(community)

    async def list_communities(
        self, db: AsyncSession, page: int = 1, page_size: int = 20, keyword: str = None
    ) -> PaginatedResponseSchema[CommunityResponse]:
        """获取小区列表

        Args:
            db: 数据库会话
            page: 页码
            page_size: 每页数量
            keyword: 搜索关键词

        Returns:
            分页结果
        """
        from sqlalchemy import select, func

        skip = (page - 1) * page_size

        # 构建查询
        stmt = select(Community).where(Community.status == 1)
        count_stmt = select(func.count()).select_from(Community).where(Community.status == 1)

        if keyword:
            stmt = stmt.where(Community.name.contains(keyword))
            count_stmt = count_stmt.where(Community.name.contains(keyword))

        # 分页
        stmt = stmt.offset(skip).limit(page_size)

        # 执行查询
        result = await db.execute(stmt)
        communities = result.scalars().all()

        count_result = await db.execute(count_stmt)
        total = count_result.scalar() or 0

        return PaginatedResponseSchema(
            items=[CommunityResponse.model_validate(c) for c in communities],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def get_nearby_communities(
        self, db: AsyncSession, query: CommunityNearbyQuery
    ) -> list[CommunityResponse]:
        """获取附近小区

        Args:
            db: 数据库会话
            query: 查询参数

        Returns:
            小区列表（包含距离）
        """
        # 获取所有小区
        communities = await self.repo.get_multi(db, limit=1000, status=1)

        # 计算距离并过滤
        result = []
        for community in communities:
            distance = haversine_distance(
                query.latitude,
                query.longitude,
                community.latitude,
                community.longitude,
            )

            if distance <= query.radius:
                community_resp = CommunityResponse.model_validate(community)
                community_resp.distance = distance
                result.append(community_resp)

        # 按距离排序
        result.sort(key=lambda x: x.distance if x.distance else 0)

        return result

    async def delete_community(self, db: AsyncSession, community_id: str) -> bool:
        """删除小区

        Args:
            db: 数据库会话
            community_id: 小区 ID

        Returns:
            是否成功
        """
        success = await self.repo.delete(db, community_id)
        if not success:
            raise AppException(ErrorCode.COMMUNITY_NOT_FOUND)

        return True
