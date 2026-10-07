<!-- frontend/src/components/scales/ScaleRenderer.vue -->
<template>
  <div>
    <div class="form-section-header mt-3">
      <Icon
        icon="chart-line"
        class="text-primary"
      /> المقاييس
    </div>
    <div id="scalesContainer">
      <div
        v-for="(scale, idx) in scales"
        :key="scale.scale_id || idx"
        class="card mb-3 p-3 scale-entry"
      >
        <div class="flex flex--justify-between mb-3">
          <strong>{{ scale.name }}</strong>
          <button
            class="btn btn--danger btn--small"
            @click="$emit('remove-scale', idx)"
          >
            إزالة
          </button>
        </div>
        <div class="grid-2">
          <div
            v-for="field in scale.fields"
            :key="field.id"
            class="form-group"
          >
            <ScoreInput
              v-if="field.field_type === 'slider'"
              type="slider"
              :model-value="field.value"
              :label="field.label"
              :min="field.min_val || 0"
              :max="field.max_val || 10"
              :step="field.step || 1"
              :disabled="false"
              @update:model-value="onFieldUpdate(idx, field, $event)"
            />
            <div v-else>
              <label :for="`scale-field-${field.id || idx}`">{{ field.label }}</label>
              <input
                :id="`scale-field-${field.id || idx}`"
                :value="field.value"
                class="form-control"
                @input="onFieldUpdate(idx, field, $event.target.value)"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
    <button
      class="btn btn--secondary btn--small mt-2"
      @click="$emit('add-scale')"
    >
      + إضافة مقياس
    </button>
  </div>
</template>

<script setup>
import Icon from '@/components/ui/Icon.vue'
import ScoreInput from '@/components/ui/ScoreInput.vue'

defineProps({
  scales: { type: Array, required: true }
})

const emit = defineEmits(['add-scale', 'remove-scale', 'update-field'])

function onFieldUpdate(scaleIndex, field, value) {
  emit('update-field', { scaleIndex, fieldId: field.id, value })
}
</script>
