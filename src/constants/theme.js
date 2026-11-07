export const DEFAULT_THEME = 'default'

export const THEMES = [
  { value: 'default', label: 'افتراضي' },
  { value: 'prussian-orange', label: 'بروسي برتقالي' },
  { value: 'vanilla-tangerine', label: 'فانيليا تانجيرين' },
  { value: 'ink-wheat-burnt', label: 'حبر قمح محروق' },
  { value: 'deep-space-strawberry', label: 'فضاء عميق فراولة' },
  { value: 'ocean-cerulean', label: 'محيط سيريولين' },
  { value: 'rosewood-crimson', label: 'روزوود قرمزي' },
  { value: 'dusk-dusty-rosewood', label: 'غسق وردي مغبر' },
]

export const ALLOWED_THEMES = THEMES.map((theme) => theme.value)
