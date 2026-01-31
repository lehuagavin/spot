/**
 * 工具函数
 */

/**
 * 格式化日期
 * @param {Date|string|number} date 日期
 * @param {string} format 格式，默认 'YYYY-MM-DD'
 * @returns {string}
 */
function formatDate(date, format = 'YYYY-MM-DD') {
  if (!date) return '';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');
  const second = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second);
}

/**
 * 格式化时间为相对时间
 * @param {Date|string|number} date 日期
 * @returns {string}
 */
function formatRelativeTime(date) {
  if (!date) return '';
  
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;
  
  if (diff < minute) {
    return '刚刚';
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`;
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`;
  } else if (diff < week) {
    return `${Math.floor(diff / day)}天前`;
  } else if (diff < month) {
    return `${Math.floor(diff / week)}周前`;
  } else {
    return formatDate(date);
  }
}

/**
 * 格式化价格
 * @param {number|string} price 价格（分）
 * @param {boolean} showSymbol 是否显示符号
 * @returns {string}
 */
function formatPrice(price, showSymbol = true) {
  if (price === undefined || price === null) return '';
  
  // 将字符串转换为数字
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '';
  
  const yuan = (numPrice / 100).toFixed(2);
  return showSymbol ? `¥${yuan}` : yuan;
}

/**
 * 格式化价格为对象（用于分段显示）
 * @param {number|string} price 价格（元）
 * @returns {Object}
 */
function formatPriceObject(price) {
  if (price === undefined || price === null) {
    return { symbol: '¥', integer: '0', decimal: '.00' };
  }
  
  // 将字符串转换为数字（后端 Decimal 类型序列化后是字符串）
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) {
    return { symbol: '¥', integer: '0', decimal: '.00' };
  }
  
  const parts = numPrice.toFixed(2).split('.');
  return {
    symbol: '¥',
    integer: parts[0],
    decimal: `.${parts[1]}`,
  };
}

/**
 * 手机号脱敏
 * @param {string} phone 手机号
 * @returns {string}
 */
function maskPhone(phone) {
  if (!phone || phone.length !== 11) return phone;
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
}

/**
 * 身份证号脱敏
 * @param {string} idCard 身份证号
 * @returns {string}
 */
function maskIdCard(idCard) {
  if (!idCard || idCard.length < 15) return idCard;
  return idCard.replace(/(\d{6})\d+(\d{4})/, '$1********$2');
}

/**
 * 计算两点之间的距离（Haversine 公式）
 * @param {number} lat1 纬度1
 * @param {number} lng1 经度1
 * @param {number} lat2 纬度2
 * @param {number} lng2 经度2
 * @returns {number} 距离（千米）
 */
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // 地球半径（千米）
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg) {
  return deg * (Math.PI / 180);
}

/**
 * 格式化距离
 * @param {number|string} distance 距离（千米）
 * @returns {string}
 */
function formatDistance(distance) {
  if (distance === undefined || distance === null) return '';
  
  // 将字符串转换为数字
  const numDistance = typeof distance === 'string' ? parseFloat(distance) : distance;
  if (isNaN(numDistance)) return '';
  
  if (numDistance < 1) {
    return `${Math.round(numDistance * 1000)}m`;
  } else {
    return `${numDistance.toFixed(1)}km`;
  }
}

/**
 * 防抖函数
 * @param {Function} fn 函数
 * @param {number} delay 延迟时间
 * @returns {Function}
 */
function debounce(fn, delay = 300) {
  let timer = null;
  return function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param {Function} fn 函数
 * @param {number} interval 间隔时间
 * @returns {Function}
 */
function throttle(fn, interval = 300) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

/**
 * 深拷贝
 * @param {*} obj 对象
 * @returns {*}
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  
  const cloned = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 生成唯一ID
 * @returns {string}
 */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 校验手机号
 * @param {string} phone 手机号
 * @returns {boolean}
 */
function isValidPhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone);
}

/**
 * 校验身份证号
 * @param {string} idCard 身份证号
 * @returns {boolean}
 */
function isValidIdCard(idCard) {
  return /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/.test(idCard);
}

/**
 * 从身份证提取生日
 * @param {string} idCard 身份证号
 * @returns {string} YYYY-MM-DD
 */
function getBirthdayFromIdCard(idCard) {
  if (!idCard || idCard.length !== 18) return '';
  const year = idCard.substring(6, 10);
  const month = idCard.substring(10, 12);
  const day = idCard.substring(12, 14);
  return `${year}-${month}-${day}`;
}

/**
 * 从身份证提取性别
 * @param {string} idCard 身份证号
 * @returns {number} 1: 男, 2: 女
 */
function getGenderFromIdCard(idCard) {
  if (!idCard || idCard.length !== 18) return 0;
  const genderCode = parseInt(idCard.charAt(16), 10);
  return genderCode % 2 === 0 ? 2 : 1;
}

/**
 * 计算年龄
 * @param {string} birthday 生日 YYYY-MM-DD
 * @returns {number}
 */
function calculateAge(birthday) {
  if (!birthday) return 0;
  
  const birth = new Date(birthday);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  
  const monthDiff = now.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * 获取星期几
 * @param {Date|string} date 日期
 * @returns {string}
 */
function getWeekDay(date) {
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const d = new Date(date);
  return weekDays[d.getDay()];
}

/**
 * 根据数字格式化星期几
 * @param {number} day 星期几 (0-6, 0为周日)
 * @returns {string}
 */
function formatWeekDay(day) {
  const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekDays[day] || '';
}

/**
 * rpx 转 px
 * @param {number} rpx 
 * @returns {number}
 */
function rpxToPx(rpx) {
  const systemInfo = wx.getSystemInfoSync();
  return rpx * systemInfo.windowWidth / 750;
}

/**
 * px 转 rpx
 * @param {number} px 
 * @returns {number}
 */
function pxToRpx(px) {
  const systemInfo = wx.getSystemInfoSync();
  return px * 750 / systemInfo.windowWidth;
}

module.exports = {
  formatDate,
  formatRelativeTime,
  formatPrice,
  formatPriceObject,
  maskPhone,
  maskIdCard,
  calculateDistance,
  formatDistance,
  debounce,
  throttle,
  deepClone,
  generateId,
  isValidPhone,
  isValidIdCard,
  getBirthdayFromIdCard,
  getGenderFromIdCard,
  calculateAge,
  getWeekDay,
  formatWeekDay,
  rpxToPx,
  pxToRpx,
};
