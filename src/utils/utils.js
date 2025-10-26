/**
 * 🛠️ 工具函數模組 (Utility Functions Module)
 *
 * 本模組提供應用程式中使用的通用工具函數，包括數據處理、格式轉換、
 * 數學計算、日期處理等常用功能。
 *
 * 📋 主要功能：
 * 1. 🔢 數學計算工具 - 座標轉換、距離計算、數值處理
 * 2. 📅 日期時間工具 - 日期格式化、時間戳轉換
 * 3. 🔤 字符串處理工具 - 文本格式化、驗證、轉換
 * 4. 📊 數據處理工具 - 陣列操作、對象處理、數據驗證
 * 5. 🌍 地理計算工具 - 經緯度處理、投影轉換
 * 6. 🎨 UI 工具 - 顏色處理、動畫輔助、響應式計算
 *
 * 🏗️ 技術架構：
 * - 純函數設計，無副作用
 * - 函數式編程風格
 * - 完整的錯誤處理
 * - 詳細的 JSDoc 文檔
 *
 * 📁 相關文件：
 * - ../stores/dataStore.js - 使用地理計算工具
 * - ../tabs/MapTab.vue - 使用座標轉換工具
 * - ../views/HomeView.vue - 使用 UI 工具
 *
 * @author Kevin Cheng
 * @version 1.0.0
 * @since 2024-12
 */

/**
 * 🔢 數學計算工具 (Mathematical Utilities)
 */

/**
 * 計算兩點之間的距離（使用 Haversine 公式）
 *
 * @param {number} lat1 - 第一個點的緯度
 * @param {number} lon1 - 第一個點的經度
 * @param {number} lat2 - 第二個點的緯度
 * @param {number} lon2 - 第二個點的經度
 * @param {string} unit - 距離單位 ('km' 或 'miles')
 * @returns {number} 兩點之間的距離
 *
 * @example
 * const distance = calculateDistance(25.04583, 121.51972, 35.6762, 139.6503, 'km');
 * console.log('距離:', distance, '公里');
 */
export function calculateDistance(lat1, lon1, lat2, lon2, unit = 'km') {
  // 🔍 參數驗證 (Parameter Validation)
  if (
    typeof lat1 !== 'number' ||
    typeof lon1 !== 'number' ||
    typeof lat2 !== 'number' ||
    typeof lon2 !== 'number'
  ) {
    throw new Error('所有座標參數必須是數字');
  }

  // 🌍 Haversine 公式計算距離 (Haversine Formula)
  const R = unit === 'miles' ? 3959 : 6371; // 地球半徑（英里或公里）
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // 保留兩位小數
}

/**
 * 將角度轉換為弧度
 *
 * @param {number} degrees - 角度值
 * @returns {number} 弧度值
 */
export function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * 將弧度轉換為角度
 *
 * @param {number} radians - 弧度值
 * @returns {number} 角度值
 */
export function toDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * 限制數值在指定範圍內
 *
 * @param {number} value - 要限制的值
 * @param {number} min - 最小值
 * @param {number} max - 最大值
 * @returns {number} 限制後的值
 */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * 📅 日期時間工具 (Date and Time Utilities)
 */

/**
 * 格式化日期為可讀字符串
 *
 * @param {Date|string|number} date - 日期對象、字符串或時間戳
 * @param {string} format - 格式類型 ('short', 'long', 'time')
 * @returns {string} 格式化後的日期字符串
 */
export function formatDate(date, format = 'short') {
  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    throw new Error('無效的日期格式');
  }

  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
    time: { hour: '2-digit', minute: '2-digit', second: '2-digit' },
  };

  return dateObj.toLocaleDateString('zh-TW', options[format] || options.short);
}

/**
 * 獲取相對時間描述（如 "2 小時前"）
 *
 * @param {Date|string|number} date - 日期對象、字符串或時間戳
 * @returns {string} 相對時間描述
 */
export function getRelativeTime(date) {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now - targetDate) / 1000);

  if (diffInSeconds < 60) return '剛剛';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} 分鐘前`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} 小時前`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} 天前`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} 個月前`;

  return `${Math.floor(diffInSeconds / 31536000)} 年前`;
}

/**
 * 🔤 字符串處理工具 (String Utilities)
 */

/**
 * 首字母大寫
 *
 * @param {string} str - 要處理的字符串
 * @returns {string} 首字母大寫的字符串
 */
