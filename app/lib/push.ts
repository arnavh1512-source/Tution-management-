import { supabase } from './supabase'

const VAPID = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''

export function pushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && !!VAPID
}

function urlB64ToUint8Array(base64: string): Uint8Array {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(b64)
  return Uint8Array.from(Array.from(raw).map(c => c.charCodeAt(0)))
}

// Ask permission, register the service worker, subscribe, and store it.
// kind='profile' → ref is the profile id (staff); kind='student' → ref is the code.
export async function enablePush(kind: 'profile' | 'student', ref: string): Promise<{ ok: boolean; error?: string }> {
  if (!pushSupported()) return { ok: false, error: 'Notifications aren’t supported on this device/browser' }
  try {
    const perm = await Notification.requestPermission()
    if (perm !== 'granted') return { ok: false, error: 'Notification permission was blocked' }
    const reg = await navigator.serviceWorker.register('/sw.js')
    await navigator.serviceWorker.ready
    const existing = await reg.pushManager.getSubscription()
    const sub = existing ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(VAPID) as unknown as BufferSource })
    const json = sub.toJSON()
    const { error } = await supabase.rpc('save_push_subscription', {
      p_endpoint: sub.endpoint, p_p256dh: json.keys?.p256dh, p_auth: json.keys?.auth, p_kind: kind, p_ref: ref,
    })
    if (error) return { ok: false, error: 'Could not save subscription' }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not enable notifications' }
  }
}

// Fire a push send request to our API route. Returns how many devices were
// pushed (or a short error string) so the caller can surface a diagnostic.
export async function sendPush(payload: { studentCodes?: string[]; notifyHead?: boolean; title: string; body: string; url?: string }): Promise<{ sent?: number; error?: string }> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { error: 'not signed in' }
    const res = await fetch('/api/push', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify(payload),
    })
    const json = await res.json().catch(() => ({}))
    if (!res.ok) return { error: json.error || `http ${res.status}` }
    return { sent: json.sent ?? 0 }
  } catch {
    return { error: 'request failed' }
  }
}
