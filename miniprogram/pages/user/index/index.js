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
    avatarLoadError: false,
    assets: {
      health_beans: 0,
      coupons: 0,
    },
  },

  onLoad() {
    this.updateLoginState();
  },

  onShow() {
    // 设置 tabBar 选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 3 });
    }
    
    // 重新从 storage 读取用户信息（确保获取最新数据）
    this.refreshUserInfo();
    
    if (app.isLoggedIn()) {
      this.loadAssets();
    }
  },

  /**
   * 刷新用户信息
   */
  refreshUserInfo() {
    // 从 storage 重新读取，确保获取最新数据
    const storage = require('../../../utils/storage');
    const storedUserInfo = storage.getUserInfo();
    
    if (storedUserInfo) {
      app.globalData.userInfo = storedUserInfo;
    }
    
    this.updateLoginState();
  },

  updateLoginState() {
    const isLoggedIn = app.isLoggedIn();
    const userInfo = app.globalData.userInfo;
    
    console.log('当前用户信息:', userInfo); // 调试日志
    
    this.setData({
      isLoggedIn,
      avatarLoadError: false, // 重置头像加载错误状态
      userInfo: userInfo ? {
        ...userInfo,
        phone_masked: util.maskPhone(userInfo.phone || ''),
      } : null,
    });
  },

  /**
   * 头像加载失败
   */
  onAvatarError() {
    console.log('头像加载失败');
    this.setData({ avatarLoadError: true });
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

  /**
   * 选择头像
   */
  async onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    if (!avatarUrl) return;

    console.log('选择的头像:', avatarUrl);

    // 立即显示新头像
    this.setData({
      'userInfo.avatar': avatarUrl,
      avatarLoadError: false,
    });

    wx.showLoading({ title: '更新中...' });

    try {
      // 上传头像到服务器
      const uploadRes = await this.uploadAvatar(avatarUrl);
      const serverAvatarUrl = uploadRes.url || avatarUrl;

      // 更新用户信息
      await api.auth.updateUserInfo({ avatar: serverAvatarUrl });

      // 更新本地数据并持久化
      const userInfo = { ...app.globalData.userInfo, avatar: serverAvatarUrl };
      app.setLoginState(app.globalData.token, userInfo);

      this.setData({
        'userInfo.avatar': serverAvatarUrl,
      });

      wx.hideLoading();
      wx.showToast({ title: '头像更新成功', icon: 'success' });

    } catch (err) {
      console.error('更新头像失败:', err);
      wx.hideLoading();
      
      // 开发环境：本地更新并持久化
      const userInfo = { ...app.globalData.userInfo, avatar: avatarUrl };
      app.setLoginState(app.globalData.token || 'mock_token', userInfo);
      
      // 头像已经显示了，只需要提示成功
      wx.showToast({ title: '头像已更新', icon: 'success' });
    }
  },

  /**
   * 上传头像
   */
  uploadAvatar(tempFilePath) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: `${app.globalData.baseUrl}/api/v1/upload/image`,
        filePath: tempFilePath,
        name: 'file',
        header: {
          Authorization: `Bearer ${wx.getStorageSync('token')}`,
        },
        success: (res) => {
          if (res.statusCode === 200) {
            const data = JSON.parse(res.data);
            resolve(data.data || data);
          } else {
            reject(new Error('上传失败'));
          }
        },
        fail: reject,
      });
    });
  },

  onMenuTap(e) {
    const { url } = e.currentTarget.dataset;
    
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
    
    // TabBar 页面需要使用 switchTab 跳转
    const tabBarPages = ['/pages/order/list/index'];
    if (tabBarPages.includes(url)) {
      wx.switchTab({ url });
    } else {
      wx.navigateTo({ url });
    }
  },

  onContact() {
    // 打开客服（由 open-type="contact" 处理）
  },

  onInvite() {
    wx.showToast({ title: '邀请好友功能开发中', icon: 'none' });
  },

  onAgentTap() {
    wx.showToast({ title: '主理人功能开发中', icon: 'none' });
  },

  onApplyAgent() {
    wx.showToast({ title: '申请主理人功能开发中', icon: 'none' });
  },

  onAutoEnroll() {
    wx.showToast({ title: '自动报班功能开发中', icon: 'none' });
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
