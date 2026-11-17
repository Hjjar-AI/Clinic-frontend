import { reactive } from 'vue'
/** Display metadata only; command transitions and permissions remain server-governed. */
export const STATUS_PRESENTATION = reactive({
  appointment: {},
  task: {},
  invoice: {
    overdue: {
      label: 'متأخرة',
      color: 'warning',
      icon: 'clock',
    },
  },
  scale: {
    published: {
      label: 'منشور',
      color: 'success',
      icon: 'check-circle',
    },
    draft: {
      label: 'مسودة',
      color: 'warning',
      icon: 'edit',
    },
  },
  user: {},
  medication: {
    controlled: {
      label: 'مادة خاضعة للرقابة',
      color: 'danger',
      icon: 'lock',
    },
    active: {
      label: 'نشط',
      color: 'success',
      icon: 'check-circle',
    },
    discontinued: {
      label: 'متوقف',
      color: 'grey',
      icon: 'minus-circle',
    },
  },
  risk: {
    High: {
      label: 'مرتفع',
      color: 'danger',
      icon: 'exclamation-triangle',
      barWidth: 100,
    },
    Moderate: {
      label: 'متوسط',
      color: 'warning',
      icon: 'exclamation-circle',
      barWidth: 60,
    },
    Low: {
      label: 'منخفض',
      color: 'success',
      icon: 'check-circle',
      barWidth: 30,
    },
    null: {
      label: 'غير محدد',
      color: 'grey',
      icon: 'minus-circle',
      barWidth: 10,
    },
  },
  visit: {},
})

export function statusLabels(domain) {
  return new Proxy({}, {
    get: (_, key) => STATUS_PRESENTATION[domain]?.[key]?.label,
    ownKeys: () => Object.keys(STATUS_PRESENTATION[domain] || {}),
    getOwnPropertyDescriptor: () => ({ enumerable: true, configurable: true }),
  })
}
export function applyStatusPresentation(payload) {
  for (const domain of ['appointment', 'visit', 'task', 'invoice']) {
    Object.assign(STATUS_PRESENTATION[domain], payload[`${domain}_status`])
  }
  Object.assign(STATUS_PRESENTATION.user, payload.user_roles)
  for (const [key, value] of Object.entries(payload.risk_levels || {})) {
    const risk = key === 'None' ? 'null' : key
    STATUS_PRESENTATION.risk[risk] = { ...STATUS_PRESENTATION.risk[risk], ...value }
  }
}
export function statusPresentation(domain, status) {
  const key =
    domain === 'risk' && (status == null || status === '') ? 'null' : status
  return (
    STATUS_PRESENTATION[domain]?.[key] || {
      label: status || 'غير معروف',
      color: 'neutral',
      icon: '',
    }
  )
}
