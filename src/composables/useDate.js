import * as datePicker from '@/services/datePicker'
import * as dates from '@/utils/date'

export function useDate() {
  return { ...dates, ...datePicker }
}
