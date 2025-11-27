<script setup>
// --- 套件匯入 ---
import { ref } from 'vue';
import axios from 'axios';

// --- 事件定義 ---
const emit = defineEmits(['software-submitted']);

// --- 表單資料狀態 ---
const formData = ref({
  software_name: '',
  license_key: '',
  registered_account: '',
  version: '',
  purchase_date: '',
  status: 'Available',      // 預設狀態
  license_type: 'Perpetual' // 預設授權類型
});

// --- 表單提交處理 ---
async function submitForm() {
  try {
    // 發送 POST 請求至後端 API
    await axios.post('http://192.168.2.168:3000/api/softwares', formData.value);
    alert('軟體新增成功！');

    // 提交成功後，觸發事件通知父元件刷新資料
    emit('software-submitted');

  } catch (error) {
    console.error('新增軟體失敗:', error);
    // 顯示後端回傳的錯誤訊息，若無則顯示通用錯誤
    const errorMsg = error.response?.data?.error || '提交失敗，請檢查後端服務。';
    alert(errorMsg);
  }
}
</script>

<template>
  <div>
    <h2>新增軟體</h2>
    <form @submit.prevent="submitForm">
      
      <div class="form-group">
        <label for="software_name">軟體名稱:</label>
        <input type="text" id="software_name" v-model="formData.software_name" required>
      </div>
      <div class="form-group">
        <label for="license_key">產品金鑰:</label>
        <input type="text" id="license_key" v-model="formData.license_key">
      </div>
      <div class="form-group">
        <label for="registered_account">註冊帳號:</label>
        <input type="email" id="registered_account" v-model="formData.registered_account">
      </div>
      <div class="form-group">
        <label for="version">版本:</label>
        <input type="text" id="version" v-model="formData.version">
      </div>

      <div class="form-group">
        <label for="purchase_date">購買日期:</label>
        <input type="date" id="purchase_date" v-model="formData.purchase_date" required>
      </div>
      <div class="form-group">
        <label for="license_type">授權類型:</label>
        <select id="license_type" v-model="formData.license_type">
          <option value="Perpetual">永久</option>
          <option value="Subscription">訂閱</option>
          <option value="Volume">大量授權 (Volume)</option>
        </select>
      </div>
      <div class="form-group">
        <label for="status">狀態:</label>
        <select id="status" v-model="formData.status">
          <option value="Available">可用</option>
          <option value="Assigned">已指派</option>
        </select>
      </div>

      <button type="submit" class="btn btn-success">提交</button>
    </form>
  </div>
</template>

<style scoped>
h2 {
  margin-top: 0;
  margin-bottom: 25px;
  font-size: 1.25rem;
  color: #343a40;
  text-align: center;
}
</style>