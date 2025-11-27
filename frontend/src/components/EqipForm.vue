<script setup>
// --- 套件匯入 ---
import { ref } from 'vue'; 
import axios from 'axios';

// --- 事件定義 ---
// 定義可發出的事件，用於通知父元件
const emit = defineEmits(['eqip-submitted']);

// --- 表單資料狀態 ---
const formData = ref({
  company_id: '',
  hostname: '',
  serial_number: '',
  asset_number: '',
  type: '',
  brand: '',
  model: '',
  os_version: '',
  mac_address: '',
  purchase_date: '',
  warranty_end_date: '',
  status: '',
  Remarks: '' 
});

// --- 表單提交處理 ---
async function submitForm() {
  try {
    // 發送 POST 請求至後端 API
    const response = await axios.post('http://192.168.2.168:3000/api/equipment', formData.value);
    console.log('資料提交成功:', response.data);
    alert('資料已成功更新！');

    // 提交成功後，觸發事件通知父元件刷新資料
    emit('eqip-submitted');

    // 重置表單欄位
    formData.value.company_id = '';
    formData.value.hostname = '';
    formData.value.serial_number = '';
    formData.value.asset_number = '';
    formData.value.type = '';
    formData.value.brand = '';
    formData.value.model = '';
    formData.value.os_version = '';
    formData.value.mac_address = '';
    formData.value.purchase_date = '';
    formData.value.warranty_end_date = '';
    formData.value.status = '';
    formData.value.Remarks = '';
  } catch (error) {
    console.error('提交失敗:', error);
    alert('提交失敗，請檢查後端服務和資料庫連線。');
  }
}
</script>

<template>
  <div>
    <h2>新增設備</h2>
    <form @submit.prevent="submitForm">
      
      <div class="form-group">
        <label for="company_id">公司代號:</label>
        <select id="company_id" v-model="formData.company_id">
          <option value="1">圖爾思-事業體</option>
          <option value="2">拜爾-事業體</option>
          <option value="3">倍思特-事業體</option>
        </select>
      </div>

      <div class="form-group">
        <label for="hostname">設備名稱:</label>
        <input type="text" id="hostname" v-model="formData.hostname" required>
      </div>
      <div class="form-group">
        <label for="serial_number">S/N序號:</label>
        <input type="text" id="serial_number" v-model="formData.serial_number" required>
      </div>
      <div class="form-group">
        <label for="asset_number">財產編號:</label>
        <input type="text" id="asset_number" v-model="formData.asset_number" required>
      </div>
      <div class="form-group">
        <label for="mac_address">MAC位址:</label>
        <input type="text" id="mac_address" v-model="formData.mac_address" required>
      </div>

      <div class="form-group">
        <label for="type">類型:</label>
        <select id="type" v-model="formData.type">
          <option value="Desktop">桌上型電腦</option>
          <option value="Laptop">筆記型電腦</option>
          <option value="Tablet">平板電腦</option>
          <option value="Server">伺服器</option>
          <option value="Printer">印表機</option>
          <option value="Network Device">網路設備</option>
          <option value="Other">其他</option>
        </select>
      </div>
      <div class="form-group">
        <label for="brand">品牌:</label>
        <input type="text" id="brand" v-model="formData.brand" required>
      </div>
      <div class="form-group">
        <label for="model">型號:</label>
        <input type="text" id="model" v-model="formData.model" required>
      </div>
      <div class="form-group">
        <label for="os_version">作業系統:</label>
        <select id="os_version" v-model="formData.os_version" >
          <option value="Windows 10 Home">Windows 10 Home</option>
          <option value="Windows 11 Pro">Windows 11 Pro</option>
          <option value="macOS Ventura">macOS Ventura</option>
          <option value="Ubuntu 22.04">Ubuntu 22.04</option>
          <option value="Other">Other</option>
        </select> 
      </div>

      <div class="form-group">
        <label for="purchase_date">購買日期:</label>
        <input type="date" id="purchase_date" v-model="formData.purchase_date" required>
      </div>
      <div class="form-group">
        <label for="warranty_end_date">保固到期日:</label>
        <input type="date" id="warranty_end_date" v-model="formData.warranty_end_date" required>
      </div>
      <div class="form-group">
        <label for="status">狀態:</label>
        <select id="status" v-model="formData.status">
          <option value="Available">閒置</option>
          <option value="Assigned">使用中</option>
          <option value="Under Repair">維修中</option>
          <option value="Decommissioned">除役</option>
        </select>
      </div>
      <div class="form-group">
        <label for="Remarks">備註:</label>
        <input type="text" id="Remarks" v-model="formData.Remarks">
      </div>
      
      <button type="submit" class="btn btn-success" style="width: 100%; margin-top: 15px;">提交</button>
    </form>
  </div>
</template>

<style>
/* 樣式由父元件或全域 CSS 管理 */
</style>