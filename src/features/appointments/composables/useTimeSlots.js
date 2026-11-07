import { computed } from 'vue'
export function useTimeSlots(startHour = 8, endHour = 23, endMinute = 30, step = 30) {
  if (![startHour,endHour,endMinute,step].every(Number.isInteger) || step <= 0 || step % 1 || startHour < 0 || endHour > 23 || endMinute < 0 || endMinute > 59 || startHour * 60 > endHour * 60 + endMinute) throw new Error('Invalid time slot bounds')
  return { timeSlots: computed(() => {
    const slots = []
    for (let minute = startHour * 60; minute <= endHour * 60 + endMinute; minute += step) slots.push(`${String(Math.floor(minute / 60)).padStart(2,'0')}:${String(minute % 60).padStart(2,'0')}`)
    return slots
  }) }
}