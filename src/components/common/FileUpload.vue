<!-- frontend/src/components/common/FileUpload.vue -->
<template>
  <div
    class="file-upload-zone"
    :class="{ 'drag-over': isDragging }"
    role="button"
    tabindex="0"
    aria-label="رفع ملف"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop.prevent="onDrop"
    @click="openFileDialog"
    @keydown.enter.prevent="openFileDialog"
    @keydown.space.prevent="openFileDialog"
  >
    <label
      class="visually-hidden"
      :for="fileInputId"
    >
      اختيار ملف
      <input
        :id="fileInputId"
        ref="fileInput"
        type="file"
        :accept="accept"
        class="visually-hidden"
        @change="onFileSelect"
      >
    </label>
    <div class="upload-zone-content">
      <Icon
        icon="upload"
        class="text-3xl text-primary mb-2"
      />
      <p class="text-base font-semibold text-primary mb-1">
        {{ instructions }}
      </p>
      <p class="text-xs text-muted">
        أو انقر هنا لاختيار ملف
      </p>
      <p class="text-xs text-muted">
        {{ accept || 'كل الصيغ المسموحة' }} • حد أقصى {{ maxSizeMb }} MB
      </p>
    </div>
    <div
      v-if="file"
      class="mt-3 p-3 bg-surface rounded"
    >
      <div class="flex flex--justify-between text-xs">
        <span class="font-semibold">{{ file.name }}</span>
        <span>{{ formattedSize }}</span>
      </div>
      <ProgressBar
        v-if="uploading"
        :percent="progress"
        label=""
        show-percent
      />
      <div
        v-if="uploadComplete"
        class="text-xs text-success mt-1"
      >
        ✓ تم الرفع بنجاح
      </div>
      <div
        v-else-if="file && !autoUpload && !uploading"
        class="text-xs text-success mt-1"
      >
        ✓ تم اختيار الملف
      </div>
      <div
        v-if="uploadError"
        class="text-xs text-danger mt-1"
      >
        {{ uploadError }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed,ref, useId } from 'vue'

import Icon from '@/components/ui/Icon.vue'
import ProgressBar from '@/components/ui/Progress.vue'
import apiClient from '@/services/apiClient'

const props = defineProps({
  accept: { type: String, default: '' },
  instructions: { type: String, default: 'اسحب وأفلت الملف هنا' },
  uploadUrl: { type: String, default: '/upload' },
  extraFields: { type: Object, default: () => ({}) },
  autoUpload: { type: Boolean, default: true },
  maxSizeMb: { type: Number, default: 10 },
})
const emit = defineEmits(['upload', 'select'])
const fileInputId = useId()

const fileInput = ref(null)
const file = ref(null)
const progress = ref(0)
const isDragging = ref(false)
const uploading = ref(false)
const uploadComplete = ref(false)
const uploadError = ref('')

const formattedSize = computed(() => {
  if (!file.value) return ''
  const kb = file.value.size / 1024
  return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(1)} MB`
})

function openFileDialog() { fileInput.value.click() }
function onFileSelect(e) { const f = e.target.files[0]; if (!f) return; startUpload(f) }
function onDrop(e) { isDragging.value = false; const f = e.dataTransfer.files[0]; if (!f) return; startUpload(f) }

function startUpload(f) {
  if (f.size > props.maxSizeMb * 1024 * 1024) {
    file.value = f
    uploadComplete.value = false
    uploading.value = false
    uploadError.value = `حجم الملف يتجاوز ${props.maxSizeMb} MB.`
    emit('select', null)
    return
  }
  file.value = f; progress.value = 0; uploadComplete.value = false; uploadError.value = ''
  emit('select', f)
  if (!props.autoUpload) return
  uploading.value = true
  const formData = new FormData(); formData.append('file', f)
  Object.entries(props.extraFields || {}).forEach(([key,value]) => { formData.append(key, value) })
  // No manual Content-Type; Axios will set multipart boundary automatically.
  apiClient.post(props.uploadUrl, formData, {
    onUploadProgress: (e) => { if (e.total) progress.value = Math.round((e.loaded * 100) / e.total) }
  })
  .then((response) => {
    uploading.value = false
    uploadComplete.value = true
    const data = response.data?.data || response.data
    emit('upload', data)
  })
  .catch(() => { uploading.value = false; uploadError.value = 'فشل الرفع – الرجاء المحاولة مرة أخرى.' })
}
</script>
