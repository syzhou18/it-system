<script setup>
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';

// --- 狀態定義 ---
const users = ref([]);
const equipments = ref([]);
const loading = ref(true);
const error = ref(null);

const formData = ref({
  employee_id: '',
  asset_number: '' // 注意：模板中綁定的是 hostname，請確認後端需求
});

// --- API 資料獲取 ---

// 獲取使用者列表
async function fetchUsers() {
  try {
    loading.value = true;
    const response = await axios.get('http://192.168.2.168:3000/api/users');
    users.value = response.data;
  } catch (err) {
    console.error('Error fetching users:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

// 獲取設備列表
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

// --- 表單處理 ---

// 提交分配資料
async function submitForm() {
  try {
    const response = await axios.post('http://192.168.2.168:3000/api/assigned/computer', formData.value);
    console.log('資料提交成功:', response.data);
    alert('資料已成功更新！');

    // 重置表單並更新列表
    await fetchUsers();
    formData.value.employee_id = '';
    formData.value.hostname = ''; 
  } catch (error) {
    console.error('提交失敗:', error);
    
    // 錯誤狀態碼處理
    if (error.response) {
      const { status, data } = error.response;
      switch (status) {
        case 404:
        case 409:
          alert('提交失敗：' + data.message);
          break;
        case 400:
          alert('提交失敗：' + data.error);
          break;
        default:
          alert('提交失敗，伺服器發生未預期的錯誤。');
      }
    } else {
      alert('提交失敗，請檢查網路連線。');
    }
  }
}

// --- 計算屬性 ---

// 設備清單排序 (依財產編號)
const sortedEquipments = computed(() => {
  if (!equipments.value || equipments.value.length === 0) {
    return [];
  }
  
  // 淺拷貝後進行安全排序
  return equipments.value.slice().sort((a, b) => {
    const asset_a = a.asset_number ?? '';
    const asset_b = b.asset_number ?? '';
    return asset_a.localeCompare(asset_b);
  });
});

// --- 生命週期 ---
onMounted(() => {
  fetchUsers();
  fetchequipments();
});
</script>

<template>
  <h1>資產分配表單</h1>
  <div class="card form-card">
    <form @submit.prevent="submitForm">
      
      <div class="form-group">
        <label for="employee_id">員工編號:</label>
        <select id="employee_id" v-model="formData.employee_id" required>
          <option disabled value="">請選擇員工編號</option>
          <option v-for="user in users" :key="user.id" :value="user.employee_id">
            {{ user.employee_id }} - {{ user.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="asset_number">財產編號:</label>
        <select id="asset_number" v-model="formData.hostname" required>
          <option disabled value="">請選擇財產編號</option>
          <option v-for="equipment in sortedEquipments" :key="equipment.id" :value="equipment.hostname">
            {{ equipment.asset_number }} - {{ equipment.hostname }}
          </option>
        </select>
      </div>

      <button type="submit" class="submit-button">提交</button>
    </form>
  </div>
</template>

<style>
/* 在此處添加樣式 */
</style>