import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import UserForm from '@/features/settings/views/UserForm.vue'
import TemplateForm from '@/features/clinical/views/TemplateForm.vue'
import UserPermissions from '@/features/settings/views/UserPermissions.vue'
import ChangePassword from '@/features/settings/views/ChangePassword.vue'
import userService from '@/features/settings/services/userService'
import templateService from '@/features/clinical/services/templateService'
import { useAuthStore } from '@/features/auth/stores/auth'
import { useConfirmStore } from '@/stores/confirm'

const password = 'Synthetic-Suite-Pass!42'
async function form(component, path) {
  const router = createRouter({ history: createMemoryHistory(), routes: [
    { path: '/users/new', name: 'UserCreate', component: UserForm },
    { path: '/users/:id/edit', component: UserForm },
    { path: '/users/:id/permissions', component: UserPermissions },
    { path: '/users', name: 'Users', component: { template: '<p>Users</p>' } },
    { path: '/templates/new', name: 'TemplateCreate', component: TemplateForm },
    { path: '/templates/:id/edit', component: TemplateForm },
    { path: '/templates', name: 'Templates', component: { template: '<p>Templates</p>' } },
    { path: '/change-password', component: ChangePassword },
    { path: '/login', name: 'Login', component: { template: '<p>Login</p>' } },
  ] })
  await router.push(path)
  const wrapper = mount({ template: '<RouterView />' }, { global: { plugins: [router] }, attachTo: document.body })
  await flushPromises()
  return { wrapper, router }
}
const inputByLabel = (wrapper, label) => {
  const node = wrapper.findAll('label').find(node => node.text().includes(label))
  return wrapper.get(`#${node.attributes('for')}`)
}

describe('user form validation and opening versions', () => {
  it.each(['mismatch', 'empty password', 'empty confirmation', 'empty both', 'short password'])('rejects %s before creating an account', async kind => {
    const create = vi.spyOn(userService, 'create').mockResolvedValue({})
    const { wrapper } = await form(UserForm, '/users/new')
    await inputByLabel(wrapper, 'اسم المستخدم').setValue('synthetic_new')
    const fields = wrapper.findAll('input[type=password]')
    await fields[0].setValue(['empty password', 'empty both'].includes(kind) ? '' : kind === 'short password' ? 'short' : password)
    await fields[1].setValue(['empty confirmation', 'empty both'].includes(kind) ? '' : kind === 'mismatch' ? 'Different-Pass!42' : password)
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(wrapper.find('.alert--danger').exists()).toBe(true))
    expect(create).not.toHaveBeenCalled()
  })

  it('edit sends opening version while omitting untouched password and navigates cleanly', async () => {
    vi.spyOn(userService, 'getById').mockResolvedValue({ id: 71, version: 8, username: 'synthetic', full_name: 'Old name', role: 'doctor' })
    const update = vi.spyOn(userService, 'update').mockResolvedValue({})
    const { wrapper, router } = await form(UserForm, '/users/71/edit')
    await inputByLabel(wrapper, 'الاسم الكامل').setValue('Revised synthetic name')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(update).toHaveBeenCalledWith('71', {
      username: 'synthetic', full_name: 'Revised synthetic name', role: 'doctor', version: 8,
    }))
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('Users'))
    expect(useConfirmStore().active).toBeNull()
  })

  it('rejected edit displays the server message and retains the draft', async () => {
    vi.spyOn(userService, 'getById').mockResolvedValue({ id: 71, version: 8, username: 'synthetic', role: 'doctor' })
    const update = vi.spyOn(userService, 'update').mockRejectedValue({ response: { status: 409, data: { error: { message: 'Synthetic user conflict' } } } })
    const { wrapper, router } = await form(UserForm, '/users/71/edit')
    await inputByLabel(wrapper, 'الاسم الكامل').setValue('Retained name')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(wrapper.text()).toContain('Synthetic user conflict'))
    expect(update).toHaveBeenCalledOnce()
    expect(router.currentRoute.value.path).toBe('/users/71/edit')
    expect(inputByLabel(wrapper, 'الاسم الكامل').element.value).toBe('Retained name')
  })
})

