import { keBackend, idValid } from '@/lib/chatBackend'

// POST /api/chat/:id/minta-admin — minta bicara dengan admin
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!idValid(id)) return Response.json({ error: 'Percakapan tidak ditemukan' }, { status: 404 })
  return keBackend(`/${id}/minta-admin`, { method: 'POST', body: '{}' })
}
