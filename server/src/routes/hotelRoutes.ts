import { Router } from 'express';
import {
  auditHotelController,
  createBookingController,
  createMerchantHotelController,
  createRoomController,
  deleteRoomController,
  getAdminHotelsController,
  getBannersController,
  getBookingsController,
  getMerchantHotelDetailController,
  getMerchantHotelsController,
  getOperationLogsController,
  getPublicHotelDetailController,
  getPublicHotelRoomsController,
  getPublicHotelsController,
  offlineHotelController,
  publishHotelController,
  restoreHotelController,
  updateMerchantHotelController,
  updateRoomController,
} from '../controllers/hotelController.js';
import { authMiddleware, requireRole } from '../middlewares/auth.js';
import { addClient, removeClient } from '../sse/eventBus.js';

const router = Router();

router.get('/banners', getBannersController);
router.get('/hotels', getPublicHotelsController);
router.get('/hotels/:id', getPublicHotelDetailController);
router.get('/hotels/:id/rooms', getPublicHotelRoomsController);
router.post('/bookings', createBookingController);
router.get('/bookings', getBookingsController);
router.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  res.write(`event: connected\ndata: ${JSON.stringify({ ok: true })}\n\n`);
  addClient(res);
  req.on('close', () => removeClient(res));
});

router.get('/merchant/hotels', authMiddleware, requireRole('merchant'), getMerchantHotelsController);
router.get('/merchant/hotels/:id', authMiddleware, requireRole('merchant'), getMerchantHotelDetailController);
router.post('/merchant/hotels', authMiddleware, requireRole('merchant'), createMerchantHotelController);
router.put('/merchant/hotels/:id', authMiddleware, requireRole('merchant'), updateMerchantHotelController);
router.post('/merchant/hotels/:id/rooms', authMiddleware, requireRole('merchant'), createRoomController);
router.put('/merchant/rooms/:roomId', authMiddleware, requireRole('merchant'), updateRoomController);
router.delete('/merchant/rooms/:roomId', authMiddleware, requireRole('merchant'), deleteRoomController);

router.get('/admin/hotels', authMiddleware, requireRole('admin'), getAdminHotelsController);
router.get('/admin/logs', authMiddleware, requireRole('admin'), getOperationLogsController);
router.patch('/admin/hotels/:id/audit', authMiddleware, requireRole('admin'), auditHotelController);
router.patch('/admin/hotels/:id/publish', authMiddleware, requireRole('admin'), publishHotelController);
router.patch('/admin/hotels/:id/offline', authMiddleware, requireRole('admin'), offlineHotelController);
router.patch('/admin/hotels/:id/restore', authMiddleware, requireRole('admin'), restoreHotelController);

export default router;
