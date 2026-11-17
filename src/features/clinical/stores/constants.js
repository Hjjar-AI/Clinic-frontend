import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import systemService from '@/services/systemService'
import { applyWorkflowChoices } from '@/constants/statusConstants'
import { applyStatusPresentation } from '@/constants/statusPresentation'

export const useConstantsStore = defineStore('constants', () => {
  const data = shallowRef({ record_choices: {} })
  const ready = ref(false), loading = ref(false), error = ref('')
  let promise
  async function fetch() {
    if (ready.value) return data.value
    if (promise) return promise
    loading.value = true; error.value = ''
    promise = (async () => {
      try {
        const [statuses, clinical] = await Promise.all([systemService.statusConstants(), systemService.clinicalConstants()])
        for (const domain of ['appointment', 'visit', 'task', 'invoice']) {
          const choices = statuses?.[`${domain}_status`]
          if (!choices || !Object.keys(choices).length || Object.values(choices).some(choice => !Array.isArray(choice.allowed_transitions))) throw new Error('Invalid workflow metadata')
        }
        for (const key of ['suicide_risk_levels', 'violence_risk_levels', 'level_of_care', 'follow_up_methods', 'marital_status_male', 'marital_status_female']) {
          if (!Array.isArray(clinical?.[key]) || !clinical[key].length) throw new Error('Invalid clinical metadata')
        }
        if (!clinical.record_choices || !statuses.user_roles || !statuses.risk_levels) throw new Error('Missing metadata')
        applyWorkflowChoices(statuses, clinical)
        applyStatusPresentation(statuses)
        data.value = clinical
        ready.value = true
        return clinical
      } catch (failure) { error.value = 'تعذر تحميل خيارات النظام؛ أعد المحاولة قبل متابعة العمل.'; throw failure }
      finally { loading.value = false; promise = null }
    })()
    return promise
  }
  function invalidate() { ready.value = false }
  return { data, ready, loading, error, fetch, invalidate }
})
