// frontend/src/services/referralService.js
import apiClient from '@/services/apiClient'

// Referral letter – no CRUD factory needed.

export default {
  generateReferralPdf(visitId, reason, version) {
    return apiClient.get(`/referrals/visit/${visitId}`, { params: { reason, version }, responseType: 'blob' })
  }
}
