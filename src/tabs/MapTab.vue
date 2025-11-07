<script>
  /**
   * 🗺️ MapTab.vue - D3.js 世界地圖組件 (D3.js World Map Component)
   *
   * 使用 D3.js 繪製世界地圖，專為世界城市地圖展示設計。
   * 主要功能：
   * - 使用 D3.js 顯示世界地圖
   * - 提供城市導航功能
   * - 支援多種投影方式
   * - 響應式設計
   *
   * 技術架構：
   * - Vue 3 Composition API
   * - D3.js 地圖繪製
   * - Pinia 狀態管理
   * - Bootstrap 5 樣式
   */

  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import * as d3 from 'd3';

  export default {
    name: 'MapTab',
    emits: ['map-ready'],
    setup(props, { emit }) {
      // 地圖相關變數
      const mapContainer = ref(null);
      const svgElement = ref(null);
      let svg = null;
      let projection = null;
      let path = null;
      let zoom = null;
      let g = null;

      // 地圖控制狀態
      const isMapReady = ref(false);
      const mapContainerId = ref(`d3-map-${Math.random().toString(36).substr(2, 9)}`);

      // 世界地圖數據
      const worldData = ref(null);

      // 圓圈顯示模式
      const ringMode = ref('distance');
      const mapScaleFactors = {
        distance: 1.05,
        radius: 0.6,
      };
      const distanceFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
      const radiusFormatter = new Intl.NumberFormat('en-US');
      const ringConfigurations = {
        distance: {
          label: '行星距離',
          radiiKm: [57.91, 108.2, 149.6, 227.9, 778.3, 1427, 2871, 4504],
          names: ['水星', '金星', '地球', '火星', '木星', '土星', '天王星', '海王星'],
          unit: '百萬公里',
          formatter: distanceFormatter,
        },
        radius: {
          label: '行星半徑',
          radiiKm: [69911, 58232, 25362, 24622, 6371, 6052, 3389, 2440],
          names: ['木星', '土星', '天王星', '海王星', '地球', '金星', '火星', '水星'],
          unit: '公里',
          formatter: radiusFormatter,
        },
      };

      const getScale = (rect) => {
        const padding = 32;
        const availableWidth = rect.width - padding * 2;
        const availableHeight = rect.height - padding * 2;
        const baseScale = Math.min(availableWidth, availableHeight);
        const factor = mapScaleFactors[ringMode.value] ?? mapScaleFactors.distance;
        return baseScale * factor;
      };

      const planetaryDistanceDisplay = ringConfigurations.distance.radiiKm.map((value, index) => {
        const labels = ringConfigurations.distance.names;
        return {
          id: `planet-distance-${index}`,
          name: labels[index] || `行星 ${index + 1}`,
          value,
          formatted: ringConfigurations.distance.formatter.format(value),
        };
      });

      const planetaryRadiusDisplay = ringConfigurations.radius.radiiKm.map((km, index) => {
        const labels = ringConfigurations.radius.names;
        return {
          id: `planet-radius-${index}`,
          name: labels[index] || `行星 ${index + 1}`,
          km,
          formatted: ringConfigurations.radius.formatter.format(km),
        };
      });

      // 城市座標資料
      const cityLocations = [
        { name: 'Taipei', label: '台北', coordinates: [121.5654, 25.033] },
        { name: 'Taichung', label: '台中', coordinates: [120.6736, 24.1477] },
        { name: 'Chiayi', label: '嘉義', coordinates: [120.445, 23.4819] },
        { name: 'Tainan', label: '台南', coordinates: [120.1667, 23.15] },
        { name: 'Kaohsiung', label: '高雄', coordinates: [120.3014, 22.6273] },
        { name: 'Hualien', label: '花蓮', coordinates: [121.602, 23.9739] },
        { name: 'Taitung', label: '台東', coordinates: [121.1139, 22.7611] },
        { name: 'Lanyu', label: '蘭嶼', coordinates: [121.5509, 22.0446] },
        { name: 'Taoyuan', label: '桃園', coordinates: [121.2168, 24.993] },
        { name: 'Shanghai', label: '上海', coordinates: [121.4737, 31.2304] },
        { name: 'Beijing', label: '北京', coordinates: [116.4074, 39.9042] },
        { name: 'Tianjin', label: '天津', coordinates: [117.3616, 39.3434] },
        { name: 'Chongqing', label: '重慶', coordinates: [106.5516, 29.563] },
        { name: 'Chengdu', label: '成都', coordinates: [104.0665, 30.5723] },
        { name: 'Urumqi', label: '烏魯木齊', coordinates: [87.6168, 43.8256] },
        { name: 'Lhasa', label: '拉薩', coordinates: [91.1175, 29.6473] },
        { name: 'Xining', label: '西寧', coordinates: [101.7789, 36.6232] },
        { name: 'Yinchuan', label: '銀川', coordinates: [106.2309, 38.4872] },
        { name: 'Hohhot', label: '呼和浩特', coordinates: [111.751, 40.8415] },
        { name: 'Lanzhou', label: '蘭州', coordinates: [103.8343, 36.0611] },
        { name: 'Guiyang', label: '貴陽', coordinates: [106.6302, 26.647] },
        { name: 'Nanning', label: '南寧', coordinates: [108.3661, 22.8172] },
        { name: 'Kunming', label: '昆明', coordinates: [102.8329, 24.8801] },
        { name: 'Xiangyang', label: '襄陽', coordinates: [112.144, 32.0424] },
        { name: 'Yibin', label: '宜賓', coordinates: [104.6308, 28.7602] },
        { name: 'Hangzhou', label: '杭州', coordinates: [120.1551, 30.2741] },
        { name: 'Nanjing', label: '南京', coordinates: [118.7965, 32.0603] },
        { name: 'Suzhou', label: '蘇州', coordinates: [120.5853, 31.2989] },
        { name: 'Guangzhou', label: '廣州', coordinates: [113.2644, 23.1291] },
        { name: 'Shenzhen', label: '深圳', coordinates: [114.0579, 22.5431] },
        { name: 'Fukuoka', label: '福岡', coordinates: [130.4017, 33.5902] },
        { name: "Xi'an", label: '西安', coordinates: [108.9398, 34.3416] },
        { name: 'Luoyang', label: '洛陽', coordinates: [112.454, 34.6197] },
        { name: 'Zhengzhou', label: '鄭州', coordinates: [113.6254, 34.7466] },
        { name: 'Dunhuang', label: '敦煌', coordinates: [94.661, 40.1421] },
        { name: 'Wuhan', label: '武漢', coordinates: [114.3055, 30.5928] },
        { name: 'Qingdao', label: '青島', coordinates: [120.3826, 36.0671] },
        { name: 'Dalian', label: '大連', coordinates: [121.6147, 38.914] },
        { name: 'Shenyang', label: '瀋陽', coordinates: [123.4315, 41.8057] },
        { name: 'Changsha', label: '長沙', coordinates: [112.9388, 28.2282] },
        { name: 'Ningbo', label: '寧波', coordinates: [121.5503, 29.8739] },
        { name: 'Harbin', label: '哈爾濱', coordinates: [126.6424, 45.756] },
        { name: 'New Delhi', label: '新德里', coordinates: [77.209, 28.6139] },
        { name: 'Mumbai', label: '孟買', coordinates: [72.8777, 19.076] },
        { name: 'Bengaluru', label: '班加羅爾', coordinates: [77.5946, 12.9716] },
        { name: 'Hyderabad', label: '海得拉巴', coordinates: [78.4867, 17.385] },
        { name: 'Chennai', label: '欽奈', coordinates: [80.2707, 13.0827] },
        { name: 'Kolkata', label: '加爾各答', coordinates: [88.3639, 22.5726] },
        { name: 'Pune', label: '浦那', coordinates: [73.8567, 18.5204] },
        { name: 'Ahmedabad', label: '艾哈邁達巴德', coordinates: [72.5714, 23.0225] },
        { name: 'Surat', label: '蘇拉特', coordinates: [72.8311, 21.1702] },
        { name: 'Jaipur', label: '齋浦爾', coordinates: [75.7873, 26.9124] },
        { name: 'Lucknow', label: '勒克瑙', coordinates: [80.9462, 26.8467] },
        { name: 'Kochi', label: '科欽', coordinates: [76.2673, 9.9312] },
        { name: 'Varanasi', label: '瓦拉納西', coordinates: [82.9739, 25.3176] },
        { name: 'Manila', label: '馬尼拉', coordinates: [120.9842, 14.5995] },
        { name: 'Quezon City', label: '奎松', coordinates: [121.0437, 14.676] },
        { name: 'Davao', label: '達沃', coordinates: [125.6131, 7.1907] },
        { name: 'Cebu', label: '宿霧', coordinates: [123.8854, 10.3157] },
        { name: 'Zamboanga', label: '三寶顏', coordinates: [122.079, 6.9214] },
        { name: 'Iloilo', label: '伊洛伊洛', coordinates: [122.545, 10.7202] },
        { name: 'Bacolod', label: '巴科洛德', coordinates: [122.9673, 10.6769] },
        { name: 'Cagayan de Oro', label: '卡加延德奧羅', coordinates: [124.6411, 8.4542] },
        { name: 'General Santos', label: '將軍市', coordinates: [125.1717, 6.1164] },
        { name: 'Taguig', label: '塔吉格', coordinates: [121.086, 14.52] },
        { name: 'Pasig', label: '巴西', coordinates: [121.0614, 14.5869] },
        { name: 'Angeles', label: '安赫萊斯', coordinates: [120.587, 15.1591] },
        { name: 'Olongapo', label: '奧隆阿波', coordinates: [120.2863, 14.8389] },
        { name: 'San Fernando', label: '聖費爾南多', coordinates: [120.6676, 15.0327] },
        { name: 'Dagupan', label: '達古潘', coordinates: [120.3333, 16.0449] },
        { name: 'Baguio', label: '碧瑤', coordinates: [120.6003, 16.4023] },
        { name: 'Laoag', label: '佬沃', coordinates: [120.5887, 18.1989] },
        { name: 'Tuguegarao', label: '土格加勞', coordinates: [121.7269, 17.6131] },
        { name: 'Vigan', label: '維甘', coordinates: [120.3869, 17.5747] },
        { name: 'Jakarta', label: '雅加達', coordinates: [106.8451, -6.2088] },
        { name: 'Surabaya', label: '泗水', coordinates: [112.7508, -7.2575] },
        { name: 'Bandung', label: '萬隆', coordinates: [107.6191, -6.9175] },
        { name: 'Medan', label: '棉蘭', coordinates: [98.6765, 3.5952] },
        { name: 'Semarang', label: '三寶壟', coordinates: [110.4203, -6.9667] },
        { name: 'Makassar', label: '望加錫', coordinates: [119.4179, -5.1477] },
        { name: 'Palembang', label: '巨港', coordinates: [104.7754, -2.9761] },
        { name: 'Batam', label: '巴淡', coordinates: [104.0305, 1.0823] },
        { name: 'Denpasar', label: '登巴薩', coordinates: [115.2126, -8.6705] },
        { name: 'Yogyakarta', label: '日惹', coordinates: [110.3695, -7.7956] },
        { name: 'Manado', label: '萬鳴', coordinates: [124.8456, 1.4748] },
        { name: 'Balikpapan', label: '巴厘巴板', coordinates: [116.8466, -1.2379] },
        { name: 'Bangkok', label: '曼谷', coordinates: [100.5018, 13.7563] },
        { name: 'Chiang Mai', label: '清邁', coordinates: [98.962, 18.7883] },
        { name: 'Phuket', label: '普吉', coordinates: [98.3923, 7.8804] },
        { name: 'Hat Yai', label: '合艾', coordinates: [100.4747, 6.996] },
        { name: 'Udon Thani', label: '烏隆他尼', coordinates: [102.8014, 17.4139] },
        { name: 'Pattaya City', label: '芭堤雅市', coordinates: [100.8692, 12.9236] },
        { name: 'Khon Kaen', label: '孔敬', coordinates: [102.8333, 16.4419] },
        { name: 'Nakhon Ratchasima', label: '呵叻', coordinates: [102.101, 14.9799] },
        { name: 'Kuala Lumpur', label: '吉隆坡', coordinates: [101.6869, 3.139] },
        { name: 'George Town', label: '檳城', coordinates: [100.3354, 5.4141] },
        { name: 'Johor Bahru', label: '新山', coordinates: [103.7618, 1.4927] },
        { name: 'Kuching', label: '古晉', coordinates: [110.3608, 1.5535] },
        { name: 'Kota Kinabalu', label: '亞庇', coordinates: [116.0735, 5.9804] },
        { name: 'Miri', label: '美里', coordinates: [113.9933, 4.3999] },
        { name: 'Bintulu', label: '民都魯', coordinates: [113.0332, 3.1706] },
        { name: 'Samarinda', label: '三馬林達', coordinates: [117.1488, -0.5021] },
        { name: 'Pontianak', label: '坤甸', coordinates: [109.3448, -0.0263] },
        { name: 'Banjarmasin', label: '班加馬辛', coordinates: [114.5926, -3.3194] },
        { name: 'Tarakan', label: '打拉根', coordinates: [117.6333, 3.3] },
        { name: 'Nusantara', label: '努山塔拉', coordinates: [117.236, -0.0206] },
        { name: 'Sapporo', label: '札幌', coordinates: [141.3545, 43.0618] },
        { name: 'Tokyo', label: '東京', coordinates: [139.6917, 35.6895] },
        { name: 'Yokohama', label: '橫濱', coordinates: [139.638, 35.4437] },
        { name: 'Osaka', label: '大阪', coordinates: [135.5022, 34.6937] },
        { name: 'Nagoya', label: '名古屋', coordinates: [136.9066, 35.1815] },
        { name: 'Kyoto', label: '京都', coordinates: [135.7681, 35.0116] },
        { name: 'Kobe', label: '神戶', coordinates: [135.1955, 34.6901] },
        { name: 'Hiroshima', label: '廣島', coordinates: [132.4553, 34.3853] },
        { name: 'Sendai', label: '仙台', coordinates: [140.8719, 38.2682] },
        { name: 'Pattaya', label: '巴達雅', coordinates: [100.8825, 12.9236] },
        { name: 'Xiamen', label: '廈門', coordinates: [118.0895, 24.4798] },
        { name: 'Fuzhou', label: '福州', coordinates: [119.2965, 26.0745] },
        { name: 'Ulaanbaatar', label: '烏蘭巴托', coordinates: [106.9057, 47.8864] },
        { name: 'Koror', label: '帛琉', coordinates: [134.4799, 7.3426] },
        { name: 'Hagatna', label: '關島', coordinates: [144.7332, 13.4757] },
        { name: 'Saipan', label: '塞班島', coordinates: [145.753, 15.1778] },
        { name: 'Chichijima', label: '小笠原島', coordinates: [142.1901, 27.0943] },
        { name: 'Minamitorishima', label: '南鳥島', coordinates: [153.9833, 24.2833] },
        { name: 'Tehran', label: '德黑蘭', coordinates: [51.389, 35.6892] },
        { name: 'Mashhad', label: '馬什哈德', coordinates: [59.6062, 36.2851] },
        { name: 'Isfahan', label: '伊斯法罕', coordinates: [51.6776, 32.6546] },
        { name: 'Shiraz', label: '設拉子', coordinates: [52.54, 29.5918] },
        { name: 'Ashgabat', label: '阿什哈巴德', coordinates: [58.3833, 37.9601] },
        { name: 'Turkmenabat', label: '土庫曼納巴德', coordinates: [63.6127, 39.0733] },
        { name: 'Mary', label: '馬雷', coordinates: [61.8319, 37.6138] },
        { name: 'Tashkent', label: '塔什干', coordinates: [69.2401, 41.2995] },
        { name: 'Samarkand', label: '撒馬爾罕', coordinates: [66.9786, 39.627] },
        { name: 'Bukhara', label: '布哈拉', coordinates: [64.4286, 39.7747] },
        { name: 'Namangan', label: '納曼干', coordinates: [71.6726, 40.9983] },
        { name: 'Almaty', label: '阿拉木圖', coordinates: [76.886, 43.2389] },
        { name: 'Astana', label: '阿斯塔納', coordinates: [71.4704, 51.1605] },
        { name: 'Shymkent', label: '奇姆肯特', coordinates: [69.5869, 42.3417] },
        { name: 'Karagandy', label: '卡拉干達', coordinates: [73.1022, 49.8028] },
        { name: 'Muscat', label: '馬斯喀特', coordinates: [58.4059, 23.588] },
        { name: 'Salalah', label: '索哈拉特', coordinates: [54.0924, 17.0197] },
        { name: 'Sohar', label: '蘇哈爾', coordinates: [56.746, 24.3481] },
        { name: 'Nizwa', label: '尼日瓦', coordinates: [57.5337, 22.9333] },
        { name: 'Port Moresby', label: '莫爾茲比港', coordinates: [147.18, -9.4438] },
        { name: 'Honiara', label: '荷尼亞拉', coordinates: [159.9492, -9.428] },
        { name: 'Suva', label: '蘇瓦', coordinates: [178.4501, -18.1248] },
        { name: 'Nadi', label: '楠迪', coordinates: [177.4516, -17.8031] },
        { name: 'Apia', label: '阿皮亞', coordinates: [-171.7514, -13.8333] },
        { name: 'Palikir', label: '帕利基爾', coordinates: [158.215, 6.9147] },
        { name: 'Majuro', label: '馬朱羅', coordinates: [171.382, 7.1164] },
        { name: 'Koror City', label: '科羅爾市', coordinates: [134.473, 7.3398] },
        { name: 'Saipan Island', label: '塞班島', coordinates: [145.754, 15.177] },
        { name: 'Pohnpei', label: '波納佩島', coordinates: [158.215, 6.9167] },
        { name: 'Yap', label: '雅浦島', coordinates: [138.08, 9.5167] },
        { name: 'Sydney', label: '雪梨', coordinates: [151.2093, -33.8688] },
        { name: 'Melbourne', label: '墨爾本', coordinates: [144.9631, -37.8136] },
        { name: 'Brisbane', label: '布里斯班', coordinates: [153.0251, -27.4698] },
        { name: 'Cairns', label: '凱恩斯', coordinates: [145.7703, -16.9186] },
        { name: 'Perth', label: '珀斯', coordinates: [115.8575, -31.9505] },
        { name: 'Adelaide', label: '阿德雷德', coordinates: [138.6007, -34.9285] },
        { name: 'Canberra', label: '坎培拉', coordinates: [149.13, -35.2809] },
        { name: 'Hobart', label: '荷巴特', coordinates: [147.3272, -42.8821] },
        { name: 'Darwin', label: '達爾文', coordinates: [130.8456, -12.4634] },
      ];

      /**
       * 📥 載入世界地圖數據
       */
      const loadWorldData = async () => {
        try {
          // 使用本地的 GeoJSON 檔案
          console.log('[MapTab] 開始載入 GeoJSON 數據...');
          const response = await fetch(
            `${process.env.BASE_URL}data/ne_110m_admin_0_countries.geojson`
          );

          if (!response.ok) {
            throw new Error(`HTTP 錯誤! 狀態: ${response.status}`);
          }

          const data = await response.json();
          worldData.value = data;
          console.log('[MapTab] 世界地圖數據載入成功，特徵數量:', data.features?.length);
          return true;
        } catch (error) {
          console.error('[MapTab] 世界地圖數據載入失敗:', error);
          return false;
        }
      };

      /**
       * 🏗️ 創建地圖實例
       * 初始化 D3 地圖並設定基本配置
       */
      const createMap = () => {
        if (!mapContainer.value) return false;

        const rect = mapContainer.value.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          console.warn('[MapTab] 容器尺寸為零，延遲初始化');
          return false;
        }

        try {
          const width = rect.width;
          const height = rect.height;

          // 創建 SVG 元素
          svg = d3
            .select(mapContainer.value)
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', '#f0f0f0');

          svgElement.value = svg.node();

          d3.select(mapContainer.value).style('position', 'relative');

          if (!ringTooltip) {
            ringTooltip = d3
              .select(mapContainer.value)
              .append('div')
              .attr('class', 'ring-tooltip')
              .style('position', 'absolute')
              .style('pointer-events', 'none')
              .style('background', 'rgba(15, 23, 42, 0.85)')
              .style('color', '#f8fafc')
              .style('padding', '0.35rem 0.55rem')
              .style('border-radius', '0.5rem')
              .style('font-size', '0.75rem')
              .style('line-height', '1.2')
              .style('white-space', 'nowrap')
              .style('opacity', 0);
          }

          // 創建投影 - 使用方位等距投影 (Azimuthal Equidistant Projection)
          // 預設以台灣地理中心為投影中心
          const scale = getScale(rect);

          projection = d3
            .geoAzimuthalEquidistant()
            .rotate([-120.982025, -23.973875]) // 以台灣地理中心為中心
            .scale(scale) // 使用計算後的縮放比例
            .translate([width / 2, height / 2])
            .clipAngle(180);

          // 創建路徑生成器
          path = d3.geoPath().projection(projection);

          // 創建容器組
          g = svg.append('g');

          // 設置縮放行為（禁用所有互動）
          zoom = d3
            .zoom()
            .scaleExtent([1, 1]) // 禁用縮放
            .on('zoom', null); // 禁用縮放事件

          svg.call(zoom).on('wheel.zoom', null).on('dblclick.zoom', null);

          isMapReady.value = true;

          // 將地圖實例和方法一起傳遞
          const mapInterface = {
            svg,
            projection,
            path,
            navigateToLocation: (center) => navigateToLocation(center),
          };

          emit('map-ready', mapInterface);

          console.log('[MapTab] D3 地圖創建成功');
          return true;
        } catch (error) {
          console.error('[MapTab] D3 地圖創建失敗:', error);
          return false;
        }
      };

      // 距離圓圈與城市標記
      let ringsGroup = null;
      let cityGroup = null;
      let tooltipGroup = null;
      let ringTooltip = null;

      /**
       * 🔵 繪製以投影中心為圓心的同心距離圓
       * 使用指定半徑（公里）繪製虛線圓圈
       * 地球邊界（180°）仍保留實線圓圈
       */
      const drawDistanceRings = () => {
        if (!svg || !projection || !mapContainer.value) return;

        if (ringTooltip) {
          ringTooltip.style('opacity', 0);
        }

        const rect = mapContainer.value.getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const scale = projection.scale();

        // 地球半徑（公里）
        const earthRadiusMeters = 6371000;
        const selectedConfig = ringConfigurations[ringMode.value] || ringConfigurations.distance;

        const rings = selectedConfig.radiiKm.map((distanceKm, idx) => {
          const adjustedDistanceKm = ringMode.value === 'radius' ? distanceKm / 10 : distanceKm;
          const distanceMeters = adjustedDistanceKm * 1000;
          const radiusPx = scale * (distanceMeters / earthRadiusMeters);
          const label = selectedConfig.names?.[idx] || `行星 ${idx + 1}`;
          const formattedValue = selectedConfig.formatter
            ? selectedConfig.formatter.format(distanceKm)
            : `${distanceKm}`;
          return {
            index: idx,
            radiusPx,
            type: ringMode.value,
            label,
            formattedValue,
            unit: selectedConfig.unit || 'km',
            originalValue: distanceKm,
          };
        });

        // 加入地球邊界圓（180° = π * R，在方位等距投影中對應到 scale * π）
        const earthBoundaryRadiusPx = scale * Math.PI;
        rings.push({ index: 999, radiusPx: earthBoundaryRadiusPx, type: 'boundary' });

        if (!ringsGroup) {
          ringsGroup = svg
            .append('g')
            .attr('class', 'distance-rings')
            .style('pointer-events', 'auto');
        }

        const selection = ringsGroup.selectAll('circle.ring').data(rings, (d) => d.index);

        const selectionEnter = selection
          .enter()
          .append('circle')
          .attr('class', 'ring')
          .attr('fill', 'none');

        selectionEnter
          .merge(selection)
          .attr('cx', cx)
          .attr('cy', cy)
          .attr('r', (d) => d.radiusPx)
          .attr('stroke', (d) => {
            if (d.type === 'boundary') return '#666666';
            return ringMode.value === 'radius' ? '#8be9fd' : '#cccccc';
          })
          .attr('stroke-width', (d) => (d.type === 'boundary' ? 2 : 1))
          .attr('stroke-dasharray', 'none')
          .attr('pointer-events', (d) => (d.type === 'boundary' ? 'none' : 'visibleStroke'))
          .on('mouseenter', function (event, d) {
            if (!ringTooltip || d.type === 'boundary') return;

            const valueText =
              ringMode.value === 'radius'
                ? `${d.formattedValue} ${d.unit} (1/10 繪製)`
                : `${d.formattedValue} ${d.unit}`;

            ringTooltip
              .style('opacity', 1)
              .html(`<strong>${d.label}</strong><div>${valueText}</div>`);

            const [x, y] = d3.pointer(event, mapContainer.value);
            ringTooltip.style('left', `${x + 12}px`).style('top', `${y - 12}px`);

            d3.select(this).attr('stroke-width', d.type === 'boundary' ? 2 : 2);
          })
          .on('mousemove', function (event, d) {
            if (!ringTooltip || d.type === 'boundary') return;

            const [x, y] = d3.pointer(event, mapContainer.value);
            ringTooltip.style('left', `${x + 12}px`).style('top', `${y - 12}px`);
          })
          .on('mouseleave', function (event, d) {
            if (ringTooltip) {
              ringTooltip.style('opacity', 0);
            }

            d3.select(this).attr('stroke-width', d.type === 'boundary' ? 2 : 1);
          });

        selection.exit().remove();
      };

      /**
       * 📍 繪製城市標記
       */
      const drawCityMarkers = () => {
        if (!svg || !projection) return;

        if (!cityGroup) {
          cityGroup = svg.append('g').attr('class', 'city-markers');
        }

        if (!tooltipGroup) {
          tooltipGroup = svg
            .append('g')
            .attr('class', 'city-tooltips')
            .style('pointer-events', 'none');
        }

        const markers = cityGroup
          .selectAll('circle.city-marker')
          .data(cityLocations, (d) => d.name);
        const tooltipLabels = tooltipGroup
          .selectAll('text.city-tooltip')
          .data(cityLocations, (d) => d.name);

        markers
          .enter()
          .append('circle')
          .attr('class', 'city-marker')
          .attr('r', 3.5)
          .attr('fill', '#ffde59')
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 1)
          .style('cursor', 'pointer')
          .on('mouseenter', function (event, d) {
            tooltipGroup
              .selectAll('text.city-tooltip')
              .filter((t) => t.name === d.name)
              .attr('visibility', 'visible');

            d3.select(this).attr('r', 5);
          })
          .on('mouseleave', function (event, d) {
            tooltipGroup
              .selectAll('text.city-tooltip')
              .filter((t) => t.name === d.name)
              .attr('visibility', 'hidden');

            d3.select(this).attr('r', 3.5);
          })
          .merge(markers)
          .attr('cx', (d) => {
            const projected = projection(d.coordinates);
            return projected ? projected[0] : 0;
          })
          .attr('cy', (d) => {
            const projected = projection(d.coordinates);
            return projected ? projected[1] : 0;
          });

        markers.exit().remove();

        tooltipLabels
          .enter()
          .append('text')
          .attr('class', 'city-tooltip')
          .attr('visibility', 'hidden')
          .attr('text-anchor', 'middle')
          .attr('dy', -8)
          .attr('fill', '#ffffff')
          .attr('font-size', 12)
          .attr('font-weight', '600')
          .attr('stroke', '#0f172a')
          .attr('stroke-width', 0.5)
          .attr('paint-order', 'stroke')
          .text((d) => d.label)
          .merge(tooltipLabels)
          .attr('x', (d) => {
            const projected = projection(d.coordinates);
            return projected ? projected[0] : 0;
          })
          .attr('y', (d) => {
            const projected = projection(d.coordinates);
            return projected ? projected[1] : 0;
          });

        tooltipLabels.exit().remove();
      };

      /**
       * 🎨 繪製世界地圖
       * 顯示所有國家，並以不同顏色標記家鄉與已造訪國家
       */
      const drawWorldMap = async () => {
        if (!g || !worldData.value) {
          console.error('[MapTab] 無法繪製地圖: g=', !!g, 'worldData=', !!worldData.value);
          return;
        }

        try {
          const features = worldData.value.features || [];

          console.log('[MapTab] 開始繪製世界地圖，國家數量:', features.length);

          const countrySelection = g.selectAll('path.country').data(features, (feature) => {
            return (
              feature.id ||
              feature.properties?.iso_a3 ||
              feature.properties?.ADM0_A3 ||
              feature.properties?.name ||
              feature.properties?.NAME
            );
          });

          countrySelection
            .enter()
            .append('path')
            .attr('class', 'country')
            .attr('fill', '#192133')
            .attr('stroke', '#cbd5f5')
            .attr('stroke-width', 0.5)
            .merge(countrySelection)
            .attr('d', path)
            .attr('fill', '#192133')
            .attr('stroke', '#cbd5f5')
            .attr('stroke-width', 0.5)
            .attr('opacity', 0.95);

          countrySelection.exit().remove();

          // 繪製距離圓圈
          drawDistanceRings();

          // 繪製城市標記
          drawCityMarkers();
        } catch (error) {
          console.error('[MapTab] 世界地圖繪製失敗:', error);
        }
      };

      /**
       * 🌍 導航到指定位置
       * 使用方位等距投影，將選定的國家設為地圖中心
       * 地球大小保持不變，只改變旋轉中心
       */
      const navigateToLocation = (center) => {
        if (!svg || !projection) return;

        const rect = mapContainer.value.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // 方位等距投影：使用 rotate 將選定位置旋轉到中心
        // rotate 接受 [lambda, phi, gamma]，其中 lambda 和 phi 是經緯度的負值
        // 地球大小保持固定，不隨導航改變
        const scale = getScale(rect);

        projection
          .rotate([-center[0], -center[1]])
          .translate([width / 2, height / 2])
          .scale(scale);

        // 更新所有路徑
        g.selectAll('path.country').attr('d', path);

        // 更新距離圓圈
        drawDistanceRings();

        // 更新城市標記
        drawCityMarkers();

        console.log('[MapTab] 地圖導航完成，中心:', center);
      };

      const refreshProjection = () => {
        if (!projection || !g || !mapContainer.value) return;

        const rect = mapContainer.value.getBoundingClientRect();
        const scale = getScale(rect);

        if (ringTooltip) {
          ringTooltip.style('opacity', 0);
        }

        projection.translate([rect.width / 2, rect.height / 2]).scale(scale);

        g.selectAll('path.country').attr('d', path);
        drawDistanceRings();
        drawCityMarkers();
      };

      const changeRingMode = (mode) => {
        if (!ringConfigurations[mode]) return;
        ringMode.value = mode;
      };

      /**
       * 📏 刷新地圖尺寸
       * 當容器大小改變時重新計算地圖尺寸
       */
      const invalidateSize = () => {
        if (!svg || !mapContainer.value) return;

        const rect = mapContainer.value.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        svg.attr('width', width).attr('height', height);

        const scale = getScale(rect);

        projection.translate([width / 2, height / 2]).scale(scale);

        // 更新所有路徑
        g.selectAll('path.country').attr('d', path);

        // 更新距離圓圈
        drawDistanceRings();

        // 更新城市標記
        drawCityMarkers();

        console.log('[MapTab] 地圖尺寸更新完成');
      };

      /**
       * 🚀 初始化地圖
       * 創建地圖並載入初始數據
       */
      const initMap = async () => {
        let attempts = 0;
        const maxAttempts = 20;

        // 先載入世界地圖數據
        const loaded = await loadWorldData();
        if (!loaded) {
          console.error('[MapTab] 無法載入世界地圖數據');
          return;
        }

        const tryCreateMap = async () => {
          if (attempts >= maxAttempts) {
            console.error('[MapTab] 地圖初始化失敗，已達到最大嘗試次數');
            return;
          }

          attempts++;
          console.log(`[MapTab] 嘗試創建地圖 (${attempts}/${maxAttempts})`);

          if (createMap()) {
            console.log('[MapTab] 地圖創建成功，開始繪製世界地圖');
            await drawWorldMap();
          } else {
            console.log('[MapTab] 地圖創建失敗，100ms 後重試');
            setTimeout(tryCreateMap, 100);
          }
        };

        tryCreateMap();
      };

      // 📏 設置 ResizeObserver 監聽容器大小變化
      let resizeObserver = null;
      let resizeTimeout = null;

      const setupResizeObserver = () => {
        if (!mapContainer.value || !window.ResizeObserver) return;

        resizeObserver = new ResizeObserver(() => {
          if (resizeTimeout) {
            clearTimeout(resizeTimeout);
          }

          resizeTimeout = setTimeout(() => {
            console.log('🔄 容器大小變化，刷新地圖');
            invalidateSize();
          }, 200);
        });

        resizeObserver.observe(mapContainer.value);
        console.log('✅ ResizeObserver 已設置');
      };

      // 🧹 生命週期：組件掛載
      onMounted(() => {
        initMap();
        setupResizeObserver();
      });

      // 🧹 生命週期：組件卸載
      onUnmounted(() => {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
        }

        if (resizeObserver) {
          resizeObserver.disconnect();
        }

        if (svg) {
          svg.remove();
          svg = null;
        }

        projection = null;
        path = null;
        zoom = null;
        g = null;
        ringsGroup = null;
        cityGroup = null;
        tooltipGroup = null;
        if (ringTooltip) {
          ringTooltip.remove();
          ringTooltip = null;
        }
        isMapReady.value = false;
      });

      watch(ringMode, () => {
        if (ringTooltip) {
          ringTooltip.style('opacity', 0);
        }
        refreshProjection();
      });

      // 監聽器已移除

      // 📤 返回組件公開的屬性和方法
      return {
        mapContainer,
        mapContainerId,
        navigateToLocation,
        changeRingMode,
        ringMode,
        ringConfigurations,
        planetaryDistanceDisplay,
        planetaryRadiusDisplay,
      };
    },
  };
