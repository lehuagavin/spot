/**
 * 个人中心页面
 */
const app = getApp();
const api = require('../../../services/api');
const util = require('../../../utils/util');

Page({
  data: {
    isLoggedIn: false,
    userInfo: null,
    assets: {
      health_beans: 0,
      coupons: 0,
    },
    menuList: [
      { icon: '🏘️', title: '小区运动主理人', desc: '事业家庭两不误', url: '', type: 'info' },
      { icon: '📋', title: '我的订单', url: '/pages/order/list/index' },
      { icon: '🎁', title: '邀请好友', url: '' },
      { icon: '👶', title: '我的学员', url: '/pages/student/list/index' },
      { icon: 'ℹ️', title: '关于我们', url: '/pages/user/about/index' },
      { icon: '📝', title: '申请主理人', url: '' },
    ],
  },

  onLoad() {
    this.updateLoginState();
  },

  onShow() {
    this.updateLoginState();
    if (app.isLoggedIn()) {
      this.loadAssets();
    }
  },

  updateLoginState() {
    const isLoggedIn = app.isLoggedIn();
    const userInfo = app.globalData.userInfo;
    
    this.setData({
      isLoggedIn,
      userInfo: userInfo ? {
        ...userInfo,
        phone_masked: util.maskPhone(userInfo.phone || ''),
      } : null,
    });
  },

  async loadAssets() {
    try {
      const assets = await api.user.getAssets();
      this.setData({ assets });
    } catch (err) {
      // 使用模拟数据
      this.setData({
        assets: {
          health_beans: 100,
          coupons: 2,
        },
      });
    }
  },

  onLogin() {
    wx.navigateTo({
      url: '/pages/user/login/index',
    });
  },

  onMenuTap(e) {
    const { url, type } = e.currentTarget.dataset;
    
    if (type === 'info') {
      // 展示信息类菜单
      wx.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }
    
    if (!url) {
      wx.showToast({ title: '功能开发中', icon: 'none' });
      return;
    }
    
    // 需要登录的页面
    const needLogin = ['/pages/order/list/index', '/pages/student/list/index'];
    if (needLogin.includes(url) && !app.isLoggedIn()) {
      wx.navigateTo({
        url: `/pages/user/login/index?redirect=${encodeURIComponent(url)}`,
      });
      return;
    }
    
    wx.navigateTo({ url });
  },

  onContact() {
    // 打开客服
  },

  onInvite() {
    wx.showToast({ title: '功能开发中', icon: 'none' });
  },

  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          app.clearLoginState();
          this.updateLoginState();
          wx.showToast({ title: '已退出登录', icon: 'success' });
        }
      },
    });
  },

  onShareAppMessage() {
    return {
      title: '义城上门教育 - 专业儿童体育培训',
      path: '/pages/index/index',
    };
  },
});
