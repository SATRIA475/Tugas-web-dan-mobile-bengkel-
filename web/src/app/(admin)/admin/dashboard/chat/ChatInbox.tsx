'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bot, Headset, UserRound, Send, Loader2, AlertCircle, ArrowLeft, Info } from 'lucide-react'

type Ringkasan = {
  id: string
  nama: string
  email: string | null
  mode: 'AI' | 'ADMIN'
  butuh_admin: number | boolean
  belum_dibaca_admin: number
  pesan_terakhir: string | null
  pengirim_terakhir: string | null
  updatedAt: string
}

type Pesan = {
  id: number
  pengirim: 'PELANGGAN' | 'AI' | 'ADMIN' | 'SISTEM'
  isi: string
  createdAt: string
  admin_nama?: string | null
}

type Detail = {
  id: string
  nama: string
  email: string | null
  no_telepon: string | null
  mode: 'AI' | 'ADMIN'
  butuh_admin: boolean
}

function waktu(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const hariIni = new Date().toDateString() === d.toDateString()
  return hariIni
    ? d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

export default function ChatInbox() {
  const [daftar, setDaftar] = useState<Ringkasan[]>([])
  const [memuatDaftar, setMemuatDaftar] = useState(true)
  const [aktif, setAktif] = useState<string | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [pesan, setPesan] = useState<Pesan[]>([])
  const [balasan, setBalasan] = useState('')
  const [mengirim, setMengirim] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastIdRef = useRef(0)
  const bawahRef = useRef<HTMLDivElement>(null)

  const muatDaftar = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/chat', { cache: 'no-store' })
      if (!res.ok) throw new Error()
      setDaftar(await res.json())
      setError(null)
    } catch {
      setError('Server chat tidak dapat dihubungi.')
    } finally {
      setMemuatDaftar(false)
    }
  }, [])

  const muatPesan = useCallback(async (id: string, reset = false) => {
    if (reset) {
      lastIdRef.current = 0
      setPesan([])
    }
    const res = await fetch(`/api/admin/chat/${id}?setelah=${lastIdRef.current}`, { cache: 'no-store' })
    if (!res.ok) return
    const data = await res.json()
    setDetail(data.percakapan)
    const baru: Pesan[] = data.pesan || []
    if (baru.length) {
      setPesan((lama) => {
        const ada = new Set(lama.map((p) => p.id))
        const hasil = [...lama, ...baru.filter((p) => !ada.has(p.id))].sort((a, b) => a.id - b.id)
        lastIdRef.current = hasil[hasil.length - 1].id
        return hasil
      })
    }
  }, [])

  useEffect(() => {
    muatDaftar()
    const t = setInterval(muatDaftar, 5000)
    return () => clearInterval(t)
  }, [muatDaftar])

  useEffect(() => {
    if (!aktif) return
    muatPesan(aktif, true)
    const t = setInterval(() => muatPesan(aktif), 3000)
    return () => clearInterval(t)
  }, [aktif, muatPesan])

  // Gulir ke pesan terakhir setelah layout selesai
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const box = bawahRef.current?.parentElement
      if (box) box.scrollTop = box.scrollHeight
    })
    return () => cancelAnimationFrame(raf)
  }, [pesan.length, aktif])

  const kirim = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const isi = balasan.trim()
    if (!aktif || !isi || mengirim) return
    setMengirim(true)
    try {
      const res = await fetch(`/api/admin/chat/${aktif}`, { method: 'POST', body: JSON.stringify({ isi }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Gagal mengirim balasan')
      setBalasan('')
      await Promise.all([muatPesan(aktif), muatDaftar()])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim balasan')
    } finally {
      setMengirim(false)
    }
  }

  const ubahMode = async (mode: 'AI' | 'ADMIN') => {
    if (!aktif) return
    await fetch(`/api/admin/chat/${aktif}/mode`, { method: 'PATCH', body: JSON.stringify({ mode }) })
    await Promise.all([muatPesan(aktif), muatDaftar()])
  }

  const perluAdmin = daftar.filter((d) => d.butuh_admin).length

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden grid md:grid-cols-[320px_1fr] min-h-[600px] h-[calc(100vh-220px)]">
      {/* Daftar percakapan */}
      <aside className={`border-r flex flex-col min-h-0 ${aktif ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-4 py-3 border-b bg-muted/50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Percakapan</span>
          {perluAdmin > 0 && (
            <span className="text-xs font-bold bg-primary text-primary-foreground rounded-full px-2 py-0.5">{perluAdmin} perlu admin</span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto divide-y">
          {memuatDaftar ? (
            <div className="flex justify-center py-10 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : daftar.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground font-medium">Belum ada percakapan.</p>
          ) : (
            daftar.map((c) => (
              <button
                key={c.id}
                onClick={() => setAktif(c.id)}
                className={`w-full text-left px-4 py-3 hover:bg-muted/60 transition-colors ${aktif === c.id ? 'bg-muted' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-foreground truncate">{c.nama}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{waktu(c.updatedAt)}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate mt-0.5">
                  {c.pengirim_terakhir === 'ADMIN' ? 'Anda: ' : c.pengirim_terakhir === 'AI' ? 'AI: ' : ''}
                  {c.pesan_terakhir}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  {c.butuh_admin ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">
                      <AlertCircle className="w-3 h-3" /> Perlu admin
                    </span>
                  ) : c.mode === 'AI' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 rounded-full px-2 py-0.5">
                      <Bot className="w-3 h-3" /> Dijawab AI
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 rounded-full px-2 py-0.5">
                      <Headset className="w-3 h-3" /> Ditangani admin
                    </span>
                  )}
                  {c.belum_dibaca_admin > 0 && (
                    <span className="text-[11px] font-bold bg-foreground text-background rounded-full px-1.5">{c.belum_dibaca_admin}</span>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Isi percakapan */}
      <section className={`flex-col min-h-0 ${aktif ? 'flex' : 'hidden md:flex'}`}>
        {!aktif || !detail ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground font-medium p-8 text-center">
            {error ?? 'Pilih percakapan untuk melihat pesan.'}
          </div>
        ) : (
          <>
            <div className="px-4 py-3 border-b flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button onClick={() => setAktif(null)} className="md:hidden p-1 -ml-1" aria-label="Kembali">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">{detail.nama}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {[detail.email, detail.no_telepon].filter(Boolean).join(' · ') || 'Pengunjung tanpa akun'}
                  </p>
                </div>
              </div>
              {detail.mode === 'AI' ? (
                <button onClick={() => ubahMode('ADMIN')} className="text-sm font-bold border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors">
                  Ambil alih dari AI
                </button>
              ) : (
                <button onClick={() => ubahMode('AI')} className="text-sm font-bold border rounded-lg px-3 py-1.5 hover:bg-muted transition-colors">
                  Serahkan ke AI
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-muted/20">
              {pesan.map((p) => {
                if (p.pengirim === 'SISTEM') {
                  return (
                    <div key={p.id} className="flex justify-center">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted rounded-full px-3 py-1">
                        <Info className="w-3 h-3" /> {p.isi}
                      </span>
                    </div>
                  )
                }
                const darIBengkel = p.pengirim !== 'PELANGGAN'
                const label = p.pengirim === 'PELANGGAN' ? detail.nama : p.pengirim === 'ADMIN' ? p.admin_nama || 'Admin' : 'Asisten AI'
                const Icon = p.pengirim === 'PELANGGAN' ? UserRound : p.pengirim === 'ADMIN' ? Headset : Bot
                return (
                  <div key={p.id} className={`flex ${darIBengkel ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] flex flex-col gap-1 ${darIBengkel ? 'items-end' : 'items-start'}`}>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
                        <Icon className="w-3.5 h-3.5" /> {label} · {waktu(p.createdAt)}
                      </span>
                      <div
                        className={`rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap break-words ${
                          p.pengirim === 'ADMIN'
                            ? 'bg-primary text-primary-foreground'
                            : p.pengirim === 'AI'
                              ? 'bg-foreground/5 text-foreground border'
                              : 'bg-card text-foreground border'
                        }`}
                      >
                        {p.isi}
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={bawahRef} />
            </div>

            {detail.mode === 'AI' && (
              <p className="px-4 pt-2 text-xs text-muted-foreground">Membalas akan mengambil alih percakapan dari AI.</p>
            )}
            <form onSubmit={kirim} className="flex items-end gap-2 p-3 border-t">
              <textarea
                value={balasan}
                onChange={(e) => setBalasan(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    kirim()
                  }
                }}
                rows={2}
                maxLength={1000}
                placeholder="Tulis balasan untuk pelanggan…"
                className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="submit"
                disabled={!balasan.trim() || mengirim}
                className="h-10 px-4 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 disabled:opacity-40"
              >
                {mengirim ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Kirim
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
