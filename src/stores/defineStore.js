/**
 * 🗺️ 定義存儲模組 (Define Store Module)
 *
 * 本模組負責管理應用程式的全局配置和設定，包括底圖選擇、地圖視圖狀態等。
 * 使用 Pinia 狀態管理系統，提供響應式的配置管理功能。
 *
 * 📋 主要功能：
 * 1. 🗺️ 管理底圖配置和選擇，支援多種地圖樣式
 * 2. 📍 保存地圖視圖狀態（中心點、縮放級別）
 * 3. 🔄 提供底圖切換和視圖更新功能
 * 4. 💾 支援狀態持久化，保持用戶偏好設定
 *
 * 🏗️ 技術架構：
 * - Pinia 狀態管理庫
 * - Vue 3 Composition API
 * - 響應式狀態更新
 * - 模組化配置管理
 *
 * 📁 相關文件：
 * - ../tabs/MapTab.vue - 地圖組件，使用此存儲的配置
 * - ../dataStore.js - 數據存儲模組
 * - ../main.js - 應用程式入口，註冊 Pinia
 *
 * @author Kevin Cheng
 * @version 1.0.0
 * @since 2024-12
 */

// 🔧 Pinia 狀態管理引入 (Pinia State Management Import)
import { defineStore } from 'pinia';

/**
 * 🏪 定義存儲商店 (Define Store Definition)
 *
 * 使用 Pinia 的 defineStore 創建配置存儲，管理應用程式的全局設定。
 * 採用 Options API 風格，提供清晰的狀態結構和方法定義。
 */
