/**
 * API 服务层
 */
const { get, post, put, del, upload } = require('../utils/request');

// ========== 认证模块 ==========
const auth = {
  /**
   * 微信登录
   * @param {string} code 微信登录 code
   */
  wechatLogin(code) {
    return post('/auth/wechat/login', { code });
  },

  /**
   * 绑定手机号
   * @param {string} code 微信手机号授权 code
   */
  bindPhone(code) {
    return post('/auth/wechat/bindPhone', { code });
  },

  /**
   * 更新用户信息
   * @param {Object} data 用户信息 { nickname, avatar }
   */
  updateUserInfo(data) {
    return put('/auth/user/info', data);
  },
};

// ========== 用户模块 ==========
const user = {
  /**
   * 获取用户信息
   */
  getInfo() {
    return get('/user/info');
  },

  /**
   * 获取用户资产
   */
  getAssets() {
    return get('/user/assets');
  },
};

// ========== 学员模块 ==========
const student = {
  /**
   * 获取学员列表
   */
  getList() {
    return get('/students');
  },

  /**
   * 添加学员
   * @param {Object} data 学员信息
   */
  add(data) {
    return post('/students', data);
  },

  /**
   * 更新学员
   * @param {string} id 学员ID
   * @param {Object} data 学员信息
   */
  update(id, data) {
    return put(`/students/${id}`, data);
  },

  /**
   * 删除学员
   * @param {string} id 学员ID
   */
  delete(id) {
    return del(`/students/${id}`);
  },
};

// ========== 小区模块 ==========
const community = {
  /**
   * 获取小区列表
   * @param {Object} params 查询参数 { keyword, page, page_size }
   */
  getList(params) {
    return get('/communities', params);
  },

  /**
   * 获取附近小区
   * @param {Object} params { latitude, longitude, radius }
   */
  getNearby(params) {
    return get('/communities/nearby', params);
  },

  /**
   * 获取小区详情
   * @param {string} id 小区ID
   */
  getDetail(id) {
    return get(`/communities/${id}`);
  },
};

// ========== 课程模块 ==========
const course = {
  /**
   * 获取课程列表
   * @param {Object} params { community_id, status, page, page_size }
   */
  getList(params) {
    return get('/courses', params);
  },

  /**
   * 获取课程详情
   * @param {string} id 课程ID
   */
  getDetail(id) {
    return get(`/courses/${id}`);
  },
};

// ========== 订单模块 ==========
const order = {
  /**
   * 创建订单
   * @param {Object} data { course_id, student_ids }
   */
  create(data) {
    return post('/orders', data);
  },

  /**
   * 获取订单列表
   * @param {Object} params { status, page, page_size }
   */
  getList(params) {
    return get('/orders', params);
  },

  /**
   * 获取订单详情
   * @param {string} id 订单ID
   */
  getDetail(id) {
    return get(`/orders/${id}`);
  },

  /**
   * 取消订单
   * @param {string} id 订单ID
   */
  cancel(id) {
    return post(`/orders/${id}/cancel`);
  },

  /**
   * 申请退款
   * @param {string} id 订单ID
   * @param {Object} data { reason }
   */
  refund(id, data) {
    return post(`/orders/${id}/refund`, data);
  },
};

// ========== 支付模块 ==========
const payment = {
  /**
   * 获取支付参数
   * @param {string} orderId 订单ID
   */
  prepay(orderId) {
    return post('/payment/prepay', { order_id: orderId });
  },

  /**
   * 确认支付（开发环境模拟支付回调）
   * @param {string} orderId 订单ID
   */
  confirm(orderId) {
    return post('/payment/confirm', { order_id: orderId });
  },
};

// ========== 会员模块 ==========
const member = {
  /**
   * 获取权益卡列表
   */
  getCards() {
    return get('/member/cards');
  },

  /**
   * 购买权益卡
   * @param {string} cardId 权益卡ID
   */
  purchase(cardId) {
    return post('/member/purchase', { card_id: cardId });
  },

  /**
   * 获取会员状态
   */
  getStatus() {
    return get('/member/status');
  },
};

// ========== 轮播图模块 ==========
const banner = {
  /**
   * 获取轮播图列表
   */
  getList() {
    return get('/banners');
  },
};

// ========== 文件上传 ==========
const file = {
  /**
   * 上传图片
   * @param {string} filePath 文件路径
   */
  uploadImage(filePath) {
    return upload(filePath, 'file');
  },
};

module.exports = {
  auth,
  user,
  student,
  community,
  course,
  order,
  payment,
  member,
  banner,
  file,
};
