// Sharing helpers for handing a student their login code.
// Students never sign in with Google — they enter a per-student code — so the
// teacher needs a frictionless way to deliver that code to the parent.

const FALLBACK_ORIGIN = 'https://tution-management-taupe.vercel.app'

// Prefer the live origin so custom domains / localhost share the right link.
export function appOrigin(): string {
  return typeof window !== 'undefined' ? window.location.origin : FALLBACK_ORIGIN
}

// The message a parent receives, with the code and exactly how to use it.
export function studentCodeMessage(name: string, code: string): string {
  const who = name.trim() ? name.trim() : 'your child'
  return [
    `Hi! Here is the login code for ${who} at Second School.`,
    '',
    `Code: ${code}`,
    '',
    `Open ${appOrigin()} → tap "I'm a student" → enter this code to view attendance, marks, fees and reminders.`,
  ].join('\n')
}

// Build a wa.me deep link. Strips formatting; assumes India (+91) for bare
// 10-digit numbers. An empty/short number yields a link that opens WhatsApp's
// contact picker so the teacher can still choose a recipient.
export function whatsappShareUrl(phone: string, message: string): string {
  const digits = (phone ?? '').replace(/\D/g, '')
  const intl = digits.length === 10 ? `91${digits}` : digits
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`
}
