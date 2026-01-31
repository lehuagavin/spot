/**
 * 义城上门教育 - 小程序应用
 */
const storage = require('./utils/storage');

App({
  /**
   * 应用启动
   */
  onLaunch() {
    console.log('小程序启动');
    
    // 初始化全局数据
    this.initGlobalData();
    
    // 检查登录状态
    this.checkLoginStatus();
    
    // 获取系统信息
    this.getSystemInfo();
  },

  /**
   * 初始化全局数据
   */
  initGlobalData() {
    // 从本地存储恢复数据
    this.globalData.token = storage.getToken();
    this.globalData.userInfo = storage.getUserInfo();
    this.globalData.selectedCommunity = storage.getSelectedCommunity();
    this.globalData.privacyAgreed = storage.getPrivacyAgreed();
    this.globalData.location = storage.getLocation();
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const token = this.globalData.token;
    if (token) {
      // 验证 token 是否有效（可选）
      this.globalData.isLoggedIn = true;
    } else {
      this.globalData.isLoggedIn = false;
    }
  },

  /**
   * 获取系统信息（使用新 API）
   */
  getSystemInfo() {
    try {
      // 使用新 API 替代已弃用的 wx.getSystemInfoSync
      const deviceInfo = wx.getDeviceInfo();
      const windowInfo = wx.getWindowInfo();
      const appBaseInfo = wx.getAppBaseInfo();
      
      // 合并为兼容的 systemInfo 对象
      this.globalData.systemInfo = {
        ...deviceInfo,
        ...windowInfo,
        ...appBaseInfo,
      };
      
      // 判断是否是 iOS
      this.globalData.isIOS = deviceInfo.platform === 'ios';
      
      // 获取状态栏高度
      this.globalData.statusBarHeight = windowInfo.statusBarHeight;
      
      // 计算导航栏高度（状态栏 + 导航栏内容区）
      const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
      const navBarHeight = (menuButtonInfo.top - windowInfo.statusBarHeight) * 2 + menuButtonInfo.height;
      this.globalData.navBarHeight = navBarHeight;
      this.globalData.menuButtonInfo = menuButtonInfo;
      
    } catch (e) {
      console.error('获取系统信息失败:', e);
    }
  },

  /**
   * 检查是否需要显示隐私协议
   */
  needShowPrivacy() {
    return !this.globalData.privacyAgreed;
  },

  /**
   * 同意隐私协议
   */
  agreePrivacy() {
    this.globalData.privacyAgreed = true;
    storage.setPrivacyAgreed(true);
  },

  /**
   * 获取位置信息
   */
  getLocation() {
    return new Promise((resolve, reject) => {
      // 如果已有位置信息，直接返回
      if (this.globalData.location) {
        resolve(this.globalData.location);
        return;
      }
      
      // 请求位置授权
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          const location = {
            latitude: res.latitude,
            longitude: res.longitude,
          };
          this.globalData.location = location;
          storage.setLocation(location);
          resolve(location);
        },
        fail: (err) => {
          console.error('获取位置失败:', err);
          reject(err);
        },
      });
    });
  },

  /**
   * 检查位置授权
   */
  checkLocationAuth() {
    return new Promise((resolve) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation'] === undefined) {
            // 未请求过授权
            resolve('notAsked');
          } else if (res.authSetting['scope.userLocation']) {
            // 已授权
            resolve('authorized');
          } else {
            // 已拒绝
            resolve('denied');
          }
        },
        fail: () => {
          resolve('error');
        },
      });
    });
  },

  /**
   * 打开位置授权设置
   */
  openLocationSetting() {
    return new Promise((resolve, reject) => {
      wx.openSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation']) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
        fail: reject,
      });
    });
  },

  /**
   * 设置登录状态
   */
  setLoginState(token, userInfo) {
    this.globalData.token = token;
    this.globalData.userInfo = userInfo;
    this.globalData.isLoggedIn = true;
    
    storage.setToken(token);
    storage.setUserInfo(userInfo);
  },

  /**
   * 清除登录状态
   */
  clearLoginState() {
    this.globalData.token = null;
    this.globalData.userInfo = null;
    this.globalData.isLoggedIn = false;
    
    storage.clearLoginData();
  },

  /**
   * 设置选中的小区
   */
  setSelectedCommunity(community) {
    this.globalData.selectedCommunity = community;
    storage.setSelectedCommunity(community);
  },

  /**
   * 检查是否已登录
   */
  isLoggedIn() {
    return this.globalData.isLoggedIn && !!this.globalData.token;
  },

  /**
   * 跳转登录页（如果未登录）
   * @returns {boolean} 是否已登录
   */
  checkLogin() {
    if (!this.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/user/login/index',
      });
      return false;
    }
    return true;
  },

  /**
   * 获取图片完整 URL
   * @param {string} path 图片路径（可能是相对路径或完整 URL）
   * @returns {string} 完整的图片 URL
   */
  getImageUrl(path) {
    if (!path) return '';
    // 如果已经是完整 URL，直接返回
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    // 拼接服务器地址
    return `${this.globalData.serverBase}${path}`;
  },

  /**
   * 全局数据
   */
  globalData: {
    // 服务器基础地址（不含 /api/v1）
    serverBase: 'http://localhost:8000',
    // API 基础地址
    apiBase: 'http://localhost:8000/api/v1',
    
    // 登录状态
    isLoggedIn: false,
    token: null,
    userInfo: null,
    
    // 位置相关
    location: null,
    selectedCommunity: null,
    
    // 隐私协议
    privacyAgreed: false,
    
    // 系统信息
    systemInfo: null,
    isIOS: false,
    statusBarHeight: 0,
    navBarHeight: 0,
    menuButtonInfo: null,
  },
});
