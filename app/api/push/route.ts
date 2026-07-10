import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

export const runtime = 'nodejs'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY ?? ''
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? 'mailto:admin@secondskool.app'

if (VAPID_PUBLIC && VAPID_PRIVATE) webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE)

type Row = { endpoint: string; p256dh: string; auth: string }

export async function POST(req: NextRequest) {
  if (!url || !serviceKey || !VAPID_PRIVATE) return NextResponse.json({ error: 'not configured' }, { status: 500 })

  // Authenticate the caller (any signed-in user) and read their centre.
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } })
  const { data: userData } = await admin.auth.getUser(token)
  const uid = userData.user?.id
  if (!uid) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data: me } = await admin.from('profiles').select('centre_id').eq('id', uid).single()
  const centre = me?.centre_id
  if (!centre) return NextResponse.json({ error: 'no centre' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { studentCodes, notifyHead, title, body: text, url: link } = body as {
    studentCodes?: string[]; notifyHead?: boolean; title?: string; body?: string; url?: string
  }
  if (!title) return NextResponse.json({ error: 'no title' }, { status: 400 })

  const subs: Row[] = []

  // Student targets — only students in the caller's centre.
  if (studentCodes?.length) {
    const { data: students } = await admin.from('students').select('student_code').eq('centre_id', centre).in('student_code', studentCodes)
    const allowed = (students ?? []).map(s => s.student_code)
    if (allowed.length) {
      const { data } = await admin.from('push_subscriptions').select('endpoint,p256dh,auth').eq('kind', 'student').in('ref', allowed)
      subs.push(...(data ?? []))
    }
  }

  // Notify the centre's head (used when a teacher requests to join).
  if (notifyHead) {
    const { data: heads } = await admin.from('profiles').select('id').eq('centre_id', centre).eq('role', 'admin').eq('staff_status', 'approved')
    const ids = (heads ?? []).map(h => h.id)
    if (ids.length) {
      const { data } = await admin.from('push_subscriptions').select('endpoint,p256dh,auth').eq('kind', 'profile').in('ref', ids)
      subs.push(...(data ?? []))
    }
  }

  const payload = JSON.stringify({ title, body: text ?? '', url: link ?? '/' })
  const stale: string[] = []
  await Promise.all(subs.map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload)
    } catch (e: unknown) {
      const code = (e as { statusCode?: number })?.statusCode
      if (code === 404 || code === 410) stale.push(s.endpoint) // expired subscription
    }
  }))
  if (stale.length) await admin.from('push_subscriptions').delete().in('endpoint', stale)

  return NextResponse.json({ sent: subs.length - stale.length })
}
