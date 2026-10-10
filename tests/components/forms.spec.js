import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, nextTick } from 'vue'
import { useForm } from '@/composables/useForm'
import { firstNameRule, surnameRule, phoneRule, nationalIdRule } from '@/utils/validationRules'
import PatientFormDemographics from '@/features/patients/components/PatientFormDemographics.vue'
import { registerOverlay, hasActiveOverlay } from '@/services/overlayStack'

function formHarness(data, schema) {
  let form
  const wrapper = mount(defineComponent({ setup() { form = useForm(data, { schema }); return () => null } }))
  return { wrapper, form }
}
describe('real VeeValidate forms', () => {
  it('rule factories validate distinct required fields and optional identifiers', async () => {
    const { form } = formHarness({ first_name: '', surname: '', phone: '', national_id: '' },
      [firstNameRule(), surnameRule(), phoneRule(), nationalIdRule()])
    expect(await form.validate()).toBe(false)
    expect(Object.keys(form.errors.value)).toEqual(expect.arrayContaining(['first_name', 'surname']))
    form.form.first_name = 'عربي'; form.form.surname = 'اصطناعي'
    await nextTick()
    expect(await form.validate()).toBe(true)
    form.form.national_id = 'invalid'; await nextTick()
    expect(await form.validate()).toBe(false)
    expect(form.errors.value.national_id).toBeTruthy()
  })
  it('required tests reject whitespace, null and empty arrays', async () => {
    for (const value of ['   ', null, []]) {
      const { wrapper, form } = formHarness({ value }, [{ field: 'value', required: true }])
      expect(await form.validate()).toBe(false)
      wrapper.unmount()
    }
  })
  it('server errors can be set and cleared without modifying read-only state', async () => {
    const { form } = formHarness({ name: 'initial' }, [])
    form.setFieldError('name', 'conflict'); await flushPromises()
    expect(form.errors.value.name).toBe('conflict')
    form.clearErrors(); await flushPromises()
    expect(form.errors.value).toEqual({})
  })
  it('reset returns to the original snapshot and clears edited values', async () => {
    const { form } = formHarness({ name: 'initial', nested: { value: 2 } }, [])
    form.form.name = 'edited'; form.form.nested.value = 8
    await nextTick(); form.resetForm(); await flushPromises()
    expect(form.form).toEqual({ name: 'initial', nested: { value: 2 } })
  })
  it('demographic inputs require names and keep gender/year/phone optional', () => {
    const wrapper = mount(PatientFormDemographics, { props: {
      form: { first_name: '', surname: '', gender: '', dob_year: '', phone: '', marital_status: '' },
      errors: {}, fieldStates: {}, genderOptions: [], yearOptions: [], maritalStatusOptions: [],
    } })
    expect(wrapper.findAll('input[required]')).toHaveLength(2)
    expect(wrapper.findAll('select[required]')).toHaveLength(0)
    expect(wrapper.get('input[type="tel"]').attributes('dir')).toBe('ltr')
  })
})
describe('overlay ownership', () => {
  it('priority controls Escape, nested inert state, scroll lock and focus restoration', () => {
    document.body.innerHTML = '<button id="opener">Open</button><div id="low" tabindex="-1"></div><div id="high" tabindex="-1"></div>'
    const opener = document.querySelector('#opener'), low = document.querySelector('#low'), high = document.querySelector('#high')
    opener.focus()
    const closeLow = vi.fn(), closeHigh = vi.fn()
    const releaseLow = registerOverlay({ element: low, close: closeLow })
    const releaseHigh = registerOverlay({ element: high, close: closeHigh, priority: 2000 })
    try {
      expect(hasActiveOverlay()).toBe(true)
      expect(document.body.style.overflow).toBe('hidden')
      expect(low.inert).toBe(true)
      expect(high.inert).not.toBe(true)
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      expect(closeHigh).toHaveBeenCalledOnce()
      expect(closeLow).not.toHaveBeenCalled()
      releaseHigh()
      expect(document.activeElement).toBe(low)
      expect(low.inert).not.toBe(true)
      releaseLow()
      expect(document.activeElement).toBe(opener)
      expect(document.body.style.overflow).toBe('')
      expect(hasActiveOverlay()).toBe(false)
    } finally { releaseHigh(); releaseLow() }
  })
})
