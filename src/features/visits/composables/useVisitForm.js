// frontend/src/features/visits/composables/useVisitForm.js
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { useDate } from '@/composables/useDate'
import { useForm } from '@/composables/useForm'
import { useFormDirty } from '@/composables/useFormDirty'
import { useFormDraft } from '@/composables/useFormDraft'
import { useFormSubmission } from '@/composables/useFormSubmission'
import { useNotify } from '@/composables/useNotify'
import {
  buildVisitCommand,
  createVisitDefaults,
  duplicateVisit,
  hydrateVisit,
  SAFE_DRAFT_FIELDS,
} from '@/features/visits/model/visitForm'
import { useVisitStore } from '@/features/visits/stores/visits'
import { RISK_LEVELS } from '@/utils/riskLevels'
import { visitDateRule } from '@/utils/validationRules'

const schema = [visitDateRule()]

export function useVisitForm({
  getPatientId,
  visitId,
  isEdit,
  getScalePayload = null,
}) {
  const { notify } = useNotify()
  const router = useRouter()
  const visitStore = useVisitStore()
  const { formatDate, calculateAge, parseDate } = useDate()

  // Pass the visit-specific allow-list into useSession. Previously this
  // list was duplicated inside both files and applied unconditionally as
  // a default, which silently stripped drafts for other forms.
  const { draft, restoreDraftToForm, pauseDraft, resumeDraft, clearDraft } =
    useFormDraft({ safeDraftFields: SAFE_DRAFT_FIELDS })

  const patient = ref(null)

  const initial = createVisitDefaults(formatDate(new Date()))
  const { form, errors, fieldStates, isDirty, validate, markClean } = useForm(
    initial,
    {
      formId: 'visitForm',
      schema,
    },
  )

  // Single source of truth for dirty state: the ref returned by useForm.
  useFormDirty(isDirty)

  const ageDisplay = computed(() => {
    if (!form.visit_date || !patient.value?.dob_year) return 'سيتم حسابه'
    const age = calculateAge(patient.value.dob_year, parseDate(form.visit_date))
    return age !== null ? `${age} سنة` : 'سيتم حسابه'
  })

  function hydrateFromData(data) {
    Object.assign(form, hydrateVisit(data))
    markClean()
  }

  function hydrateDuplicateFromData(data) {
    hydrateFromData(data)
    Object.assign(form, duplicateVisit(data, formatDate(new Date())))
  }

  const riskOptions = computed(() => [
    { value: '', label: 'غير مقيم' },
    ...Object.entries(RISK_LEVELS)
      .filter(([key]) => key !== 'null')
      .map(([key, val]) => ({ value: key, label: val.label })),
  ])

  function buildPayload() {
    return buildVisitCommand(form, getScalePayload)
  }

  const execute = async () => {
    const payload = buildPayload()
    if (isEdit) {
      payload.version = form.version
      await visitStore.updateVisit(visitId, payload)
    } else {
      await visitStore.createVisit(getPatientId(), payload)
    }
    markClean()
    notify('تم حفظ الزيارة', 'success')
    router.push({ name: 'PatientDetail', params: { id: getPatientId() } })
  }

  const { submit, submitError, isSubmitting } = useFormSubmission(
    validate,
    execute,
  )

  async function handleSubmit() {
    pauseDraft()
    const success = await submit()
    if (success) {
      clearDraft()
      markClean()
    }
    resumeDraft()
    return success
  }

  function cancel() {
    router.push({ name: 'PatientDetail', params: { id: getPatientId() } })
  }

  const stopDraftWatcher = watch(
    () => form,
    (val) => {
      draft.value = val
    },
    { deep: true, immediate: true },
  )
  onBeforeUnmount(() => {
    stopDraftWatcher()
  })

  return {
    form,
    errors,
    fieldStates,
    isDirty,
    validate,
    ageDisplay,
    hydrateFromData,
    hydrateDuplicateFromData,
    patient,
    riskOptions,
    isSubmitting,
    submitError,
    handleSubmit,
    cancel,
    draft,
    restoreDraftToForm,
    SAFE_DRAFT_FIELDS,
    // Kept as an alias for backward compatibility with callers that still
    // destructure it. New code should call `markClean()` on the form.
    resetFormDirty: markClean,
    clearDraft,
    pauseDraft,
    resumeDraft,
  }
}
