/**
 * 通用类型定义
 */

// 分页参数
export interface PageParams {
  page?: number;
  page_size?: number;
}

// 分页响应
export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

// API 响应
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 管理员
export interface Admin {
  id: string;
  username: string;
  name: string;
  status: number;
  created_at: string;
  updated_at: string;
}

// 登录请求
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应
export interface LoginResponse {
  token: string;
  expires_in: number;
  admin: Admin;
}

// 用户
export interface User {
  id: string;
  openid: string;
  phone: string | null;
  nickname: string | null;
  avatar: string | null;
  health_beans: number;
  coupons: number;
  is_member: boolean;
  status: number;
  created_at: string;
  updated_at: string;
}

// 学员
export interface Student {
  id: string;
  user_id: string;
  id_type: string;
  id_name: string;
  id_number: string;
  id_number_masked: string;
  photo: string | null;
  birthday: string;
  gender: string;
  member_type: string;
  created_at: string;
  updated_at: string;
}

// 小区
export interface Community {
  id: string;
  name: string;
  address: string;
  image: string | null;
  latitude: number;
  longitude: number;
  status: number;
  created_at: string;
  updated_at: string;
}

// 创建小区请求
export interface CommunityCreateRequest {
  name: string;
  address: string;
  image?: string;
  latitude: number;
  longitude: number;
}

// 更新小区请求
export interface CommunityUpdateRequest {
  name?: string;
  address?: string;
  image?: string;
  latitude?: number;
  longitude?: number;
  status?: number;
}

// 教练
export interface Teacher {
  id: string;
  name: string;
  phone: string;
  avatar: string | null;
  introduction: string | null;
  status: number;
  created_at: string;
  updated_at: string;
}

// 创建教练请求
export interface TeacherCreateRequest {
  name: string;
  phone: string;
  avatar?: string;
  introduction?: string;
}

// 更新教练请求
export interface TeacherUpdateRequest {
  name?: string;
  phone?: string;
  avatar?: string;
  introduction?: string;
  status?: number;
}

// 课程状态类型
export type CourseStatus = 'draft' | 'enrolling' | 'full' | 'in_progress' | 'completed' | 'cancelled';

// 课程状态常量
export const CourseStatusValues = {
  DRAFT: 'draft' as const,
  ENROLLING: 'enrolling' as const,
  FULL: 'full' as const,
  IN_PROGRESS: 'in_progress' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
};

// 课程状态文本映射
export const CourseStatusText: Record<CourseStatus, string> = {
  draft: '草稿',
  enrolling: '报名中',
  full: '已满员',
  in_progress: '进行中',
  completed: '已完成',
  cancelled: '已取消',
};

// 课程状态颜色映射
export const CourseStatusColor: Record<CourseStatus, string> = {
  draft: 'default',
  enrolling: 'processing',
  full: 'warning',
  in_progress: 'success',
  completed: 'default',
  cancelled: 'error',
};

// 课程
export interface Course {
  id: string;
  name: string;
  // 年龄 - 分开字段
  age_min: number;
  age_max: number;
  // 年龄 - 组合字段（计算属性）
  age_range?: string;
  teacher_id: string;
  teacher_name?: string;
  teacher?: Teacher;
  community_id: string;
  community_name?: string;
  community?: Community;
  total_weeks: number;
  total_lessons: number;
  // 时间 - 分开字段
  schedule_day: string;
  schedule_start: string;
  schedule_end: string;
  // 时间 - 组合字段（计算属性）
  schedule?: string;
  location: string;
  price: number;
  member_price: number;
  min_students: number;
  max_students: number;
  current_students?: number;
  enrolled_count: number;
  deadline: string;
  start_date: string;
  status: CourseStatus;
  image: string | null;
  description: string | null;
  created_at: string;
  updated_at?: string;
}

// 创建课程请求
export interface CourseCreateRequest {
  name: string;
  age_range: string;
  teacher_id: string;
  community_id: string;
  total_weeks: number;
  total_lessons: number;
  schedule: string;
  location: string;
  price: number;
  member_price: number;
  min_students: number;
  max_students: number;
  deadline: string;
  start_date: string;
  image?: string;
  description?: string;
}

