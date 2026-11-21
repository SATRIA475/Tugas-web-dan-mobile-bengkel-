'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, X, Send, Bot, UserRound, Headset, Loader2 } from 'lucide-react'

type Pesan = {
  id: number
  pengirim: 'PELANGGAN' | 'AI' | 'ADMIN'
  isi: string
  createdAt: string
  admin_nama?: string | null
}

type StatusChat = { mode: 'AI' | 'ADMIN'; butuh_admin: boolean }

const KEY = 'satra_chat_id'

function bacaId(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}
function simpanId(id: string | null) {
  try {
    if (id) localStorage.setItem(KEY, id)
    else localStorage.removeItem(KEY)
  } catch {}
}

function jam(iso: string) {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

export default function FloatingChat() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [chatId, setChatId] = useState<string | null>(null)
  const [pesan, setPesan] = useState<Pesan[]>([])
  const [status, setStatus] = useState<StatusChat>({ mode: 'AI', butuh_admin: false })
  const [input, setInput] = useState('')
  const [mengirim, setMengirim] = useState(false)
  const [memuat, setMemuat] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [adaBaru, setAdaBaru] = useState(false)
  const bawahRef = useRef<HTMLDivElement>(null)
  const lastIdRef = useRef(0)

  const gabung = useCallback((baru: Pesan[]) => {
    if (!baru.length) return
    setPesan((lama) => {
      const ada = new Set(lama.map((p) => p.id))
      const hasil = [...lama, ...baru.filter((p) => !ada.has(p.id))].sort((a, b) => a.id - b.id)
      lastIdRef.current = hasil.length ? hasil[hasil.length - 1].id : 0
      return hasil
    })
  }, [])

  const mulaiBaru = useCallback(async () => {
    const res = await fetch('/api/chat', { method: 'POST', body: '{}' })
    if (!res.ok) throw new Error('Gagal memulai chat')
    const data = await res.json()
    simpanId(data.id)
    setChatId(data.id)
    return data.id as string
  }, [])

  const tarik = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/chat/${id}?setelah=${lastIdRef.current}`, { cache: 'no-store' })
      if (res.status === 404) {
        // Percakapan lama sudah tidak ada — mulai yang baru
        simpanId(null)
        lastIdRef.current = 0
        setPesan([])
        const baruId = await mulaiBaru()
        return tarik(baruId)
      }
      if (!res.ok) throw new Error('Gagal memuat pesan')
      const data = await res.json()
      setStatus({ mode: data.mode, butuh_admin: data.butuh_admin })
      gabung(data.pesan || [])
      return data.pesan?.length > 0
    },
    [gabung, mulaiBaru]
  )

  // Buka panel: siapkan percakapan (lanjutkan yang tersimpan atau mulai baru), lalu muat pesan
  useEffect(() => {
    if (!open) return
    let batal = false
    ;(async () => {
      setMemuat(lastIdRef.current === 0)
      setError(null)
      try {
        const id = chatId || bacaId() || (await mulaiBaru())
        if (batal) return
        if (id !== chatId) setChatId(id)
        await tarik(id)
      } catch {
        if (!batal) setError('Live chat sedang tidak dapat dihubungi. Coba lagi sebentar.')
      } finally {
        if (!batal) setMemuat(false)
      }
    })()
    return () => {
      batal = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Polling pesan baru (balasan admin) — lebih sering saat panel terbuka
  useEffect(() => {
    if (!chatId) return
    const t = setInterval(async () => {
      if (mengirim) return
      try {
        const adaPesan = await tarik(chatId)
        if (adaPesan && !open) setAdaBaru(true)
      } catch {}
    }, open ? 3000 : 15000)
    return () => clearInterval(t)
  }, [chatId, open, mengirim, tarik])

  // Lanjutkan percakapan yang tersimpan saat halaman dimuat (untuk notifikasi balasan admin)
  useEffect(() => {
    const id = bacaId()
    if (id) setChatId(id)
  }, [])

  // Gulir ke pesan terakhir setelah layout selesai
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const box = bawahRef.current?.parentElement
      if (box) box.scrollTop = box.scrollHeight
    })
    return () => cancelAnimationFrame(raf)
  }, [pesan.length, mengirim, open, memuat])

  const kirim = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const isi = input.trim()
    if (!isi || !chatId || mengirim) return
    setMengirim(true)
    setError(null)
    setInput('')
    try {
      const res = await fetch(`/api/chat/${chatId}`, {
        method: 'POST',
        body: JSON.stringify({ isi, setelah: lastIdRef.current }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Gagal mengirim pesan')
      setStatus({ mode: data.mode, butuh_admin: data.butuh_admin })
      gabung(data.pesan || [])
    } catch (err) {
      setInput(isi)
      setError(err instanceof Error ? err.message : 'Gagal mengirim pesan')
    } finally {
      setMengirim(false)
    }
  }

  const mintaAdmin = async () => {
    if (!chatId) return
    try {
      await fetch(`/api/chat/${chatId}/minta-admin`, { method: 'POST' })
      await tarik(chatId)
    } catch {
      setError('Gagal menghubungi admin')
    }
  }

  if (pathname?.startsWith('/admin')) return null

  const menungguAdmin = status.mode === 'ADMIN' && status.butuh_admin
  const statusTeks = status.mode === 'AI' ? 'Dijawab asisten AI · admin siap membantu' : menungguAdmin ? 'Menunggu balasan admin bengkel' : 'Terhubung dengan admin bengkel'

  return (
    <>
      {open && (
        <div className="fixed inset-x-3 bottom-40 z-[60] sm:inset-x-auto sm:right-6 sm:w-[380px] flex flex-col max-h-[calc(100vh-12rem)] h-[560px] bg-background border-4 border-foreground shadow-[10px_10px_0px_rgba(220,38,38,1)]">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 bg-foreground text-background px-4 py-3 border-b-4 border-primary">
            <div className="min-w-0">
              <p className="font-black italic uppercase tracking-wider text-lg leading-tight">
                Live <span className="text-primary">Chat</span>
              </p>
              <p className="text-xs font-bold text-background/70 truncate flex items-center gap-1.5">
                <span className={`inline-block w-2 h-2 rounded-full ${status.mode === 'AI' ? 'bg-green-400' : menungguAdmin ? 'bg-yellow-400' : 'bg-primary'}`} />
                {statusTeks}
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Tutup chat" className="p-1 hover:text-primary transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Pesan */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-muted/30">
            {memuat && (
              <div className="flex justify-center py-6 text-foreground/60">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
            {pesan.map((p) => {
              const saya = p.pengirim === 'PELANGGAN'
              const label = saya ? 'Anda' : p.pengirim === 'ADMIN' ? p.admin_nama || 'Admin bengkel' : 'Asisten AI'
              const Icon = saya ? UserRound : p.pengirim === 'ADMIN' ? Headset : Bot
              return (
                <div key={p.id} className={`flex ${saya ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] ${saya ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <span className={`flex items-center gap-1 text-[11px] font-black uppercase tracking-wider ${p.pengirim === 'ADMIN' ? 'text-primary' : 'text-foreground/60'}`}>
                      <Icon className="w-3.5 h-3.5" /> {label} · {jam(p.createdAt)}
                    </span>
                    <div
                      className={`px-3 py-2 text-sm font-semibold whitespace-pre-wrap break-words border-2 ${
                        saya
                          ? 'bg-primary text-primary-foreground border-primary'
                          : p.pengirim === 'ADMIN'
                            ? 'bg-background text-foreground border-primary'
                            : 'bg-background text-foreground border-foreground'
                      }`}
                    >
                      {p.isi}
                    </div>
                  </div>
                </div>
              )
            })}
            {mengirim && status.mode === 'AI' && (
              <div className="flex items-center gap-2 text-xs font-bold text-foreground/60">
                <Bot className="w-4 h-4" /> Asisten AI sedang mengetik…
              </div>
            )}
            <div ref={bawahRef} />
          </div>

          {/* Aksi admin */}
          {status.mode === 'AI' && !memuat && chatId && (
            <button
              onClick={mintaAdmin}
              className="mx-3 mt-2 flex items-center justify-center gap-2 border-2 border-foreground bg-background px-3 py-2 text-xs font-black uppercase tracking-wider hover:bg-foreground hover:text-background transition-colors"
            >
              <Headset className="w-4 h-4" /> Bicara dengan admin bengkel
            </button>
          )}

          {error && <p className="mx-3 mt-2 text-xs font-bold text-primary">{error}</p>}

          {/* Input */}
          <form onSubmit={kirim} className="flex items-end gap-2 p-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  kirim()
                }
              }}
              rows={1}
              maxLength={1000}
              placeholder={chatId ? 'Tulis pesan…' : 'Menyiapkan chat…'}
              disabled={!chatId || memuat}
              className="flex-1 resize-none border-2 border-foreground bg-background px-3 py-2 text-sm font-semibold focus:outline-none focus:border-primary max-h-28"
            />
            <button
              type="submit"
              disabled={!input.trim() || !chatId || mengirim}
              aria-label="Kirim pesan"
              className="h-10 w-10 shrink-0 flex items-center justify-center bg-primary text-primary-foreground border-2 border-foreground disabled:opacity-40 hover:bg-foreground transition-colors"
            >
              {mengirim ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      )}

      <div className="fixed bottom-24 right-6 z-50">
        <button
          onClick={() => {
            setOpen((o) => !o)
            setAdaBaru(false)
          }}
          aria-expanded={open}
          className="relative bg-primary text-primary-foreground border-4 border-foreground px-4 py-3 flex items-center gap-3 shadow-[8px_8px_0px_rgba(0,0,0,1)] skew-x-[-10deg] hover:-translate-y-1 hover:shadow-[10px_10px_0px_rgba(0,0,0,1)] transition-all cursor-pointer group"
        >
          {adaBaru && !open && <span className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 border-2 border-foreground" aria-label="Pesan baru" />}
          <span className="skew-x-[10deg] flex items-center gap-3">
            {open ? <X className="w-6 h-6 text-foreground" /> : <MessageCircle className="w-6 h-6 text-foreground group-hover:scale-110 transition-transform" />}
            <span className="font-black italic text-lg tracking-widest uppercase">Live Chat</span>
          </span>
        </button>
      </div>
    </>
  )
}
