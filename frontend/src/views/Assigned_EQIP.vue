<script setup>
import axios from 'axios';
import { ref, onMounted ,computed } from 'vue';

const users = ref([]);
const equipments = ref([]);
const loading = ref(true);
const error = ref(null);


// 提取並重用數據獲取邏輯
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

async function fetchequipments() {
  try {
    loading.value = true;
    const response = await axios.get('http://localhost:3000/api/equipment');
    equipments.value = response.data;
  } catch (err) {
    console.error('Error fetching equipments:', err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}


const formData = ref({
  employee_id: '',
  asset_number: ''
});

// 表單提交方法
async function submitForm() {
  try {
    const response = await axios.post('http://localhost:3000/api/assigned/computer', formData.value);
    console.log('資料提交成功:', response.data);
    alert('資料已成功更新！');
    // 清空表單並重新獲取數據
    await fetchUsers();
    formData.value.employee_id = '';
    formData.value.hostname = '';
  } catch (error) {
    console.error('提交失敗:', error);
    if (error.response) {
      // 根據 HTTP 狀態碼顯示不同的錯誤訊息
      switch (error.response.status) {
        case 404:
          alert('提交失敗：' + error.response.data.message);
          break;
        case 409:
          alert('提交失敗：' + error.response.data.message);
          break;
        case 400:
          alert('提交失敗：' + error.response.data.error);
          break;
        default:
          alert('提交失敗，伺服器發生未預期的錯誤。');
          break;
      }
    } else {
      // 處理沒有後端響應的錯誤，例如網路斷線或 CORS 問題
      alert('提交失敗，請檢查網路連線。');
    }
  }
}

// 創建一個 computed 屬性來處理排序
const sortedEquipments = computed(() => {
  // 1. 確保 equipments.value 不為空陣列
  if (!equipments.value || equipments.value.length === 0) {
    return []; // 如果為空，回傳空陣列以避免錯誤
  }
  
  // 2. 使用 .slice() 創建淺拷貝
  return equipments.value.slice().sort((a, b) => {
    // 3. 在比較前，處理可能為 null 或 undefined 的值
    const asset_a = a.asset_number ?? ''; // 如果 a.asset_number 是 null 或 undefined，則賦予空字串
    const asset_b = b.asset_number ?? ''; // 同理
    
    // 4. 執行字串比較
    return asset_a.localeCompare(asset_b);
  });
});

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
</style>