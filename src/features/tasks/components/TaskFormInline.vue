<template>
  <BaseCard class="mb-4">
    <CardHeader
      variant="neutral"
      icon="plus-circle"
      title="مهمة جديدة"
    />
    <div class="card__body">
      <form
        class="grid-3 gap-3"
        @submit.prevent="handleAdd"
      >
        <FormInput
          v-model="title"
          label="عنوان المهمة"
          required
          placeholder="عنوان..."
        />
        <!-- Replace raw date input with FormDate -->
        <FormDate
          v-model="dueDate"
          label="تاريخ الاستحقاق"
          required
        />
        <div class="form-group m-0 flex flex--align-end">
          <BaseButton
            type="submit"
            variant="success"
            :loading="adding"
            block
          >
            <Icon icon="save" /> {{ adding ? 'جاري الحفظ...' : 'حفظ' }}
          </BaseButton>
        </div>
      </form>
    </div>
  </BaseCard>
</template>

<script setup>
import { ref } from 'vue'

import CardHeader from '@/components/ui/CardHeader.vue'
import FormDate from '@/components/ui/FormDate.vue'   // ← added import
import FormInput from '@/components/ui/FormInput.vue'
import { useTaskStore } from '@/features/tasks/stores/tasks'

const emit = defineEmits(['task-added'])
const taskStore = useTaskStore()
const title = ref('')
const dueDate = ref('')
const adding = ref(false)

async function handleAdd() {
  if (!title.value.trim()) return
  adding.value = true
  try {
    await taskStore.addTask({ title: title.value, due_date: dueDate.value })
    title.value = ''
    dueDate.value = ''
    emit('task-added')
  } finally {
    adding.value = false
  }
}
</script>