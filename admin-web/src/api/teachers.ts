/**
 * 教练管理 API
 */
import request from '../utils/request';
import type { 
  Teacher, 
  TeacherCreateRequest, 
  TeacherUpdateRequest, 
  PageParams, 
  PageResponse 
} from '../types';

// 获取教练列表
export function getTeachers(params: PageParams & { keyword?: string; status?: number }): Promise<PageResponse<Teacher>> {
  return request.get('/api/v1/admin/teachers', { params });
}

// 获取教练详情
export function getTeacher(id: string): Promise<Teacher> {
  return request.get(`/api/v1/admin/teachers/${id}`);
}

// 创建教练
export function createTeacher(data: TeacherCreateRequest): Promise<Teacher> {
  return request.post('/api/v1/admin/teachers', data);
}

// 更新教练
export function updateTeacher(id: string, data: TeacherUpdateRequest): Promise<Teacher> {
  return request.put(`/api/v1/admin/teachers/${id}`, data);
}

// 删除教练
export function deleteTeacher(id: string): Promise<void> {
  return request.delete(`/api/v1/admin/teachers/${id}`);
}

// 获取所有教练（用于下拉选择）
export async function getAllTeachers(): Promise<Teacher[]> {
  const res: PageResponse<Teacher> = await request.get('/api/v1/admin/teachers', { 
    params: { page: 1, page_size: 100, status: 1 } 
  });
  return res.list;
}
