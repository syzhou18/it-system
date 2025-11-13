<script setup>
import { ref } from 'vue';
import axios from 'axios';

// 定义此元件可發出的事件
const emit = defineEmits(['software-submitted']);

// 表單數據的響應式狀態
// **修正：** 新增後端所需的 software_id 和 license_type 欄位
const formData = ref({
  software_name: '',
  license_key: '',
  registered_account: '',
  version: '',
  purchase_date: '',
  status: 'Available', // 預設狀態為可用
  license_type: 'Perpetual' // 新增 license_type 欄位，並設定預設值
});

// 表單提交方法
async function submitForm() {
  try {
    // 發送 POST 請求到後端 API
    await axios.post('http://localhost:3000/api/softwares', formData.value);
    alert('軟體新增成功！');

    // 發出事件，通知父元件資料已更新
    emit('software-submitted');

  } catch (error) {
    console.error('新增軟體失敗:', error);
    // **優化：** 顯示後端回傳的具體錯誤訊息
    alert(error.response?.data?.error || '提交失敗，請檢查後端服務。');
  }
}
</script>

<template>
  <div>
    <h2>新增軟體</h2>
    <form @submit.prevent="submitForm">
      <!-- **新增：** 軟體 ID 輸入欄位 -->
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
          <option value="Volume">Volume</option>
        </select>
      </div>
       <div class="form-group">
        <label for="status">狀態:</label>
        <select id="status" v-model="formData.status">
          <option value="Unused">可用</option>
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