</script>

<template>
  <!-- 🗺️ 地圖主容器 -->
  <div id="map-container" class="h-100 w-100 position-relative bg-transparent z-0">
    <!-- 🗺️ D3.js 地圖容器 -->
    <div :id="mapContainerId" ref="mapContainer" class="h-100 w-100"></div>

    <!-- 🎛️ 左側控制面板 -->
    <div
      class="position-absolute"
      style="top: 50%; left: 0; transform: translateY(-50%); z-index: 1000; padding: 1rem"
    >
      <div class="bg-dark bg-opacity-75 rounded-3 p-3">
        <div class="d-flex flex-column gap-2">
          <button
            type="button"
            class="btn border-0 my-country-btn my-font-sm-white px-4 py-3 text-start"
            :class="[ringMode === 'distance' ? 'active' : '']"
            @click="changeRingMode('distance')"
          >
            行星距離
          </button>
          <button
            type="button"
            class="btn border-0 my-country-btn my-font-sm-white px-4 py-3 text-start"
            :class="[ringMode === 'radius' ? 'active' : '']"
            @click="changeRingMode('radius')"
          >
            行星半徑
          </button>
        </div>

        <div v-if="ringMode === 'distance'" class="mt-3">
          <p class="my-font-sm-white mb-2">行星與太陽的平均距離 (百萬公里)</p>
          <ul class="list-unstyled my-font-sm-white mb-0">
            <li
              v-for="item in planetaryDistanceDisplay"
              :key="item.id"
              class="d-flex justify-content-between"
            >
              <span>{{ item.name }}</span>
              <span>{{ item.formatted }}</span>
            </li>
          </ul>
        </div>

        <div v-if="ringMode === 'radius'" class="mt-3">
          <p class="my-font-sm-white mb-2">行星半徑 (公里)</p>
          <ul class="list-unstyled my-font-sm-white mb-0">
            <li
              v-for="item in planetaryRadiusDisplay"
              :key="item.id"
              class="d-flex justify-content-between"
            >
              <span>{{ item.name }}</span>
              <span>{{ item.formatted }} km</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @import '../assets/css/common.css';

  #map-container {
    overflow: hidden;
  }

  /* 距離圓圈使用 D3.js 繪製，包含指定半徑實線圓圈與地球邊界實線圓圈 */

  :deep(.country) {
    transition: fill 0.2s ease;
  }

  /* 國家懸停效果已移除 */

  :deep(.city-marker) {
    transition: r 0.2s ease;
  }

  :deep(.city-tooltip) {
    transition: opacity 0.2s ease;
  }
</style>
