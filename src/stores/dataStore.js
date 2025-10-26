/**
 * 📦 數據存儲模組 (Data Store Module)
 *
 * 管理城市圖層數據和地圖導航功能
 * 使用 Pinia 狀態管理系統和 Vue 3 Composition API
 */

// 核心依賴
import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 🏪 數據存儲商店定義 (Data Store Definition)
 *
 * 使用 Pinia 的 defineStore 創建一個名為 'data' 的狀態管理商店。
 * 採用 Composition API 語法，提供更好的 TypeScript 支援和代碼組織。
 *
 * @returns {Object} 包含所有狀態和方法的商店對象
 */
export const useDataStore = defineStore(
  'data', // 商店唯一標識符
  () => {
    // 台灣中心座標（用於地圖投影和導航）
    const taiwanCenter = [120.982025, 23.973875];

    /**
     * 🏠 台灣 (Taiwan)
     *
     * 台灣在地圖上會以紅色標示
     */
    const homeCountry = ref('Taiwan');

    /**
     * 🌍 已造訪國家列表 (Visited Countries List)
     *
     * 這些國家在地圖上會以淺藍色標示
     * 名稱需與 GeoJSON 中的 properties.NAME 欄位完全匹配
     * 按英文字母順序排列
     * 注意：微型國家（列支敦士登、聖馬利諾、教廷、摩納哥、安道爾、馬爾他）
     * 在此低解析度地圖中不存在
     */
    const visitedCountries = ref([
      'Australia',
      'Austria',
      'Belgium',
      'Brunei',
      'China',
      'Czechia',
      'Denmark',
      'Estonia',
      'Finland',
      'France',
      'Germany',
      'Greece',
      'Greenland',
      'Hungary',
      'Iceland',
      'Italy',
      'Japan',
      'Laos',
      'Luxembourg',
      'Malaysia',
      'Mexico',
      'Mongolia',
      'Netherlands',
      'North Korea',
      'Norway',
      'Philippines',
      'Poland',
      'Qatar',
      'Singapore',
      'Slovakia',
      'South Korea',
      'Spain',
      'Sweden',
      'Switzerland',
      'Thailand',
      'United Kingdom',
      'United States of America',
      'Vietnam',
    ]);

    /**
     * 🏠 檢查國家是否為台灣 (Check if Country is Taiwan)
     *
     * @param {string} countryName - 國家名稱（來自 GeoJSON 的 properties.name 或其他屬性）
     * @returns {boolean} 是否為台灣
     */
    const isHomeCountry = (countryName) => {
      if (!countryName) return false;
      return countryName.trim() === homeCountry.value;
    };

    /**
     * 🔍 檢查國家是否已造訪 (Check if Country is Visited)
     *
     * @param {string} countryName - 國家名稱（來自 GeoJSON 的 properties.name 或其他屬性）
     * @returns {boolean} 是否為已造訪國家
     */
    const isCountryVisited = (countryName) => {
      if (!countryName) return false;

      // 標準化國家名稱進行比對
      const normalizedName = countryName.trim();

      return visitedCountries.value.some((visitedCountry) => {
        // 完全匹配
        if (normalizedName === visitedCountry) return true;

        // 部分匹配（例如 "United States" 匹配 "United States of America"）
        if (normalizedName.includes(visitedCountry) || visitedCountry.includes(normalizedName)) {
          return true;
        }

        return false;
      });
    };

    /**
     * 🔄 切換圖層可見性狀態 (Toggle Layer Visibility)
     *
     * 控制指定圖層的顯示/隱藏狀態，並在圖層首次顯示時自動載入相關數據。
     * 這是圖層管理的核心方法，負責處理圖層狀態變更和數據載入邏輯。
     *
     * @param {string} layerId - 要切換狀態的圖層唯一標識符
     * @returns {Promise<void>} 異步操作，無返回值
     *
     * @example
     * // 切換安養機構圖層的顯示狀態
     * await toggleLayerVisibility('安養機構');
     */
    // 移除圖層可見性切換（城市圖層永久可見，且無需勾選切換）

    // 移除 GeoJSON 載入功能，現在直接使用座標點

    // ------------------------------------------------------------
    // 選中的地圖物件（用於清除選取狀態）
    const selectedFeature = ref(null);

    const setSelectedFeature = (feature) => {
      selectedFeature.value = feature;
    };

    // ------------------------------------------------------------
    // 地圖導航功能
    const mapInstance = ref(null);

    const setMapInstance = (map) => {
      mapInstance.value = map;
    };

    /**
     * 🌍 導航到台灣
     *
     * 將地圖視圖移動到台灣的中心位置
     *
     * @returns {void}
     */
    const navigateToTaiwan = () => {
      // 檢查地圖實例是否準備就緒
      if (!mapInstance.value) {
        console.error('❌ 地圖實例未準備就緒，等待地圖初始化...');
        // 延遲重試機制
        setTimeout(() => {
          if (mapInstance.value) {
            console.log('🌍 地圖已準備就緒，重新嘗試移動');
            navigateToTaiwan();
          } else {
            console.error('❌ 地圖實例仍未準備就緒');
          }
        }, 1000);
        return;
      }

      // 執行地圖導航到台灣
      try {
        // D3.js 地圖使用 navigateToLocation 方法
        if (mapInstance.value.navigateToLocation) {
          mapInstance.value.navigateToLocation(taiwanCenter);
          console.log('🌍 成功導航到台灣');
        }
      } catch (error) {
        console.error('❌ 地圖導航失敗:', error);
      }
    };

    return {
      taiwanCenter, // 台灣中心座標
      selectedFeature, // 選中的地圖要素
      setSelectedFeature, // 設定選中的地圖要素
      mapInstance, // 地圖實例
      setMapInstance, // 設定地圖實例
      navigateToTaiwan, // 導航到台灣
      homeCountry, // 台灣（紅色標示）
      isHomeCountry, // 檢查國家是否為台灣
      visitedCountries, // 已造訪國家列表
      isCountryVisited, // 檢查國家是否已造訪
    };
  },
  {
    persist: true,
  }
);
