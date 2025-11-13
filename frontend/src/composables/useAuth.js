// src/composables/useAuth.js
import { ref, onUnmounted } from 'vue';
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import router from '../router';

// --- Firebase 設定 ---
// 重要提示：請將這些設定換成您自己在 Firebase 專案中取得的設定！
const firebaseConfig = {
  apiKey: "AIzaSyBO8Uvdxnt90bpI3sG7LD7vQTmjMngyAco",
  authDomain: "it-system-1631f.firebaseapp.com",
  projectId: "it-system-1631f",
  storageBucket: "it-system-1631f.firebasestorage.app",
  messagingSenderId: "660821189199",
  appId: "1:660821189199:web:4e76d5963f14aaedbd803a",
  measurementId: "G-K445GLPN35"
};

// --- 初始化 Firebase ---
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const provider = new GoogleAuthProvider();

// --- 響應式狀態 ---
const user = ref(null); // 用於儲存當前登入的使用者資訊

// --- 監聽認證狀態變化 ---
// onAuthStateChanged 會在登入、登出或頁面刷新時自動觸發
const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
  user.value = firebaseUser;
});

// 當 Composable 不再被使用時，取消監聽以防止記憶體洩漏
onUnmounted(() => {
  unsubscribe();
});

// --- 核心函式 ---
const signInWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider);
    // 登入成功後，導向首頁
    router.push('/');
  } catch (error) {
    console.error("Google 登入失敗:", error);
    alert("登入時發生錯誤，請稍後再試。");
  }
};

const handleSignOut = async () => {
  try {
    await signOut(auth);
    // 登出成功後，導向登入頁
    router.push('/login');
  } catch (error) {
    console.error("登出失敗:", error);
  }
};

/**
 * 導出一個可組合函式，讓任何元件都能存取使用者狀態和認證函式
 */
export function useAuth() {
  return {
    user,
    signInWithGoogle,
    handleSignOut,
    auth // 導出 auth 實例，方便在路由器守衛中使用
  };
}
