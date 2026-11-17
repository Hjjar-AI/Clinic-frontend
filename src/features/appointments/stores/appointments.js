// frontend/src/features/appointments/stores/appointments.js
import appointmentService from '@/features/appointments/services/appointmentService'
import { createCrudStore } from '@/stores/crudStoreFactory'

export const useAppointmentStore = createCrudStore('appointments', {
  fetchAll: (params) => appointmentService.getAll(params),
  fetchOne: (id) => appointmentService.getById(id),
  create: (payload) => appointmentService.create(payload),
  update: (id, payload) => appointmentService.update(id, payload),
  remove: (id, version) => appointmentService.delete(id, version),
  listKey: 'appointments',
  extensions: {
    actions: {
      async fetchCalendar(view, date) {
        const data = await appointmentService.getCalendar(view, date)
        this.items = data?.items || []
        return data
      },
      // F6: `version` is now required for the backend to accept a reschedule.
      async rescheduleAppointment(id, newDate, newTime, version) {
        const updated = await appointmentService.reschedule(id, newDate, newTime, version)
        const apt = this.items.find(a => a.id === id)
        if (apt) Object.assign(apt, updated)
      },
      async cancelAppointment(id, version) {
        const updated = await appointmentService.cancel(id, version)
        const apt = this.items.find(a => a.id === id)
        if (apt) Object.assign(apt, updated)
      },
      async completeAppointment(id, version) {
        const updated = await appointmentService.complete(id, version)
        const apt = this.items.find(a => a.id === id)
        if (apt) Object.assign(apt, updated)
      },
      async fetchAppointment(id) {
        return await appointmentService.getById(id)
      },
      async getAvailability(doctorId, date, duration) {
        const data = await appointmentService.getAvailability(doctorId, date, duration)
        return data?.items || []
      },
      async createAppointment(payload) {
        return this.create(payload)
      },
      async updateAppointment(id, payload) {
        return this.update(id, payload)
      },
    },
  },
})