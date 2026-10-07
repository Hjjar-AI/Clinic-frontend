// frontend/src/utils/errorMessages.js
// Centralised Arabic error strings – import from here everywhere.

export const MSG_NETWORK_ERROR = 'فشل الاتصال بالخادم. تحقق من الشبكة.'
export const MSG_UNEXPECTED_ERROR = 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.'
export const MSG_RATE_LIMIT = 'طلبات كثيرة جداً – حاول بعد قليل'
export const MSG_UNAUTHORIZED = 'انتهت صلاحية الجلسة'
export const MSG_FORBIDDEN = 'غير مصرح لك بهذا الإجراء.'
export const MSG_SERVER_ERROR = 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى.'
export const MSG_SAVE_SUCCESS = 'تم الحفظ بنجاح'
export const MSG_SAVE_FAILURE = 'فشل الحفظ. حاول مرة أخرى؟'
export const MSG_DELETE_CONFIRM = 'هل أنت متأكد من الحذف؟'
export const MSG_DELETE_SUCCESS = 'تم الحذف بنجاح'
export const MSG_DELETE_FAILURE = 'فشل الحذف'

// Missing messages needed by validationRules.js
export const MSG_FIRST_NAME_REQUIRED = 'الاسم الأول مطلوب'
export const MSG_INVALID_PHONE = 'رقم الهاتف غير صالح (يجب أن يبدأ بـ 0 ويتكون من 9-10 أرقام)'
export const MSG_INVALID_NATIONAL_ID = 'الرقم الوطني غير صالح (يجب أن يتكون من 10-12 رقماً)'