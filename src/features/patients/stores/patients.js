// frontend/src/features/patients/stores/patients.js
import { computed,ref } from 'vue';

import patientService from '@/features/patients/services/patientService';
import { createCrudStore } from '@/stores/crudStoreFactory';
import { announce } from '@/utils/announce';
import { createLRUCache } from '@/utils/lruCache';

const MAX_CACHED_PATIENTS = 100;
const patientCache = createLRUCache(MAX_CACHED_PATIENTS);
const HIGHLIGHT_DURATION_MS = 2000;

/**
 * Strips the UI-only `_highlight` flag from a patient snapshot.
 * Called before capturing rollback state and before writing to the cache,
 * so the flag never leaks into durable state.
 */
function withoutHighlight(patient) {
  if (!patient) return null;
  const copy = { ...patient };
  delete copy._highlight;
  return copy;
}

export const usePatientStore = createCrudStore('patients', {
  fetchAll: (params) => patientService.getAll(params),
  fetchOne: (id, include) => patientService.getById(id, include),
  create: (payload) => patientService.create(payload),
  update: (id, payload) => patientService.update(id, payload),
  remove: (id) => patientService.delete(id),
  listKey: 'patients',
  extensions: {
    setup() {
      const currentPatientId = ref(null);
      const highlightTimers = {};

      const patientsById = ref({});
      const allIds = ref([]);

      function clearHighlight(id) {
        const current = patientsById.value[id];
        if (current && current._highlight) {
          current._highlight = false;
          patientCache.set(id, { ...current });
        } else if (current) {
          patientCache.set(id, { ...current });
        }
      }

      async function searchPatients(params = {}) {
        const data = await patientService.search(params);
        const list = data?.patients || [];
        for (const p of list) {
          patientsById.value[p.id] = p;
          if (!allIds.value.includes(p.id)) allIds.value.push(p.id);
          patientCache.set(p.id, { ...p });
        }
        return list;
      }

      async function fetchPatient(id, include = '') {
        const cached = patientCache.get(id);
        if (cached) {
          currentPatientId.value = id;
          patientsById.value[id] = cached;
          if (!allIds.value.includes(id)) allIds.value.push(id);
          const patient = await patientService.getById(id, include);
          patientsById.value[id] = patient;
          patientCache.set(id, patient);
          return patient;
        }
        const patient = await patientService.getById(id, include);
        patientsById.value[id] = patient;
        if (!allIds.value.includes(id)) allIds.value.push(id);
        patientCache.set(id, patient);
        currentPatientId.value = id;
        return patient;
      }

      async function createPatient(patientData) {
        const patient = await patientService.create(patientData);
        patientsById.value[patient.id] = patient;
        allIds.value.unshift(patient.id);
        patientCache.set(patient.id, patient);
        announce('تم إضافة المريض');
        return patient;
      }

      async function updatePatient(id, patientData) {
        // Capture a clean snapshot (no `_highlight`) so a rollback restores the
        // actual last-known-good state, not a mid-highlight variant.
        const old = withoutHighlight(patientsById.value[id]);

        if (old) {
          const optimistic = { ...old, ...patientData, _highlight: true };
          patientsById.value[id] = optimistic;
          patientCache.set(id, { ...optimistic });
        }

        try {
          const updated = await patientService.update(id, patientData);
          patientsById.value[id] = { ...updated, _highlight: true };
          patientCache.set(id, { ...updated, _highlight: true });
          announce('تم حفظ المريض');

          if (highlightTimers[id]) clearTimeout(highlightTimers[id]);
          highlightTimers[id] = setTimeout(() => {
            clearHighlight(id);
            delete highlightTimers[id];
          }, HIGHLIGHT_DURATION_MS);

          return updated;
        } catch (error) {
          if (old) {
            patientsById.value[id] = old;
            patientCache.set(id, old);
          }
          // Cancel any pending highlight timer so it doesn't fire against the
          // just-restored snapshot.
          if (highlightTimers[id]) {
            clearTimeout(highlightTimers[id]);
            delete highlightTimers[id];
          }
          throw error;
        }
      }

      async function deletePatient(id) {
        const old = withoutHighlight(patientsById.value[id]);
        delete patientsById.value[id];
        allIds.value = allIds.value.filter((x) => x !== id);
        patientCache.delete(id);

        // A pending highlight timer for a deleted row would fire against a
        // non-existent key — clean it up.
        if (highlightTimers[id]) {
          clearTimeout(highlightTimers[id]);
          delete highlightTimers[id];
        }

        try {
          await patientService.delete(id);
          announce('تم حذف المريض');
        } catch (error) {
          if (old) {
            patientsById.value[id] = old;
            allIds.value.push(id);
            patientCache.set(id, old);
          }
          throw error;
        }
      }

      // Export methods
      async function exportPdf(patientId) {
        return await patientService.exportPdf(patientId);
      }

      async function exportWord(patientId) {
        return await patientService.exportWord(patientId);
      }

      async function exportCsv(fields = []) {
        return await patientService.exportCsv(fields);
      }

      async function exportExcel(fields = []) {
        return await patientService.exportExcel(fields);
      }

      const currentPatient = computed(() =>
        currentPatientId.value ? patientsById.value[currentPatientId.value] : null
      );

      return {
        patientsById,
        allIds,
        currentPatient,
        currentPatientId,
        searchPatients,
        fetchPatient,
        createPatient,
        updatePatient,
        deletePatient,
        exportPdf,
        exportWord,
        exportCsv,
        exportExcel,
      };
    },
  },
});
