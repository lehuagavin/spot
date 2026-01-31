/**
 * 仪表盘 API
 */
import request from '../utils/request';
import type { DashboardStats, Order, PageResponse } from '../types';

// 获取统计数据
export function getDashboardStats(): Promise<DashboardStats> {
  return request.get('/api/v1/admin/dashboard/stats');
}

// 获取最近订单
export function getRecentOrders(limit: number = 10): Promise<PageResponse<Order>> {
  return request.get('/api/v1/admin/dashboard/recent-orders', { params: { limit } });
}
