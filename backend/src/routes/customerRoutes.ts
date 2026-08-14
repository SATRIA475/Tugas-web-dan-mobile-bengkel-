import { Router } from 'express';
import { getRiwayat, getKendaraan, getProfile } from '../controllers/customerController';

const router = Router();

router.get('/history/:userId', getRiwayat);
router.get('/vehicles/:userId', getKendaraan);
router.get('/profile/:userId', getProfile);

export default router;
