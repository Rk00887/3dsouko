import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { warehouseApi } from '../api/client.js'

export const useWarehouseStore = defineStore('warehouse', () => {
  const warehouses  = ref([])
  const current     = ref(null)   // 現在選択中の倉庫
  const loading     = ref(false)
  const error       = ref(null)

  const currentId = computed(() => current.value?.id ?? null)

  async function fetchAll() {
    loading.value = true
    error.value   = null
    try {
      warehouses.value = await warehouseApi.list()
    } catch (e) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function create(dto) {
    loading.value = true
    error.value   = null
    try {
      const wh = await warehouseApi.create(dto)
      warehouses.value.push(wh)
      current.value = wh
      return wh
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function update(id, dto) {
    const wh = await warehouseApi.update(id, dto)
    const idx = warehouses.value.findIndex(w => w.id === id)
    if (idx >= 0) warehouses.value[idx] = wh
    if (current.value?.id === id) current.value = wh
    return wh
  }

  async function remove(id) {
    await warehouseApi.delete(id)
    warehouses.value = warehouses.value.filter(w => w.id !== id)
    if (current.value?.id === id) current.value = null
  }

  function select(wh) {
    current.value = wh
  }

  return { warehouses, current, currentId, loading, error, fetchAll, create, update, remove, select }
})