export const useDefineStore = defineStore('define', {
  /**
   * 📊 狀態定義 (State Definition)
   * 定義存儲中的所有響應式狀態
   */
  state: () => ({
    // 🗺️ 當前選中的底圖類型 (Current Selected Basemap Type)
    // 固定為標準地圖，確保一致的地圖顯示效果
    selectedBasemap: 'carto_dark',

    // 🗺️ 地圖視圖狀態 (Map View State)
    // 包含地圖的中心點和縮放級別信息
    mapView: {
      center: [25.04583, 121.51972], // 地圖中心點 [緯度, 經度] - 台灣台北
      zoom: 16, // 縮放等級（調整到16級，顯示詳細的內容）
    },

    // 🗺️ 底圖配置列表 (Basemap Configuration List)
    // 定義可用的底圖選項，目前僅保留標準地圖
    basemaps: [
      {
        label: 'Carto Dark', // 底圖顯示名稱
        value: 'carto_dark', // 底圖唯一標識符
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', // 底圖瓦片 URL 模板
        attribution: '© CartoDB, © OpenStreetMap contributors', // 底圖版權信息
        description: '深色主題的標準地圖，適合夜間使用', // 底圖描述
      },
      // 🔮 未來可擴展的底圖選項 (Future Expandable Basemap Options)
      // {
      //   label: 'Carto Light',
      //   value: 'carto_light',
      //   url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      //   attribution: '© CartoDB, © OpenStreetMap contributors',
      //   description: '淺色主題的標準地圖，適合日間使用'
      // },
      // {
      //   label: 'OpenStreetMap',
      //   value: 'osm',
      //   url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //   attribution: '© OpenStreetMap contributors',
      //   description: '開源地圖，由社群維護'
      // }
    ],

    // 🎨 地圖樣式配置 (Map Style Configuration)
    mapStyle: {
      // 國家顏色配置
      countryColors: {
        taiwan: '#ff9999', // 台灣特殊顏色
        visited: '#666666', // 已造訪國家顏色
        unvisited: 'transparent', // 未造訪國家顏色（透明）
      },
      // 邊界線樣式
      borderStyle: {
        color: 'none', // 邊界線顏色（無邊界設計）
        width: 0, // 邊界線寬度
        opacity: 0, // 邊界線透明度
      },
    },
  }),

  /**
   * 🔧 動作方法 (Actions)
   * 定義修改狀態的方法
   */
  actions: {
    /**
     * 🗺️ 設定選中的底圖 (Set Selected Basemap)
     *
     * 更新當前選中的底圖類型，觸發地圖重新渲染。
     * 此方法會影響地圖組件的底圖顯示。
     *
     * @param {string} value - 底圖類型值，必須在 basemaps 配置中存在
     * @throws {Error} 當底圖值不存在時拋出錯誤
     *
     * @example
     * // 切換到淺色底圖
     * defineStore.setSelectedBasemap('carto_light');
     */
    setSelectedBasemap(value) {
      // 🔍 驗證底圖值是否存在 (Validate Basemap Value)
      const basemapExists = this.basemaps.some((basemap) => basemap.value === value);

      if (!basemapExists) {
        console.error('❌ [DefineStore] 無效的底圖值:', value);
        throw new Error(`底圖值 "${value}" 不存在於配置中`);
      }

      // 📝 更新選中的底圖 (Update Selected Basemap)
      this.selectedBasemap = value;
      console.log('🗺️ [DefineStore] 底圖已切換至:', value);
    },

    /**
     * 🗺️ 設定地圖視圖狀態 (Set Map View State)
     *
     * 更新地圖的中心點和縮放級別，用於地圖導航和視圖控制。
     * 此方法會觸發地圖組件的視圖更新。
     *
     * @param {Array<number>} center - 地圖中心點 [緯度, 經度]
     * @param {number} zoom - 縮放級別 (通常為 1-20)
     * @throws {Error} 當參數格式不正確時拋出錯誤
     *
     * @example
     * // 導航到日本東京
     * defineStore.setMapView([35.6762, 139.6503], 12);
     */
    setMapView(center, zoom) {
      // 🔍 驗證中心點格式 (Validate Center Format)
      if (!Array.isArray(center) || center.length !== 2) {
        console.error('❌ [DefineStore] 無效的中心點格式:', center);
        throw new Error('中心點必須是包含兩個數字的陣列 [緯度, 經度]');
      }

      // 🔍 驗證縮放級別 (Validate Zoom Level)
      if (typeof zoom !== 'number' || zoom < 1 || zoom > 20) {
        console.error('❌ [DefineStore] 無效的縮放級別:', zoom);
        throw new Error('縮放級別必須是 1-20 之間的數字');
      }

      // 📝 更新地圖視圖狀態 (Update Map View State)
      this.mapView.center = [...center]; // 創建副本避免引用問題
      this.mapView.zoom = zoom;

      console.log('🗺️ [DefineStore] 地圖視圖已更新:', {
        center: this.mapView.center,
        zoom: this.mapView.zoom,
      });
    },

    /**
     * 🎨 更新地圖樣式配置 (Update Map Style Configuration)
     *
     * 更新地圖的顏色和樣式配置，用於自定義地圖外觀。
     *
     * @param {Object} styleConfig - 樣式配置對象
     * @param {Object} styleConfig.countryColors - 國家顏色配置
     * @param {Object} styleConfig.borderStyle - 邊界線樣式配置
     *
     * @example
     * // 更新國家顏色
     * defineStore.updateMapStyle({
     *   countryColors: {
     *     taiwan: '#ff6b6b',
     *     visited: '#4ecdc4'
     *   }
     * });
     */
    updateMapStyle(styleConfig) {
      // 🔍 驗證樣式配置 (Validate Style Configuration)
      if (typeof styleConfig !== 'object' || styleConfig === null) {
        console.error('❌ [DefineStore] 無效的樣式配置:', styleConfig);
        throw new Error('樣式配置必須是一個對象');
      }

      // 📝 合併樣式配置 (Merge Style Configuration)
      if (styleConfig.countryColors) {
        this.mapStyle.countryColors = {
          ...this.mapStyle.countryColors,
          ...styleConfig.countryColors,
        };
      }

      if (styleConfig.borderStyle) {
        this.mapStyle.borderStyle = {
          ...this.mapStyle.borderStyle,
          ...styleConfig.borderStyle,
        };
      }

      console.log('🎨 [DefineStore] 地圖樣式已更新:', this.mapStyle);
    },

    /**
     * 🔄 重置地圖視圖到預設狀態 (Reset Map View to Default)
     *
     * 將地圖視圖重置為預設的台灣中心視圖。
     * 用於重置按鈕或錯誤恢復。
     */
    resetMapView() {
      this.mapView.center = [25.04583, 121.51972]; // 台灣台北
      this.mapView.zoom = 16;

      console.log('🔄 [DefineStore] 地圖視圖已重置為預設狀態');
    },

    /**
     * 📊 獲取當前底圖配置 (Get Current Basemap Configuration)
     *
     * 根據當前選中的底圖值，返回完整的底圖配置信息。
     *
     * @returns {Object|null} 當前底圖的完整配置，如果不存在則返回 null
     *
     * @example
     * const currentBasemap = defineStore.getCurrentBasemapConfig();
     * console.log('當前底圖:', currentBasemap.label);
     */
    getCurrentBasemapConfig() {
      const currentBasemap = this.basemaps.find(
        (basemap) => basemap.value === this.selectedBasemap
      );

      if (!currentBasemap) {
        console.warn('⚠️ [DefineStore] 找不到當前底圖配置:', this.selectedBasemap);
        return null;
      }

      return { ...currentBasemap }; // 返回副本避免外部修改
    },
  },

  /**
   * 🔍 計算屬性 (Getters)
   * 定義基於狀態的計算屬性
   */
  getters: {
    /**
     * 📊 獲取當前地圖視圖信息 (Get Current Map View Info)
     *
     * @returns {Object} 包含當前地圖視圖的完整信息
     */
    currentMapView: (state) => ({
      center: [...state.mapView.center], // 返回副本
      zoom: state.mapView.zoom,
      basemap: state.selectedBasemap,
    }),

    /**
     * 🎨 獲取當前地圖樣式 (Get Current Map Style)
     *
     * @returns {Object} 包含當前地圖樣式的完整配置
     */
    currentMapStyle: (state) => ({
      countryColors: { ...state.mapStyle.countryColors },
      borderStyle: { ...state.mapStyle.borderStyle },
    }),

    /**
     * 📋 獲取可用底圖列表 (Get Available Basemaps List)
     *
     * @returns {Array} 包含所有可用底圖的陣列
     */
    availableBasemaps: (state) =>
      state.basemaps.map((basemap) => ({
        ...basemap, // 返回副本避免外部修改
      })),
  },
});
