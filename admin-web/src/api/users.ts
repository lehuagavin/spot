/**
 * 用户管理 API
 */
import request from '../utils/request';
import type { 
  User, 
  Student,
  Order,
  PageParams, 
  PageResponse 
} from '../types';

// 获取用户列表
export function getUsers(params: PageParams & { 
  keyword?: string; 
  status?: number;
  is_member?: boolean;
}): Promise<PageResponse<User>> {
  return request.get('/api/v1/admin/users', { params });
}

// 获取用户详情
export function getUser(id: string): Promise<User> {
  return request.get(`/api/v1/admin/users/${id}`);
}

// 更新用户状态
export function updateUserStatus(id: string, status: number): Promise<User> {
  return request.put(`/api/v1/admin/users/${id}/status`, { status });
}

// 获取用户学员列表
export function getUserStudents(id: string): Promise<Student[]> {
  return request.get(`/api/v1/admin/users/${id}/students`);
}

// 获取用户订单列表
export function getUserOrders(id: string, params?: PageParams): Promise<PageResponse<Order>> {
  return request.get(`/api/v1/admin/users/${id}/orders`, { params });
}
