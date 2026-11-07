/** No request data, error messages or headers are sent to the console. */
export function reportError(operation, error) {
  const status = error?.response?.status
  console.error('[Clinic error]', { operation, ...(Number.isInteger(status) ? { status } : {}) })
}
