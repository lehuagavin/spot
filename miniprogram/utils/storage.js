/**
 * 本地存储封装
 */

// 存储键名常量
const KEYS = {
  TOKEN: 'token',
  USER_INFO: 'userInfo',
  SELECTED_COMMUNITY: 'selectedCommunity',
  PRIVACY_AGREED: 'privacyAgreed',
  SEARCH_HISTORY: 'searchHistory',
};

/**
 * 设置存储
 * @param {string} key 键名
 * @param {*} value 值
 */
function set(key, value) {
  try {
    wx.setStorageSync(key, value);
  } catch (e) {
    console.error('存储失败:', e);
  }
}

/**
 * 获取存储
 * @param {string} key 键名
 * @param {*} defaultValue 默认值
 * @returns {*}
 */
function get(key, defaultValue = null) {
  try {
    const value = wx.getStorageSync(key);
    return value !== '' ? value : defaultValue;
  } catch (e) {
    console.error('读取存储失败:', e);
    return defaultValue;
  }
}

/**
 * 移除存储
 * @param {string} key 键名
 */
function remove(key) {
  try {
    wx.removeStorageSync(key);
  } catch (e) {
    console.error('移除存储失败:', e);
  }
}

/**
 * 清空所有存储
 */
function clear() {
  try {
    wx.clearStorageSync();
  } catch (e) {
    console.error('清空存储失败:', e);
  }
}

// ========== 业务相关存储方法 ==========

/**
 * 保存 Token
 */
function setToken(token) {
  set(KEYS.TOKEN, token);
}

/**
 * 获取 Token
 */
function getToken() {
  return get(KEYS.TOKEN, '');
}

/**
 * 移除 Token
 */
function removeToken() {
  remove(KEYS.TOKEN);
}

/**
 * 保存用户信息
 */
function setUserInfo(userInfo) {
  set(KEYS.USER_INFO, userInfo);
}

/**
 * 获取用户信息
 */
function getUserInfo() {
  return get(KEYS.USER_INFO, null);
}

/**
 * 移除用户信息
 */
function removeUserInfo() {
  remove(KEYS.USER_INFO);
}

/**
 * 保存选中的小区
 */
function setSelectedCommunity(community) {
  set(KEYS.SELECTED_COMMUNITY, community);
}

/**
 * 获取选中的小区
 */
function getSelectedCommunity() {
  return get(KEYS.SELECTED_COMMUNITY, null);
}

/**
 * 设置隐私协议同意状态
 */
function setPrivacyAgreed(agreed) {
  set(KEYS.PRIVACY_AGREED, agreed);
}

/**
 * 获取隐私协议同意状态
 */
function getPrivacyAgreed() {
  return get(KEYS.PRIVACY_AGREED, false);
}

/**
 * 添加搜索历史
 */
function addSearchHistory(keyword, maxCount = 10) {
  if (!keyword) return;
  
  let history = get(KEYS.SEARCH_HISTORY, []);
  
  // 移除已存在的相同关键词
  history = history.filter(item => item !== keyword);
  
  // 添加到最前面
  history.unshift(keyword);
  
  // 限制数量
  if (history.length > maxCount) {
    history = history.slice(0, maxCount);
  }
  
  set(KEYS.SEARCH_HISTORY, history);
}

/**
 * 获取搜索历史
 */
function getSearchHistory() {
  return get(KEYS.SEARCH_HISTORY, []);
}

/**
 * 清空搜索历史
 */
function clearSearchHistory() {
  remove(KEYS.SEARCH_HISTORY);
}

/**
 * 清除登录相关数据
 */
function clearLoginData() {
  removeToken();
  removeUserInfo();
}

module.exports = {
  KEYS,
  set,
  get,
  remove,
  clear,
  setToken,
  getToken,
  removeToken,
  setUserInfo,
  getUserInfo,
  removeUserInfo,
  setSelectedCommunity,
  getSelectedCommunity,
  setPrivacyAgreed,
  getPrivacyAgreed,
  addSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  clearLoginData,
};
