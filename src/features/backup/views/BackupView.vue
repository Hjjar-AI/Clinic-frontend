<template>
  <BackupLayout
    :backup-loading="backupLoading"
    :preview-loading="previewLoading"
    :restore-loading="restoreLoading"
    :preview-data="previewData"
    :has-file="!!selectedFile"
    @create-backup="handleCreateBackup"
    @preview-restore="handlePreviewRestore"
    @execute-restore="handleExecuteRestore"
    @file-selected="onFileSelected"
    @preview-reset="resetPreview"
  />
</template>

<script setup>
import { onBeforeUnmount, ref } from 'vue'

import { useApi } from '@/composables/useApi'
import BackupLayout from '@/features/backup/components/BackupLayout.vue'
import backupService from '@/features/backup/services/backupService'
import { unwrapResponse } from '@/services/apiClient'
import { downloadBlob } from '@/utils/download'

let generation = 0
onBeforeUnmount(() => {
  generation += 1
})
const selectedFile = ref(null)
const previewData = ref(null)
const selectedBackupType = ref('full')

function resetPreview() {
  generation += 1
  previewData.value = null
}
function onFileSelected(file) {
  if (restoreLoading.value) return
  selectedFile.value = file
  resetPreview()
}

const { loading: backupLoading, execute: doBackup } = useApi(async () => {
  const res = await backupService.createBackup(selectedBackupType.value)
  downloadBlob(
    new Blob([res.data]),
    selectedBackupType.value === 'json' ? 'backup.json' : 'backup.zip',
  )
})

const handleCreateBackup = (type) => {
  if (backupLoading.value) return
  selectedBackupType.value = type
  doBackup().catch(() => {})
}

const { loading: previewLoading, execute: doPreview } = useApi(async () => {
  if (!selectedFile.value) return
  const request = generation
  const file = selectedFile.value,
    options = { ...restoreOptions.value }
  const response = await backupService.previewRestore(file, options)
  if (request === generation) previewData.value = unwrapResponse(response)
})

const handlePreviewRestore = (options) => {
  if (restoreLoading.value) return
  resetPreview()
  restoreOptions.value = { ...options }
  doPreview().catch(() => {})
}

const restoreOptions = ref(null)
const { loading: restoreLoading, execute: doRestore } = useApi(async () => {
  if (!selectedFile.value) return
  await backupService.executeRestore(selectedFile.value, restoreOptions.value)
})

const handleExecuteRestore = (options) => {
  if (
    restoreLoading.value ||
    previewLoading.value ||
    !previewData.value?.preview_token ||
    options.preview_token !== previewData.value.preview_token
  )
    return
  restoreOptions.value = { ...options }
  doRestore().catch(() => {})
}
</script>
