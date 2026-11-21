import { Router } from 'express';
import {
  mulaiPercakapan,
  ambilPesanPelanggan,
  kirimPesanPelanggan,
  mintaAdmin,
  daftarPercakapanAdmin,
  detailPercakapanAdmin,
  balasAdmin,
  ubahModeAdmin,
} from '../controllers/chatController';

const router = Router();

// Admin (dipanggil dari server Next.js setelah cek sesi admin)
router.get('/admin/percakapan', daftarPercakapanAdmin);
router.get('/admin/percakapan/:id', detailPercakapanAdmin);
router.post('/admin/percakapan/:id/balas', balasAdmin);
router.patch('/admin/percakapan/:id/mode', ubahModeAdmin);

// Pelanggan
router.post('/', mulaiPercakapan);
router.get('/:id', ambilPesanPelanggan);
router.post('/:id', kirimPesanPelanggan);
router.post('/:id/minta-admin', mintaAdmin);

export default router;
