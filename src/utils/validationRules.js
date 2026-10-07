// frontend/src/utils/validationRules.js
//
// Rule-object factories consumed by `useForm`. Each factory returns a plain
// object of the shape:
//
//   { field, label, required?, message?, minLength?, min?, max?, pattern?, custom? }
//
// `useForm` turns the array of these into a Yup schema via `buildYupSchema`.
//
// HISTORY: this file previously returned Yup schemas
// (`yup.string().required(...)`), which silently broke every form in the
// app — `useForm` iterated the array, found no `.field` or `.required`
// property on a Yup schema, and collapsed all validation onto a single
// `shape[undefined]` key. The factories below return rule objects that
// match what `useForm` actually consumes.

import { validateNationalId,validatePhone } from '@/utils/validators'

export const firstNameRule = (field = 'first_name', message = 'الاسم الأول مطلوب') => ({
  field,
  label: 'الاسم الأول',
  required: true,
  message,
})

export const surnameRule = (field = 'surname', message = 'اسم العائلة مطلوب') => ({
  field,
  label: 'اسم العائلة',
  required: true,
  message,
})

export const genderRule = (field = 'gender', message = 'الجنس مطلوب') => ({
  field,
  label: 'الجنس',
  required: true,
  message,
})

export const dobYearRule = (field = 'dob_year', message = 'سنة الميلاد مطلوبة') => ({
  field,
  label: 'سنة الميلاد',
  required: true,
  message,
  custom: (value) => {
    if (value === null || value === undefined || value === '') return ''
    const y = parseInt(value, 10)
    if (Number.isNaN(y)) return message
    const currentYear = new Date().getFullYear()
    if (y < 1900 || y > currentYear) return message
    return ''
  },
})

export const phoneRule = (
  field = 'phone',
  validator = validatePhone,
  message = 'رقم الهاتف غير صالح'
) => ({
  field,
  label: 'رقم الهاتف',
  custom: (value) => (!value || validator(value) ? '' : message),
})

export const nationalIdRule = (
  field = 'national_id',
  validator = validateNationalId,
  message = 'الرقم الوطني غير صالح'
) => ({
  field,
  label: 'الرقم الوطني',
  custom: (value) => (!value || validator(value) ? '' : message),
})

export const visitDateRule = (field = 'visit_date', message = 'تاريخ الزيارة مطلوب') => ({
  field,
  label: 'تاريخ الزيارة',
  required: true,
  message,
})

export const mainComplaintsRule = (field = 'main_complaints', message = 'الشكوى الرئيسية مطلوبة') => ({
  field,
  label: 'الشكوى الرئيسية',
  required: true,
  message,
})
