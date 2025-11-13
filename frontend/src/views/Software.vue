<script setup>
// --- 核心與外部套件匯入 ---
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// --- 自訂元件與 Composables 匯入 ---
import SoftwareForm from '../components/SoftwareForm.vue';
import { useAuth } from '../composables/useAuth.js';
import { useClickOutside } from '../composables/useClickOutside.js';
import { useSortableTable } from '../composables/useSortableTable.js';

// --- 權限、排序、外部點擊功能實例化 ---
const { userRole } = useAuth();
const tableRef = ref(null);
const cancelAllActions = () => {
  editingSoftwareId.value = null;
  activeDropdownId.value = null;
};
useClickOutside(tableRef, cancelAllActions);

// --- 響應式狀態定義 ---
const softwares = ref([]);
const equipments = ref([]);
const loading = ref(true);
const error = ref(null);
const isAssignModalVisible = ref(false);
const isNewSoftwareModalVisible = ref(false);
const activeDropdownId = ref(null);
const isDropdownUpward = ref(false);
const editingSoftwareId = ref(null);
const tempSoftwareData = ref(null);

// 將 softwares ref 傳入排序 composable
const { sortKey, sortOrder, sortedData: sortedSoftwares, sortBy } = useSortableTable(softwares);

// 指派軟體的表單數據
const assignFormData = ref({
  software_id: '',
  asset_number: '' // 修正：應為 asset_number
});

// --- API 相關函式 ---
async function fetchData() {
  try {
    loading.value = true;
    const [softwaresRes, equipmentsRes] = await Promise.all([
      axios.get('http://localhost:3000/api/softwares'),
      axios.get('http://localhost:3000/api/equipment')
    ]);
    softwares.value = softwaresRes.data;
    equipments.value = equipmentsRes.data;
  } catch (err) {
    console.error('獲取資料失敗:', err);
    error.value = '無法載入資料';
  } finally {
    loading.value = false;
  }
}

// --- 事件處理函式 ---
function toggleDropdown(id, event) {
  if (activeDropdownId.value === id) {
    activeDropdownId.value = null;
  } else {
    activeDropdownId.value = id;
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    isDropdownUpward.value = spaceBelow < 100;
  }
}

function startEdit(software) {
  activeDropdownId.value = null;
  editingSoftwareId.value = software.software_id;
  tempSoftwareData.value = { ...software };
  if (tempSoftwareData.value.purchase_date) {
    tempSoftwareData.value.purchase_date = tempSoftwareData.value.purchase_date.substring(0, 10);
  }
}

async function saveEdit() {
  if (!tempSoftwareData.value) return;
  try {
    await axios.put(`http://localhost:3000/api/softwares/${editingSoftwareId.value}`, tempSoftwareData.value);
    alert('軟體更新成功！');
    editingSoftwareId.value = null;
    await fetchData();
  } catch (err) {
    console.error('更新失敗:', err);
    alert('更新失敗');
  }
}

async function deleteSoftware(id) {
  if (!confirm(`您確定要刪除軟體編號 ${id} 的資料嗎？`)) return;
  try {
    await axios.delete(`http://localhost:3000/api/softwares/${id}`);
    alert('軟體刪除成功！');
    await fetchData();
  } catch (err) {
    console.error('刪除失敗:', err);
    alert('刪除失敗');
  }
}

function cancelEdit() {
  editingSoftwareId.value = null;
  tempSoftwareData.value = null;
  activeDropdownId.value = null;
}

async function handleSoftwareSubmitted() {
  isNewSoftwareModalVisible.value = false;
  await fetchData();
}

async function submitAssignmentForm() {
  try {
    await axios.post('http://localhost:3000/api/assigned/software', assignFormData.value);
    alert('軟體指派成功！');
    isAssignModalVisible.value = false;
    assignFormData.value = { software_id: '', asset_number: '' }; // 重設表單
    await fetchData(); // 重新獲取資料以更新狀態
  } catch (error) {
    console.error('指派失敗:', error);
    alert(error.response?.data?.message || '指派失敗，請檢查後端服務。');
  }
}

// --- 生命週期掛鉤 ---
onMounted(fetchData);
</script>

