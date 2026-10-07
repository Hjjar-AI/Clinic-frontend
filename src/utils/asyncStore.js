// frontend/src/utils/asyncStore.js
// Lightweight helper for stores that need loading/error state on async actions.
// Stores may import this directly (utils layer).

export function withAsyncState(state) {
  state.loading = false
  state.error = null

  function setLoading() {
    state.loading = true
    state.error = null
  }

  function setError(message) {
    state.loading = false
    state.error = message || 'خطأ غير متوقع'
  }

  function setSuccess() {
    state.loading = false
    state.error = null
  }

  return { setLoading, setError, setSuccess }
}