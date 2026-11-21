import type { NextRequest } from 'next/server'
import { keBackend, idValid, sesiAdmin } from '@/lib/chatBackend'

type Ctx = { params: Promise<{ id: string }> }

// GET /api/admin/chat/:id — isi percakapan
export async function GET(request: NextRequest, { params }: Ctx) {
  if (!(await sesiAdmin())) return Response.json({ error: 'Tidak diizinkan' }, { status: 403 })
  const { id } = await params
  if (!idValid(id)) return Response.json({ error: 'Percakapan tidak ditemukan' }, { status: 404 })
  const setelah = Number(request.nextUrl.searchParams.get('setelah')) || 0
  return keBackend(`/admin/percakapan/${id}?setelah=${setelah}`)
}

// POST /api/admin/chat/:id — admin membalas
export async function POST(request: Request, { params }: Ctx) {
  const admin = await sesiAdmin()
  if (!admin) return Response.json({ error: 'Tidak diizinkan' }, { status: 403 })
  const { id } = await params
  if (!idValid(id)) return Response.json({ error: 'Percakapan tidak ditemukan' }, { status: 404 })
  const body = await request.json().catch(() => ({}))
  return keBackend(`/admin/percakapan/${id}/balas`, {
    method: 'POST',
    body: JSON.stringify({ isi: body?.isi, admin_id: admin.userId }),
  })
}
