export function createCustomDiagnosis(name) {
  return {
    id: null,
    code: '',
    name,
    arabic_name: name,
    custom_name: name,
    custom_code: '',
    duplicate: false,
  }
}
export function createCustomMedication(name) {
  return {
    id: null,
    name,
    display_name: name,
    is_custom: true,
    dosage: '',
    brand: '',
    schedule: '',
    duplicate: false,
  }
}
