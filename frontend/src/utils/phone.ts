export function normalizePhone(input: string): string {
  return (input || '').replace(/\D+/g, '')
}

export function isValidPhone(input: string): boolean {
  return /^\+?\d{7,15}$/.test(input)
}