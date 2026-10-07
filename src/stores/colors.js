// frontend/src/stores/colors.js
import { defineStore } from 'pinia'
import { reactive } from 'vue'

import { getChartColors } from '@/composables/useChart'

export const useColorStore = defineStore('colors', () => {
  const doctorColors = reactive({})

  function getDoctorColor(doctorId) {
    if (!doctorColors[doctorId]) {
      const index = Object.keys(doctorColors).length % 12
      const colors = getChartColors(12)
      doctorColors[doctorId] = colors[index]
    }
    return doctorColors[doctorId]
  }

  return { doctorColors, getDoctorColor }
})