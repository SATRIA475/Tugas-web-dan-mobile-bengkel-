import { Users, Wrench, CalendarClock, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

async function getStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/stats`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    return null;
  }
}

async function getBookings() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/bookings`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.slice(0, 5); // get top 5 recent bookings
  } catch (error) {
    return [];
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats();
  const recentBookings = await getBookings();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Menunggu': return <span className="bg-amber-500/20 text-amber-600 border-2 border-amber-500 px-3 py-1 font-black uppercase text-xs flex items-center gap-1 skew-x-[-10deg]"><Clock className="w-3 h-3 skew-x-[10deg]" /><span className="skew-x-[10deg]">Menunggu</span></span>;
      case 'Diproses': return <span className="bg-blue-500/20 text-blue-600 border-2 border-blue-500 px-3 py-1 font-black uppercase text-xs flex items-center gap-1 skew-x-[-10deg]"><Wrench className="w-3 h-3 skew-x-[10deg]" /><span className="skew-x-[10deg]">Diproses</span></span>;
      case 'Selesai': return <span className="bg-green-500/20 text-green-600 border-2 border-green-500 px-3 py-1 font-black uppercase text-xs flex items-center gap-1 skew-x-[-10deg]"><CheckCircle2 className="w-3 h-3 skew-x-[10deg]" /><span className="skew-x-[10deg]">Selesai</span></span>;
      default: return <span className="bg-gray-500/20 text-gray-600 px-3 py-1 font-black uppercase text-xs skew-x-[-10deg]"><span className="skew-x-[10deg]">{status}</span></span>;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-foreground pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-foreground uppercase italic tracking-tighter skew-x-[-5deg]">Command <span className="text-primary">Center</span></h1>
          <p className="text-foreground/70 mt-2 font-bold uppercase tracking-wider text-sm md:text-base">Status performa bengkel hari ini secara real-time.</p>
        </div>
        <Link href="/admin/dashboard/booking">
          <Button className="bg-primary text-primary-foreground hover:bg-foreground hover:text-background border-4 border-foreground h-12 px-6 rounded-none font-black italic shadow-[4px_4px_0px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all skew-x-[-10deg]">
            <span className="skew-x-[10deg] flex items-center gap-2">Kelola Semua Booking <CalendarClock className="w-4 h-4" /></span>
          </Button>
        </Link>
      </div>
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-card text-card-foreground border-4 border-foreground shadow-[8px_8px_0px_rgba(0,0,0,0.1)] hover:shadow-[12px_12px_0px_rgba(220,38,38,0.3)] transition-all p-6 flex flex-col justify-between skew-x-[-2deg] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CalendarClock className="w-24 h-24 transform translate-x-4 -translate-y-4 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary text-primary-foreground border-2 border-foreground skew-x-[5deg]">
                <CalendarClock className="w-6 h-6 skew-x-[-5deg]" />
              </div>
              <h3 className="font-black text-foreground uppercase tracking-widest skew-x-[2deg]">Booking Menunggu</h3>
            </div>
            <div className="text-6xl font-black text-primary italic tracking-tighter skew-x-[2deg]">{stats?.bookingMenunggu || 0}</div>
          </div>
        </div>
        
        <div className="bg-card text-card-foreground border-4 border-foreground shadow-[8px_8px_0px_rgba(0,0,0,0.1)] hover:shadow-[12px_12px_0px_rgba(0,0,0,0.3)] transition-all p-6 flex flex-col justify-between skew-x-[-2deg] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Users className="w-24 h-24 transform translate-x-4 -translate-y-4 text-foreground" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-foreground text-background border-2 border-foreground skew-x-[5deg]">
                <Users className="w-6 h-6 skew-x-[-5deg]" />
              </div>
              <h3 className="font-black text-foreground uppercase tracking-widest skew-x-[2deg]">Total Pelanggan</h3>
            </div>
            <div className="text-6xl font-black text-foreground italic tracking-tighter skew-x-[2deg]">{stats?.totalPelanggan || 2}</div>
          </div>
        </div>

        <div className="bg-card text-card-foreground border-4 border-foreground shadow-[8px_8px_0px_rgba(0,0,0,0.1)] hover:shadow-[12px_12px_0px_rgba(0,0,0,0.3)] transition-all p-6 flex flex-col justify-between skew-x-[-2deg] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wrench className="w-24 h-24 transform translate-x-4 -translate-y-4 text-foreground" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-background text-foreground border-2 border-foreground skew-x-[5deg]">
                <Wrench className="w-6 h-6 skew-x-[-5deg]" />
              </div>
              <h3 className="font-black text-foreground uppercase tracking-widest skew-x-[2deg]">Total Layanan</h3>
            </div>
            <div className="text-6xl font-black text-foreground italic tracking-tighter skew-x-[2deg]">{stats?.totalLayanan || 5}</div>
          </div>
        </div>
      </div>

      {/* Booking Management Feature Preview */}
      <div className="mt-12 bg-background border-4 border-foreground shadow-[12px_12px_0px_rgba(0,0,0,0.1)] relative overflow-hidden">
        <div className="bg-foreground text-background p-5 border-b-4 border-foreground flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase italic tracking-widest flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-primary" /> Antrean Booking Terbaru
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-muted border-b-4 border-foreground">
              <tr>
                <th className="p-4 font-black uppercase tracking-widest text-sm whitespace-nowrap">ID Booking</th>
                <th className="p-4 font-black uppercase tracking-widest text-sm whitespace-nowrap">Pelanggan</th>
                <th className="p-4 font-black uppercase tracking-widest text-sm whitespace-nowrap">Kendaraan</th>
                <th className="p-4 font-black uppercase tracking-widest text-sm whitespace-nowrap">Layanan</th>
                <th className="p-4 font-black uppercase tracking-widest text-sm whitespace-nowrap">Jadwal</th>
                <th className="p-4 font-black uppercase tracking-widest text-sm whitespace-nowrap">Status</th>
                <th className="p-4 font-black uppercase tracking-widest text-sm text-right whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-muted">
              {recentBookings.map((booking: any, index: number) => (
                <tr key={index} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-bold text-sm">BKG-{String(booking.id).padStart(3, '0')}</td>
                  <td className="p-4 font-bold text-sm uppercase">{booking.pelanggan_nama}</td>
                  <td className="p-4 font-bold text-sm text-foreground/80">{booking.plat_nomor}</td>
                  <td className="p-4 font-bold text-sm text-foreground/80">{booking.nama_layanan}</td>
                  <td className="p-4 font-bold text-sm">
                    {new Date(booking.tanggal_booking).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="p-4">
                    {getStatusBadge(booking.status)}
                  </td>
                  <td className="p-4 text-right">
                    <Button variant="outline" size="sm" className="border-2 border-foreground rounded-none font-black uppercase text-xs skew-x-[-10deg] hover:bg-foreground hover:text-background">
                      <span className="skew-x-[10deg]">Detail</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {recentBookings.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center">
            <CalendarClock className="w-16 h-16 text-muted-foreground opacity-50 mb-4" />
            <p className="text-xl font-bold text-muted-foreground uppercase">Belum ada booking hari ini.</p>
          </div>
        )}
      </div>

    </div>
  )
}
