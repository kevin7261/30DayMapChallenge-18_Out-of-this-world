<script>
  /**
   * 🏠 HomeView.vue - 主頁面組件 (Main Page Component)
   *
   * 這是應用程式的主頁面，整合了地圖顯示和控制面板。
   * 主要功能：
   * - 顯示世界城市地圖
   * - 提供城市導航按鈕
   * - 提供底圖切換功能
   * - 響應式佈局設計
   *
   * 組件結構：
   * - MapTab: 地圖顯示組件
   * - 控制面板: 城市導航和底圖選擇
   */

  import MapTab from '../tabs/MapTab.vue';
  import { useDataStore } from '@/stores/dataStore.js';
  import { useDefineStore } from '@/stores/defineStore.js';
  import { ref, onMounted } from 'vue';

  export default {
    name: 'HomeView',
    components: { MapTab },
    setup() {
      // 📦 存儲實例
      const dataStore = useDataStore();
      const defineStore = useDefineStore();

      /**
       * 🗺️ 設定地圖實例
       * 將 D3.js 地圖實例傳遞給 dataStore 以便城市導航使用
       * @param {Object} map - D3.js 地圖實例（包含 svg, projection, path）
       */
      const setMapInstance = (map) => dataStore.setMapInstance(map);

      // 🌍 當前選中的國家（預設為台灣）
      const currentCountry = ref('TAIWAN');

      // 🚀 初始化應用程式
      onMounted(() => {
        // 直接導航到台灣
        dataStore.navigateToTaiwan();
      });

      return {
        setMapInstance,
        defineStore,
        currentCountry,
      };
    },
  };
</script>

<template>
  <!-- 🏠 主應用程式容器 -->
  <div id="app" class="d-flex flex-column vh-100">
    <!-- 🗺️ 地圖區域容器 -->
    <div class="flex-grow-1 overflow-hidden position-relative">
      <!-- 🗺️ 地圖組件 -->
      <MapTab @map-ready="setMapInstance" :current-country="currentCountry" />
    </div>
  </div>
</template>

<style>
  @import '../assets/css/common.css';
</style>
