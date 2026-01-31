/**
 * 隐私协议弹窗组件
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
  data: {},

  /**
   * 组件方法
   */
  methods: {
    /**
     * 拒绝
     */
    onReject() {
      // 退出小程序
      wx.showModal({
        title: '提示',
        content: '拒绝隐私协议将无法使用小程序',
        confirmText: '继续退出',
        cancelText: '返回',
        success: (res) => {
          if (res.confirm) {
            // 退出小程序
            wx.exitMiniProgram();
          }
        },
      });
    },

    /**
     * 同意
     */
    onAgree() {
      app.agreePrivacy();
      this.triggerEvent('agree');
    },

    /**
     * 查看隐私政策
     */
    onViewPrivacy() {
      // 打开隐私政策页面
      wx.openPrivacyContract({
        fail: () => {
          // 如果没有设置隐私协议，跳转到自定义页面
          wx.navigateTo({
            url: '/pages/webview/index?url=' + encodeURIComponent('https://example.com/privacy'),
          });
        },
      });
    },

    /**
     * 阻止冒泡
     */
    preventTap() {
      // 阻止点击遮罩关闭
    },
  },
});
