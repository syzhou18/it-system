<script setup>
import { Icon } from '@iconify/vue';
import { useAuth } from './composables/useAuth.js';
import { computed } from 'vue';
import { useRoute } from 'vue-router';


// 從 Composable 獲取使用者狀態和登出函式
const { user, handleSignOut } = useAuth();
const route = useRoute();

// 計算屬性，判斷當前是否在登入頁面
const isLoginPage = computed(() => route.name === 'Login');

</script>

<!-- <template>
  <header class="app-header">
    <div class="logo">
      <Icon icon="ic:baseline-shield" width="28" height="28" color="#007bff" />
      <h1>IT管理系統</h1>
    </div>
  </header>

  <div>
    <aside class="sidebar">
      <ul class="sidebar-nav">
        <li><router-link to="/">儀錶板</router-link></li>
        <li><router-link to="/EQIP">設備管理</router-link></li>
        <li><router-link to="/HRM">人員管理</router-link></li>
        <li><router-link to="/Assigned_EQIP">分配電腦測試</router-link></li>
        <li><router-link to="/Software">軟體管理</router-link></li>
      </ul>
    </aside>

    <section class="main-content">
      <router-view></router-view>
    </section>
  </div>
</template> -->

<template>
  <!--  如果不是在登入頁面，才顯示主要的 Header 和 Sidebar 佈局 
  <div v-if="!isLoginPage">
    <header class="app-header">
      <div class="logo">
        <Icon icon="ic:baseline-shield" width="28" height="28" color="#343a40" />
        <h1>IT SYSTEM</h1>
      </div>
      如果使用者已登入，顯示使用者資訊和登出按鈕 
      <div v-if="user" class="user-info">
        <span>你好, {{ user.displayName || user.email }}</span>
        <button @click="handleSignOut" class="btn btn-danger">登出</button>
      </div>
    </header>

    <main class="main-container">
      <aside class="sidebar">
        <ul class="sidebar-nav">
          <li><router-link to="/">儀錶板</router-link></li>
          <li><router-link to="/hrm">人員管理</router-link></li>
          <li><router-link to="/eqip">設備管理</router-link></li>
          <li><router-link to="/Assigned_EQIP">分配電腦</router-link></li>
          <li><router-link to="/Software">軟體管理</router-link></li>
        </ul>
      </aside>
      
      <div class="main-content">
        <router-view></router-view>
      </div>
    </main>
  </div>
   如果在登入頁面，則只渲染登入頁對應的 router-view 
  <div v-else>
    <router-view></router-view>
  </div> -->

    <header class="app-header">
      <div class="logo">
        <Icon icon="ic:baseline-shield" width="28" height="28" color="#343a40" />
        <h1>IT SYSTEM</h1>
      </div>
    </header>
  <main class="main-container">
      <aside class="sidebar">
        <ul class="sidebar-nav">
          <li><router-link to="/">儀錶板</router-link></li>
          <li><router-link to="/hrm">人員管理</router-link></li>
          <li><router-link to="/eqip">設備管理</router-link></li>
          <li><router-link to="/Assigned_EQIP">分配電腦</router-link></li>
          <li><router-link to="/Software">軟體管理</router-link></li>
        </ul>
      </aside>
      
      <div class="main-content">
        <router-view></router-view>
      </div>
    </main>
</template>

<style scoped>
/*
  這裡的樣式已經全部移至全域的 main.css 檔案中，
  以避免樣式衝突和重複定義。
  此處應保持空白，除非有僅限於此元件本身的特殊樣式。
*/

/* 增加使用者資訊區域的樣式 */
.user-info {
  margin-left: auto; /* 將元素推到最右邊 */
  display: flex;
  align-items: center;
  gap: 15px; /* 元素之間的間距 */
}

.user-info span {
  font-weight: 500;
  color: #495057;
}
</style>

