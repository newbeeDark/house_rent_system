export function normalizePhone(input: string): string {
  return (input || '').replace(/\D+/g, '')
}

export function isValidPhoneDigits(digits: string): boolean {
  return /^\d{7,15}$/.test(digits)
}