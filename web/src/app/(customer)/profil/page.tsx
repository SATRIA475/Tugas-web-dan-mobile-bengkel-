import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { User, Phone, Mail, Clock, LayoutDashboard, Settings, UserCircle2, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000/api'

export default async function ProfilPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login')
  }

  // Fetch profile
  const res = await fetch(`${BACKEND_URL}/customer/profile/${session.userId}`, { cache: 'no-store' });
  
  if (!res.ok) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="border-4 border-destructive p-8 bg-destructive/10 text-destructive text-center shadow-[8px_8px_0px_rgba(220,38,38,0.5)] skew-x-[-5deg]">
          <h2 className="text-2xl font-black uppercase italic skew-x-[5deg]">Error Memuat Profil</h2>
          <p className="mt-2 font-bold skew-x-[5deg]">Gagal mengambil data dari server.</p>
        </div>
      </div>
    );
  }

  const user = await res.json();
  const joinedDate = new Date(user.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex-1 w-full bg-background flex flex-col items-center py-12 px-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-20 right-0 w-64 h-full bg-primary/5 -skew-x-[45deg] pointer-events-none" />
      <div className="absolute top-40 -left-20 w-48 h-full bg-foreground/5 -skew-x-[45deg] pointer-events-none" />

      <div className="w-full max-w-4xl relative z-10 space-y-8">
        
        <div className="flex items-center gap-4 border-b-8 border-primary pb-4 mb-8">
          <UserCircle2 className="w-12 h-12 text-primary" />
          <h1 className="text-4xl md:text-5xl font-black uppercase italic text-foreground tracking-tighter">Profil <span className="text-primary">Member</span></h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar / Status Section */}
          <div className="md:col-span-1">
            <div className="border-4 border-foreground bg-card p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] skew-x-[-3deg] relative overflow-hidden flex flex-col items-center text-center group">
              <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />
              <div className="w-32 h-32 bg-primary rounded-none border-4 border-foreground flex items-center justify-center skew-x-[3deg] mb-6 shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
                <User className="w-16 h-16 text-primary-foreground" />
              </div>
              
              <h2 className="text-2xl font-black uppercase italic skew-x-[3deg] text-foreground group-hover:text-primary transition-colors line-clamp-1">{user.nama}</h2>
              <div className="mt-2 inline-flex items-center bg-foreground text-background px-3 py-1 skew-x-[3deg] text-xs font-black uppercase tracking-widest">
                VIP MEMBER
              </div>

              <div className="mt-8 w-full skew-x-[3deg]">
                <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-foreground rounded-none font-black uppercase italic shadow-[4px_4px_0px_rgba(0,0,0,0.2)] skew-x-[-10deg] h-12">
                  <span className="skew-x-[10deg] flex items-center gap-2"><Settings className="w-4 h-4"/> Edit Profil</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="md:col-span-2 space-y-6">
            <div className="border-4 border-foreground bg-card p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.1)] skew-x-[-3deg]">
              <h3 className="text-xl font-black uppercase italic border-b-4 border-primary pb-2 mb-6 skew-x-[3deg] inline-block">Informasi <span className="text-primary">Kontak</span></h3>
              
              <div className="space-y-6 skew-x-[3deg]">
                <div className="flex items-start gap-4">
                  <div className="bg-foreground text-primary p-3 shadow-[4px_4px_0px_rgba(220,38,38,0.5)]">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Nama Lengkap</p>
                    <p className="text-lg font-bold text-foreground">{user.nama}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-foreground text-primary p-3 shadow-[4px_4px_0px_rgba(220,38,38,0.5)]">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Email</p>
                    <p className="text-lg font-bold text-foreground">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-foreground text-primary p-3 shadow-[4px_4px_0px_rgba(220,38,38,0.5)]">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">No. Telepon</p>
                    <p className="text-lg font-bold text-foreground">{user.no_telepon || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-foreground text-primary p-3 shadow-[4px_4px_0px_rgba(220,38,38,0.5)]">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Bergabung Sejak</p>
                    <p className="text-lg font-bold text-foreground">{joinedDate}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 skew-x-[-3deg]">
               <Link href="/kendaraan" className="border-4 border-foreground bg-primary text-primary-foreground p-6 shadow-[8px_8px_0px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-transform group cursor-pointer block">
                 <div className="skew-x-[3deg] flex flex-col gap-2">
                   <Wrench className="w-8 h-8 group-hover:scale-110 transition-transform" />
                   <h4 className="font-black uppercase italic text-lg">Kendaraan Saya</h4>
                   <p className="text-sm font-bold opacity-80">Kelola garasi virtual Anda</p>
                 </div>
               </Link>
               <Link href="/riwayat" className="border-4 border-foreground bg-foreground text-background p-6 shadow-[8px_8px_0px_rgba(220,38,38,0.5)] hover:-translate-y-1 transition-transform group cursor-pointer block">
                 <div className="skew-x-[3deg] flex flex-col gap-2">
                   <LayoutDashboard className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
                   <h4 className="font-black uppercase italic text-lg">Riwayat Servis</h4>
                   <p className="text-sm font-bold opacity-80">Lihat track record kendaraan</p>
                 </div>
               </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
