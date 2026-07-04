import { supabase } from './supabase'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB cap — keeps storage + egress costs sane
const ALLOWED = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp']

// Uploads a note file to the public 'notes' bucket under a random path and
// returns its public URL. Rejects oversized or non-PDF/image files (no videos —
// videos are the bandwidth killer; teachers paste a YouTube/Drive link instead).
export async function uploadNoteFile(file: File): Promise<{ url?: string; error?: string }> {
  if (file.size > MAX_BYTES) return { error: 'File too large (max 10 MB)' }
  if (!ALLOWED.includes(file.type)) return { error: 'Only PDF or image files' }
  const ext = file.name.split('.').pop() || 'bin'
  const path = `${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage.from('notes').upload(path, file, {
    contentType: file.type, upsert: false,
  })
  if (error) return { error: 'Upload failed — check your connection' }
  return { url: supabase.storage.from('notes').getPublicUrl(path).data.publicUrl }
}
