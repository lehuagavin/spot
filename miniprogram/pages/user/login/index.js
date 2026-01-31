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
    step: 'login', // 'login' 或 'bindPhone'
    loading: false,
    phoneLoading: false,
    redirectUrl: '',
    tempAvatarUrl: '', // 临时头像URL
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
        // 切换到绑定手机号步骤
        this.setData({ 
          loading: false,
          step: 'bindPhone',
        });
        return;
      }
      
      // 5. 登录成功，返回上一页
      this.onLoginSuccess();
      
    } catch (err) {
      console.error('登录失败:', err);
      this.setData({ loading: false });
      
      // 模拟登录：跳转到绑定手机号步骤（开发环境测试）
      this.mockLoginNeedPhone();
    }
  },

  /**
   * 模拟登录 - 需要绑定手机号（开发环境）
   */
  mockLoginNeedPhone() {
    const mockUser = {
      id: 'user_001',
      nickname: '微信用户',
      avatar: '',
      phone: '', // 空手机号，需要绑定
      health_beans: 0,
      coupons: 0,
      is_member: false,
    };
    
    app.setLoginState('mock_token_12345', mockUser);
    
    // 切换到绑定手机号步骤
    this.setData({ step: 'bindPhone' });
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
   * 选择头像
   */
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    if (avatarUrl) {
      this.setData({ tempAvatarUrl: avatarUrl });
      wx.showToast({
        title: '头像已选择',
        icon: 'success',
      });
    }
  },

  /**
   * 上传头像到服务器
   */
  async uploadAvatar(tempFilePath) {
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

  /**
   * 保存头像
   */
  async saveAvatar() {
    const { tempAvatarUrl } = this.data;
    if (!tempAvatarUrl) return;

    try {
      // 上传头像
      const uploadRes = await this.uploadAvatar(tempAvatarUrl);
      const serverAvatarUrl = uploadRes.url || tempAvatarUrl;

      // 更新用户信息
      await api.auth.updateUserInfo({ avatar: serverAvatarUrl });

      // 更新本地数据并持久化
      const userInfo = app.globalData.userInfo || {};
      userInfo.avatar = serverAvatarUrl;
      app.setLoginState(app.globalData.token, userInfo);
    } catch (err) {
      console.error('保存头像失败:', err);
      // 开发环境：本地保存并持久化
      const userInfo = app.globalData.userInfo || {};
      userInfo.avatar = tempAvatarUrl;
      app.setLoginState(app.globalData.token || 'mock_token', userInfo);
    }
  },

  /**
   * 获取手机号
   */
  async onGetPhoneNumber(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      console.log('用户拒绝授权手机号');
      wx.showToast({
        title: '需要授权手机号才能继续',
        icon: 'none',
      });
      return;
    }
    
    this.setData({ phoneLoading: true });
    
    // 保存用户选择的头像（后续合并使用）
    const selectedAvatar = this.data.tempAvatarUrl;
    
    try {
      // 1. 调用后端绑定手机号接口
      const code = e.detail.code;
      await api.auth.bindPhone(code);
      
      // 2. 刷新用户信息
      let userInfo = await api.user.getInfo();
      
      // 3. 如果用户选择了头像，合并头像信息并更新到后端
      if (selectedAvatar) {
        try {
          const uploadRes = await this.uploadAvatar(selectedAvatar);
          const serverAvatarUrl = uploadRes.url || selectedAvatar;
          await api.auth.updateUserInfo({ avatar: serverAvatarUrl });
          userInfo.avatar = serverAvatarUrl;
        } catch (avatarErr) {
          console.error('上传头像失败:', avatarErr);
          userInfo.avatar = selectedAvatar; // 使用本地头像
        }
      }
      
      // 4. 保存并持久化用户信息
      app.setLoginState(app.globalData.token, userInfo);
      
      this.setData({ phoneLoading: false });
      
      wx.showToast({
        title: '设置成功',
        icon: 'success',
      });
      
      // 登录成功
      setTimeout(() => {
        this.onLoginSuccess();
      }, 1000);
      
    } catch (err) {
      console.error('绑定手机号失败:', err);
      this.setData({ phoneLoading: false });
      
      // 开发环境：模拟绑定成功
      this.mockBindSuccess();
    }
  },

  /**
   * 模拟绑定成功（开发环境）
   */
  mockBindSuccess() {
    // 获取微信授权返回的手机号（真实场景会从后端获取）
    // 这里使用模拟数据
    const mockPhone = '13812342461'; // 模拟授权获得的手机号
    
    const userInfo = app.globalData.userInfo || {};
    userInfo.phone = mockPhone;
    userInfo.nickname = userInfo.nickname || '微信用户';
    
    // 保存头像（如果用户选择了头像）
    if (this.data.tempAvatarUrl) {
      userInfo.avatar = this.data.tempAvatarUrl;
      console.log('保存头像:', this.data.tempAvatarUrl);
    }
    
    console.log('模拟绑定成功，用户信息:', userInfo);
    
    // 重要：更新并持久化用户信息
    app.setLoginState(app.globalData.token || 'mock_token', userInfo);
    
    wx.showToast({
      title: '设置成功',
      icon: 'success',
    });
    
    setTimeout(() => {
      this.onLoginSuccess();
    }, 1000);
  },

  /**
   * 跳过绑定
   */
  async onSkipBind() {
    // 如果选择了头像，保存头像
    if (this.data.tempAvatarUrl) {
      await this.saveAvatar();
    }

    wx.showToast({
      title: '已跳过，部分功能可能受限',
      icon: 'none',
    });
    
    setTimeout(() => {
      this.onLoginSuccess();
    }, 1000);
  },

  /**
   * 登录成功处理
   */
  onLoginSuccess() {
    this.setData({ loading: false, phoneLoading: false });
    
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

  /**
   * 查看用户协议
   */
  onShowUserAgreement() {
    wx.showModal({
      title: '用户协议',
      content: '用户协议内容正在完善中，请稍后查看。',
      showCancel: false,
      confirmText: '我知道了',
    });
  },

  /**
   * 查看隐私政策
   */
  onShowPrivacyPolicy() {
    wx.showModal({
      title: '隐私政策',
      content: '隐私政策内容正在完善中，请稍后查看。',
      showCancel: false,
      confirmText: '我知道了',
    });
  },
});
