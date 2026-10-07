// frontend/src/services/backupService.js
import apiClient from '@/services/apiClient'

export default {
  createBackup(backupType) {
    return apiClient.post('/backup', { backup_type: backupType }, { responseType: 'blob' })
  },
  previewRestore(file, options = { patients: true, diagnoses: true, medications: true }) {
    const fd = new FormData()
    fd.append('backup_file', file)
    for (const key of ['patients', 'diagnoses', 'medications']) fd.append(`restore_${key}`, options[key])
    return apiClient.post('/backup/restore/preview', fd)
  },
  executeRestore(file, options) {
    const fd = new FormData()
    fd.append('backup_file', file)
    fd.append('restore_patients', options.patients)
    fd.append('restore_medications', options.medications)
    fd.append('restore_diagnoses', options.diagnoses)
    fd.append('confirm_clear', options.confirm_clear)
    fd.append('confirmation_phrase', options.confirmation_phrase || '')
    fd.append('preview_token', options.preview_token || '')
    return apiClient.post('/backup/restore/execute', fd)
  }
}
