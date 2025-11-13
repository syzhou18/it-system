<script setup>
// --- 核心套件匯入 ---
import axios from 'axios';
// 从 'vue' 中匯入所需的函式：ref 用於建立響應式變數，onMounted 用於在元件掛載後執行程式碼，computed 用於建立計算屬性
import { ref, onMounted, computed } from 'vue';

// --- 子元件與 Composables 匯入 ---
// 匯入「新增設備」的表單子元件
import EqipForm from '../components/EqipForm.vue';
// 匯入「點擊外部取消」的 Composable
import { useClickOutside } from '../composables/useClickOutside.js';
// **1. 匯入新的排序 Composable**
import { useSortableTable } from '../composables/useSortableTable.js';


// --- 響應式狀態定義 (State) ---
const equipments = ref([]); // 用於儲存從後端獲取的原始設備列表
const loading = ref(true); // 用於追蹤 API 數據是否仍在載入中，預設為是
const error = ref(null); // 用於儲存 API 請求失敗時的錯誤訊息
const editingEquipmentId = ref(null); // 追蹤當前正在編輯的設備 ID，null 代表沒有任何設備在編輯模式
const tempEquipmentData = ref(null); // 臨時儲存正在編輯的設備資料，避免直接修改原始數據
const activeFilter = ref('all'); // 追蹤當前的篩選條件，預設為 'all' (全部)
const activeDropdownId = ref(null); // 追蹤當前哪個操作下拉選單是開啟的
const isModalVisible = ref(false); // 控制「新增設備」彈出視窗的顯示與否
const tableRef = ref(null); // 建立一個 ref，用於在 template 中綁定到 <table> 元素

// --- API 相關函式 ---
// 從後端 API 獲取所有設備資料
async function fetchequipments() {
  try {
    loading.value = true; // 開始請求前，將載入狀態設為 true
    const response = await axios.get('http://localhost:3000/api/equipment'); // 發送 GET 請求
    equipments.value = response.data; // 將獲取到的資料存入 equipments ref
  } catch (err) {
    console.error('獲取設備資料時發生錯誤:', err); // 在主控台印出詳細錯誤
    error.value = err.message; // 將錯誤訊息存入 error ref，以便在畫面上顯示
  } finally {
    loading.value = false; // 無論成功或失敗，請求結束後都將載入狀態設為 false
  }
}

// --- 計算屬性 (Computed Properties) ---
// 根據 activeFilter 的值，動態計算出要顯示在表格中的設備列表
const filteredEquipments = computed(() => {
  // 如果篩選條件是 'all'，直接回傳所有設備
  if (activeFilter.value === 'all') {
    return equipments.value;
  }
  // **修正**：解決字串與數字的類型不匹配問題
  // 將 activeFilter 的值（字串）轉換為一個整數
  const filterId = parseInt(activeFilter.value, 10);
  
  // 使用 filter 方法篩選出 company_id（數字）與 filterId（數字）相等的設備
  return equipments.value.filter(equipment => equipment.company_id === filterId);
});

const { sortKey, sortOrder, sortedData: sortedAndFilteredEquipments, sortBy } = useSortableTable(filteredEquipments);

// --- 事件處理函式 (Event Handlers) ---
// 設定篩選條件的函式
function setFilter(companyId) {
  activeFilter.value = companyId; // 更新 activeFilter 的值，觸發 filteredEquipments 重新計算
}

// 開始編輯設備的函式
function startEdit(equipment) {
  editingEquipmentId.value = equipment.computer_id; // 設定正在編輯的設備 ID
  const temp = { ...equipment }; // 複製一份設備資料到暫存物件，避免直接修改原始列表

  // 處理日期格式，確保 input[type="date"] 能正確顯示
  if (temp.purchase_date) {
    temp.purchase_date = temp.purchase_date.substring(0, 10);
  }
  if (temp.warranty_end_date) {
    temp.warranty_end_date = temp.warranty_end_date.substring(0, 10);
  }

  tempEquipmentData.value = temp; // 將處理過的暫存資料存入 ref
}

// 切換操作下拉選單的顯示與隱藏
function toggleDropdown(computer_id, event) {
  if (activeDropdownId.value === computer_id) {
    // 如果點擊的是已開啟的選單，則關閉它
    activeDropdownId.value = null;
  } else {
    // 否則，開啟被點擊的選單
    activeDropdownId.value = computer_id;
  }
}

// 儲存編輯後的資料
async function saveEdit() {
  if (!tempEquipmentData.value) return; // 如果沒有編輯中的資料，直接返回

  try {
    const updatedData = { ...tempEquipmentData.value }; // 複製一份要提交的資料

    // 刪除不應由前端更新的欄位 (通常是主鍵和外鍵)
    delete updatedData.computer_id;
    delete updatedData.assigned_to;

    // 發送 PUT 請求到後端 API 更新資料
    await axios.put(`http://localhost:3000/api/equipment/${tempEquipmentData.value.computer_id}`, updatedData);

    // 更新成功後，重設所有狀態
    editingEquipmentId.value = null;
    tempEquipmentData.value = null;
    activeDropdownId.value = null;
    await fetchequipments(); // 重新獲取最新資料以刷新畫面
  } catch (err) {
    console.error('更新設備時發生錯誤:', err);
    alert('更新失敗，請檢查後端服務。');
  }
}

