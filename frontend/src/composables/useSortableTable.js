import { ref, computed } from 'vue';

/**
 * 表格排序功能的 Composable (Sortable Table)
 *
 * @param {Ref<Array>} dataRef - 包含原始數據的 Vue Ref
 * @returns {Object} 包含排序狀態、處理後的數據與操作方法
 */
export function useSortableTable(dataRef) {
  
  // --- 狀態定義 ---
  const sortKey = ref('');       // 當前排序欄位
  const sortOrder = ref('asc');  // 排序順序 ('asc' | 'desc')

  // --- 計算屬性 ---

  // 根據當前設定回傳排序後的資料
  const sortedData = computed(() => {
    const data = dataRef.value;

    // 若無排序鍵或數據非陣列，直接回傳原資料
    if (!sortKey.value || !Array.isArray(data)) {
      return data;
    }

    // 建立淺層複製以避免修改原始數據
    const dataToSort = [...data];

    return dataToSort.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];

      if (valA < valB) return sortOrder.value === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder.value === 'asc' ? 1 : -1;
      return 0;
    });
  });

  // --- 操作函式 ---

  // 點擊表頭觸發排序
  function sortBy(key) {
    if (sortKey.value === key) {
      // 若點擊相同欄位，切換升/降冪
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      // 若點擊新欄位，重置為升冪
      sortKey.value = key;
      sortOrder.value = 'asc';
    }
  }

  return {
    sortKey,
    sortOrder,
    sortedData,
    sortBy,
  };
}