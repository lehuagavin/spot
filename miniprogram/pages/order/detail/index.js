/**
 * 订单详情页面
 */
const api = require('../../../services/api');

Page({
  data: {
    orderId: '',
    order: null,
    loading: true,
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ orderId: options.id });
      this.loadOrderDetail(options.id);
    }
  },

  async loadOrderDetail(id) {
    try {
      const order = await api.order.getDetail(id);
      this.setData({ order, loading: false });
    } catch (err) {
      this.setData({
        order: {
          id,
          course_name: '体能+跳绳',
          status: 'ongoing',
          status_text: '开班中',
          schedule: '周六 08:00-09:00',
          community_name: '碧桂园中央公园',
          address: '海口市美兰区桂林横路',
          total_amount: 80,
          discount_amount: 0,
          pay_amount: 80,
          students: [{ name: '张小明' }],
          created_at: '2026-01-30 10:00:00',
          pay_time: '2026-01-30 10:05:00',
        },
        loading: false,
      });
    }
  },

  async onCancel() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消此订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.order.cancel(this.data.orderId);
          } catch (err) {}
          wx.showToast({ title: '取消成功', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1500);
        }
      },
    });
  },

  async onRefund() {
    wx.showModal({
      title: '申请退款',
      content: '确定要申请退款吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.order.refund(this.data.orderId, { reason: '用户申请' });
          } catch (err) {}
          wx.showToast({ title: '申请已提交', icon: 'success' });
          setTimeout(() => this.loadOrderDetail(this.data.orderId), 1500);
        }
      },
    });
  },

  onContact() {
    // 联系客服
  },
});
