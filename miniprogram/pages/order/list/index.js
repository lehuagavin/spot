/**
 * 拼班记录（订单列表）页面
 */
const app = getApp();
const api = require('../../../services/api');

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
    page: 1,
    pageSize: 10,
    hasMore: true,
  },

  onLoad() {
    this.loadOrders(true);
  },

  onShow() {
    if (this.needRefresh) {
      this.loadOrders(true);
      this.needRefresh = false;
    }
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
      
      const data = await api.order.getList(params);
      const list = data.list || data || [];
      const orders = refresh ? list : [...this.data.orders, ...list];
      
      this.setData({
        orders: orders.length > 0 ? orders : this.getMockOrders(),
        loading: false,
        page: page + 1,
        hasMore: list.length >= this.data.pageSize,
      });
    } catch (err) {
      this.setData({
        orders: this.getMockOrders(),
        loading: false,
      });
    }
  },

  getMockOrders() {
    return [
      {
        id: 'o1',
        course_name: '体能+跳绳',
        status: 'pending',
        status_text: '拼班中',
        schedule: '周六 08:00-09:00',
        community_name: '碧桂园中央公园',
        pay_amount: 80,
        created_at: '2026-01-30 10:00:00',
      },
      {
        id: 'o2',
        course_name: '篮球启蒙班',
        status: 'ongoing',
        status_text: '开班中',
        schedule: '周日 09:00-10:00',
        community_name: '保利中央公馆',
        pay_amount: 100,
        created_at: '2026-01-25 14:30:00',
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

  onPullDownRefresh() {
    this.loadOrders(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore) {
      this.loadOrders(false);
    }
  },

  getStatusClass(status) {
    const map = {
      pending: 'pending',
      waiting: 'waiting',
      ongoing: 'ongoing',
      completed: 'completed',
      cancelled: 'cancelled',
    };
    return map[status] || '';
  },
});
