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
          <span class="font-semibold">{{ member.user_name }}</span>
          <Badge
            :status="member.user_role"
            status-type="user"
            size="xs"
            variant="soft"
            class="mr-2"
          />
        </div>
        <BaseButton
          variant="ghost"
          size="xs"
          icon="trash"
          title="إزالة"
          aria-label="إزالة العضو من فريق الرعاية"
          confirm-message="هل أنت متأكد من إزالة هذا العضو؟"
          @confirmed="$emit('remove', member.user)"
        />
      </div>
    </div>
    <EmptyState
      v-else
      type="default"
      title="لا يوجد أعضاء في الفريق"
    />

    <!-- Add form -->
    <div class="care-team-add-row mt-3 flex gap-2 flex--end">
      <ApiSelect
        v-model="newUserId"
        url="/auth/users/doctors/"
        value-key="id"
        label-key="full_name"
        label=""
        placeholder="اختر مستخدم"
        class="flex--1"
      />
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
import { ref } from 'vue'

import ApiSelect from '@/components/ui/ApiSelect.vue'
import Badge from '@/components/ui/Badge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { useNotify } from '@/composables/useNotify'
import patientService from '@/features/patients/services/patientService'

const props = defineProps({
  patientId: { type: Number, required: true },
  version: { type: Number, required: true },
  members: { type: Array, default: () => [] },
})

const emit = defineEmits(['remove', 'added'])

const { notify } = useNotify()
const newUserId = ref(null)
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
