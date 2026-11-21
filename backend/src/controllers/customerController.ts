import crypto from 'crypto';
import { Request, Response } from 'express';
import { pool } from '../lib/db';
import { RowDataPacket } from 'mysql2';

export const getRiwayat = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(`
      SELECT b.id, b.tanggal_booking, b.status, b.catatan, k.plat_nomor, k.merk, k.tipe, l.nama_layanan, l.harga,
      t.total_bayar, t.metode_pembayaran, t.status_pembayaran, t.id as transaksi_id, t.tanggal_bayar
      FROM booking b
      JOIN kendaraan k ON b.kendaraan_id = k.id
      JOIN layanan l ON b.layanan_id = l.id
      LEFT JOIN transaksi t ON b.id = t.booking_id
      WHERE b.pelanggan_id = ?
      ORDER BY b.tanggal_booking DESC
    `, [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const getKendaraan = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(`
      SELECT id, plat_nomor, merk, tipe, tahun, createdAt
      FROM kendaraan
      WHERE user_id = ?
      ORDER BY createdAt DESC
    `, [userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const [rows] = await pool.query(`
      SELECT id, email, nama, no_telepon, role, createdAt
      FROM users
      WHERE id = ?
    `, [userId]);
    
    if (Array.isArray(rows) && rows.length > 0) {
      res.json((rows as RowDataPacket[])[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const addKendaraan = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { plat_nomor, merk, tipe, tahun } = req.body;

    if (!plat_nomor || !merk || !tipe) {
      return res.status(400).json({ error: 'Plat nomor, merk, dan tipe wajib diisi' });
    }

    const plat = String(plat_nomor).trim().toUpperCase();
    const [existing] = await pool.query<RowDataPacket[]>('SELECT id FROM kendaraan WHERE plat_nomor = ?', [plat]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Plat nomor sudah terdaftar' });
    }

    const id = crypto.randomUUID();
    const tahunNum = tahun ? parseInt(String(tahun), 10) : null;
    await pool.query(
      'INSERT INTO kendaraan (id, user_id, plat_nomor, merk, tipe, tahun) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, plat, String(merk).trim(), String(tipe).trim(), Number.isNaN(tahunNum) ? null : tahunNum]
    );
    res.status(201).json({ message: 'Kendaraan berhasil ditambahkan', id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menambahkan kendaraan' });
  }
};

export const deleteKendaraan = async (req: Request, res: Response) => {
  try {
    const { userId, id } = req.params;
    // Hanya hapus kendaraan milik user tersebut
    const [result]: any = await pool.query('DELETE FROM kendaraan WHERE id = ? AND user_id = ?', [id, userId]);
    if (!result.affectedRows) {
      return res.status(404).json({ error: 'Kendaraan tidak ditemukan' });
    }
    res.json({ message: 'Kendaraan berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal menghapus kendaraan' });
  }
};
