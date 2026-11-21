import { Request, Response } from 'express';
import crypto from 'crypto';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { pool } from '../lib/db';
import { ensureChatTables } from '../lib/chatDb';
import { balasanAi, RiwayatPesan } from '../lib/chatAi';

const MAKS_PANJANG = 1000;

type Percakapan = RowDataPacket & {
  id: string;
  pelanggan_id: string | null;
  nama_tamu: string | null;
  mode: 'AI' | 'ADMIN';
  butuh_admin: number;
};

async function ambilPercakapan(id: string): Promise<Percakapan | null> {
  const [rows] = await pool.query<Percakapan[]>('SELECT * FROM chat_percakapan WHERE id = ?', [id]);
  return rows[0] ?? null;
}

async function simpanPesan(percakapanId: string, pengirim: RiwayatPesan['pengirim'], isi: string, adminId: string | null = null) {
  const [res] = await pool.query<ResultSetHeader>(
    'INSERT INTO chat_pesan (percakapan_id, pengirim, admin_id, isi) VALUES (?, ?, ?, ?)',
    [percakapanId, pengirim, adminId, isi]
  );
  return res.insertId;
}

async function daftarPesan(percakapanId: string, setelah = 0) {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT p.id, p.pengirim, p.isi, p.createdAt, u.nama AS admin_nama
     FROM chat_pesan p LEFT JOIN users u ON p.admin_id = u.id
     WHERE p.percakapan_id = ? AND p.id > ?
     ORDER BY p.id ASC`,
    [percakapanId, setelah]
  );
  return rows;
}

function teksPesan(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const isi = raw.trim();
  if (!isi || isi.length > MAKS_PANJANG) return null;
  return isi;
}

async function teruskanKeAdmin(id: string, alasan: string) {
  await pool.query(`UPDATE chat_percakapan SET mode = 'ADMIN', butuh_admin = 1 WHERE id = ?`, [id]);
  await simpanPesan(id, 'SISTEM', `Diteruskan ke admin: ${alasan}`);
}

/* ===================== Pelanggan ===================== */

/** POST /api/chat — mulai percakapan baru. ID percakapan berfungsi sebagai token rahasia. */
export const mulaiPercakapan = async (req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const { pelanggan_id, nama } = req.body ?? {};
    const id = crypto.randomBytes(24).toString('hex');
    await pool.query('INSERT INTO chat_percakapan (id, pelanggan_id, nama_tamu) VALUES (?, ?, ?)', [
      id,
      typeof pelanggan_id === 'string' && pelanggan_id ? pelanggan_id : null,
      typeof nama === 'string' && nama.trim() ? nama.trim().slice(0, 100) : null,
    ]);
    await simpanPesan(id, 'AI', 'Halo! Saya asisten virtual Satra Garage+. Ada yang bisa dibantu soal servis motor Anda? Jika perlu, Anda juga bisa langsung bicara dengan admin bengkel.');
    res.status(201).json({ id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memulai percakapan' });
  }
};

/** GET /api/chat/:id?setelah=<idPesan> — ambil pesan baru (untuk polling). */
export const ambilPesanPelanggan = async (req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const id = String(req.params.id);
    const percakapan = await ambilPercakapan(id);
    if (!percakapan) return res.status(404).json({ error: 'Percakapan tidak ditemukan' });
    const setelah = Number(req.query.setelah) || 0;
    const pesan = (await daftarPesan(id, setelah)).filter((p) => p.pengirim !== 'SISTEM');
    res.json({ mode: percakapan.mode, butuh_admin: !!percakapan.butuh_admin, pesan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil pesan' });
  }
};

/** POST /api/chat/:id — pelanggan mengirim pesan; AI membalas jika mode AI. */
export const kirimPesanPelanggan = async (req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const id = String(req.params.id);
    const isi = teksPesan(req.body?.isi);
    if (!isi) return res.status(400).json({ error: `Pesan wajib diisi (maksimal ${MAKS_PANJANG} karakter)` });

    const percakapan = await ambilPercakapan(id);
    if (!percakapan) return res.status(404).json({ error: 'Percakapan tidak ditemukan' });

    // Kaitkan ke akun jika pelanggan baru login setelah memulai chat
    if (!percakapan.pelanggan_id && typeof req.body?.pelanggan_id === 'string' && req.body.pelanggan_id) {
      await pool.query('UPDATE chat_percakapan SET pelanggan_id = ? WHERE id = ?', [req.body.pelanggan_id, id]);
    }

    await simpanPesan(id, 'PELANGGAN', isi);
    await pool.query('UPDATE chat_percakapan SET belum_dibaca_admin = belum_dibaca_admin + 1 WHERE id = ?', [id]);

    if (percakapan.mode === 'AI') {
      const [riwayat] = await pool.query<RowDataPacket[]>(
        'SELECT pengirim, isi FROM chat_pesan WHERE percakapan_id = ? ORDER BY id DESC LIMIT 30',
        [id]
      );
      try {
        const hasil = await balasanAi((riwayat as RiwayatPesan[]).reverse());
        await simpanPesan(id, 'AI', hasil.teks);
        if (hasil.jenis === 'teruskan') await teruskanKeAdmin(id, hasil.alasan);
      } catch (err) {
        // AI tidak tersedia (mis. API key belum diisi) — jangan biarkan pelanggan tanpa jawaban
        console.error('Balasan AI gagal:', err instanceof Error ? err.message : err);
        await simpanPesan(id, 'AI', 'Asisten AI sedang tidak tersedia. Pesan Anda sudah diteruskan ke admin bengkel, mohon tunggu balasannya di sini.');
        await teruskanKeAdmin(id, 'AI tidak tersedia');
      }
    }

    const setelah = Number(req.body?.setelah) || 0;
    const terbaru = await ambilPercakapan(id);
    const pesan = (await daftarPesan(id, setelah)).filter((p) => p.pengirim !== 'SISTEM');
    res.json({ mode: terbaru?.mode, butuh_admin: !!terbaru?.butuh_admin, pesan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengirim pesan' });
  }
};

/** POST /api/chat/:id/minta-admin — pelanggan minta bicara langsung dengan admin. */
export const mintaAdmin = async (req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const id = String(req.params.id);
    const percakapan = await ambilPercakapan(id);
    if (!percakapan) return res.status(404).json({ error: 'Percakapan tidak ditemukan' });
    if (percakapan.mode !== 'ADMIN' || !percakapan.butuh_admin) {
      await teruskanKeAdmin(id, 'Pelanggan meminta bicara dengan admin');
      await simpanPesan(id, 'AI', 'Baik, saya hubungkan dengan admin bengkel. Admin akan membalas di sini secepatnya.');
      await pool.query('UPDATE chat_percakapan SET belum_dibaca_admin = belum_dibaca_admin + 1 WHERE id = ?', [id]);
    }
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal meneruskan ke admin' });
  }
};

/* ===================== Admin ===================== */

/** GET /api/chat/admin/percakapan — daftar percakapan terbaru. */
export const daftarPercakapanAdmin = async (_req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT c.id, c.mode, c.butuh_admin, c.belum_dibaca_admin, c.updatedAt, c.createdAt,
             COALESCE(u.nama, c.nama_tamu, 'Tamu') AS nama, u.email,
             (SELECT isi FROM chat_pesan p WHERE p.percakapan_id = c.id AND p.pengirim <> 'SISTEM' ORDER BY p.id DESC LIMIT 1) AS pesan_terakhir,
             (SELECT pengirim FROM chat_pesan p WHERE p.percakapan_id = c.id AND p.pengirim <> 'SISTEM' ORDER BY p.id DESC LIMIT 1) AS pengirim_terakhir
      FROM chat_percakapan c
      LEFT JOIN users u ON c.pelanggan_id = u.id
      WHERE EXISTS (SELECT 1 FROM chat_pesan p WHERE p.percakapan_id = c.id AND p.pengirim = 'PELANGGAN')
      ORDER BY c.butuh_admin DESC, c.updatedAt DESC
      LIMIT 100
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil daftar chat' });
  }
};

/** GET /api/chat/admin/percakapan/:id — isi percakapan (menandai sudah dibaca). */
export const detailPercakapanAdmin = async (req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const id = String(req.params.id);
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT c.id, c.mode, c.butuh_admin, c.createdAt, COALESCE(u.nama, c.nama_tamu, 'Tamu') AS nama, u.email, u.no_telepon
       FROM chat_percakapan c LEFT JOIN users u ON c.pelanggan_id = u.id WHERE c.id = ?`,
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Percakapan tidak ditemukan' });
    await pool.query('UPDATE chat_percakapan SET belum_dibaca_admin = 0, updatedAt = updatedAt WHERE id = ?', [id]);
    const setelah = Number(req.query.setelah) || 0;
    res.json({ percakapan: { ...rows[0], butuh_admin: !!rows[0].butuh_admin }, pesan: await daftarPesan(id, setelah) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengambil percakapan' });
  }
};

/** POST /api/chat/admin/percakapan/:id/balas — admin membalas (AI berhenti menjawab). */
export const balasAdmin = async (req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const id = String(req.params.id);
    const isi = teksPesan(req.body?.isi);
    const adminId = typeof req.body?.admin_id === 'string' ? req.body.admin_id : null;
    if (!isi) return res.status(400).json({ error: `Pesan wajib diisi (maksimal ${MAKS_PANJANG} karakter)` });
    if (!adminId) return res.status(400).json({ error: 'Admin ID wajib diisi' });
    if (!(await ambilPercakapan(id))) return res.status(404).json({ error: 'Percakapan tidak ditemukan' });

    await simpanPesan(id, 'ADMIN', isi, adminId);
    await pool.query(`UPDATE chat_percakapan SET mode = 'ADMIN', butuh_admin = 0, belum_dibaca_admin = 0 WHERE id = ?`, [id]);
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengirim balasan' });
  }
};

/** PATCH /api/chat/admin/percakapan/:id/mode — admin menyerahkan kembali ke AI atau mengambil alih. */
export const ubahModeAdmin = async (req: Request, res: Response) => {
  try {
    await ensureChatTables();
    const id = String(req.params.id);
    const mode = req.body?.mode;
    if (mode !== 'AI' && mode !== 'ADMIN') return res.status(400).json({ error: "Mode harus 'AI' atau 'ADMIN'" });
    if (!(await ambilPercakapan(id))) return res.status(404).json({ error: 'Percakapan tidak ditemukan' });

    await pool.query('UPDATE chat_percakapan SET mode = ?, butuh_admin = 0 WHERE id = ?', [mode, id]);
    await simpanPesan(id, 'SISTEM', mode === 'AI' ? 'Admin menyerahkan percakapan kembali ke AI' : 'Admin mengambil alih percakapan');
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal mengubah mode' });
  }
};
