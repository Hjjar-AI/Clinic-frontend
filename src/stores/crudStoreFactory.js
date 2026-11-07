// frontend/src/stores/crudStoreFactory.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

import { unwrapResponse } from '@/services/apiClient'
import { sessionGeneration } from '@/services/sessionState'
import { normalizeCursorResponse } from '@/utils/cursorResponse'

export function createCrudStore(storeId, config) {
  const { extensions = {} } = config

  return defineStore(storeId, () => {
    const items = ref([])
    const current = ref(null)
    const loading = ref(false)
    const error = ref(null)

    async function fetchAll(params = {}) {
      const epoch = sessionGeneration()
      loading.value = true
      error.value = null

      try {
        const response = await config.fetchAll(params)
        items.value = normalizeCursorResponse(response, {
          keys: ['items', config.listKey || 'items', 'results', 'data'],
        }).items
        return items.value
      } catch (e) {
        if (epoch !== sessionGeneration()) throw e
        error.value = e.message || 'خطأ في التحميل'
        throw e
      } finally {
        if (epoch === sessionGeneration()) loading.value = false
      }
    }

    async function fetchOne(id, ...args) {
      const epoch = sessionGeneration()
      if (!config.fetchOne) return null

      loading.value = true
      error.value = null

      try {
        const response = await config.fetchOne(id, ...args)
        current.value = unwrapResponse(response)
        return current.value
      } catch (e) {
        if (epoch !== sessionGeneration()) throw e
        error.value = e.message || 'خطأ في التحميل'
        throw e
      } finally {
        if (epoch === sessionGeneration()) loading.value = false
      }
    }

    async function create(payload) {
      const epoch = sessionGeneration()
      loading.value = true
      error.value = null

      try {
        const response = await config.create(payload)
        const newItem = unwrapResponse(response)

        if (newItem && newItem.id !== undefined) {
          items.value.push(newItem)
        }

        return newItem
      } catch (e) {
        if (epoch !== sessionGeneration()) throw e
        error.value = e.message || 'خطأ في الحفظ'
        throw e
      } finally {
        if (epoch === sessionGeneration()) loading.value = false
      }
    }

    async function update(id, payload) {
      const epoch = sessionGeneration()
      loading.value = true
      error.value = null

      try {
        const response = await config.update(id, payload)
        const updatedItem = unwrapResponse(response)

        const index = items.value.findIndex((item) => item.id === id)

        if (index !== -1) {
          items.value[index] = updatedItem
        }

        if (current.value?.id === id) {
          current.value = updatedItem
        }

        return updatedItem
      } catch (e) {
        if (epoch !== sessionGeneration()) throw e
        error.value = e.message || 'خطأ في التحديث'
        throw e
      } finally {
        if (epoch === sessionGeneration()) loading.value = false
      }
    }

    async function remove(id) {
      const epoch = sessionGeneration()
      loading.value = true
      error.value = null

      try {
        await config.remove(id)

        items.value = items.value.filter((item) => item.id !== id)

        if (current.value?.id === id) {
          current.value = null
        }
      } catch (e) {
        if (epoch !== sessionGeneration()) throw e
        error.value = e.message || 'خطأ في الحذف'
        throw e
      } finally {
        if (epoch === sessionGeneration()) loading.value = false
      }
    }

    const rawState = extensions.state || {}
    const extraState = typeof rawState === 'function' ? rawState() : rawState

    const extraGetters = extensions.getters || {}
    const extraActions = extensions.actions || {}
    const baseStore = {
      items,
      current,
      loading,
      error,
      fetchAll,
      fetchOne,
      create,
      update,
      remove,
      ...extraState,
      ...extraGetters,
      ...extraActions,
    }
    const setupExtensions = extensions.setup?.(baseStore) || {}

    return {
      ...baseStore,
      ...setupExtensions,
    }
  })
}
