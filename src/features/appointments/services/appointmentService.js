// frontend/src/features/appointments/services/appointmentService.js
import apiClient from '@/services/apiClient'
import { unwrapResponse } from '@/services/apiClient'
import { createCrudService } from '@/services/baseCrudService'

const base = createCrudService('/appointments')

export default {
  ...base,
  async getCalendar(view, date, doctorId) {
    const res = await apiClient.get('/appointments/calendar', { params: { view, date, doctor_id: doctorId } })
    return unwrapResponse(res)
  },
  async cancel(id, version) {
    const body = version !== undefined ? { version } : {}
    const res = await apiClient.put(`/appointments/${id}/cancel/`, body)
    return unwrapResponse(res)
  },
  async complete(id, version) {
    const body = version !== undefined ? { version } : {}
    const res = await apiClient.put(`/appointments/${id}/complete/`, body)
    return unwrapResponse(res)
  },
  async reschedule(id, date, time, version) {
    // F6: backend requires `version` for optimistic locking; without it the
    // reschedule endpoint always returned 400. Callers must pass it.
    const body = { date, time }
    if (version !== undefined && version !== null) {
      body.version = version
    }
    const res = await apiClient.put(`/appointments/${id}/reschedule/`, body)
    return unwrapResponse(res)
  },
  async getAvailability(doctorId, date, duration) {
    const res = await apiClient.get('/appointments/availability', { params: { doctor_id: doctorId, date, duration } })
    return unwrapResponse(res)
  },
  async getByPatient(patientId, params = {}) {
    const query = { patient_id: patientId, ...params }
    const res = await apiClient.get('/appointments', { params: query })
    return unwrapResponse(res)
  }
}