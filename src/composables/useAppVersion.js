import { ref } from 'vue'
import systemService from '@/services/systemService'
const version = ref(''), error = ref('')
export function useAppVersion() {
  async function load() { error.value = ''; try { const payload = await systemService.version(); version.value = payload.version } catch { error.value = 'تعذر تحميل الإصدار' } }
  if (!version.value) load()
  return { version, error, retry: load }
}
