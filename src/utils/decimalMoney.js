// All arithmetic uses integer hundredths; API money remains decimal strings.
const MAX_MONEY = 9999999999n
const MAX_QUANTITY = 99999999n

export function decimalMinor(value, maximum = MAX_MONEY) {
  if (!['string', 'number'].includes(typeof value)) throw new TypeError('قيمة عشرية غير صالحة')
  const match = /^(\d{1,8})(?:\.(\d{1,2}))?$/.exec(String(value).trim())
  if (!match) throw new TypeError('يلزم عدد غير سالب بمنزلتين عشريتين كحد أقصى')
  const minor = BigInt(match[1]) * 100n + BigInt((match[2] || '').padEnd(2, '0'))
  if (minor > maximum) throw new RangeError('القيمة تتجاوز الحد المسموح')
  return minor
}

export function decimalString(minor) {
  const sign = minor < 0n ? '-' : ''
  const absolute = minor < 0n ? -minor : minor
  return `${sign}${absolute / 100n}.${String(absolute % 100n).padStart(2, '0')}`
}

export function lineAmount(quantity, unitPrice) {
  const count = decimalMinor(quantity, MAX_QUANTITY)
  if (count === 0n) throw new RangeError('الكمية يجب أن تكون موجبة')
  const amount = (count * decimalMinor(unitPrice) + 50n) / 100n
  if (amount > MAX_MONEY) throw new RangeError('مبلغ البند يتجاوز الحد المسموح')
  return decimalString(amount)
}

export function invoiceAmounts(lines, tax = '0', discount = '0') {
  if (!Array.isArray(lines) || lines.length < 1 || lines.length > 200) throw new RangeError('يلزم بند واحد إلى 200 بند')
  const subtotal = lines.reduce((sum, line) => sum + decimalMinor(lineAmount(line.quantity, line.unit_price)), 0n)
  const total = subtotal + decimalMinor(tax || '0') - decimalMinor(discount || '0')
  if (subtotal > MAX_MONEY || total < 0n || total > MAX_MONEY) throw new RangeError('المبلغ الإجمالي أو الخصم غير صالح')
  return { total_amount: decimalString(subtotal), final_amount: decimalString(total) }
}