describe('template CRUD content and navigation', () => {
  const record = { id: 31, version: 6, name: 'Synthetic template', category: 'anxiety', description: 'Synthetic',
    content: { mse: 'Old MSE', formulation: { predisposing: 'Old basis', protective: 'Protection' }, risk_notes: 'Risk', treatment_text: 'Treatment', doctor_notes: 'Notes' } }
  it('edit round-trips nested content with its opening version and clears dirty navigation', async () => {
    vi.spyOn(templateService, 'getById').mockResolvedValue(record)
    const update = vi.spyOn(templateService, 'update').mockResolvedValue({})
    const { wrapper, router } = await form(TemplateForm, '/templates/31/edit')
    await inputByLabel(wrapper, 'العوامل المهيئة').setValue('New basis')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(update).toHaveBeenCalledWith('31', expect.objectContaining({
      version: 6, category: 'anxiety', content: expect.objectContaining({
        mse: 'Old MSE', formulation: { predisposing: 'New basis', protective: 'Protection', precipitating: '', perpetuating: '' },
        risk_notes: 'Risk', treatment_text: 'Treatment', doctor_notes: 'Notes',
      }),
    })))
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('Templates'))
    expect(useConfirmStore().active).toBeNull()
  })

  it('rejected update retains edited content and remains on the form', async () => {
    vi.spyOn(templateService, 'getById').mockResolvedValue(record)
    vi.spyOn(templateService, 'update').mockRejectedValue({ response: { status: 409, data: { error: { message: 'Synthetic template conflict' } } } })
    const { wrapper, router } = await form(TemplateForm, '/templates/31/edit')
    await inputByLabel(wrapper, 'اسم القالب').setValue('Keep this template draft')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(wrapper.text()).toContain('Synthetic template conflict'))
    expect(inputByLabel(wrapper, 'اسم القالب').element.value).toBe('Keep this template draft')
    expect(router.currentRoute.value.path).toBe('/templates/31/edit')
  })

  it('dirty route cancellation preserves edits and acceptance completes navigation', async () => {
    const { wrapper, router } = await form(TemplateForm, '/templates/new')
    await inputByLabel(wrapper, 'اسم القالب').setValue('Unsaved synthetic')
    const cancelled = router.push('/templates')
    await flushPromises()
    useConfirmStore().onCancel()
    await cancelled
    expect(router.currentRoute.value.path).toBe('/templates/new')
    expect(inputByLabel(wrapper, 'اسم القالب').element.value).toBe('Unsaved synthetic')
    const accepted = router.push('/templates')
    await flushPromises()
    useConfirmStore().onConfirm()
    await accepted
    expect(router.currentRoute.value.path).toBe('/templates')
  })
})

describe('permission and password forms', () => {
  it('inherited permissions stay disabled while selected grants use the opening permission version', async () => {
    vi.spyOn(userService, 'getById').mockResolvedValue({ id: 71, version: 3, username: 'synthetic' })
    vi.spyOn(userService, 'getPermissions').mockResolvedValue({ version: 9,
      all_permissions: [{ codename: 'view_patients', label: 'Inherited' }, { codename: 'manage_tasks', label: 'Task grant' }],
      current_permissions: ['view_patients'], inherited_permissions: ['view_patients'],
    })
    const update = vi.spyOn(userService, 'updatePermissions').mockResolvedValue({})
    const { wrapper, router } = await form(UserPermissions, '/users/71/permissions')
    expect(wrapper.get('input[aria-label="Inherited (موروثة)"]').element.disabled).toBe(true)
    await wrapper.get('input[aria-label="Task grant"]').setValue(true)
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(update).toHaveBeenCalledWith('71', { permissions: ['view_patients', 'manage_tasks'], version: 9 }))
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/users'))
  })

  it('password mismatch blocks a mutation', async () => {
    const update = vi.spyOn(useAuthStore(), 'changePassword').mockResolvedValue()
    const { wrapper } = await form(ChangePassword, '/change-password')
    const fields = wrapper.findAll('input[type=password]')
    await fields[0].setValue(password)
    await fields[1].setValue('Synthetic-New-Password!94')
    await fields[2].setValue('Different-New-Password!95')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(wrapper.find('.alert--danger').exists()).toBe(true))
    expect(update).not.toHaveBeenCalled()
  })

  it('successful password change clears authentication and navigates to expired-session login', async () => {
    const store = useAuthStore()
    store.user = { id: 71, username: 'user_71' }
    const update = vi.spyOn(store, 'changePassword').mockResolvedValue()
    const { wrapper, router } = await form(ChangePassword, '/change-password')
    const fields = wrapper.findAll('input[type=password]')
    await fields[0].setValue(password)
    await fields[1].setValue('Synthetic-New-Password!94')
    await fields[2].setValue('Synthetic-New-Password!94')
    await wrapper.get('form').trigger('submit')
    await vi.waitFor(() => expect(update).toHaveBeenCalledWith(password, 'Synthetic-New-Password!94'))
    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('Login'))
    expect(store.isAuthenticated).toBe(false)
    expect(router.currentRoute.value.query.session).toBe('expired')
  })
})
