import { createRouter , createWebHistory } from 'vue-router'

import Home from '@/views/Home.vue'
import HRM from '@/views/HRM.vue'
import EQIP from '@/views/EQIP.vue'
import Assigned_EQIP from '@/views/Assigned_EQIP.vue'
import Software from '@/views/Software.vue'

const routes = [
    {path: '/', name: Home , component: Home},
    {path: '/HRM', name: HRM , component: HRM},
    {path: '/EQIP', name: EQIP , component: EQIP},
    {path: '/Assigned_EQIP', name: Assigned_EQIP , component: Assigned_EQIP},
    {path: '/Software', name: Software , component: Software}
  ]

const router = createRouter({
  history: createWebHistory(),
  routes 
    })

export default router

/* // src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import { getAuth, onAuthStateChanged } from "firebase/auth";

// --- 異步等待 Firebase 初始化並獲取當前使用者 ---
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const removeListener = onAuthStateChanged(
      getAuth(),
      (user) => {
        removeListener(); // 監聽一次後就移除，避免重複觸發
        resolve(user);
      },
      reject
    );
  });
};

// --- 路由定義 ---
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    // 如果使用者已登入，就不應該能進入登入頁
    beforeEnter: async (to, from, next) => {
      if (await getCurrentUser()) {
        next('/');
      } else {
        next();
      }
    }
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: true } // 標記這個頁面需要登入
  },
  {
    path: '/hrm',
    name: 'HRM',
    component: () => import('../views/HRM.vue'),
    meta: { requiresAuth: true } // 標記這個頁面需要登入
  },
  {
    path: '/eqip', 
    name: 'EQIP',
    component: () => import('../views/EQIP.vue'), 
    meta: { requiresAuth: true } 
  },
  {
    path: '/Assigned_EQIP',
    name: 'Assigned_EQIP' ,
    component: () => import('../views/Assigned_EQIP.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/Software',
    name: 'Software' ,
    component: () => import('../views/Software.vue'),
    meta: { requiresAuth: true }
  }
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- 全域導航守衛 ---
// 在每一次路由切換前，這個函式都會被執行
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const currentUser = await getCurrentUser();

  if (requiresAuth && !currentUser) {
    // 如果頁面需要登入，但使用者未登入，則導向登入頁
    next('/login');
  } else {
    // 否則，正常進入頁面
    next();
  }
});

export default router;
 */