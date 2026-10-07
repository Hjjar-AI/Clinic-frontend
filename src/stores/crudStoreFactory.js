// frontend/src/stores/crudStoreFactory.js
import { defineStore } from 'pinia';
import { ref } from 'vue';

function extractPayload(response) {
  return response?.data?.data ?? response?.data ?? response;
}

function extractList(response, listKey) {
  const payload = extractPayload(response);

  if (!payload) return [];

  if (Array.isArray(payload)) return payload;

  const list = payload.items || payload[listKey || 'items'] || payload.results || payload.data || [];

  return Array.isArray(list) ? list : [];
}

export function createCrudStore(storeId, config) {
  const { extensions = {} } = config;

  return defineStore(storeId, () => {
    const items = ref([]);
    const current = ref(null);
    const loading = ref(false);
    const error = ref(null);

    async function fetchAll(params = {}) {
      loading.value = true;
      error.value = null;

      try {
        const response = await config.fetchAll(params);
        items.value = extractList(response, config.listKey);
        return items.value;
      } catch (e) {
        error.value = e.message || 'خطأ في التحميل';
        throw e;
      } finally {
        loading.value = false;
      }
    }

    async function fetchOne(id, ...args) {
      if (!config.fetchOne) return null;

      loading.value = true;
      error.value = null;

      try {
        const response = await config.fetchOne(id, ...args);
        current.value = extractPayload(response);
        return current.value;
      } catch (e) {
        error.value = e.message || 'خطأ في التحميل';
        throw e;
      } finally {
        loading.value = false;
      }
    }

    async function create(payload) {
      loading.value = true;
      error.value = null;

      try {
        const response = await config.create(payload);
        const newItem = extractPayload(response);

        if (newItem && newItem.id !== undefined) {
          items.value.push(newItem);
        }

        return newItem;
      } catch (e) {
        error.value = e.message || 'خطأ في الحفظ';
        throw e;
      } finally {
        loading.value = false;
      }
    }

    async function update(id, payload) {
      loading.value = true;
      error.value = null;

      try {
        const response = await config.update(id, payload);
        const updatedItem = extractPayload(response);

        const index = items.value.findIndex((item) => item.id === id);

        if (index !== -1) {
          items.value[index] = updatedItem;
        }

        if (current.value?.id === id) {
          current.value = updatedItem;
        }

        return updatedItem;
      } catch (e) {
        error.value = e.message || 'خطأ في التحديث';
        throw e;
      } finally {
        loading.value = false;
      }
    }

    async function remove(id) {
      loading.value = true;
      error.value = null;

      try {
        await config.remove(id);

        items.value = items.value.filter((item) => item.id !== id);

        if (current.value?.id === id) {
          current.value = null;
        }
      } catch (e) {
        error.value = e.message || 'خطأ في الحذف';
        throw e;
      } finally {
        loading.value = false;
      }
    }

    const rawState = extensions.state || {};
    const extraState = typeof rawState === 'function' ? rawState() : rawState;

    const extraGetters = extensions.getters || {};
    const extraActions = extensions.actions || {};
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
    };
    const setupExtensions = extensions.setup?.(baseStore) || {};

    return {
      ...baseStore,
      ...setupExtensions,
    };
  });
}
