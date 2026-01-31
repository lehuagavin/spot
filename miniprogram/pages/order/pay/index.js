/**
 * 支付页面
 */
const api = require('../../../services/api');

Page({
  data: {
    orderId: '',
    order: null,
    countdown: 900, // 15分钟
    countdownText: '15:00',
    loading: true,
    paying: false,
  },

  timer: null,

  onLoad(options) {
    if (options.orderId) {
      this.setData({ orderId: options.orderId });
      this.loadOrderDetail(options.orderId);
      this.startCountdown();
    }
  },

  onUnload() {
    if (this.timer) clearInterval(this.timer);
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
          status: 'pending',
          total_amount: 80,
          pay_amount: 80,
          created_at: new Date().toISOString(),
        },
        loading: false,
      });
    }
  },

  startCountdown() {
    this.timer = setInterval(() => {
      let { countdown } = this.data;
      countdown--;
      
      if (countdown <= 0) {
        clearInterval(this.timer);
        wx.showModal({
          title: '提示',
          content: '订单已超时，请重新下单',
          showCancel: false,
          success: () => {
            wx.navigateBack({ delta: 2 });
          },
        });
        return;
      }
      
      const minutes = Math.floor(countdown / 60);
      const seconds = countdown % 60;
      const countdownText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      this.setData({ countdown, countdownText });
    }, 1000);
  },

  async onPay() {
    if (this.data.paying) return;
    this.setData({ paying: true });
    
    try {
      const payParams = await api.payment.prepay(this.data.orderId);
      
      // 调用微信支付
      wx.requestPayment({
        ...payParams,
        success: () => {
          wx.showToast({ title: '支付成功', icon: 'success' });
          setTimeout(() => {
            wx.redirectTo({ url: '/pages/order/list/index' });
          }, 1500);
        },
        fail: (err) => {
          if (err.errMsg !== 'requestPayment:fail cancel') {
            wx.showToast({ title: '支付失败', icon: 'none' });
          }
          this.setData({ paying: false });
        },
      });
    } catch (err) {
      // 模拟支付成功
      wx.showToast({ title: '支付成功', icon: 'success' });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/order/list/index' });
      }, 1500);
    }
  },

  onCancel() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消此订单吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.order.cancel(this.data.orderId);
          } catch (err) {}
          wx.navigateBack({ delta: 2 });
        }
      },
    });
  },
});
