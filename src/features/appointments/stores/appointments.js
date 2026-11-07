// frontend/src/features/appointments/stores/appointments.js
import appointmentService from '@/features/appointments/services/appointmentService'
import { createCrudStore } from '@/stores/crudStoreFactory'

export const useAppointmentStore = createCrudStore('appointments', {
  fetchAll: (params) => appointmentService.getAll(params),
  fetchOne: (id) => appointmentService.getById(id),
  create: (payload) => appointmentService.create(payload),
  update: (id, payload) => appointmentService.update(id, payload),
  remove: (id) => appointmentService.delete(id),
  listKey: 'appointments',
  extensions: {
    actions: {
      async fetchCalendar(view, date) {
        const data = await appointmentService.getCalendar(view, date)
        this.items = data?.appointments || []
        return data
      },
      // F6: `version` is now required for the backend to accept a reschedule.
      async rescheduleAppointment(id, newDate, newTime, version) {
        await appointmentService.reschedule(id, newDate, newTime, version)
        const apt = this.items.find(a => a.id === id)
        if (apt) {
          apt.appointment_date = newDate
          apt.appointment_time = newTime
          // Keep the local optimistic copy's version in step so a subsequent
          // edit doesn't immediately conflict.
          if (version !== undefined && version !== null) {
            apt.version = version + 1
          }
        }
      },
      async cancelAppointment(id, version) {
        await appointmentService.cancel(id, version)
        const apt = this.items.find(a => a.id === id)
        if (apt) apt.status = 'cancelled'
      },
      async completeAppointment(id, version) {
        await appointmentService.complete(id, version)
        const apt = this.items.find(a => a.id === id)
        if (apt) apt.status = 'completed'
      },
      async fetchAppointment(id) {
        return await appointmentService.getById(id)
      },
      async getAvailability(doctorId, date, duration) {
        const data = await appointmentService.getAvailability(doctorId, date, duration)
        return data?.slots || []
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