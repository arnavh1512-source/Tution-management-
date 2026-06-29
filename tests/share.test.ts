import { describe, it, expect } from 'vitest'
import { studentCodeMessage, whatsappShareUrl, appOrigin } from '../app/lib/share'

describe('appOrigin', () => {
  it('falls back to the production URL when there is no window (SSR)', () => {
    expect(appOrigin()).toBe('https://tution-management-taupe.vercel.app')
  })
})

describe('studentCodeMessage', () => {
  it('includes the student name, the code, and the app link', () => {
    const msg = studentCodeMessage('Arjun', 'TUT-ABCDEFGH')
    expect(msg).toContain('Arjun')
    expect(msg).toContain('TUT-ABCDEFGH')
    expect(msg).toContain('tution-management-taupe.vercel.app')
  })

  it('uses a friendly fallback when the name is blank', () => {
    expect(studentCodeMessage('   ', 'TUT-ABCDEFGH')).toContain('your child')
  })
})

describe('whatsappShareUrl', () => {
  it('prefixes a bare 10-digit Indian number with 91', () => {
    expect(whatsappShareUrl('9876543210', 'hi')).toMatch(/^https:\/\/wa\.me\/919876543210\?text=/)
  })

  it('strips spaces, dashes and plus signs', () => {
    expect(whatsappShareUrl('+91 98765-43210', 'hi')).toContain('wa.me/919876543210')
  })

  it('keeps an already-international number as-is', () => {
    expect(whatsappShareUrl('919876543210', 'hi')).toContain('wa.me/919876543210')
  })

  it('url-encodes the message', () => {
    expect(whatsappShareUrl('9876543210', 'a b&c')).toContain('text=a%20b%26c')
  })

  it('yields the contact-picker form when the number is empty', () => {
    expect(whatsappShareUrl('', 'hi')).toMatch(/^https:\/\/wa\.me\/\?text=/)
  })
})
