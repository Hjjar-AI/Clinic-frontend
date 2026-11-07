import { STATUS_PRESENTATION } from '@/constants/statusPresentation'
export const RISK_LEVELS = STATUS_PRESENTATION.risk

export function getRiskInfo(level) {
  return RISK_LEVELS[level] || RISK_LEVELS.null
}
