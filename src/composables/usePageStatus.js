import { ref } from 'vue'

export function usePageStatus() {
  const status = ref('loading')

  function setLoading() { status.value = 'loading' }
  function setEmpty() { status.value = 'empty' }
  function setError() { status.value = 'error' }
  function setContent() { status.value = 'content' }

  return { status, setLoading, setEmpty, setError, setContent }
}