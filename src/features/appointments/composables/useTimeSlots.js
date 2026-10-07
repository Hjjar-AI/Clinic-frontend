import { computed } from 'vue'

export function useTimeSlots(startHour = 8, endHour = 23, endMinute = 30, step = 30) {
  const timeSlots = computed(() => {
    const slots = []
    let h = startHour
    let m = 0
    while (h < endHour || (h === endHour && m <= endMinute)) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
      m += step
      if (m >= 60) { h++; m = 0 }
    }
    return slots
  })
  return { timeSlots }
}