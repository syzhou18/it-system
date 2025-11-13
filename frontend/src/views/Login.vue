<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
      </div>
      <h1>IT SYSTEM</h1>
      <p>請登入以繼續</p>
      <button @click="signInWithGoogle" class="google-login-button">
        <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google logo" />
        使用 Google 帳戶登入
      </button>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '../composables/useAuth.js';
const { signInWithGoogle } = useAuth();
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f4f7f6;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}
.login-card {
  background-color: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}
.logo {
  margin-bottom: 20px;
  color: #343a40;
}
h1 {
  margin: 0 0 10px;
  font-size: 24px;
  color: #343a40;
}
p {
  margin-bottom: 30px;
  color: #6c757d;
}
.google-login-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  background-color: #fff;
  color: #495057;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, box-shadow 0.2s;
}
.google-login-button:hover {
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}
.google-login-button img {
  width: 20px;
  height: 20px;
  margin-right: 12px;
}
</style>
