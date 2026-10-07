// frontend/src/utils/riskLevels.js
export const RISK_LEVELS = {
  High: {
    color: 'danger',
    icon: 'exclamation-triangle',
    label: 'مرتفع',
    barWidth: 100
  },
  Moderate: {
    color: 'warning',
    icon: 'exclamation-circle',
    label: 'متوسط',
    barWidth: 60
  },
  Low: {
    color: 'success',
    icon: 'check-circle',
    label: 'منخفض',
    barWidth: 30
  },
  null: {
    color: 'grey',
    icon: 'minus-circle',
    label: 'غير محدد',
    barWidth: 10
  }
}

export function getRiskInfo(level) {
  return RISK_LEVELS[level] || RISK_LEVELS.null
}