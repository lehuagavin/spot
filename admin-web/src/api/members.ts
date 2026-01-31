/**
 * 会员管理 API
 */
import request from '../utils/request';
import type { 
  MemberCard, 
  MemberCardCreateRequest, 
  MemberCardUpdateRequest, 
  UserMember,
  PageParams, 
  PageResponse 
} from '../types';

// 获取权益卡列表（后端返回数组格式，不是分页格式）
export function getMemberCards(_params?: PageParams & { 
  status?: number;
}): Promise<MemberCard[]> {
  return request.get('/api/v1/admin/member/cards');
}

// 获取权益卡详情
export function getMemberCard(id: string): Promise<MemberCard> {
  return request.get(`/api/v1/admin/member/cards/${id}`);
}

// 创建权益卡
export function createMemberCard(data: MemberCardCreateRequest): Promise<MemberCard> {
  return request.post('/api/v1/admin/member/cards', data);
}

// 更新权益卡
export function updateMemberCard(id: string, data: MemberCardUpdateRequest): Promise<MemberCard> {
  return request.put(`/api/v1/admin/member/cards/${id}`, data);
}

// 获取会员购买记录
export function getMemberRecords(params: PageParams & {
  user_id?: string;
  member_card_id?: string;
}): Promise<PageResponse<UserMember>> {
  return request.get('/api/v1/admin/member/records', { params });
}