// 取消編輯模式
function cancelEdit() {
  editingEquipmentId.value = null;
  tempEquipmentData.value = null;
  activeDropdownId.value = null; // 同時關閉可能已開啟的下拉選單
}

// **新增：取消分配設備的函式**
async function unassignEquipment(computer_id) {
  // 彈出確認對話框，確保使用者知道後果
  if (!confirm(`您確定要取消分配此設備嗎？\n\n設備狀態將會變更為「閒置」，並清除與員工的關聯。`)) {
    return;
  }
  try {
    // 呼叫現有的更新 API，明確地將狀態改為 'Available' 並將 'assigned_to' 設為 null
    // **注意：** 這需要後端 PUT /api/equipment/:id 路由能夠正確處理 assigned_to = null 的更新
    await axios.put(`http://localhost:3000/api/equipment/cancelassigned/${computer_id}`, {
      status: 'Available',
      assigned_to: null 
    });
    alert('設備已成功取消分配！');
    await fetchequipments(); // 操作成功後，重新獲取最新資料
  } catch (err) {
    console.error('取消分配失敗:', err);
    alert('操作失敗，請檢查後端服務。');
  }
}

// 刪除設備的函式
async function deleteEqip(computer_id) {
  // 使用 confirm 彈出確認對話框，防止使用者誤觸
  if (!confirm(`您確定要刪除設備編號 ${computer_id} 的資料嗎？`)) {
    return;
  }
  try {
    // 發送 DELETE 請求到後端 API
    await axios.delete(`http://localhost:3000/api/equipment/${computer_id}`);
    alert('資料已成功刪除！');
    await fetchequipments(); // 刪除成功後，重新獲取最新資料
  } catch (err) {
    console.error('刪除設備時發生錯誤:', err);
    alert('刪除失敗，請檢查後端服務。');
  }
}

// 處理子元件 (EqipForm) 提交成功後觸發的事件
async function handleEqipSubmitted() {
  isModalVisible.value = false; // 關閉彈出視窗
  await fetchequipments(); // 重新獲取最新資料
}

// --- Composable 執行 ---
// 使用 useClickOutside，傳入表格的 ref 和取消操作的函式
// 當使用者點擊表格外部區域時，會自動呼叫 cancelEdit
useClickOutside(tableRef, cancelEdit);

// --- 生命週期掛鉤 (Lifecycle Hooks) ---
// 當元件被掛載到畫面上後，執行一次 fetchequipments 來獲取初始資料
onMounted(() => {
  fetchequipments();
});
</script>

