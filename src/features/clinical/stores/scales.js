// frontend/src/features/clinical/stores/scales.js
import scaleService from '@/features/clinical/services/scaleService'
import { createCrudStore } from '@/stores/crudStoreFactory'

export const useScaleStore = createCrudStore('scales', {
  fetchAll: () => scaleService.getAll(),
  fetchOne: (id) => scaleService.getById(id),
  create: (payload) => scaleService.create(payload),
  update: undefined,
  remove: (id) => scaleService.delete(id),
  listKey: 'scales',
  extensions: {
    state: () => ({ customLoading: false }),
    actions: {
      async fetchScales() { return this.fetchAll() },
      async fetchScale(id) { return this.fetchOne(id) },
      reset() {
        this.items = []
        this.current = null
        this.loading = false
        this.error = null
      },
    },
  },
})