/**
 * 轮播图管理 API
 */
import request from '../utils/request';
import type { 
  Banner, 
  BannerCreateRequest, 
  BannerUpdateRequest, 
  PageParams, 
  PageResponse 
} from '../types';

// 获取轮播图列表
export function getBanners(params: PageParams & { 
  status?: number;
}): Promise<PageResponse<Banner>> {
  return request.get('/api/v1/admin/banners', { params });
}

// 获取轮播图详情
export function getBanner(id: string): Promise<Banner> {
  return request.get(`/api/v1/admin/banners/${id}`);
}

// 创建轮播图
export function createBanner(data: BannerCreateRequest): Promise<Banner> {
  return request.post('/api/v1/admin/banners', data);
}

// 更新轮播图
export function updateBanner(id: string, data: BannerUpdateRequest): Promise<Banner> {
  return request.put(`/api/v1/admin/banners/${id}`, data);
}

// 删除轮播图
export function deleteBanner(id: string): Promise<void> {
  return request.delete(`/api/v1/admin/banners/${id}`);
}