<template>
  <!-- 頁面根容器 -->
  <div class="page-container">
    <!-- 頁面操作區，包含篩選和新增按鈕 -->
    <div class="page-actions">
      <!-- 篩選按鈕群組 -->
      <div class="filter-group">
        <button @click="setFilter('all')" class="btn" :class="{ 'btn-success': activeFilter === 'all' }">全部</button>
        <button @click="setFilter('1')" class="btn" :class="{ 'btn-success': activeFilter === '1' }">圖爾思-事業體</button>
        <button @click="setFilter('2')" class="btn" :class="{ 'btn-success': activeFilter === '2' }">拜爾-事業體</button>
        <button @click="setFilter('3')" class="btn" :class="{ 'btn-success': activeFilter === '3' }">倍思特-事業體</button>
      </div>

      <!-- 新增設備按鈕，使用 v-if 判斷只有 'admin' 角色才能看到 -->
      <button @click="isModalVisible = true" class="btn btn-success">新增設備</button>
    </div>

    <!-- 新增設備的 Modal 彈出視窗 -->
    <div v-if="isModalVisible" class="modal-overlay">
      <div class="modal-content">
        <button @click="isModalVisible = false" class="modal-close-button">×</button>
        <!-- 載入 EqipForm 子元件，並監聽其 'eqip-submitted' 事件 -->
        <EqipForm @eqip-submitted="handleEqipSubmitted" />
      </div>
    </div>

    <!-- 訊息提示區 -->
    <!-- 正在載入時顯示 -->
    <div v-if="loading" class="message-card">正在載入設備資料...</div>
    <!-- 發生錯誤時顯示 -->
    <div v-else-if="error" class="message-card error-message">載入資料失敗: {{ error }}</div>
    <!-- 篩選後無資料時顯示 -->
    <div v-else-if="filteredEquipments.length === 0" class="message-card">
      <span v-if="activeFilter === 'all'">沒有找到任何設備資料。</span>
      <!-- 修正：顯示更精確的提示訊息 -->
      <span v-else>在此事業體中沒有找到任何設備資料。</span>
    </div>

    <!-- 資料表格，使用 ref="tableRef" 將此 DOM 元素與 script 中的 tableRef 變數綁定 -->
    <table v-else class="data-table" ref="tableRef">
      <thead>
        <tr>
          <th @click="sortBy('hostname')">設備名稱 <span v-if="sortKey === 'hostname'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('asset_number')">財產編號 <span v-if="sortKey === 'asset_number'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('status')">狀態 <span v-if="sortKey === 'status'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('mac_address')">MAC位址 <span v-if="sortKey === 'mac_address'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('type')">類型 <span v-if="sortKey === 'type'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('os_version')">OS版本 <span v-if="sortKey === 'os_version'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('purchase_date')">購買日期 <span v-if="sortKey === 'purchase_date'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('warranty_end_date')">保固日期 <span v-if="sortKey === 'warranty_end_date'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th >操作</th>
        </tr>
      </thead>
      <tbody>
        <!-- 使用 v-for 遍歷篩選後的 filteredEquipments 列表來渲染每一行 -->
        <template v-for="equipment in sortedAndFilteredEquipments" :key="equipment.computer_id">
          <!-- 顯示模式的 tr -->
          <tr v-if="editingEquipmentId !== equipment.computer_id">
            <td>{{ equipment.hostname }}</td>
            <td>{{ equipment.asset_number }}</td>
            <td>
              <!-- 根據 status 的值顯示對應的中文狀態 -->
              <span v-if="equipment.status === 'Assigned'">使用中</span>
              <span v-else-if="equipment.status === 'Available'">閒置</span>
              <span v-else-if="equipment.status === 'Under Repair'">維修中</span>
              <span v-else-if="equipment.status === 'Decommissioned'">除役</span>
              <span v-else>{{ equipment.status }}</span>
            </td>
            <td>{{ equipment.mac_address }}</td>
            <td>{{ equipment.type }}</td>
            <td>{{ equipment.os_version }}</td>
            <!-- 處理日期格式，只顯示年月日部分 -->
            <td>{{ equipment.purchase_date ? equipment.purchase_date.substring(0, 10) : '' }}</td>
            <td>{{ equipment.warranty_end_date ? equipment.warranty_end_date.substring(0, 10) : '' }}</td>
            <!-- 操作欄位內容，只有 'admin' 角色才能看到 -->
            <td>
              <div class="dropdown">
                <!-- **修改**: 將 $event 物件傳遞給 toggleDropdown 函式 -->
                <button @click="toggleDropdown(equipment.computer_id, $event)" class="dropdown-toggle">...</button>
                <!-- **修改**: 動態綁定 upward class -->
                <div v-if="activeDropdownId === equipment.computer_id" class="dropdown-menu" >
                  <button v-if="equipment.status === 'Assigned'" @click.stop="unassignEquipment(equipment.computer_id)">取消分配</button>
                  <!-- 編輯按鈕，使用 .stop 修飾符防止事件冒泡觸發外部點擊 -->
                  <button @click.stop="startEdit(equipment)">編輯</button>
                  <!-- 刪除按鈕 -->
                  <button @click.stop="deleteEqip(equipment.computer_id)">刪除</button>
                </div>
              </div>
            </td>
          </tr>
          <!-- 編輯模式的 tr -->
          <tr v-else>
            <td><input type="text" v-model="tempEquipmentData.hostname"></td>
            <td><input type="text" v-model="tempEquipmentData.asset_number"></td>
            <td>
              <select v-model="tempEquipmentData.status">
                <option value="Available">閒置</option>
                <option value="Assigned">使用中</option>
                <option value="Under Repair">維修中</option>
                <option value="Decommissioned">除役</option>
              </select>
            </td>
            <td><input type="text" v-model="tempEquipmentData.mac_address"></td>
            <td><input type="text" v-model="tempEquipmentData.type"></td>
            <td><input type="text" v-model="tempEquipmentData.os_version"></td>
            <td><input type="date" v-model="tempEquipmentData.purchase_date"></td>
            <td><input type="date" v-model="tempEquipmentData.warranty_end_date"></td>
            <td>
              <div class="button-group">
                <button @click="saveEdit" class="btn btn-success">儲存</button>
                <button @click="cancelEdit" class="btn btn-danger">取消</button>
              </div>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
/* 此處應為空，因為所有樣式都由全域 CSS 管理 */
/* 新增 filter-group 樣式，使其與新增按鈕分開對齊 */
.filter-group {
  display: flex;
  gap: 10px;
}
.page-actions {
  /* 使用 justify-content: space-between 將兩組按鈕推向兩側 */
  justify-content: space-between;
}

.data-table thead th {
  cursor: pointer;
  user-select: none; /* 防止點擊時選中文本 */
}
</style>

