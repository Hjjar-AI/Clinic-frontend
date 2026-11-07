/** Display metadata only; command transitions and permissions remain server-governed. */
export const STATUS_PRESENTATION = {
  appointment: {
    scheduled: {
      label: 'مجدول',
      color: 'info',
      icon: 'calendar-check',
    },
    confirmed: {
      label: 'مؤكد',
      color: 'primary',
      icon: 'check',
    },
    arrived: {
      label: 'وصل',
      color: 'warning',
      icon: 'user-check',
    },
    completed: {
      label: 'مكتمل',
      color: 'success',
      icon: 'check-circle',
    },
    cancelled: {
      label: 'ملغي',
      color: 'danger',
      icon: 'times-circle',
    },
    'no-show': {
      label: 'غائب',
      color: 'warning',
      icon: 'exclamation-circle',
    },
  },
  task: {
    open: {
      label: 'مفتوحة',
      color: 'warning',
      icon: 'circle',
    },
    in_progress: {
      label: 'قيد التنفيذ',
      color: 'info',
      icon: 'spinner',
    },
    completed: {
      label: 'مكتملة',
      color: 'success',
      icon: 'check-circle',
    },
    cancelled: {
      label: 'ملغية',
      color: 'danger',
      icon: 'ban',
    },
  },
  invoice: {
    draft: {
      label: 'مسودة',
      color: 'grey',
      icon: 'file-alt',
    },
    issued: {
      label: 'صادرة',
      color: 'info',
      icon: 'file-invoice',
    },
    paid: {
      label: 'مدفوعة',
      color: 'success',
      icon: 'check-circle',
    },
    cancelled: {
      label: 'ملغية',
      color: 'danger',
      icon: 'times-circle',
    },
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
  user: {
    admin: {
      label: 'مدير',
      color: 'purple',
      icon: 'crown',
    },
    doctor: {
      label: 'طبيب',
      color: 'primary',
      icon: 'user-md',
    },
    receptionist: {
      label: 'موظف استقبال',
      color: 'info',
      icon: 'user-tie',
    },
  },
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
  visit: {
    draft: {
      label: 'مسودة',
      color: 'grey',
      icon: 'edit',
    },
    final: {
      label: 'نهائية',
      color: 'success',
      icon: 'check-circle',
    },
    amended: {
      label: 'معدلة',
      color: 'warning',
      icon: 'history',
    },
    locked: {
      label: 'مقفلة',
      color: 'danger',
      icon: 'lock',
    },
  },
}

export function statusLabels(domain) {
  return Object.fromEntries(
    Object.entries(STATUS_PRESENTATION[domain] || {}).map(([key, value]) => [
      key,
      value.label,
    ]),
  )
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
