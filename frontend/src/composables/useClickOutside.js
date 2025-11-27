import { onMounted, onUnmounted } from 'vue';

/**
 * 偵測點擊元素外部的 Composable (Click Outside)
 *
 * @param {Ref} targetRef - 目標 DOM 元素的 Ref
 * @param {Function} callback - 點擊外部時觸發的回呼函式
 */
export function useClickOutside(targetRef, callback) {
  
  // 點擊事件處理函式
  const listener = (event) => {
    const el = targetRef.value;

    // 若目標元素不存在，或點擊發生在目標元素內部，則忽略此次事件
    if (!el || el.contains(event.target)) {
      return;
    }

    // 觸發回呼
    callback();
  };

  // --- 生命週期監聽 ---
  
  onMounted(() => {
    document.addEventListener('click', listener);
  });

  onUnmounted(() => {
    document.removeEventListener('click', listener);
  });
}