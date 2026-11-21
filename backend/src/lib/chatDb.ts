import { pool } from './db';

let ready: Promise<void> | null = null;

/**
 * Membuat tabel live chat jika belum ada (idempotent).
 * Definisi yang sama juga ada di database/schema.sql.
 */
export function ensureChatTables(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS chat_percakapan (
          id VARCHAR(64) PRIMARY KEY,
          pelanggan_id VARCHAR(191) NULL,
          nama_tamu VARCHAR(191) NULL,
          mode ENUM('AI', 'ADMIN') NOT NULL DEFAULT 'AI',
          butuh_admin TINYINT(1) NOT NULL DEFAULT 0,
          belum_dibaca_admin INT NOT NULL DEFAULT 0,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
          INDEX idx_chat_updated (updatedAt),
          CONSTRAINT fk_chat_pelanggan FOREIGN KEY (pelanggan_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS chat_pesan (
          id BIGINT AUTO_INCREMENT PRIMARY KEY,
          percakapan_id VARCHAR(64) NOT NULL,
          pengirim ENUM('PELANGGAN', 'AI', 'ADMIN', 'SISTEM') NOT NULL,
          admin_id VARCHAR(191) NULL,
          isi TEXT NOT NULL,
          createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
          INDEX idx_pesan_percakapan (percakapan_id, id),
          CONSTRAINT fk_pesan_percakapan FOREIGN KEY (percakapan_id) REFERENCES chat_percakapan(id) ON DELETE CASCADE,
          CONSTRAINT fk_pesan_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
        )
      `);
    })().catch((err) => {
      ready = null; // coba lagi di request berikutnya
      throw err;
    });
  }
  return ready;
}
