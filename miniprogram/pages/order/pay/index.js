/**
 * 确认支付页面
 */
const api = require('../../../services/api');

Page({
  data: {
    orderId: '',
    order: null,
    countdown: 900, // 15分钟
    countdownMinutes: '15',
    countdownSeconds: '00',
    loading: true,
    paying: false,
    showPayModal: false,
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
      // 使用模拟数据
      this.setData({
        order: {
          id,
          course_name: '普通-运动课1.5h',
          course_status: 'ongoing',
          total_weeks: 2,
          current_week: 1,
          remaining_slots: 3,
          schedule: '2026-02-02 星期一 16:10~17:40',
          location: '海沧天心岛',
          unit_price: '120.00',
          students: [
            {
              name: '陈乐华',
              is_new: true,
              price: '29.9',
              discount: '90.1',
            },
          ],
          total_amount: '120.00',
          discount_amount: '90.1',
          pay_amount: '29.90',
          status: 'pending',
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
      
      this.setData({
        countdown,
        countdownMinutes: minutes.toString(),
        countdownSeconds: seconds.toString().padStart(2, '0'),
      });
    }, 1000);
  },

  // 显示支付弹窗
  onShowPayModal() {
    this.setData({ showPayModal: true });
  },

  // 隐藏支付弹窗
  onHidePayModal() {
    this.setData({ showPayModal: false });
  },

  // 发送到手机微信支付
  async onPayToPhone() {
    if (this.data.paying) return;
    this.setData({ paying: true, showPayModal: false });
    
    // 判断是否为开发环境（开发者工具或本地调试）
    const systemInfo = wx.getSystemInfoSync();
    const isDev = systemInfo.platform === 'devtools' || __wxConfig.envVersion === 'develop';
    
    if (isDev) {
      // 开发环境：直接模拟支付成功（跳过微信支付调用）
      console.log('开发环境：模拟支付成功');
      wx.showLoading({ title: '支付中...' });
      setTimeout(() => {
        wx.hideLoading();
        this.handlePaySuccess();
      }, 1000);
      return;
    }
    
    // 生产环境：调用真实微信支付
    try {
      const payParams = await api.payment.prepay(this.data.orderId);
      
      wx.requestPayment({
        ...payParams,
        success: () => {
          this.handlePaySuccess();
        },
        fail: (err) => {
          console.log('微信支付失败:', err);
          if (err.errMsg && err.errMsg.includes('fail cancel')) {
            // 用户取消支付
            this.setData({ paying: false });
            return;
          }
          wx.showToast({ title: '支付失败', icon: 'none' });
          this.setData({ paying: false });
        },
      });
    } catch (err) {
      console.log('支付接口调用失败:', err);
      wx.showToast({ title: '支付失败，请重试', icon: 'none' });
      this.setData({ paying: false });
    }
  },

  // 处理支付成功
  async handlePaySuccess() {
    try {
      // 调用后端确认支付接口（模拟支付回调）
      await api.payment.confirm(this.data.orderId);
    } catch (e) {
      console.log('确认支付失败:', e);
    }
    
    wx.showToast({ title: '支付成功', icon: 'success' });
    setTimeout(() => {
      wx.redirectTo({ url: '/pages/order/list/index' });
    }, 1500);
  },

  // 二维码支付
  onPayByQrcode() {
    this.setData({ showPayModal: false });
    // TODO: 实现二维码支付
    // 可以跳转到二维码支付页面或显示二维码
    wx.showToast({
      title: '二维码支付功能开发中',
      icon: 'none',
    });
  },

  // 取消订单
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

  // 兼容旧方法
  onPay() {
    this.onShowPayModal();
  },
});
