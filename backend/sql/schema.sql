-- Skema untuk inisialisasi otomatis database kosong (dipakai backend saat start, mis. di Railway).
-- Salinan dari database/schema.sql tanpa CREATE DATABASE / USE / DROP TABLE agar aman dijalankan.
-- Jika mengubah skema, perbarui kedua file.

-- ==============================================================================
-- DATABASE MYSQL SCHEMA UNTUK BENGKEL
-- ==============================================================================

-- Buat database jika belum ada

-- ==============================================================================
-- 1. DROP TABLES (Hapus tabel jika sudah ada, urutan dari child ke parent)
-- ==============================================================================

-- ==============================================================================
-- 2. CREATE TABLES
-- ==============================================================================

-- a. Table: users
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(191) PRIMARY KEY,
  email VARCHAR(191) UNIQUE NOT NULL,
  password VARCHAR(191) NOT NULL,
  nama VARCHAR(191) NOT NULL,
  no_telepon VARCHAR(191),
  role ENUM('PELANGGAN', 'ADMIN', 'SUPER_ADMIN') DEFAULT 'PELANGGAN',
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
);

-- b. Table: kendaraan
CREATE TABLE IF NOT EXISTS kendaraan (
  id VARCHAR(191) PRIMARY KEY,
  user_id VARCHAR(191) NOT NULL,
  plat_nomor VARCHAR(191) UNIQUE NOT NULL,
  merk VARCHAR(191) NOT NULL,
  tipe VARCHAR(191) NOT NULL,
  tahun INT,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_kendaraan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- c. Table: layanan
CREATE TABLE IF NOT EXISTS layanan (
  id VARCHAR(191) PRIMARY KEY,
  nama_layanan VARCHAR(191) NOT NULL,
  deskripsi VARCHAR(191),
  harga DECIMAL(65, 30) NOT NULL,
  estimasi_waktu INT, -- dalam menit
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
);

-- d. Table: booking
CREATE TABLE IF NOT EXISTS booking (
  id VARCHAR(191) PRIMARY KEY,
  pelanggan_id VARCHAR(191) NOT NULL,
  kendaraan_id VARCHAR(191) NOT NULL,
  layanan_id VARCHAR(191) NOT NULL,
  tanggal_booking DATETIME(3) NOT NULL,
  status ENUM('Menunggu', 'Diproses', 'Selesai', 'Dibatalkan') DEFAULT 'Menunggu',
  catatan TEXT,
  createdAt DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_booking_pelanggan FOREIGN KEY (pelanggan_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_kendaraan FOREIGN KEY (kendaraan_id) REFERENCES kendaraan(id) ON DELETE CASCADE,
  CONSTRAINT fk_booking_layanan FOREIGN KEY (layanan_id) REFERENCES layanan(id) ON DELETE CASCADE
);

-- e. Table: transaksi
CREATE TABLE IF NOT EXISTS transaksi (
  id VARCHAR(191) PRIMARY KEY,
  booking_id VARCHAR(191) UNIQUE NOT NULL,
  admin_id VARCHAR(191),
  total_bayar DECIMAL(65, 30) NOT NULL,
  metode_pembayaran VARCHAR(191),
  status_pembayaran ENUM('Lunas', 'Belum Lunas') DEFAULT 'Lunas',
  tanggal_bayar DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
  CONSTRAINT fk_transaksi_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE CASCADE,
  CONSTRAINT fk_transaksi_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ==============================================================================
-- 3. SEED DATA (Data Awal Layanan)
-- ==============================================================================
INSERT INTO layanan (id, nama_layanan, deskripsi, harga, estimasi_waktu) VALUES
(UUID(), 'Servis Rutin Ringan', 'Ganti oli, cek kampas rem, busi, dan tegangan aki.', 150000.00, 60),
(UUID(), 'Servis Besar / Berat', 'Bongkar mesin (turun mesin), ganti piston, dll.', 750000.00, 360),
(UUID(), 'Ganti Oli Mesin', 'Ganti oli mesin standar pabrik.', 65000.00, 30),
(UUID(), 'Ganti Kampas Rem', 'Ganti kampas rem depan atau belakang.', 85000.00, 45),
(UUID(), 'Tune Up Injeksi', 'Pembersihan injektor, throttle body, reset ECU.', 200000.00, 90);

-- f. Live chat (AI + admin bengkel)
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
);

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
);
