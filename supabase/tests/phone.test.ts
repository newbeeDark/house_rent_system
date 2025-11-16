import { describe, it, expect } from 'vitest'
import { normalizePhone, isValidPhoneDigits } from '../utils/phone'

describe('phone utils', () => {
  it('normalizePhone removes non-digits', () => {
    expect(normalizePhone('+60 12-345-6789')).toBe('60123456789')
    expect(normalizePhone('143663232')).toBe('143663232')
  })

  it('isValidPhoneDigits validates 7-15 digits', () => {
    expect(isValidPhoneDigits('1234567')).toBe(true)
    expect(isValidPhoneDigits('123456')).toBe(false)
    expect(isValidPhoneDigits('123456789012345')).toBe(true)
    expect(isValidPhoneDigits('1234567890123456')).toBe(false)
  })
})