<template>
  <div class="page-container">
    <h1>軟體管理</h1>

    <div class="page-actions">
      <!-- 新增按鈕 -->
      <button @click="isNewSoftwareModalVisible = true" class="btn btn-success">新增軟體</button>
      <button @click="isAssignModalVisible = true" class="btn">指派軟體至設備</button>
    </div>

    <!-- 新增軟體 Modal -->
    <div v-if="isNewSoftwareModalVisible" class="modal-overlay">
      <div class="modal-content">
        <button @click="isNewSoftwareModalVisible = false" class="modal-close-button">×</button>
        <SoftwareForm @software-submitted="handleSoftwareSubmitted" />
      </div>
    </div>
    
    <!-- 指派軟體 Modal -->
    <div v-if="isAssignModalVisible" class="modal-overlay">
        <div class="modal-content">
            <button @click="isAssignModalVisible = false" class="modal-close-button">×</button>
            <h2>指派軟體</h2>
            <form @submit.prevent="submitAssignmentForm">
                <div class="form-group">
                    <label for="assign_software_id">軟體:</label>
                    <select id="assign_software_id" v-model="assignFormData.software_id" required>
                        <option disabled value="">請選擇軟體</option>
                        <option v-for="sw in softwares.filter(s => s.status === 'Available')" :key="sw.software_id" :value="sw.software_id">
                            {{ sw.software_id }} - {{ sw.software_name }}
                        </option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="assign_asset_number">財產編號:</label>
                    <select id="assign_asset_number" v-model="assignFormData.asset_number" required>
                        <option disabled value="">請選擇財產編號</option>
                        <option v-for="eq in equipments" :key="eq.computer_id" :value="eq.asset_number">
                            {{ eq.asset_number }} - {{ eq.hostname }}
                        </option>
                    </select>
                </div>
                <button type="submit" class="btn btn-success">提交指派</button>
            </form>
        </div>
    </div>


    <!-- 訊息提示 -->
    <div v-if="loading" class="message-card">正在載入資料...</div>
    <div v-else-if="error" class="message-card error-message">{{ error }}</div>
    <div v-else-if="sortedSoftwares.length === 0" class="message-card">沒有找到任何軟體資料。</div>
    
    <!-- 資料表格 -->
    <table v-else class="data-table" ref="tableRef">
      <thead>
        <tr>
          <th @click="sortBy('software_id')">軟體編號 <span v-if="sortKey === 'software_id'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('software_name')">軟體名稱 <span v-if="sortKey === 'software_name'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('license_key')">產品金鑰<span v-if="sortKey === 'license_key'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('registered_account')">註冊帳號<span v-if="sortKey === 'registered_account'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('version')">版本 <span v-if="sortKey === 'version'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('purchase_date')">購買日期 <span v-if="sortKey === 'purchase_date'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('status')">狀態 <span v-if="sortKey === 'status'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th >操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="software in sortedSoftwares" :key="software.software_id">
          <!-- 顯示模式 -->
          <tr v-if="editingSoftwareId !== software.software_id">
            <td>{{ software.software_id }}</td>
            <td>{{ software.software_name }}</td>
            <td>{{ software.license_key }}</td>
            <td>{{ software.registered_account }}</td>
            <td>{{ software.version }}</td>
            <td>{{ software.purchase_date ? software.purchase_date.substring(0, 10) : '' }}</td>
            <td>{{ software.status }}</td>
            <td >
              <div class="dropdown">
                <button @click="toggleDropdown(software.software_id, $event)" class="dropdown-toggle">...</button>
                <div v-if="activeDropdownId === software.software_id" class="dropdown-menu" :class="{ 'upward': isDropdownUpward }">
                  <button @click.stop="startEdit(software)">編輯</button>
                  <button @click.stop="deleteSoftware(software.software_id)">刪除</button>
                </div>
              </div>
            </td>
          </tr>
          <!-- 編輯模式 -->
          <tr v-else>
            <td>{{ tempSoftwareData.software_id }}</td>
            <td><input type="text" v-model="tempSoftwareData.software_name"></td>
            <td><input type="text" v-model="tempSoftwareData.license_key"></td>
            <td><input type="email" v-model="tempSoftwareData.registered_account"></td>
            <td><input type="text" v-model="tempSoftwareData.version"></td>
            <td><input type="date" v-model="tempSoftwareData.purchase_date"></td>
            <td>
              <select v-model="tempSoftwareData.status">
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
              </select>
            </td>
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
/* 將 form-card 相關樣式移至全域或保持在此處（如果僅此頁面使用） */
.form-card {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 20px;
}
</style>
