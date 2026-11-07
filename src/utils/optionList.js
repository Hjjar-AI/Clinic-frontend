import { unwrapResponse } from '@/services/apiClient'

export function optionList(response) {
  const payload = unwrapResponse(response)
  if (Array.isArray(payload)) return payload
  for (const key of [
    'items',
    'results',
    'patients',
    'visits',
    'users',
    'doctors',
    'diagnoses',
    'medications',
    'scales',
    'templates',
  ])
    if (Array.isArray(payload?.[key])) return payload[key]
  throw new Error('Invalid options response')
}
