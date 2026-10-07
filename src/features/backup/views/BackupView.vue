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
  />
</template>

<script setup>
import { ref } from 'vue'

import { useApi } from '@/composables/useApi'
import BackupLayout from '@/features/backup/components/BackupLayout.vue'
import backupService from '@/features/backup/services/backupService'
import { unwrapResponse } from '@/services/apiClient'

const selectedFile = ref(null)
const previewData = ref(null)
const selectedBackupType = ref('full')

function onFileSelected(file) { selectedFile.value = file }

const { loading: backupLoading, execute: doBackup } = useApi(async () => {
  const res = await backupService.createBackup(selectedBackupType.value)
  const url = window.URL.createObjectURL(new Blob([res.data]))
  const a = document.createElement('a')
  a.href = url
  a.download = selectedBackupType.value === 'json' ? 'backup.json' : 'backup.zip'
  a.click()
})

const handleCreateBackup = (type) => {
  selectedBackupType.value = type
  doBackup()
}

const { loading: previewLoading, execute: doPreview } = useApi(async () => {
  if (!selectedFile.value) return
  const response = await backupService.previewRestore(selectedFile.value)
  previewData.value = unwrapResponse(response)
})

const handlePreviewRestore = () => doPreview()

const restoreOptions = ref(null)
const { loading: restoreLoading, execute: doRestore } = useApi(async () => {
  if (!selectedFile.value) return
  await backupService.executeRestore(selectedFile.value, restoreOptions.value)
})

const handleExecuteRestore = (options) => {
  restoreOptions.value = options
  doRestore()
}
</script>
