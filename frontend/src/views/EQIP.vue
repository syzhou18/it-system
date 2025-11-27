<script setup>
// --- 套件與 Composable 匯入 ---
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';
import EqipForm from '../components/EqipForm.vue';
import { useClickOutside } from '../composables/useClickOutside.js';
import { useSortableTable } from '../composables/useSortableTable.js';

// --- 狀態定義 ---
const equipments = ref([]);
const loading = ref(true);
const error = ref(null);
const editingEquipmentId = ref(null);
const tempEquipmentData = ref(null);
const activeFilter = ref('all');
const activeDropdownId = ref(null);
const isModalVisible = ref(false);
const tableRef = ref(null);
const searchTerm = ref('');

// --- API 函式 ---

// 獲取設備資料
async function fetchequipments() {
  try {
    loading.value = true;
    const response = await axios.get('http://192.168.2.168:3000/api/equipment');
    equipments.value = response.data;
  } catch (err) {
    console.error('Error fetching equipments:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// 儲存編輯資料
async function saveEdit() {
  if (!tempEquipmentData.value) return;

  try {
    const updatedData = { ...tempEquipmentData.value };
    delete updatedData.computer_id;
    delete updatedData.assigned_to;

    await axios.put(`http://192.168.2.168:3000/api/equipment/${tempEquipmentData.value.computer_id}`, updatedData);

    // 重置狀態並刷新
    editingEquipmentId.value = null;
    tempEquipmentData.value = null;
    activeDropdownId.value = null;
    await fetchequipments();
  } catch (err) {
    console.error('Error updating equipment:', err);
    alert('更新失敗，請檢查後端服務。');
  }
}

// 取消設備分配
async function unassignEquipment(computer_id) {
  if (!confirm(`您確定要取消分配此設備嗎？\n\n設備狀態將會變更為「閒置」，並清除與員工的關聯。`)) {
    return;
  }
  try {
    await axios.put(`http://192.168.2.168:3000/api/equipment/cancelassigned/${computer_id}`, {
      status: 'Available',
      assigned_to: null
    });
    alert('設備已成功取消分配！');
    await fetchequipments();
  } catch (err) {
    console.error('Error unassigning equipment:', err);
    alert('操作失敗，請檢查後端服務。');
  }
}

// 刪除設備
async function deleteEqip(computer_id) {
  if (!confirm(`您確定要刪除設備編號 ${computer_id} 的資料嗎？`)) {
    return;
  }
  try {
    await axios.delete(`http://192.168.2.168:3000/api/equipment/${computer_id}`);
    alert('資料已成功刪除！');
    await fetchequipments();
  } catch (err) {
    console.error('Error deleting equipment:', err);
    alert('刪除失敗，請檢查後端服務。');
  }
}

// --- 資料處理與計算屬性 ---

// 篩選設備列表
const filteredEquipments = computed(() => {
  if (activeFilter.value === 'all') {
    return equipments.value;
  }
  const filterId = parseInt(activeFilter.value, 10);
  return equipments.value.filter(equipment => equipment.company_id === filterId);
});

// 使用 Composable 處理表格排序
const { sortKey, sortOrder, sortedData: sortedAndFilteredEquipments, sortBy } = useSortableTable(filteredEquipments);

// --- 介面操作函式 ---

function setFilter(companyId) {
  activeFilter.value = companyId;
}

function startEdit(equipment) {
  editingEquipmentId.value = equipment.computer_id;
  const temp = { ...equipment };

  // 格式化日期以便 input[type="date"] 顯示
  if (temp.purchase_date) temp.purchase_date = temp.purchase_date.substring(0, 10);
  if (temp.warranty_end_date) temp.warranty_end_date = temp.warranty_end_date.substring(0, 10);

  tempEquipmentData.value = temp;
}

function toggleDropdown(computer_id, event) {
  activeDropdownId.value = activeDropdownId.value === computer_id ? null : computer_id;
}

function cancelEdit() {
  editingEquipmentId.value = null;
  tempEquipmentData.value = null;
  activeDropdownId.value = null;
}

async function handleEqipSubmitted() {
  isModalVisible.value = false;
  await fetchequipments();
}

// --- 初始化與監聽 ---

// 點擊外部關閉編輯模式
useClickOutside(tableRef, cancelEdit);

onMounted(() => {
  fetchequipments();
});
</script>

<template>
  <div class="page-container">
    
    <div class="page-actions">
      <div class="filter-group">
        <button @click="setFilter('all')" class="btn" :class="{ 'btn-success': activeFilter === 'all' }">全部</button>
        <button @click="setFilter('1')" class="btn" :class="{ 'btn-success': activeFilter === '1' }">圖爾思-事業體</button>
        <button @click="setFilter('2')" class="btn" :class="{ 'btn-success': activeFilter === '2' }">拜爾-事業體</button>
        <button @click="setFilter('3')" class="btn" :class="{ 'btn-success': activeFilter === '3' }">倍思特-事業體</button>
      </div>
      <button @click="isModalVisible = true" class="btn btn-success">新增設備</button>
    </div>

    <div v-if="isModalVisible" class="modal-overlay">
      <div class="modal-content">
        <button @click="isModalVisible = false" class="modal-close-button">×</button>
        <EqipForm @eqip-submitted="handleEqipSubmitted" />
      </div>
    </div>

    <div v-if="loading" class="message-card">正在載入設備資料...</div>
    <div v-else-if="error" class="message-card error-message">載入資料失敗: {{ error }}</div>
    <div v-else-if="filteredEquipments.length === 0" class="message-card">
      <span v-if="activeFilter === 'all'">沒有找到任何設備資料。</span>
      <span v-else>在此事業體中沒有找到任何設備資料。</span>
    </div>

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
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="equipment in sortedAndFilteredEquipments" :key="equipment.computer_id">
          
          <tr v-if="editingEquipmentId !== equipment.computer_id">
            <td>{{ equipment.hostname }}</td>
            <td>{{ equipment.asset_number }}</td>
            <td>
              <span v-if="equipment.status === 'Assigned'">使用中</span>
              <span v-else-if="equipment.status === 'Available'">閒置</span>
              <span v-else-if="equipment.status === 'Under Repair'">維修中</span>
              <span v-else-if="equipment.status === 'Decommissioned'">除役</span>
              <span v-else>{{ equipment.status }}</span>
            </td>
            <td>{{ equipment.mac_address }}</td>
            <td>{{ equipment.type }}</td>
            <td>{{ equipment.os_version }}</td>
            <td>{{ equipment.purchase_date ? equipment.purchase_date.substring(0, 10) : '' }}</td>
            <td>{{ equipment.warranty_end_date ? equipment.warranty_end_date.substring(0, 10) : '' }}</td>
            <td>
              <div class="dropdown">
                <button @click="toggleDropdown(equipment.computer_id, $event)" class="dropdown-toggle">...</button>
                <div v-if="activeDropdownId === equipment.computer_id" class="dropdown-menu">
                  <button v-if="equipment.status === 'Assigned'" @click.stop="unassignEquipment(equipment.computer_id)">取消分配</button>
                  <button @click.stop="startEdit(equipment)">編輯</button>
                  <button @click.stop="deleteEqip(equipment.computer_id)">刪除</button>
                </div>
              </div>
            </td>
          </tr>

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
.filter-group {
  display: flex;
  gap: 10px;
}
.page-actions {
  justify-content: space-between;
}
.data-table thead th {
  cursor: pointer;
  user-select: none;
}
</style>