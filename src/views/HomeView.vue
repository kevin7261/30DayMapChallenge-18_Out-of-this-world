<script>
  /**
   * 🏠 HomeView.vue - 主頁面組件 (Main Home Page Component)
   *
   * 功能說明：
   * 1. 🗺️ 整合地圖組件和控制面板，提供完整的地圖展示界面
   * 2. 🔗 連接數據存儲和地圖組件，實現數據與視圖的綁定
   * 3. 🚀 管理地圖實例的生命週期，確保地圖正確初始化和導航
   * 4. 📱 提供響應式佈局，適配不同設備和螢幕尺寸
   *
   * 架構說明：
   * - 容器層：提供滿版佈局容器
   * - 地圖層：MapTab 組件負責地圖渲染和互動
   * - 狀態層：透過 Pinia 管理全局狀態
   *
   * 設計理念：
   * - 簡潔的單頁面設計
   * - 地圖為主要內容，無多餘 UI 元素
   * - 自動化地圖導航和初始化
   */

  // 🔧 Vue Composition API 引入
  import MapTab from '../tabs/MapTab.vue';
  import { useDataStore } from '@/stores/dataStore.js';
  import { onMounted } from 'vue';

  export default {
    name: 'HomeView',

    /**
     * 🧩 組件註冊 (Component Registration)
     * 註冊本頁面使用的子組件
     */
    components: {
      MapTab, // 地圖標籤頁組件
    },

    /**
     * 🔧 組件設定函數 (Component Setup)
     * 使用 Composition API 設定頁面層級的狀態管理和邏輯
     */
    setup() {
      // 📦 獲取數據存儲實例 (Get Data Store Instance)
      const dataStore = useDataStore();

      /**
       * 🗺️ 設定地圖實例 (Set Map Instance)
       * 將地圖組件創建的地圖實例傳遞給數據存儲，用於後續的導航操作
       *
       * @param {Object} map - 地圖實例對象，包含 SVG、投影、路徑等 D3.js 元素
       */
      const setMapInstance = (map) => {
        console.log('🏠 [HomeView] 接收地圖實例:', map);
        dataStore.setMapInstance(map);
      };

      /**
       * 🚀 組件掛載後執行 (Component Mounted)
       * 在地圖組件準備就緒後，自動導航到台灣
       */
      onMounted(() => {
        console.log('🏠 [HomeView] 組件已掛載，準備導航到台灣');
        // 延遲執行，確保地圖實例已準備就緒
        setTimeout(() => {
          dataStore.navigateToTaiwan();
        }, 100);
      });

      // 📤 返回響應式數據和函數給模板使用 (Return Reactive Data and Functions)
      return {
        setMapInstance, // 地圖實例設定函數
      };
    },
  };
</script>

<template>
  <!-- 🏠 HomeView.vue - 主頁面模板 (Main Home Page Template) -->
  <!-- 提供滿版無邊距的佈局，地圖佔滿整個視窗 -->
  <div id="app" class="d-flex flex-column vh-100">
    <!-- 📱 主要內容區域 (Main Content Area) -->
    <!-- 使用 flex-grow-1 讓內容區域佔滿剩餘空間 -->
    <!-- overflow-hidden 防止內容溢出 -->
    <!-- position-relative 為子元素提供定位上下文 -->
    <div class="flex-grow-1 overflow-hidden position-relative">
      <!-- 🗺️ 地圖組件 (Map Component) -->
      <!-- 監聽 map-ready 事件，當地圖準備就緒時接收地圖實例 -->
      <MapTab @map-ready="setMapInstance" />
    </div>
  </div>
</template>

<style>
  /**
   * 🎨 HomeView.vue - 主頁面樣式 (Main Home Page Styles)
   *
   * 引入共用樣式表，確保與應用程式整體設計保持一致
   * 大部分樣式已整合至 common.css 中統一管理
   */

  /* 📦 引入共用樣式表 (Import Common Stylesheet) */
  @import '../assets/css/common.css';

  /* 📱 頁面特定樣式 (Page-Specific Styles) */
  /* 目前無需額外的頁面特定樣式，所有樣式已整合至 common.css */
</style>
