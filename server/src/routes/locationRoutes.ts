import { Router } from 'express';
import { reverseGeocodeController } from '../controllers/locationController.js';

const router = Router();

router.get('/regeo', reverseGeocodeController);

export default router;
