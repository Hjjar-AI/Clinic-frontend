// frontend/src/features/visits/stores/visits.js
import visitService from '@/features/visits/services/visitService'
import { createCrudStore } from '@/stores/crudStoreFactory'

export const useVisitStore = createCrudStore('visits', {
  fetchAll: (params) => visitService.getByPatient(params.patientId),
  fetchOne: (id, include) => visitService.getById(id, include),
  create: (payload) => visitService.create(payload.patientId, payload),
  update: (id, payload) => visitService.update(id, payload),
  remove: (id) => visitService.delete(id),
  listKey: 'visits',
  extensions: {
    actions: {
      async createVisit(patientId, payload) {
        const newItem = await visitService.create(patientId, payload)
        this.items.push(newItem)
        return newItem
      },
      async updateVisit(id, payload) {
        const updatedItem = await visitService.update(id, payload)
        const idx = this.items.findIndex(i => i.id === id)
        if (idx !== -1) this.items[idx] = updatedItem
        if (this.current?.id === id) this.current = updatedItem
        return updatedItem
      },
      async fetchVisit(id, include = '') {
        return this.fetchOne(id, include)
      },
    },
  },
})