/**
 * 网络请求封装
 */

const app = getApp();

// 请求配置
const config = {
  timeout: 30000,
  retryCount: 2,
};

/**
 * 发起请求
 * @param {Object} options 请求选项
 * @returns {Promise}
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    const baseUrl = app.globalData.apiBase;
    
    wx.request({
      url: `${baseUrl}${options.url}`,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.header,
      },
      timeout: options.timeout || config.timeout,
      success: (res) => {
        const { statusCode, data } = res;
        
        if (statusCode >= 200 && statusCode < 300) {
          // 业务状态码检查
          if (data.code === 0 || data.code === undefined) {
            resolve(data.data !== undefined ? data.data : data);
          } else {
            // 业务错误
            handleBusinessError(data);
            reject(data);
          }
        } else if (statusCode === 401) {
          // 未授权，跳转登录
          handleUnauthorized();
          reject({ code: 401, message: '登录已过期，请重新登录' });
        } else {
          // HTTP 错误
          const error = { code: statusCode, message: data.message || '请求失败' };
          reject(error);
        }
      },
      fail: (err) => {
        console.error('请求失败:', err);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
        });
        reject({ code: -1, message: err.errMsg || '网络请求失败' });
      },
    });
  });
}

/**
 * 处理业务错误
 */
function handleBusinessError(data) {
  const { code, message } = data;
  
  // 可以根据不同错误码做特殊处理
  switch (code) {
    case 10001:
      // 用户不存在
      break;
    case 10002:
      // 参数错误
      break;
    default:
      break;
  }
  
  if (message) {
    wx.showToast({
      title: message,
      icon: 'none',
    });
  }
}

/**
 * 处理未授权
 */
function handleUnauthorized() {
  // 清除本地登录状态
  wx.removeStorageSync('token');
  wx.removeStorageSync('userInfo');
  
  // 更新全局状态
  app.globalData.userInfo = null;
  app.globalData.token = null;
  
  // 提示并跳转登录
  wx.showModal({
    title: '提示',
    content: '登录已过期，请重新登录',
    showCancel: false,
    success: () => {
      wx.navigateTo({
        url: '/pages/user/login/index',
      });
    },
  });
}

/**
 * GET 请求
 */
function get(url, data, options = {}) {
  return request({
    url,
    method: 'GET',
    data,
    ...options,
  });
}

/**
 * POST 请求
 */
function post(url, data, options = {}) {
  return request({
    url,
    method: 'POST',
    data,
    ...options,
  });
}

/**
 * PUT 请求
 */
function put(url, data, options = {}) {
  return request({
    url,
    method: 'PUT',
    data,
    ...options,
  });
}

/**
 * DELETE 请求
 */
function del(url, data, options = {}) {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options,
  });
}

/**
 * 上传文件
 */
function upload(filePath, name = 'file', formData = {}) {
  return new Promise((resolve, reject) => {
    const token = wx.getStorageSync('token');
    const baseUrl = app.globalData.apiBase;
    
    wx.uploadFile({
      url: `${baseUrl}/upload/image`,
      filePath,
      name,
      formData,
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data);
            if (data.code === 0) {
              resolve(data.data);
            } else {
              reject(data);
            }
          } catch (e) {
            reject({ code: -1, message: '解析响应失败' });
          }
        } else {
          reject({ code: res.statusCode, message: '上传失败' });
        }
      },
      fail: (err) => {
        reject({ code: -1, message: err.errMsg || '上传失败' });
      },
    });
  });
}

module.exports = {
  request,
  get,
  post,
  put,
  del,
  upload,
};
