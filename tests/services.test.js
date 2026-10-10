import test from 'node:test'
import assert from 'node:assert/strict'
import { createCrudService } from '@/services/baseCrudService'
import auth from '@/features/auth/services/authService'
import patients from '@/features/patients/services/patientService'
import visits from '@/features/visits/services/visitService'
import appointments from '@/features/appointments/services/appointmentService'
import billing from '@/features/billing/services/invoiceService'
import tasks from '@/features/tasks/services/taskService'
import users from '@/features/settings/services/userService'
import settings from '@/features/settings/services/settingsService'
import backups from '@/features/backup/services/backupService'
import imports from '@/features/import/services/importService'
import prescriptions from '@/features/prescription/services/prescriptionService'
import referrals from '@/features/prescription/services/referralService'
import notifications from '@/features/notifications/services/notificationService'
import dashboard from '@/features/dashboard/services/dashboardService'
import reports from '@/features/reports/services/statisticsService'
import { installRuntime, respond, requests, body } from './helpers/runtime.js'
installRuntime()

test('CRUD methods preserve endpoints, envelopes and opening delete version', async () => {
  const service = createCrudService('/patients')
  respond({ data: { id: 1, version: 3 } })
  assert.deepEqual(await service.getById(1), { id: 1, version: 3 })
  await service.getAll({ per_page: 10 })
  await service.create({ first_name: 'Synthetic' })
  await service.update(1, { version: 3, occupation: 'Teacher' })
  await service.delete(1, 3)
  assert.deepEqual(requests.map(r => [r.method, r.url]), [
    ['get', '/patients/1/'], ['get', '/patients/'], ['post', '/patients/'], ['put', '/patients/1/'], ['delete', '/patients/1/'],
  ])
  assert.deepEqual(body(), { version: 3 })
})
test('login bootstraps CSRF before posting credentials', async () => {
  respond({ data: { user: { id: 1 } } })
  await auth.login({ username: 'synthetic', password: 'suite-only' })
  assert.deepEqual(requests.map(r => [r.method, r.url]), [['get', '/system/config/'], ['post', '/auth/login/']])
  assert.equal(body().username, 'synthetic')
})
const contracts = [
  ['care team add', () => patients.addCareTeamMember(1, 2, 'doctor', 3), 'post', '/patients/1/care_team_add/', { user_id: 2, role: 'doctor', version: 3 }],
  ['care team remove', () => patients.removeCareTeamMember(1, 2, 3, 'Reassignment'), 'delete', '/patients/1/care-team/2/', { version: 3, reason: 'Reassignment' }],
  ['longitudinal record', () => patients.saveRecord(1, { kind: 'contacts', version: 3, fields: { name: 'Synthetic' } }), 'post', '/patients/1/records/', { kind: 'contacts', version: 3, fields: { name: 'Synthetic' } }],
  ['merge preview', () => patients.previewMerge(1, 2), 'post', '/patients/1/merge_preview/', { target_id: 2 }],
  ['merge execution', () => patients.mergePatient(1, { token: 'preview', version: 3, target_version: 4, reason: 'Duplicate' }), 'post', '/patients/1/merge/', { token: 'preview', version: 3, target_version: 4, reason: 'Duplicate' }],
  ['document metadata version', () => patients.updateDocument(1, 2, { version: 7, description: 'Synthetic' }), 'patch', '/patients/1/documents/2/', { version: 7, description: 'Synthetic' }],
  ['document archive version', () => patients.archiveDocument(1, 2, 7), 'delete', '/patients/1/documents/2/', { version: 7 }],
  ['visit creation', () => visits.create(1, { main_complaints: 'Synthetic' }), 'post', '/patients/1/visits/', { main_complaints: 'Synthetic' }],
  ['visit transition', () => visits.transition(1, 'amended', 3, 'Correction'), 'put', '/visits/1/transition/', { status: 'amended', version: 3, reason: 'Correction' }],
  ['visit followup', () => visits.completeFollowUp(1, 3, 'missed'), 'put', '/visits/1/complete_follow_up/', { version: 3, outcome: 'missed' }],
  ['appointment reschedule', () => appointments.reschedule(1, '2026-01-01', '12:00', 3), 'put', '/appointments/1/reschedule/', { date: '2026-01-01', time: '12:00', version: 3 }],
  ['invoice transition', () => billing.transition(1, 'cancelled', 3, 'Correction'), 'put', '/billing/1/transition/', { status: 'cancelled', version: 3, reason: 'Correction' }],
  ['task transition', () => tasks.transition(1, 'cancelled', 3, 'No longer needed'), 'put', '/tasks/1/transition/', { status: 'cancelled', version: 3, reason: 'No longer needed' }],
  ['task reorder', () => tasks.reorder([2, 1]), 'put', '/tasks/reorder/', { order: [2, 1] }],
  ['user permissions', () => users.updatePermissions(1, { permissions: ['view_patients'], version: 3 }), 'put', '/auth/users/permissions/1/', { permissions: ['view_patients'], version: 3 }],
  ['settings version', () => settings.updateSettings({ version: 3, clinic_name: 'Synthetic' }), 'put', '/settings/', { version: 3, clinic_name: 'Synthetic' }],
  ['referral issue', () => referrals.generateReferralPdf(1, 'Synthetic reason', 3), 'post', '/referrals/visit/1/', { reason: 'Synthetic reason', version: 3 }],
  ['prescription issue', () => prescriptions.generate({ visit_id: 1, version: 3 }), 'post', '/prescription/generate/', { visit_id: 1, version: 3 }],
]
for (const [label, invoke, method, url, payload] of contracts) {
  test(`${label} sends the backend contract`, async () => {
    respond({ data: { ok: true } })
    await invoke()
    assert.equal(requests.at(-1).method, method)
    assert.equal(requests.at(-1).url, url)
    assert.deepEqual(body(), payload)
    assert.ok(requests.at(-1).headers.get('X-Idempotency-Key'))
    if (payload.version) assert.equal(requests.at(-1).headers.get('If-Match'), String(payload.version))
  })
}
const reads = [
  ['patient team', () => patients.getCareTeam(1), '/patients/1/care_team/'],
  ['team candidates', () => patients.getTeamCandidates(), '/patients/team_candidates/'],
  ['patient corrections', () => patients.getCorrections(1, 100), '/patients/1/corrections/'],
  ['patient records', () => patients.getRecords(1, 'allergies', 100), '/patients/1/records/'],
  ['patient visits', () => patients.getVisits(1), '/patients/1/visits/'],
  ['doctors', () => users.getDoctors(), '/auth/users/doctors/'],
  ['prescription preview', () => prescriptions.preview(1), '/prescription/visit/1/'],
  ['dashboard', () => dashboard.getDashboard(), '/dashboard/'],
  ['dashboard charts', () => dashboard.getCharts(), '/dashboard/charts/'],
  ['dashboard summary', () => dashboard.getSummary(), '/dashboard/summary/'],
  ['statistics', () => reports.getStatistics({ year: 2026 }), '/reports/statistics/'],
  ['monthly report', () => reports.getMonthlySummary(2026, 1), '/reports/monthly-summary/'],
  ['doctor performance', () => reports.getDoctorPerformance(), '/reports/doctor-performance/'],
  ['reconciliation', () => reports.getReconciliation(), '/reports/reconciliation/'],
]
for (const [label, invoke, url] of reads) {
  test(`${label} uses the read endpoint`, async () => {
    respond({ data: { ok: true } })
    await invoke()
    assert.equal(requests.at(-1).method, 'get')
    assert.equal(requests.at(-1).url, url)
  })
}
test('patient CSV export preserves filters and requested columns', async () => {
  const blob = new Blob(['synthetic'])
  respond(blob)
  assert.equal(await patients.exportCsv(['first_name', 'surname'], { search: 'Synthetic' }), blob)
  assert.deepEqual(requests[0].params, { search: 'Synthetic', fields: 'first_name,surname' })
  assert.equal(requests[0].responseType, 'blob')
})
test('notification polling is persistent and keeps cursor params', async () => {
  respond()
  await notifications.getNotificationsPersistent({ limit: 10 })
  assert.equal(requests[0].__persistent, true)
  assert.equal(requests[0].params.per_page, 10)
})
test('restore includes exact scope, preview token and confirmation', async () => {
  const file = new File(['synthetic'], 'backup.zip')
  respond()
  await backups.executeRestore(file, { patients: false, diagnoses: true, medications: true,
    confirm_clear: true, confirmation_phrase: 'RESTORE CLINIC', preview_token: 'suite-preview' })
  const fd = body()
  assert.equal(fd.get('restore_patients'), 'false')
  assert.equal(fd.get('restore_diagnoses'), 'true')
  assert.equal(fd.get('preview_token'), 'suite-preview')
  assert.equal(fd.get('confirmation_phrase'), 'RESTORE CLINIC')
  assert.equal(requests[0].url, '/backup/restore/execute/')
})
test('patient import keeps preview binding and selected doctor', async () => {
  respond()
  await imports.importPatients(new File(['synthetic'], 'patients.csv'), 2, 'suite-preview')
  assert.equal(body().get('doctor_id'), '2')
  assert.equal(body().get('preview_token'), 'suite-preview')
})
test('medication mapping normalizes empty columns and sends preview separately', async () => {
  respond()
  await imports.mapMedications(new File(['synthetic'], 'medications.csv'), { dosage: '', generic_english: 0 }, 'merge', 'suite-preview', true)
  assert.deepEqual(JSON.parse(body().get('column_map')), { dosage: null, generic_english: 0 })
  assert.equal(body().get('preview'), 'true')
  assert.equal(body().get('merge_mode'), 'merge')
  assert.equal(body().get('preview_token'), 'suite-preview')
})
