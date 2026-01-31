/**
 * 位置授权组件
 */
const app = getApp();

Component({
  /**
   * 组件属性
   */
  properties: {
    show: {
      type: Boolean,
      value: false,
    },
  },

  /**
   * 组件数据
   */
  data: {
    authStatus: 'notAsked', // notAsked, authorized, denied
  },

  /**
   * 生命周期
   */
  lifetimes: {
    attached() {
      this.checkAuth();
    },
  },

  /**
   * 组件方法
   */
  methods: {
    /**
     * 检查授权状态
     */
    async checkAuth() {
      const status = await app.checkLocationAuth();
      this.setData({ authStatus: status });
    },

    /**
     * 请求位置授权
     */
    onRequestAuth() {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          const location = {
            latitude: res.latitude,
            longitude: res.longitude,
          };
          app.globalData.location = location;
          this.triggerEvent('success', { location });
        },
        fail: (err) => {
          console.error('获取位置失败:', err);
          if (err.errMsg.includes('deny') || err.errMsg.includes('auth')) {
            this.setData({ authStatus: 'denied' });
            this.triggerEvent('denied');
          } else {
            this.triggerEvent('fail', { error: err });
          }
        },
      });
    },

    /**
     * 跳过授权
     */
    onSkip() {
      this.triggerEvent('skip');
    },

    /**
     * 打开设置
     */
    onOpenSetting() {
      wx.openSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation']) {
            this.setData({ authStatus: 'authorized' });
            // 重新获取位置
            this.onRequestAuth();
          }
        },
      });
    },

    /**
     * 阻止冒泡
     */
    preventTap() {},
  },
});
