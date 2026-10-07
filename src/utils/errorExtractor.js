// frontend/src/utils/errorExtractor.js

/**
 * Extract a user-friendly error string from an API error response.
 * Handles structured error format from backend.
 */
export function extractApiErrors(error) {
  const data = error?.response?.data
  if (!data) return null

  // New structured format: { error: { code, message, errors? } }
  const errorObj = data?.error
  if (errorObj) {
    const message = errorObj.message
    if (typeof message === 'string' && message.trim()) {
      return message.trim()
    }
    if (errorObj.errors) {
      const messages = Object.values(errorObj.errors).flat()
      if (messages.length) return messages.join('؛ ')
    }
  }

  // Legacy formats (for backward compatibility)
  const formErrors = data?.errors?.form
  if (Array.isArray(formErrors) && formErrors.length) {
    return formErrors.join('؛ ')
  }

  const message = data?.error?.message || data?.error
  if (typeof message === 'string' && message.trim()) {
    return message.trim()
  }
  if (Array.isArray(message) && message.length) {
    return message.join('؛ ')
  }

  if (typeof data === 'string') return data
  if (Array.isArray(data) && data.length) return data.join('؛ ')

  return null
}