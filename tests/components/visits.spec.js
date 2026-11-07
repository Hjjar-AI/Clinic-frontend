import { it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import VisitsList from '@/features/visits/views/VisitsList.vue'
import visitService from '@/features/visits/services/visitService'
import { useAuthStore } from '@/features/auth/stores/auth'
import { useConfirmStore } from '@/stores/confirm'
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


it('one checkbox confirmation archives with the version from the displayed visit row', async () => {
  useAuthStore().user = { id: 1, role: 'admin', permissions: ['view_visits', 'delete_visit'] }
  let rows = [{ id: 7, version: 4, patient: { id: 9, full_name: 'Synthetic archive patient' }, status: 'draft', visit_date: '2026-10-12' }]
  vi.spyOn(visitService, 'getAll').mockImplementation(async () => ({ items: rows, meta: { total: rows.length } }))
  const remove = vi.spyOn(visitService, 'delete').mockImplementation(async () => { rows = [] })
    .mockRejectedValueOnce(new Error('Synthetic unavailable write'))
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/visits', component: VisitsList },
    { path: '/patients/:id', name: 'PatientDetail', component: { template: '<div />' } },
    { path: '/visits/:id', name: 'VisitDetail', component: { template: '<div />' } },
  ] })
  await router.push('/visits')
  const wrapper = mount({ template: '<RouterView />' }, { global: { plugins: [router] } })
  await flushPromises()
  await wrapper.get('button[title="أرشفة المسودة"]').trigger('click')
  const confirmation = useConfirmStore()
  expect(confirmation.active.options.requireCheckbox).toBe(true)
  expect(remove).not.toHaveBeenCalled()
  confirmation.onCancel()
  await flushPromises()
  expect(remove).not.toHaveBeenCalled()
  await wrapper.get('button[title="أرشفة المسودة"]').trigger('click')
  confirmation.onConfirm()
  await flushPromises()
  expect(remove).toHaveBeenCalledExactlyOnceWith(7, 4)
  expect(confirmation.active).toBeNull()
  expect(wrapper.get('tbody').text()).toContain('Synthetic archive patient')
  await wrapper.get('button[title="أرشفة المسودة"]').trigger('click')
  confirmation.onConfirm()
  await flushPromises()
  expect(remove).toHaveBeenCalledTimes(2)
  expect(remove).toHaveBeenLastCalledWith(7, 4)
  expect(confirmation.active).toBeNull()
  expect(wrapper.get('tbody').text()).not.toContain('Synthetic archive patient')
})
