/**
 * 小区管理 API
 */
import request from '../utils/request';
import type { 
  Community, 
  CommunityCreateRequest, 
  CommunityUpdateRequest, 
  PageParams, 
  PageResponse 
} from '../types';

// 获取小区列表
export function getCommunities(params: PageParams & { keyword?: string; status?: number }): Promise<PageResponse<Community>> {
  return request.get('/api/v1/admin/communities', { params });
}

// 获取小区详情
export function getCommunity(id: string): Promise<Community> {
  return request.get(`/api/v1/admin/communities/${id}`);
}

// 创建小区
export function createCommunity(data: CommunityCreateRequest): Promise<Community> {
  return request.post('/api/v1/admin/communities', data);
}

// 更新小区
export function updateCommunity(id: string, data: CommunityUpdateRequest): Promise<Community> {
  return request.put(`/api/v1/admin/communities/${id}`, data);
}

// 删除小区
export function deleteCommunity(id: string): Promise<void> {
  return request.delete(`/api/v1/admin/communities/${id}`);
}

// 获取所有小区（用于下拉选择）
export async function getAllCommunities(): Promise<Community[]> {
  const res: PageResponse<Community> = await request.get('/api/v1/admin/communities', { 
    params: { page: 1, page_size: 1000, status: 1 } 
  });
  return res.list;
}
