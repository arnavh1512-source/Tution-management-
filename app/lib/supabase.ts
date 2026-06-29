import { createClient } from '@supabase/supabase-js'

// Env values pasted into dashboards sometimes carry invisible or "smart"
// characters (zero-width spaces, curly quotes, NBSPs) that break fetch headers
// with "String contains non ISO-8859-1 code point". Supabase URLs and keys are
// pure printable ASCII, so strip anything outside that range defensively.
const clean = (v: string) => v.replace(/[^\x20-\x7E]/g, '').trim()

const supabaseUrl = clean(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '')
const supabaseAnonKey = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '')

if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey))
  console.warn('Supabase env vars missing — live mode will not work')

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder',
)
