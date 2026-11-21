import { keBackend, sesiAdmin } from '@/lib/chatBackend'

// GET /api/admin/chat — daftar percakapan (khusus admin)
export async function GET() {
  if (!(await sesiAdmin())) return Response.json({ error: 'Tidak diizinkan' }, { status: 403 })
  return keBackend('/admin/percakapan')
}
