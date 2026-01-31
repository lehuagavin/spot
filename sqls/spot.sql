-- =========================================================================
-- 义城上门教育 - 数据库初始化脚本
-- =========================================================================
-- 项目: 义城上门教育 (Yicheng Home Education)
-- 版本: v1.0 (MVP)
-- 日期: 2026-01-31
-- =========================================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS spot
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE spot;

-- =========================================================================
-- 1. 管理员表 (admins)
-- =========================================================================
CREATE TABLE IF NOT EXISTS admins (
  id VARCHAR(32) PRIMARY KEY COMMENT '管理员ID',
  username VARCHAR(64) NOT NULL UNIQUE COMMENT '用户名',
  password_hash VARCHAR(128) NOT NULL COMMENT '密码哈希',
  name VARCHAR(64) NOT NULL COMMENT '姓名',
  status TINYINT(1) DEFAULT 1 COMMENT '状态 1正常 0禁用',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员表';

-- =========================================================================
-- 2. 用户表 (users)
-- =========================================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(32) PRIMARY KEY COMMENT '用户ID',
  openid VARCHAR(64) NOT NULL UNIQUE COMMENT '微信OpenID',
  unionid VARCHAR(64) DEFAULT NULL UNIQUE COMMENT '微信UnionID',
  phone VARCHAR(20) DEFAULT NULL UNIQUE COMMENT '手机号',
  nickname VARCHAR(64) DEFAULT NULL COMMENT '昵称',
  avatar VARCHAR(512) DEFAULT NULL COMMENT '头像URL',
  health_beans INT DEFAULT 0 COMMENT '健康豆',
  is_member TINYINT(1) DEFAULT 0 COMMENT '是否会员 1是 0否',
  member_expire_at DATETIME DEFAULT NULL COMMENT '会员过期时间',
  status TINYINT(1) DEFAULT 1 COMMENT '状态 1正常 0禁用',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  INDEX idx_openid (openid),
  INDEX idx_phone (phone),
  INDEX idx_unionid (unionid)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =========================================================================
-- 3. 学员表 (students)
-- =========================================================================
CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(32) PRIMARY KEY COMMENT '学员ID',
  user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
  id_type VARCHAR(20) NOT NULL COMMENT '证件类型',
  id_name VARCHAR(64) NOT NULL COMMENT '证件姓名',
  id_number VARCHAR(256) NOT NULL COMMENT '证件号码(加密)',
  id_number_hash VARCHAR(64) NOT NULL COMMENT '证件号码哈希',
  photo VARCHAR(512) DEFAULT NULL COMMENT '照片URL',
  birthday DATE NOT NULL COMMENT '出生日期',
  gender VARCHAR(10) NOT NULL COMMENT '性别',
  member_type VARCHAR(20) DEFAULT 'normal' COMMENT '会员类型',
  status TINYINT(1) DEFAULT 1 COMMENT '状态 1正常 0禁用',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_id_number_hash (id_number_hash),
  CONSTRAINT fk_students_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='学员表';

-- =========================================================================
-- 4. 小区表 (communities)
-- =========================================================================
CREATE TABLE IF NOT EXISTS communities (
  id VARCHAR(32) PRIMARY KEY COMMENT '小区ID',
  name VARCHAR(128) NOT NULL COMMENT '小区名称',
  address VARCHAR(256) NOT NULL COMMENT '详细地址',
  image VARCHAR(512) DEFAULT NULL COMMENT '小区图片URL',
  latitude DECIMAL(10,7) NOT NULL COMMENT '纬度',
  longitude DECIMAL(10,7) NOT NULL COMMENT '经度',
  province VARCHAR(32) DEFAULT NULL COMMENT '省份',
  city VARCHAR(32) DEFAULT NULL COMMENT '城市',
  district VARCHAR(32) DEFAULT NULL COMMENT '区县',
  status TINYINT(1) DEFAULT 1 COMMENT '状态 1正常 0禁用',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  INDEX idx_location (latitude, longitude),
  INDEX idx_city (city),
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='小区表';

-- =========================================================================
-- 5. 教练表 (teachers)
-- =========================================================================
CREATE TABLE IF NOT EXISTS teachers (
  id VARCHAR(32) PRIMARY KEY COMMENT '教练ID',
  name VARCHAR(64) NOT NULL COMMENT '姓名',
  avatar VARCHAR(512) DEFAULT NULL COMMENT '头像URL',
  phone VARCHAR(20) DEFAULT NULL COMMENT '手机号',
  intro TEXT DEFAULT NULL COMMENT '简介',
  status TINYINT(1) DEFAULT 1 COMMENT '状态 1正常 0禁用',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='教练表';

-- =========================================================================
-- 6. 课程表 (courses)
-- =========================================================================
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(32) PRIMARY KEY COMMENT '课程ID',
  community_id VARCHAR(32) NOT NULL COMMENT '小区ID',
  teacher_id VARCHAR(32) NOT NULL COMMENT '教练ID',
  name VARCHAR(128) NOT NULL COMMENT '课程名称',
  image VARCHAR(512) DEFAULT NULL COMMENT '课程图片URL',
  age_min INT NOT NULL COMMENT '最小年龄',
  age_max INT NOT NULL COMMENT '最大年龄',
  total_weeks INT NOT NULL COMMENT '总周数',
  total_lessons INT NOT NULL COMMENT '总课时',
  schedule_day VARCHAR(20) NOT NULL COMMENT '上课日(如:周六)',
  schedule_start TIME NOT NULL COMMENT '开始时间',
  schedule_end TIME NOT NULL COMMENT '结束时间',
  location VARCHAR(256) DEFAULT NULL COMMENT '上课地点详情',
  price DECIMAL(10,2) NOT NULL COMMENT '原价',
  member_price DECIMAL(10,2) NOT NULL COMMENT '会员价',
  min_students INT NOT NULL COMMENT '最低开班人数',
  max_students INT NOT NULL COMMENT '最大人数',
  enrolled_count INT DEFAULT 0 COMMENT '已报名人数',
  deadline DATETIME NOT NULL COMMENT '报名截止时间',
  start_date DATE DEFAULT NULL COMMENT '开课日期',
  status VARCHAR(20) DEFAULT 'enrolling' COMMENT '状态 enrolling拼班中 pending待开课 started开班中 ended已结束 failed拼班失败 cancelled已取消',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  INDEX idx_community_id (community_id),
  INDEX idx_teacher_id (teacher_id),
  INDEX idx_status (status),
  INDEX idx_deadline (deadline),
  CONSTRAINT fk_courses_community_id FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
  CONSTRAINT fk_courses_teacher_id FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程表';

-- =========================================================================
-- 7. 订单表 (orders)
-- =========================================================================
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(32) PRIMARY KEY COMMENT '订单ID',
  order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '订单号',
  user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
  course_id VARCHAR(32) NOT NULL COMMENT '课程ID',
  total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总额',
  discount_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '优惠金额',
  pay_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  coupon_id VARCHAR(32) DEFAULT NULL COMMENT '优惠券ID',
  status VARCHAR(20) NOT NULL COMMENT '订单状态 pending待支付 paid已支付 cancelled已取消 refunding退款中 refunded已退款 completed已完成',
  pay_time DATETIME DEFAULT NULL COMMENT '支付时间',
  expire_at DATETIME NOT NULL COMMENT '过期时间',
  refund_time DATETIME DEFAULT NULL COMMENT '退款时间',
  refund_amount DECIMAL(10,2) DEFAULT NULL COMMENT '退款金额',
  remark VARCHAR(256) DEFAULT NULL COMMENT '备注',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  INDEX idx_order_no (order_no),
  INDEX idx_user_id (user_id),
  INDEX idx_course_id (course_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_orders_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_orders_course_id FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- =========================================================================
-- 8. 课程学员关联表 (course_students)
-- =========================================================================
CREATE TABLE IF NOT EXISTS course_students (
  id VARCHAR(32) PRIMARY KEY COMMENT 'ID',
  course_id VARCHAR(32) NOT NULL COMMENT '课程ID',
  student_id VARCHAR(32) NOT NULL COMMENT '学员ID',
  order_id VARCHAR(32) NOT NULL COMMENT '订单ID',
  price DECIMAL(10,2) NOT NULL COMMENT '单价',
  is_new_user TINYINT(1) DEFAULT 0 COMMENT '是否新人价 1是 0否',
  status VARCHAR(20) NOT NULL COMMENT '状态',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  INDEX idx_course_id (course_id),
  INDEX idx_student_id (student_id),
  INDEX idx_order_id (order_id),
  UNIQUE KEY uk_course_student (course_id, student_id),
  CONSTRAINT fk_course_students_course_id FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  CONSTRAINT fk_course_students_student_id FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_course_students_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程学员关联表';

-- =========================================================================
-- 9. 支付记录表 (payments)
-- =========================================================================
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(32) PRIMARY KEY COMMENT '支付ID',
  order_id VARCHAR(32) NOT NULL COMMENT '订单ID',
  transaction_id VARCHAR(64) DEFAULT NULL COMMENT '微信支付交易号',
  amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
  status VARCHAR(20) NOT NULL COMMENT '状态 pending待支付 success支付成功 failed支付失败 refunded已退款',
  pay_time DATETIME DEFAULT NULL COMMENT '支付时间',
  refund_id VARCHAR(64) DEFAULT NULL COMMENT '退款单号',
  refund_amount DECIMAL(10,2) DEFAULT NULL COMMENT '退款金额',
  refund_time DATETIME DEFAULT NULL COMMENT '退款时间',
  raw_data JSON DEFAULT NULL COMMENT '原始数据',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  INDEX idx_order_id (order_id),
  INDEX idx_transaction_id (transaction_id),
  CONSTRAINT fk_payments_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';

-- =========================================================================
-- 10. 权益卡表 (member_cards)
-- =========================================================================
CREATE TABLE IF NOT EXISTS member_cards (
  id VARCHAR(32) PRIMARY KEY COMMENT '卡ID',
  name VARCHAR(64) NOT NULL COMMENT '卡名称',
  duration INT NOT NULL COMMENT '有效天数',
  price DECIMAL(10,2) NOT NULL COMMENT '售价',
  original_price DECIMAL(10,2) NOT NULL COMMENT '原价',
  benefits JSON DEFAULT NULL COMMENT '权益列表',
  is_recommended TINYINT(1) DEFAULT 0 COMMENT '是否推荐 1是 0否',
  sort_order INT DEFAULT 0 COMMENT '排序',
  status TINYINT(1) DEFAULT 1 COMMENT '状态 1正常 0禁用',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  INDEX idx_status (status),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权益卡表';

-- =========================================================================
-- 11. 用户会员记录表 (user_members)
-- =========================================================================
CREATE TABLE IF NOT EXISTS user_members (
  id VARCHAR(32) PRIMARY KEY COMMENT 'ID',
  user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
  card_id VARCHAR(32) NOT NULL COMMENT '权益卡ID',
  order_id VARCHAR(32) DEFAULT NULL COMMENT '购买订单ID',
  start_at DATETIME NOT NULL COMMENT '开始时间',
  expire_at DATETIME NOT NULL COMMENT '过期时间',
  status TINYINT(1) DEFAULT 1 COMMENT '状态 1正常 0已过期',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  INDEX idx_user_id (user_id),
  INDEX idx_expire_at (expire_at),
  CONSTRAINT fk_user_members_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_members_card_id FOREIGN KEY (card_id) REFERENCES member_cards(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户会员记录表';

-- =========================================================================
-- 12. 轮播图表 (banners)
-- =========================================================================
CREATE TABLE IF NOT EXISTS banners (
  id VARCHAR(32) PRIMARY KEY COMMENT 'ID',
  title VARCHAR(128) DEFAULT NULL COMMENT '标题',
  image VARCHAR(512) NOT NULL COMMENT '图片URL',
  link VARCHAR(512) DEFAULT NULL COMMENT '跳转链接',
  link_type VARCHAR(20) DEFAULT NULL COMMENT '链接类型',
  sort_order INT DEFAULT 0 COMMENT '排序',
  status TINYINT(1) DEFAULT 1 COMMENT '状态 1正常 0禁用',
  created_at DATETIME NOT NULL COMMENT '创建时间',
  updated_at DATETIME NOT NULL COMMENT '更新时间',
  INDEX idx_sort_order (sort_order),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='轮播图表';

-- =========================================================================
-- 初始化数据
-- =========================================================================

-- 初始化管理员账号 (密码: admin123)
INSERT INTO admins (id, username, password_hash, name, status, created_at, updated_at)
VALUES (
  'admin_001',
  'admin',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtYr6D1HwXHHm',
  '系统管理员',
  1,
  NOW(),
  NOW()
);

-- =========================================================================
-- 脚本结束
-- =========================================================================
