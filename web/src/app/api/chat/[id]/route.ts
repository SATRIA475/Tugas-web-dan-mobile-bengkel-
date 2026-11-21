import type { NextRequest } from 'next/server'
import { keBackend, idValid, idPelanggan } from '@/lib/chatBackend'

type Ctx = { params: Promise<{ id: string }> }

// GET /api/chat/:id?setelah=n — ambil pesan baru
export async function GET(request: NextRequest, { params }: Ctx) {
  const { id } = await params
  if (!idValid(id)) return Response.json({ error: 'Percakapan tidak ditemukan' }, { status: 404 })
  const setelah = Number(request.nextUrl.searchParams.get('setelah')) || 0
  return keBackend(`/${id}?setelah=${setelah}`)
}

// POST /api/chat/:id — kirim pesan
export async function POST(request: Request, { params }: Ctx) {
  const { id } = await params
  if (!idValid(id)) return Response.json({ error: 'Percakapan tidak ditemukan' }, { status: 404 })
  const body = await request.json().catch(() => ({}))
  return keBackend(`/${id}`, {
    method: 'POST',
    body: JSON.stringify({ isi: body?.isi, setelah: Number(body?.setelah) || 0, pelanggan_id: await idPelanggan() }),
  })
}
