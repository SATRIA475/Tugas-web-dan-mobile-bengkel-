import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { RowDataPacket } from 'mysql2';
import { pool } from './db';

/**
 * Jika DATABASE_URL menunjuk ke database yang belum ada (mis. database `bengkel`
 * di server MySQL yang dipakai bersama aplikasi lain), buat database tersebut.
 */
async function buatDatabaseJikaBelumAda() {
  const raw = process.env.DATABASE_URL;
  if (!raw) return;
  const url = new URL(raw);
  const nama = decodeURIComponent(url.pathname.replace(/^\//, ''));
  if (!nama || !/^[A-Za-z0-9_]+$/.test(nama)) return;
  url.pathname = '/';
  const conn = await mysql.createConnection(url.toString());
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${nama}\``);
  } finally {
    await conn.end();
  }
}

/**
 * Siapkan database saat backend start (dipakai saat deploy, mis. Railway):
 * 1. Jika tabel `users` belum ada (database baru/kosong), jalankan sql/schema.sql.
 * 2. Jika ADMIN_EMAIL & ADMIN_PASSWORD diisi dan akun itu belum ada, buat akun admin.
 * Aman dijalankan berulang kali: database yang sudah berisi tidak diubah.
 */
export async function initDatabase() {
  await buatDatabaseJikaBelumAda();

  const [tables] = await pool.query<RowDataPacket[]>("SHOW TABLES LIKE 'users'");
  if (tables.length === 0) {
    const file = path.resolve(process.cwd(), 'sql', 'schema.sql');
    const sql = fs.readFileSync(file, 'utf8');
    const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL!, multipleStatements: true });
    try {
      await conn.query(sql);
      console.log('[initDb] Database kosong: skema dan data layanan awal dibuat.');
    } finally {
      await conn.end();
    }
  }

  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      const hash = await bcrypt.hash(password, 10);
      await pool.query('INSERT INTO users (id, email, password, nama, role) VALUES (?, ?, ?, ?, ?)', [
        crypto.randomUUID(),
        email,
        hash,
        process.env.ADMIN_NAME?.trim() || 'Administrator',
        'ADMIN',
      ]);
      console.log(`[initDb] Akun admin ${email} dibuat.`);
    }
  }
}
