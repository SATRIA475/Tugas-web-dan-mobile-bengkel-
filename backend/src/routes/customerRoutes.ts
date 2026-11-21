import { Router } from 'express';
import { getRiwayat, getKendaraan, getProfile, addKendaraan, deleteKendaraan } from '../controllers/customerController';

const router = Router();

router.get('/history/:userId', getRiwayat);
router.get('/vehicles/:userId', getKendaraan);
router.post('/vehicles/:userId', addKendaraan);
router.delete('/vehicles/:userId/:id', deleteKendaraan);
router.get('/profile/:userId', getProfile);

export default router;
