import { keBackend, idPelanggan } from '@/lib/chatBackend'

// POST /api/chat — mulai percakapan baru
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const pelanggan_id = await idPelanggan()
  return keBackend('', {
    method: 'POST',
    body: JSON.stringify({ pelanggan_id, nama: typeof body?.nama === 'string' ? body.nama : undefined }),
  })
}
