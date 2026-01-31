/**
 * 我的订单页面
 */
const app = getApp();
const api = require('../../../services/api');

// 状态文本映射
const STATUS_TEXT_MAP = {
  pending: '未支付',
  paid: '已支付',
  waiting: '待开课',
  ongoing: '上课中',
  completed: '已完成',
  cancelled: '已取消',
  refunding: '退款中',
  refunded: '已退款',
};

Page({
  data: {
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'pending', label: '拼班中' },
      { key: 'waiting', label: '待开课' },
      { key: 'ongoing', label: '开班中' },
      { key: 'completed', label: '已完成' },
      { key: 'cancelled', label: '已取消' },
    ],
    currentTab: 'all',
    orders: [],
    loading: true,
    isLoggedIn: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
  },

  onLoad() {
    // onLoad 只在首次加载时调用，订单刷新在 onShow 中处理
  },

  onShow() {
    // 设置 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    
    // 更新登录状态
    const isLoggedIn = app.isLoggedIn();
    this.setData({ isLoggedIn });
    
    // 检查登录状态
    if (!isLoggedIn) {
      this.setData({
        orders: [],
        loading: false,
      });
      return;
    }
    
    // 每次显示页面时都刷新订单列表（用户可能在其他地方下了新订单）
    this.loadOrders(true);
  },

  async loadOrders(refresh = false) {
    const page = refresh ? 1 : this.data.page;
    
    if (refresh) {
      this.setData({ loading: true, orders: [], page: 1 });
    }
    
    try {
      const params = { page, page_size: this.data.pageSize };
      if (this.data.currentTab !== 'all') {
        params.status = this.data.currentTab;
      }
      
      console.log('请求订单列表, 参数:', params);
      const data = await api.order.getList(params);
      console.log('订单列表响应:', data);
      
      const list = Array.isArray(data.items) ? data.items : (Array.isArray(data) ? data : []);
      console.log('解析后订单列表:', list.length, '条');
      
      // 处理订单数据
      const processedList = list.map(order => this.processOrderData(order));
      
      const currentOrders = Array.isArray(this.data.orders) ? this.data.orders : [];
      const orders = refresh ? processedList : [...currentOrders, ...processedList];
      
      this.setData({
        orders: orders.length > 0 ? orders : [],
        loading: false,
        page: page + 1,
        hasMore: list.length >= this.data.pageSize,
      });
    } catch (err) {
      console.error('加载订单失败:', err);
      // API 失败时显示空状态，不使用模拟数据
      this.setData({
        orders: [],
        loading: false,
      });
    }
  },

  // 处理订单数据
  processOrderData(order) {
    // 添加状态文本
    order.status_text = STATUS_TEXT_MAP[order.status] || order.status;
    
    // 格式化完整时间
    if (order.created_at) {
      order.created_at_full = this.formatFullTime(order.created_at);
    }
    
    // 确保金额为数字
    order.pay_amount = parseFloat(order.pay_amount) || 0;
    order.total_amount = parseFloat(order.total_amount) || order.pay_amount;
    
    return order;
  },

  // 格式化完整时间（用于详情显示）
  formatFullTime(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  },

  // 模拟订单数据
  getMockOrders() {
    const now = new Date();
    return [
      {
        id: '1',
        order_no: '17698731317809620' + Math.floor(Math.random() * 100),
        course_name: '普通-运动课1.5h(第1周)',
        status: 'pending',
        status_text: '未支付',
        student_name: '陈乐华',
        created_at_full: this.formatFullTime(now),
        pay_method: '微信',
        total_amount: 120,
        pay_amount: 29.9,
      },
      {
        id: '2',
        order_no: '17698727499344421' + Math.floor(Math.random() * 100),
        course_name: '普通-运动课1.5h(第1周)',
        status: 'pending',
        status_text: '未支付',
        student_name: '陈乐华',
        created_at_full: this.formatFullTime(new Date(now - 600000)),
        pay_method: '微信',
        total_amount: 120,
        pay_amount: 29.9,
      },
      {
        id: '3',
        order_no: '17698726779118737' + Math.floor(Math.random() * 100),
        course_name: '普通-运动课1.5h(第1周)',
        status: 'pending',
        status_text: '未支付',
        student_name: '陈乐华',
        created_at_full: this.formatFullTime(new Date(now - 1200000)),
        pay_method: '微信',
        total_amount: 120,
        pay_amount: 29.9,
      },
    ];
  },

  onTabChange(e) {
    const { key } = e.currentTarget.dataset;
    if (key === this.data.currentTab) return;
    
    this.setData({ currentTab: key });
    this.loadOrders(true);
  },

  onOrderTap(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/order/detail/index?id=${id}`,
    });
  },

  goHome() {
    wx.switchTab({
      url: '/pages/index/index',
    });
  },

  goLogin() {
    wx.navigateTo({
      url: '/pages/user/login/index',
    });
  },

  onPullDownRefresh() {
    this.loadOrders(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadOrders(false);
    }
  },
});
