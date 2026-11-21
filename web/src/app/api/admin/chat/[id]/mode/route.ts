import { keBackend, idValid, sesiAdmin } from '@/lib/chatBackend'

// PATCH /api/admin/chat/:id/mode — serahkan ke AI / ambil alih
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await sesiAdmin())) return Response.json({ error: 'Tidak diizinkan' }, { status: 403 })
  const { id } = await params
  if (!idValid(id)) return Response.json({ error: 'Percakapan tidak ditemukan' }, { status: 404 })
  const body = await request.json().catch(() => ({}))
  return keBackend(`/admin/percakapan/${id}/mode`, { method: 'PATCH', body: JSON.stringify({ mode: body?.mode }) })
}
