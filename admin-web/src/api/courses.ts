/**
 * 课程管理 API
 */
import request from '../utils/request';
import type { 
  Course, 
  CourseCreateRequest, 
  CourseUpdateRequest, 
  CourseStatus,
  Student,
  PageParams, 
  PageResponse 
} from '../types';

// 获取课程列表
export function getCourses(params: PageParams & { 
  keyword?: string; 
  status?: CourseStatus;
  community_id?: string;
  teacher_id?: string;
}): Promise<PageResponse<Course>> {
  return request.get('/api/v1/admin/courses', { params });
}

// 获取课程详情
export function getCourse(id: string): Promise<Course> {
  return request.get(`/api/v1/admin/courses/${id}`);
}

// 创建课程
export function createCourse(data: CourseCreateRequest): Promise<Course> {
  return request.post('/api/v1/admin/courses', data);
}

// 更新课程
export function updateCourse(id: string, data: CourseUpdateRequest): Promise<Course> {
  return request.put(`/api/v1/admin/courses/${id}`, data);
}

// 更新课程状态
export function updateCourseStatus(id: string, status: CourseStatus): Promise<Course> {
  return request.put(`/api/v1/admin/courses/${id}/status`, { status });
}

// 获取课程学员列表
export function getCourseStudents(id: string): Promise<Student[]> {
  return request.get(`/api/v1/admin/courses/${id}/students`);
}
