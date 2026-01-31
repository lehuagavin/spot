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

// AI 生成图片请求参数
export interface AIGenerateImageRequest {
  prompt: string;
  size?: string;
}

// AI 生成图片响应
export interface AIGenerateImageResponse {
  url: string;
  original_url: string;
  model: string;
  size: string;
}

// AI 生成图片（超时时间 2 分钟，因为 AI 生成较慢）
export function generateAIImage(params: AIGenerateImageRequest): Promise<AIGenerateImageResponse> {
  return request.post('/api/v1/ai/generate-image', params, {
    timeout: 120000, // 120 秒
  });
}

// AI 生成描述请求参数
export interface AIGenerateDescriptionRequest {
  style: 'ghibli' | 'futurism' | 'pixar' | 'oil' | 'chinese';
  context_type: 'banner' | 'course';
  context_data: Record<string, any>;
}

// AI 生成描述响应
export interface AIGenerateDescriptionResponse {
  description: string;
  tokens_used: number;
  model: string;
}

// AI 生成描述（超时时间 30 秒）
export function generateDescription(params: AIGenerateDescriptionRequest): Promise<AIGenerateDescriptionResponse> {
  return request.post('/api/v1/ai/generate-description', params, {
    timeout: 30000, // 30 秒
  });
}
