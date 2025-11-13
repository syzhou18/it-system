import { onMounted, onUnmounted } from 'vue';

/**
 * 一個可組合函式 (Composable)，用於偵測使用者是否在指定的元素外部進行了點擊。
 * @param {ref} targetRef - 一個 Vue ref，指向您想要監控的 DOM 元素。
 * @param {function} callback - 當偵測到外部點擊時要執行的回呼函式。
 */
export function useClickOutside(targetRef, callback) {
  
  const listener = (event) => {
    // 如果目標元素尚未掛載，或點擊發生在目標元素內部，則不執行任何操作。
    if (!targetRef.value || targetRef.value.contains(event.target)) {
      return;
    }
    
    // 執行傳入的回呼函式
    callback();
  };

  // 元件掛載時，在 document 上註冊點擊事件監聽器
  onMounted(() => {
    document.addEventListener('click', listener);
  });

  // 元件卸載時，移除監聽器以防止記憶體洩漏
  onUnmounted(() => {
    document.removeEventListener('click', listener);
  });
}