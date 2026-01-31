/**
 * 订单管理 API
 */
import request from '../utils/request';
import type { 
  Order, 
  OrderStatus,
  PageParams, 
  PageResponse 
} from '../types';

// 获取订单列表
export function getOrders(params: PageParams & { 
  keyword?: string; 
  status?: OrderStatus;
  start_date?: string;
  end_date?: string;
  user_id?: string;
  course_id?: string;
}): Promise<PageResponse<Order>> {
  return request.get('/api/v1/admin/orders', { params });
}

// 获取订单详情
export function getOrder(id: string): Promise<Order> {
  return request.get(`/api/v1/admin/orders/${id}`);
}

// 处理退款
export function processRefund(id: string, data: { reason?: string }): Promise<Order> {
  return request.post(`/api/v1/admin/orders/${id}/refund`, data);
}
