/**
 * 📦 數據存儲模組 (Data Store Module)
 *
 * 管理 D3 地圖實例與導航功能
 * 使用 Pinia 狀態管理系統和 Vue 3 Composition API
 */

// 核心依賴
import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 🏪 數據存儲商店定義 (Data Store Definition)
 */
export const useDataStore = defineStore(
  'data',
  () => {
    // 台灣中心座標（用於地圖投影和導航）
    const taiwanCenter = [120.982025, 23.973875];

    // 地圖實例
    const mapInstance = ref(null);
    const setMapInstance = (map) => {
      mapInstance.value = map;
    };

    // 導航到台灣
    const navigateToTaiwan = () => {
      if (!mapInstance.value) {
        console.error('❌ 地圖實例未準備就緒');
        setTimeout(() => {
          if (mapInstance.value) {
            navigateToTaiwan();
          }
        }, 1000);
        return;
      }

      try {
        if (mapInstance.value.navigateToLocation) {
          mapInstance.value.navigateToLocation(taiwanCenter);
          console.log('🌍 成功導航到台灣');
        }
      } catch (error) {
        console.error('❌ 地圖導航失敗:', error);
      }
    };

    return {
      taiwanCenter,
      mapInstance,
      setMapInstance,
      navigateToTaiwan,
    };
  },
  {
    persist: true,
  }
);
