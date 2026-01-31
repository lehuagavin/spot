/**
 * 文件上传 API
 */
import request from '../utils/request';
import type { UploadResponse } from '../types';

// 上传图片
export function uploadImage(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/api/v1/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

// 获取图片完整 URL
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  return `${baseUrl}${path}`;
}
