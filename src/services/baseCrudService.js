import { toCommand } from '@/services/contracts'
// frontend/src/services/baseCrudService.js
import apiClient from './apiClient'
import { unwrapResponse } from './apiClient'

/**
 * Creates a basic CRUD service for a given resource URL.
 * Ensures trailing slashes to match Django's URL patterns.
 */
export function createCrudService(resourceUrl, commandKind = null) {
  // Add trailing slash if missing
  const baseUrl = resourceUrl.endsWith('/') ? resourceUrl : `${resourceUrl}/`

  return {
    async getAll(params) {
      const res = await apiClient.get(baseUrl, { params })
      return unwrapResponse(res)
    },
    async getById(id) {
      const res = await apiClient.get(`${baseUrl}${id}/`)
      return unwrapResponse(res)
    },
    async create(data) {
      const res = await apiClient.post(baseUrl, commandKind ? toCommand(commandKind, data) : data)
      return unwrapResponse(res)
    },
    async update(id, data) {
      const res = await apiClient.put(`${baseUrl}${id}/`, commandKind ? toCommand(commandKind, data) : data)
      return unwrapResponse(res)
    },
    async delete(id, version) {
      const res = await apiClient.delete(`${baseUrl}${id}/`, { data: { version } })
      return unwrapResponse(res)
    }
  }
}