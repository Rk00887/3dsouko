import { defineStore } from 'pinia'
import { ref } from 'vue'
import { layoutApi } from '../api/client.js'

export const useLayoutStore = defineStore('layout', () => {
  const layouts     = ref([])
  const currentId   = ref(null)
  const loading     = ref(false)
  const error       = ref(null)

  async function fetchByWarehouse(warehouseId) {
    loading.value = true
    error.value   = null
    try {
      layouts.value = await layoutApi.list(warehouseId)
    } catch (e) {
      error.value = e.message
      layouts.value = []
    } finally {
      loading.value = false
    }
  }

  async function save(dto) {
    loading.value = true
    error.value   = null
    try {
      const saved = await layoutApi.save(dto)
      const idx = layouts.value.findIndex(l => l.id === saved.id)
      if (idx >= 0) layouts.value[idx] = saved
      else layouts.value.unshift(saved)
      currentId.value = saved.id
      return saved
    } catch (e) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    await layoutApi.delete(id)
    layouts.value = layouts.value.filter(l => l.id !== id)
    if (currentId.value === id) currentId.value = null
  }

  async function get(id) {
    return layoutApi.get(id)
  }

  return { layouts, currentId, loading, error, fetchByWarehouse, save, remove, get }
})
