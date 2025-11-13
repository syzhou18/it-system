<script setup>
import axios from 'axios';
// 1. 匯入 computed
import { ref, onMounted, computed } from 'vue';
import UserForm from '../components/UserForm.vue';
import { useClickOutside } from '../composables/useClickOutside.js';
import { Icon } from '@iconify/vue';
import { useSortableTable } from '../composables/useSortableTable.js';

// --- 響應式狀態 ---
const users = ref([]); // 儲存從 API 獲取的原始使用者列表
const loading = ref(true);
const error = ref(null);
const isModalVisible = ref(false);
const tableRef = ref(null);
const activeDropdownId = ref(null);
const editingEmployeeId = ref(null);
const tempUserData = ref(null);

// 2. 新增一個狀態來追蹤目前的篩選條件
const activeFilter = ref('all'); // 'all' 代表顯示全部

// --- API 呼叫 ---
async function fetchUsers() {
  try {
    loading.value = true;
    const response = await axios.get('http://localhost:3000/api/users');
    users.value = response.data;
  } catch (err) {
    console.error('Error fetching users:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// 3. 建立一個計算屬性，根據篩選條件回傳要顯示的使用者列表
const filteredUsers = computed(() => {
  if (activeFilter.value === 'all') {
    return users.value; // 如果篩選是 'all'，回傳所有使用者
  }
  return users.value.filter(user => user.department === activeFilter.value);
});

const { sortKey, sortOrder, sortedData: sortedAndFilteredusers, sortBy } = useSortableTable(filteredUsers);
// --- 事件處理函式 ---

// 4. 設定篩選條件的函式
function setFilter(department) {
  activeFilter.value = department;
}

async function deleteUser(employee_id) {
  if (!confirm(`您確定要刪除員工編號 ${employee_id} 的資料嗎？`)) {
    return;
  }
  try {
    await axios.delete(`http://localhost:3000/api/users/${employee_id}`);
    alert('資料已成功刪除！');
    await fetchUsers();
  } catch (error) {
    console.error('刪除失敗:', error);
    alert('刪除失敗，請檢查後端服務。');
  }
}

function toggleDropdown(employee_id) {
  if (activeDropdownId.value === employee_id) {
    activeDropdownId.value = null;
  } else {
    activeDropdownId.value = employee_id;
  }
}

function editUser(user) {
  activeDropdownId.value = null;
  editingEmployeeId.value = user.employee_id;
  tempUserData.value = { ...user };
}

async function saveEdit() {
  if (!tempUserData.value) return;
  try {
    const updatedData = { ...tempUserData.value };
    await axios.put(`http://localhost:3000/api/users/${editingEmployeeId.value}`, updatedData);
    alert('資料已成功更新！');
    editingEmployeeId.value = null;
    tempUserData.value = null;
    await fetchUsers();
  } catch (error) {
    console.error('更新失敗:', error);
    alert('更新失敗，請檢查後端服務。');
  }
}

function cancelEdit() {
  editingEmployeeId.value = null;
  tempUserData.value = null;
  activeDropdownId.value = null;
}

async function handleUserSubmitted() {
  isModalVisible.value = false;
  await fetchUsers();
}

useClickOutside(tableRef, cancelEdit);

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="page-container">
    <div class="page-actions">
        <div class="filter-group">
            <button @click="setFilter('all')" class="btn" :class="{ 'btn-success': activeFilter === 'all' }">全部</button>
            <button @click="setFilter('TOOLS')" class="btn" :class="{ 'btn-success': activeFilter === 'TOOLS' }">圖爾思-事業體</button>
            <button @click="setFilter('BIO')" class="btn" :class="{ 'btn-success': activeFilter === 'BIO' }">拜爾-事業體</button>
            <button @click="setFilter('ABREAL')" class="btn" :class="{ 'btn-success': activeFilter === 'ABREAL' }">倍思特-事業體</button>
        </div>

        <button @click="isModalVisible = true" class="btn" >
            <Icon icon="material-symbols:add-box" width="24" height="24" />
        </button>
    </div>

    <!-- Modal 彈出視窗 -->
    <div v-if="isModalVisible" class="modal-overlay">
      <div class="modal-content">
        <button @click="isModalVisible = false" class="modal-close-button">×</button>
        <UserForm @user-submitted="handleUserSubmitted" />
      </div>
    </div>

    <!-- 訊息提示 -->
    <div v-if="loading" class="message-card">正在載入使用者資料...</div>
    <div v-else-if="error" class="message-card error-message">載入資料失敗: {{ error }}</div>
    <!-- 7. 更新 v-if 條件，判斷 filteredUsers -->
    <div v-else-if="filteredUsers.length === 0" class="message-card">
      <span v-if="activeFilter === 'all'">沒有找到任何使用者資料。</span>
      <span v-else>在 "{{ activeFilter }}" 部門中沒有找到任何使用者資料。</span>
    </div>

    <!-- 6. 將 v-for 迴圈的對象從 users 改為 filteredUsers -->
    <table v-else class="data-table" ref="tableRef">
      <thead>
        <tr>
          <!--<th>ID</th>-->
          <th @click="sortBy('name')">姓名 <span v-if="sortKey === 'name'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('job_title')">職位<span v-if="sortKey === 'job_title'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('phone_number')">電話<span v-if="sortKey === 'phone_number'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th @click="sortBy('email')">Email<span v-if="sortKey === 'email'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="user in sortedAndFilteredusers" :key="user.employee_id">
          <!-- 顯示模式 -->
          <tr v-if="editingEmployeeId !== user.employee_id">
            <!--<td>{{ user.employee_id }}</td>-->
            <td>{{ user.name }}</td>
            <td>{{ user.job_title }}</td>
            <td>{{ user.phone_number }}</td>
            <td>{{ user.email }}</td>
            <td>
              <div class="dropdown">
                <button @click="toggleDropdown(user.employee_id)" class="dropdown-toggle">...</button>
                <div v-if="activeDropdownId === user.employee_id" class="dropdown-menu">
                  <button @click.stop="editUser(user)">編輯</button>
                  <button @click.stop="deleteUser(user.employee_id)">刪除</button>
                </div>
              </div>
            </td>
          </tr>
          <!-- 編輯模式 -->
          <tr v-else>
            <!--<td><input type="text" v-model="tempUserData.employee_id"></td>-->
            <td><input type="text" v-model="tempUserData.name"></td>
            <td><input type="text" v-model="tempUserData.job_title"></td>
            <td><input type="text" v-model="tempUserData.phone_number"></td>
            <td><input type="text" v-model="tempUserData.email"></td>
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
</style>

