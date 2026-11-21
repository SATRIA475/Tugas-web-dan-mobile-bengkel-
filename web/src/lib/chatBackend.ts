import { getSession } from '@/lib/auth'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api'

/** ID percakapan dibuat backend: 48 karakter hex. Validasi agar tidak bisa dipakai untuk path lain. */
export function idValid(id: string): boolean {
  return /^[a-f0-9]{48}$/.test(id)
}

/** Teruskan request ke backend chat dan kembalikan respons apa adanya. */
export async function keBackend(path: string, init?: RequestInit): Promise<Response> {
  try {
    const res = await fetch(`${BACKEND_URL}/chat${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      cache: 'no-store',
    })
    const body = await res.text()
    return new Response(body, { status: res.status, headers: { 'Content-Type': 'application/json' } })
  } catch {
    return Response.json({ error: 'Server chat tidak dapat dihubungi' }, { status: 502 })
  }
}

/** Sesi admin, atau null jika bukan admin. */
export async function sesiAdmin(): Promise<{ userId: string } | null> {
  const session = await getSession()
  if (!session?.userId || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) return null
  return { userId: String(session.userId) }
}

export async function idPelanggan(): Promise<string | null> {
  const session = await getSession()
  return session?.userId ? String(session.userId) : null
}