// 更新课程请求
export interface CourseUpdateRequest {
  name?: string;
  age_range?: string;
  teacher_id?: string;
  community_id?: string;
  total_weeks?: number;
  total_lessons?: number;
  schedule?: string;
  location?: string;
  price?: number;
  member_price?: number;
  min_students?: number;
  max_students?: number;
  deadline?: string;
  start_date?: string;
  image?: string;
  description?: string;
}

// 订单状态类型
export type OrderStatus = 'pending' | 'paid' | 'enrolling' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'refunded';

// 订单状态常量
export const OrderStatusValues = {
  PENDING: 'pending' as const,
  PAID: 'paid' as const,
  ENROLLING: 'enrolling' as const,
  CONFIRMED: 'confirmed' as const,
  IN_PROGRESS: 'in_progress' as const,
  COMPLETED: 'completed' as const,
  CANCELLED: 'cancelled' as const,
  REFUNDED: 'refunded' as const,
};

// 订单状态文本映射
export const OrderStatusText: Record<OrderStatus, string> = {
  pending: '待支付',
  paid: '已支付',
  enrolling: '拼班中',
  confirmed: '已成班',
  in_progress: '开班中',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

// 订单状态颜色映射
export const OrderStatusColor: Record<OrderStatus, string> = {
  pending: 'warning',
  paid: 'processing',
  enrolling: 'processing',
  confirmed: 'success',
  in_progress: 'success',
  completed: 'default',
  cancelled: 'default',
  refunded: 'error',
};

// 订单
export interface Order {
  id: string;
  order_no: string;
  user_id: string;
  user?: User;
  course_id: string;
  course?: Course;
  student_ids: string[];
  students?: Student[];
  total_amount: number;
  discount_amount: number;
  pay_amount: number;
  status: OrderStatus;
  pay_time: string | null;
  refund_time: string | null;
  refund_reason: string | null;
  created_at: string;
  updated_at: string;
}

// 权益卡类型
export type MemberCardType = 'season' | 'half_year' | 'year';

// 权益卡类型常量
export const MemberCardTypeValues = {
  SEASON: 'season' as const,
  HALF_YEAR: 'half_year' as const,
  YEAR: 'year' as const,
};

// 权益卡类型文本
export const MemberCardTypeText: Record<MemberCardType, string> = {
  season: '季卡',
  half_year: '半年卡',
  year: '年卡',
};

// 权益卡
export interface MemberCard {
  id: string;
  name: string;
  type: MemberCardType;
  price: number;
  original_price: number;
  duration_days: number;
  description: string | null;
  benefits: string | null;
  status: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// 创建权益卡请求
export interface MemberCardCreateRequest {
  name: string;
  type: MemberCardType;
  price: number;
  original_price: number;
  duration_days: number;
  description?: string;
  benefits?: string;
  sort_order?: number;
}

// 更新权益卡请求
export interface MemberCardUpdateRequest {
  name?: string;
  type?: MemberCardType;
  price?: number;
  original_price?: number;
  duration_days?: number;
  description?: string;
  benefits?: string;
  status?: number;
  sort_order?: number;
}

// 会员购买记录
export interface UserMember {
  id: string;
  user_id: string;
  user?: User;
  member_card_id: string;
  member_card?: MemberCard;
  start_date: string;
  end_date: string;
  status: number;
  created_at: string;
}

// 轮播图
export interface Banner {
  id: string;
  title: string;
  image: string;
  link: string | null;
  link_type: string;
  sort_order: number;
  status: number;
  created_at: string;
  updated_at: string;
}

// 创建轮播图请求
export interface BannerCreateRequest {
  title: string;
  image: string;
  link?: string;
  link_type?: string;
  sort_order?: number;
}

// 更新轮播图请求
export interface BannerUpdateRequest {
  title?: string;
  image?: string;
  link?: string;
  link_type?: string;
  sort_order?: number;
  status?: number;
}

// 仪表盘统计数据
export interface DashboardStats {
  total_users: number;
  total_orders: number;
  total_revenue: number;
  total_courses: number;
  today_orders: number;
  today_revenue: number;
  course_status_distribution: {
    status: CourseStatus;
    count: number;
  }[];
}

// 上传响应
export interface UploadResponse {
  url: string;
  filename: string;
}
