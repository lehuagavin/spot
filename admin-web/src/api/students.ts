/**
 * 学员管理 API
 */
import request from '../utils/request';
import type { 
  Student, 
  PageParams, 
  PageResponse 
} from '../types';

// 获取学员列表
export function getStudents(params: PageParams & { 
  keyword?: string; 
  user_id?: string;
}): Promise<PageResponse<Student>> {
  return request.get('/api/v1/admin/students', { params });
}

// 获取学员详情
export function getStudent(id: string): Promise<Student> {
  return request.get(`/api/v1/admin/students/${id}`);
}
