import { ref } from 'vue'

import { useApi } from '@/composables/useApi'

export function useCatalogEditor({
  defaults,
  hydrate,
  create,
  update,
  invalidate,
}) {
  const modalOpen = ref(false),
    isEditing = ref(false),
    currentId = ref(null)
  const form = ref(defaults()),
    refreshKey = ref(0)
  function refreshList() {
    invalidate()
    refreshKey.value += 1
  }
  function openFormModal(item) {
    isEditing.value = Boolean(item)
    currentId.value = item?.id ?? null
    form.value = item ? { ...hydrate(item), version: item.version } : defaults()
    modalOpen.value = true
  }
  const { loading: saving, execute } = useApi(async () => {
    if (isEditing.value) await update(currentId.value, form.value)
    else await create(form.value)
    modalOpen.value = false
    refreshList()
  })
  function save() {
    return execute().catch(() => {})
  }
  return {
    modalOpen,
    isEditing,
    form,
    refreshKey,
    refreshList,
    openFormModal,
    saving,
    save,
  }
}
