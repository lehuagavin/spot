/**
 * 认证相关 API
 */
import request from '../utils/request';
import type { LoginRequest, LoginResponse, Admin } from '../types';

// 管理员登录
export function login(data: LoginRequest): Promise<LoginResponse> {
  return request.post('/api/v1/admin/auth/login', data);
}

// 管理员登出
export function logout(): Promise<void> {
  return request.post('/api/v1/admin/auth/logout');
}

// 获取当前管理员信息
export function getAdminInfo(): Promise<Admin> {
  return request.get('/api/v1/admin/auth/info');
}
