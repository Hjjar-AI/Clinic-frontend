<template>
  <div class="user-permissions">
    <PageHeader :title="`صلاحيات المستخدم: ${user?.full_name || user?.username}`" />
    <BaseCard>
      <div class="card__body">
        <div
          v-if="loading"
          class="text-center py-4"
        >
          <Icon
            icon="spinner"
            spin
          />
        </div>
        <form
          v-else
          @submit.prevent="savePermissions"
        >
          <DataTable
            :columns="columns"
            :items="permissionRows"
            :loading="false"
            empty-title="لا توجد صلاحيات"
          >
            <template #description="{ item }">
              {{ item.description }}
            </template>
            <template #name="{ item }">
              {{ item.name }}
            </template>
            <template #checkbox="{ item }">
              <label class="checkbox">
                <input
                  v-model="selectedPerms"
                  type="checkbox"
                  :value="item.name"
                  :disabled="item.inherited"
                  class="checkbox__input"
                  :aria-label="`${item.description || item.name}${item.inherited ? ' (موروثة)' : ''}`"
                >
              </label>
            </template>
          </DataTable>

          <div class="flex flex--gap-2 mt-3">
            <BaseButton
              type="submit"
              variant="primary"
              :loading="saving"
            >
              <Icon icon="save" /> حفظ الصلاحيات
            </BaseButton>
            <BaseButton
              variant="secondary"
              to="/users"
            >
              إلغاء
            </BaseButton>
          </div>
        </form>
      </div>
    </BaseCard>
  </div>
</template>

<script setup>
import { computed, onMounted,ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import DataTable from '@/components/ui/DataTable.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useApi } from '@/composables/useApi'
import userService from '@/features/settings/services/userService'
import { unwrapResponse } from '@/services/apiClient'

const route = useRoute()
const router = useRouter()

const userId = route.params.id

const user = ref(null)
const loading = ref(true)

const selectedPerms = ref([])
const allPermissions = ref([])
const inheritedPerms = ref([])
const permissionVersion = ref(1)

const columns = [
  { key: 'description', label: 'الصلاحية' },
  { key: 'name', label: 'المعرف' },
  { key: 'checkbox', label: 'مسموح' },
]

const permissionRows = computed(() => {
  return allPermissions.value.map((permission) => ({
    name: permission.codename,
    description: permission.label,
    inherited: inheritedPerms.value.includes(permission.codename),
  }))
})

onMounted(async () => {
  try {
    const userResult = await userService.getById(userId)
    const permissionsResult = await userService.getPermissions(userId)

    const userData = unwrapResponse(userResult)
    const permissionsData = unwrapResponse(permissionsResult)

    user.value = userData

    allPermissions.value = permissionsData?.all_permissions || []
    selectedPerms.value = permissionsData?.current_permissions || []
    inheritedPerms.value = permissionsData?.inherited_permissions || []
    permissionVersion.value = permissionsData?.version || userData?.version || 1
  } catch {
    user.value = null
    allPermissions.value = []
    selectedPerms.value = []
  } finally {
    loading.value = false
  }
})

const { loading: saving, execute: doSave } = useApi(async () => {
  await userService.updatePermissions(userId, {
    permissions: selectedPerms.value,
    version: permissionVersion.value,
  })

  router.push('/users')
})

const savePermissions = () => doSave()
</script>
