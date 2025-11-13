import { ref, computed } from 'vue';

/**
 * 一個可重用的 Vue Composable，用於為表格提供排序功能。
 * @param {import('vue').Ref<Array<Object>>} dataRef - 一個包含表格原始數據的 ref 物件。
 * @returns {Object} 包含排序狀態和方法的物件。
 */
export function useSortableTable(dataRef) {
  // --- 響應式狀態 ---
  // sortKey: 當前用於排序的欄位名 (例如 'hostname')
  // sortOrder: 排序順序 ('asc' 為升冪, 'desc' 為降冪)
  const sortKey = ref('');
  const sortOrder = ref('asc');

  /**
   * 一個計算屬性，它會根據 sortKey 和 sortOrder 的值，
   * 回傳一個排序後的新陣列。
   */
  const sortedData = computed(() => {
    // 取得傳入的原始數據
    const data = dataRef.value;
    // 如果沒有有效的排序欄位，或數據不是陣列，直接回傳原始數據
    if (!sortKey.value || !Array.isArray(data)) {
      return data;
    }

    // 建立一個數據的淺層複製，避免直接修改原始陣列 (這是很重要的最佳實踐)
    const dataToSort = [...data];

    // 使用 sort() 方法進行排序
    dataToSort.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];

      // 進行比較
      if (valA < valB) {
        return sortOrder.value === 'asc' ? -1 : 1;
      }
      if (valA > valB) {
        return sortOrder.value === 'asc' ? 1 : -1;
      }
      return 0; // 如果值相等，保持原始順序
    });

    return dataToSort;
  });

  /**
   * 處理表頭點擊事件的函式。
   * @param {string} key - 被點擊的表頭所對應的欄位名。
   */
  function sortBy(key) {
    // 如果點擊的是當前已排序的欄位
    if (sortKey.value === key) {
      // 則切換排序順序 (asc -> desc -> asc)
      sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
    } else {
      // 如果點擊的是一個新的欄位
      // 則將其設為新的排序欄位，並預設為升冪排序
      sortKey.value = key;
      sortOrder.value = 'asc';
    }
  }

  // 將狀態和方法回傳，以便在元件中使用
  return {
    sortKey,
    sortOrder,
    sortedData,
    sortBy,
  };
}

