import { it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import VisitsListLayout from '@/features/visits/components/VisitsListLayout.vue'

it('visit rows link to the nested patient ID returned by the API', async () => {
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/visits', component: { template: '<div />' } },
    { path: '/patients/:id', name: 'PatientDetail', component: { template: '<div />' } },
    { path: '/visits/:id', name: 'VisitDetail', component: { template: '<div />' } },
  ] })
  await router.push('/visits')
  const wrapper = mount(VisitsListLayout, { global: { plugins: [router] }, props: {
    columns: [{ key: 'patient_name', label: 'المريض' }], tableFilters: [], filters: {},
    canEdit: false, canDelete: false, canExport: false,
    fetchFn: async () => ({ data: [{ id: 7, patient: { id: 9, full_name: 'مريض اصطناعي' }, status: 'final' }], hasMore: false, nextCursor: null }),
  } })
  await flushPromises()
  expect(wrapper.get('a[href="/patients/9"]').text()).toBe('مريض اصطناعي')
})
