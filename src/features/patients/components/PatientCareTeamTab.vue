<template>
  <div>
    <!-- Current members -->
    <div
      v-if="members.length"
      class="mb-3"
    >
      <div
        v-for="member in members"
        :key="member.id"
        class="flex flex--justify-between flex--center p-2 border-bottom"
      >
        <div>
          <span class="font-semibold">{{ member.user_name }}
          <span v-if="member.ended_at" class="text-muted"> · عضوية سابقة: {{ member.removal_reason }}</span></span>
          <Badge
            :status="member.user_role"
            status-type="user"
            size="xs"
            variant="soft"
            class="mr-2"
          />
          <p class="text-xs text-muted">الدور: {{ roleLabels[member.role] || member.role }} · أضافه: {{ member.assigned_by_name || 'غير مسجل' }} · بدء العضوية: {{ member.started_at }}<span v-if="member.ended_at"> · انتهت: {{ member.ended_at }} · أنهاها: {{ member.ended_by_name || 'غير مسجل' }}</span></p>
        </div>
        <BaseButton
          v-if="!member.ended_at && authStore.can('manage_users')"
          variant="ghost"
          size="xs"
          icon="trash"
          title="إزالة"
          aria-label="إزالة العضو من فريق الرعاية"
          @click="$emit('remove', member.user)"
        />
      </div>
    </div>
    <EmptyState
      v-else
      type="default"
      title="لا يوجد أعضاء في الفريق"
    />

    <!-- Add form -->
    <div v-if="authStore.can('manage_users')" class="care-team-add-row mt-3 flex gap-2 flex--end">
      <select v-model="newUserId" class="form-control" aria-label="عضو فريق الرعاية">
        <option :value="null">اختر عضو الفريق</option>
        <option v-for="user in candidates" :key="user.id" :value="user.id">{{ user.full_name }}</option>
      </select>
      <select
        v-model="newRole"
        class="form-control form-control--select care-team-role-select"

        aria-label="دور عضو فريق الرعاية"
      >
        <option value="doctor">
          طبيب
        </option>
        <option value="nurse">
          ممرض
        </option>
        <option value="therapist">
          معالج
        </option>
        <option value="coordinator">منسق</option>
        <option value="assistant">
          مساعد
        </option>
      </select>
      <BaseButton
        variant="primary"
        size="sm"
        :disabled="!newUserId"
        @click="addMember"
      >
        <Icon icon="plus" /> إضافة
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

import { useAuthStore } from '@/features/auth/stores/auth'
import Badge from '@/components/ui/Badge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useNotify } from '@/composables/useNotify'
import patientService from '@/features/patients/services/patientService'

const props = defineProps({
  patientId: { type: Number, required: true },
  version: { type: Number, required: true },
  members: { type: Array, default: () => [] },
})

const authStore = useAuthStore()
const candidates = ref([])
onMounted(async () => { if (authStore.can('manage_users')) candidates.value = await patientService.getTeamCandidates() })

const emit = defineEmits(['remove', 'added'])

const { notify } = useNotify()
const newUserId = ref(null)
const roleLabels = {doctor:'طبيب',nurse:'ممرض',therapist:'معالج',assistant:'مساعد',coordinator:'منسق'}
const newRole = ref('doctor')

async function addMember() {
  if (!newUserId.value) return
  try {
    await patientService.addCareTeamMember(
      props.patientId,
      newUserId.value,
      newRole.value,
      props.version,
    )
    notify('تمت إضافة العضو', 'success')
    emit('added')
    newUserId.value = null
    newRole.value = 'doctor'
  } catch {
    notify('فشل إضافة العضو', 'danger')
  }
}
</script>
