/**
 * 登录页面
 */
const app = getApp();
const api = require('../../../services/api');

Page({
  /**
   * 页面数据
   */
  data: {
    loading: false,
    redirectUrl: '',
  },

  /**
   * 页面加载
   */
  onLoad(options) {
    // 保存重定向地址
    if (options.redirect) {
      this.setData({
        redirectUrl: decodeURIComponent(options.redirect),
      });
    }
  },

  /**
   * 微信快捷登录
   */
  async onWechatLogin() {
    if (this.data.loading) return;
    
    this.setData({ loading: true });
    
    try {
      // 1. 获取微信登录 code
      const loginRes = await this.wxLogin();
      const code = loginRes.code;
      
      // 2. 调用后端登录接口
      const loginData = await api.auth.wechatLogin(code);
      
      // 3. 保存登录状态
      app.setLoginState(loginData.token, loginData.user);
      
      // 4. 检查是否需要绑定手机号
      if (!loginData.user.phone) {
        // 需要绑定手机号
        this.setData({ loading: false });
        wx.showModal({
          title: '提示',
          content: '请绑定手机号以完成注册',
          showCancel: false,
          confirmText: '去绑定',
        });
        return;
      }
      
      // 5. 登录成功，返回上一页
      this.onLoginSuccess();
      
    } catch (err) {
      console.error('登录失败:', err);
      this.setData({ loading: false });
      
      // 模拟登录成功（开发环境）
      this.mockLogin();
    }
  },

  /**
   * 模拟登录（开发环境）
   */
  mockLogin() {
    const mockUser = {
      id: 'user_001',
      nickname: '测试用户',
      avatar: '',
      phone: '13800138000',
      health_beans: 100,
      coupons: 2,
      is_member: false,
    };
    
    app.setLoginState('mock_token_12345', mockUser);
    
    wx.showToast({
      title: '登录成功',
      icon: 'success',
    });
    
    setTimeout(() => {
      this.onLoginSuccess();
    }, 1000);
  },

  /**
   * 微信登录
   */
  wxLogin() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: resolve,
        fail: reject,
      });
    });
  },

  /**
   * 获取手机号
   */
  async onGetPhoneNumber(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      console.log('用户拒绝授权手机号');
      return;
    }
    
    this.setData({ loading: true });
    
    try {
      // 调用后端绑定手机号接口
      const code = e.detail.code;
      await api.auth.bindPhone(code);
      
      // 刷新用户信息
      const userInfo = await api.user.getInfo();
      app.globalData.userInfo = userInfo;
      
      // 登录成功
      this.onLoginSuccess();
      
    } catch (err) {
      console.error('绑定手机号失败:', err);
      this.setData({ loading: false });
      wx.showToast({
        title: '绑定失败',
        icon: 'none',
      });
    }
  },

  /**
   * 登录成功处理
   */
  onLoginSuccess() {
    this.setData({ loading: false });
    
    const { redirectUrl } = this.data;
    
    if (redirectUrl) {
      // 跳转到指定页面
      wx.redirectTo({
        url: redirectUrl,
        fail: () => {
          wx.switchTab({
            url: redirectUrl,
            fail: () => {
              wx.navigateBack();
            },
          });
        },
      });
    } else {
      // 返回上一页
      wx.navigateBack({
        fail: () => {
          wx.switchTab({
            url: '/pages/index/index',
          });
        },
      });
    }
  },

  /**
   * 返回首页
   */
  onBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({
          url: '/pages/index/index',
        });
      },
    });
  },
});