export function capitalize(str) {
  if (typeof str !== 'string') {
    throw new Error('參數必須是字符串');
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * 移除字符串兩端的空白字符
 *
 * @param {string} str - 要處理的字符串
 * @returns {string} 處理後的字符串
 */
export function trim(str) {
  if (typeof str !== 'string') {
    throw new Error('參數必須是字符串');
  }
  return str.trim();
}

/**
 * 檢查字符串是否為空或只包含空白字符
 *
 * @param {string} str - 要檢查的字符串
 * @returns {boolean} 是否為空
 */
export function isEmpty(str) {
  return !str || str.trim().length === 0;
}

/**
 * 生成隨機字符串
 *
 * @param {number} length - 字符串長度
 * @param {string} charset - 字符集
 * @returns {string} 隨機字符串
 */
export function generateRandomString(
  length = 8,
  charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
) {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

/**
 * 📊 數據處理工具 (Data Processing Utilities)
 */

/**
 * 深拷貝對象
 *
 * @param {any} obj - 要拷貝的對象
 * @returns {any} 深拷貝後的對象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item));
  }

  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * 檢查兩個對象是否深度相等
 *
 * @param {any} obj1 - 第一個對象
 * @param {any} obj2 - 第二個對象
 * @returns {boolean} 是否相等
 */
export function deepEqual(obj1, obj2) {
  if (obj1 === obj2) return true;

  if (obj1 == null || obj2 == null) return false;

  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 !== 'object') return obj1 === obj2;

  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    if (!deepEqual(obj1[key], obj2[key])) return false;
  }

  return true;
}

/**
 * 從陣列中移除重複元素
 *
 * @param {Array} array - 要處理的陣列
 * @param {string} key - 用於比較的鍵名（可選）
 * @returns {Array} 去重後的陣列
 */
export function removeDuplicates(array, key = null) {
  if (!Array.isArray(array)) {
    throw new Error('參數必須是陣列');
  }

  if (key) {
    const seen = new Set();
    return array.filter((item) => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  }

  return [...new Set(array)];
}

/**
 * 🌍 地理計算工具 (Geographic Utilities)
 */

/**
 * 驗證經緯度座標是否有效
 *
 * @param {number} lat - 緯度
 * @param {number} lng - 經度
 * @returns {boolean} 是否有效
 */
export function isValidCoordinate(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * 將十進制度數轉換為度分秒格式
 *
 * @param {number} decimal - 十進制度數
 * @param {boolean} isLatitude - 是否為緯度
 * @returns {string} 度分秒格式字符串
 */
export function decimalToDMS(decimal, isLatitude = true) {
  const absolute = Math.abs(decimal);
  const degrees = Math.floor(absolute);
  const minutesFloat = (absolute - degrees) * 60;
  const minutes = Math.floor(minutesFloat);
  const seconds = (minutesFloat - minutes) * 60;

  const direction = isLatitude ? (decimal >= 0 ? 'N' : 'S') : decimal >= 0 ? 'E' : 'W';

  return `${degrees}°${minutes}'${seconds.toFixed(2)}"${direction}`;
}

/**
 * 🎨 UI 工具 (UI Utilities)
 */

/**
 * 生成隨機顏色
 *
 * @param {string} type - 顏色類型 ('hex', 'rgb', 'hsl')
 * @returns {string} 隨機顏色
 */
export function generateRandomColor(type = 'hex') {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);

  switch (type) {
    case 'hex':
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    case 'rgb':
      return `rgb(${r}, ${g}, ${b})`;
    case 'hsl':
      const h = Math.floor(Math.random() * 360);
      const s = Math.floor(Math.random() * 100);
      const l = Math.floor(Math.random() * 100);
      return `hsl(${h}, ${s}%, ${l}%)`;
    default:
      throw new Error('不支援的顏色類型');
  }
}

/**
 * 計算響應式字體大小
 *
 * @param {number} baseSize - 基礎字體大小
 * @param {number} screenWidth - 螢幕寬度
 * @param {number} minSize - 最小字體大小
 * @param {number} maxSize - 最大字體大小
 * @returns {number} 計算後的字體大小
 */
export function calculateResponsiveFontSize(baseSize, screenWidth, minSize = 12, maxSize = 48) {
  const scale = screenWidth / 1920; // 以 1920px 為基準
  const responsiveSize = baseSize * scale;
  return clamp(responsiveSize, minSize, maxSize);
}

/**
 * 防抖函數
 *
 * @param {Function} func - 要防抖的函數
 * @param {number} delay - 延遲時間（毫秒）
 * @returns {Function} 防抖後的函數
 */
export function debounce(func, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * 節流函數
 *
 * @param {Function} func - 要節流的函數
 * @param {number} limit - 限制時間（毫秒）
 * @returns {Function} 節流後的函數
 */
export function throttle(func, limit = 100) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * 🔧 錯誤處理工具 (Error Handling Utilities)
 */

/**
 * 安全執行函數，捕獲並處理錯誤
 *
 * @param {Function} func - 要執行的函數
 * @param {any} defaultValue - 錯誤時的預設值
 * @param {...any} args - 函數參數
 * @returns {any} 函數執行結果或預設值
 */
export function safeExecute(func, defaultValue = null, ...args) {
  try {
    return func(...args);
  } catch (error) {
    console.error('函數執行錯誤:', error);
    return defaultValue;
  }
}

/**
 * 異步安全執行函數
 *
 * @param {Function} func - 要執行的異步函數
 * @param {any} defaultValue - 錯誤時的預設值
 * @param {...any} args - 函數參數
 * @returns {Promise<any>} 函數執行結果或預設值
 */
export async function safeExecuteAsync(func, defaultValue = null, ...args) {
  try {
    return await func(...args);
  } catch (error) {
    console.error('異步函數執行錯誤:', error);
    return defaultValue;
  }
}

/**
 * 📝 日誌工具 (Logging Utilities)
 */

/**
 * 格式化日誌訊息
 *
 * @param {string} level - 日誌級別 ('info', 'warn', 'error', 'debug')
 * @param {string} message - 日誌訊息
 * @param {any} data - 附加數據
 * @returns {string} 格式化後的日誌訊息
 */
export function formatLogMessage(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (data) {
    return `${prefix} ${message} | Data: ${JSON.stringify(data)}`;
  }

  return `${prefix} ${message}`;
}

/**
 * 條件日誌輸出
 *
 * @param {boolean} condition - 是否輸出日誌
 * @param {string} level - 日誌級別
 * @param {string} message - 日誌訊息
 * @param {any} data - 附加數據
 */
export function conditionalLog(condition, level, message, data = null) {
  if (condition) {
    const formattedMessage = formatLogMessage(level, message, data);
    console[level](formattedMessage);
  }
}
