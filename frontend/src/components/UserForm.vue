<script setup>
// --- 套件匯入 ---
import { ref } from 'vue';
import axios from 'axios';

// --- 事件定義 ---
// 定義可發出的事件，用於通知父元件
const emit = defineEmits(['user-submitted']);

// --- 表單資料狀態 ---
const formData = ref({
  employee_id: '',
  name: '',
  job_title: '',
  department: '',
  phone_number: '',
  email: ''
});

// --- 表單提交處理 ---
async function submitForm() {
  try {
    // 發送 POST 請求至後端 API
    const response = await axios.post('http://192.168.2.168:3000/api/users', formData.value);
    console.log('資料提交成功:', response.data);
    alert('資料已成功更新！');

    // 提交成功後，觸發事件通知父元件刷新資料
    emit('user-submitted');

    // 重置表單欄位
    formData.value.employee_id = '';
    formData.value.name = '';
    formData.value.job_title = '';
    formData.value.department = '';
    formData.value.phone_number = '';
    formData.value.email = '';
  } catch (error) {
    console.error('提交失敗:', error);
    alert('提交失敗，請檢查後端服務和資料庫連線。');
  }
}
</script>

<template>
  <div>
    <h2>新增員工</h2>
    <form @submit.prevent="submitForm">
      
      <div class="form-group">
        <label for="Staff_ID">員工編號:</label>
        <input type="text" id="Staff_ID" v-model="formData.employee_id" required>
      </div>
      <div class="form-group">
        <label for="Name">名稱:</label>
        <input type="text" id="Name" v-model="formData.name" required>
      </div>
      
      <div class="form-group">
        <label for="Position">職位:</label>
        <input type="text" id="Position" v-model="formData.job_title" required>
      </div>
      <div class="form-group">
        <label for="Department">部門:</label>
        <input type="text" id="Department" v-model="formData.department">
      </div>

      <div class="form-group">
        <label for="Phone">分機:</label>
        <input type="text" id="Phone" v-model="formData.phone_number">
      </div>
      <div class="form-group">
        <label for="Email">電子郵件:</label>
        <input type="email" id="Email" v-model="formData.email" required>
      </div>
      
      <button type="submit" class="btn btn-success" style="width: 100%; margin-top: 15px;">提交</button>
    </form>
  </div>
</template>

<style scoped>
/* 樣式由父元件或全域 CSS 管理 */
</style>