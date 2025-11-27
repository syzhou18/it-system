<script setup>
// --- 套件匯入 ---
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// --- 狀態定義 ---
const equipments = ref([]); // 設備列表
const users = ref([]);      // 使用者列表
const loading = ref(true);  // 載入中狀態
const error = ref(null);    // 錯誤訊息

// --- API 呼叫 ---
async function fetchData() {
  try {
    loading.value = true;
    // 並行請求設備和使用者資料
    const [equipmentsResponse, usersResponse] = await Promise.all([
      axios.get('http://192.168.2.168:3000/api/equipment'),
      axios.get('http://192.168.2.168:3000/api/users')
    ]);
    equipments.value = equipmentsResponse.data;
    users.value = usersResponse.data;
  } catch (err) {
    console.error('API 請求失敗:', err);
    error.value = '資料載入失敗，請稍後重試。';
  } finally {
    loading.value = false;
  }
}

// --- 計算屬性 (儀表板統計) ---

// 總計數據
const totalEquipments = computed(() => equipments.value.length);
const totalUsers = computed(() => users.value.length);

// 設備狀態統計
const availableEquipments = computed(() => 
  equipments.value.filter(e => e.status === 'Available').length
);

const repairingEquipments = computed(() => 
  equipments.value.filter(e => e.status === 'Under Repair').length
);

// 各狀態詳細數量統計 (圖表用)
const statusCounts = computed(() => {
  const counts = { '使用中': 0, '閒置': 0, '維修中': 0, '除役': 0 };
  const statusMap = {
    'Assigned': '使用中',
    'Available': '閒置',
    'Under Repair': '維修中',
    'Decommissioned': '除役'
  };
  
  equipments.value.forEach(e => {
    const statusName = statusMap[e.status] || e.status;
    if (counts[statusName] !== undefined) {
      counts[statusName]++;
    }
  });
  return counts;
});

// 設備類型統計 (圖表用)
const typeCounts = computed(() => {
  const counts = {};
  equipments.value.forEach(e => {
    counts[e.type] = (counts[e.type] || 0) + 1;
  });
  return counts;
});

// 最近新增的 5 筆設備 (以 ID 排序)
const recentEquipments = computed(() => {
  return [...equipments.value]
    .sort((a, b) => b.computer_id - a.computer_id)
    .slice(0, 5);
});

// --- 生命週期 ---
onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="page-container dashboard-container">
    <h1>儀表板總覽</h1>

    <div v-if="loading" class="message-card">正在載入儀表板資料...</div>
    <div v-else-if="error" class="message-card error-message">{{ error }}</div>

    <div v-else>
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="value">{{ totalEquipments }}</div>
          <div class="label">總設備數量</div>
        </div>
        <div class="kpi-card">
          <div class="value">{{ totalUsers }}</div>
          <div class="label">總員工人數</div>
        </div>
        <div class="kpi-card">
          <div class="value">{{ availableEquipments }}</div>
          <div class="label">目前閒置設備</div>
        </div>
        <div class="kpi-card">
          <div class="value">{{ repairingEquipments }}</div>
          <div class="label">正在維修設備</div>
        </div>
      </div>

      <div class="dashboard-grid">
        <div class="dashboard-card">
          <h2>設備狀態分佈</h2>
          <div class="bar-chart">
            <div v-for="(count, status) in statusCounts" :key="status" class="chart-item">
              <span class="chart-label">{{ status }}</span>
              <div class="bar-wrapper">
                <div class="bar" :style="{ width: totalEquipments > 0 ? (count / totalEquipments * 100) + '%' : '0%' }"></div>
              </div>
              <span class="chart-value">{{ count }}</span>
            </div>
          </div>
        </div>

        <div class="dashboard-card">
          <h2>設備類型分佈</h2>
          <div class="bar-chart">
             <div v-for="(count, type) in typeCounts" :key="type" class="chart-item">
              <span class="chart-label">{{ type }}</span>
              <div class="bar-wrapper">
                <div class="bar" :style="{ width: totalEquipments > 0 ? (count / totalEquipments * 100) + '%' : '0%' }"></div>
              </div>
              <span class="chart-value">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>

       <div class="dashboard-card">
          <h2>最近新增設備</h2>
          <table class="data-table simple-table">
            <thead>
              <tr>
                <th>設備名稱</th>
                <th>財產編號</th>
                <th>類型</th>
                <th>購買日期</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="eq in recentEquipments" :key="eq.computer_id">
                <td>{{ eq.hostname }}</td>
                <td>{{ eq.asset_number }}</td>
                <td>{{ eq.type }}</td>
                <td>{{ eq.purchase_date ? eq.purchase_date.substring(0, 10) : '' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
    </div>
  </div>
</template>

<style scoped>
/* 頁面標題 */
.dashboard-container h1 {
  text-align: center;
  margin-bottom: 40px;
}

/* KPI 卡片樣式 */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.kpi-card {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #dee2e6;
}

.kpi-card .value {
  font-size: 3rem;
  font-weight: 600;
  color: #343a40;
}

.kpi-card .label {
  font-size: 1rem;
  color: #6c757d;
  margin-top: 5px;
}

/* 儀表板主要佈局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.dashboard-card {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #dee2e6;
}

.dashboard-card h2 {
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 1.25rem;
  color: #343a40;
}

/* 長條圖樣式 */
.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.chart-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chart-label {
  flex-basis: 120px;
  text-align: right;
  font-size: 0.9rem;
  color: #495057;
  white-space: nowrap;
}

.bar-wrapper {
  flex-grow: 1;
  background-color: #e9ecef;
  border-radius: 4px;
  height: 20px;
}

.bar {
  height: 100%;
  background-color: #6c757d;
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
}

.chart-value {
  font-weight: 500;
  flex-basis: 30px;
  text-align: left;
}

/* 簡易表格樣式 (用於最近新增列表) */
.simple-table {
  box-shadow: none;
  border: none;
}
.simple-table thead {
  background-color: transparent;
  color: #6c757d;
}
</style>