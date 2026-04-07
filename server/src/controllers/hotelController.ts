import {
  auditHotel,
  createBooking,
  deleteRoom,
  getAdminHotels,
  getBanners,
  getBookings,
  getMerchantHotelById,
  getMerchantHotels,
  getOperationLogs,
  getPublicHotelDetail,
  getPublicHotelRooms,
  getPublicHotels,
  offlineHotel,
  publishHotel,
  restoreHotel,
  saveMerchantHotel,
  upsertRoom,
} from '../services/hotelService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success } from '../utils/response.js';
import { auditSchema, bookingSchema, hotelSchema, roomSchema } from '../utils/validators.js';

export const getBannersController = asyncHandler(async (req, res) => {
  res.json(success(await getBanners()));
});

export const getPublicHotelsController = asyncHandler(async (req, res) => {
  res.json(success(await getPublicHotels(req.query)));
});

export const getPublicHotelDetailController = asyncHandler(async (req, res) => {
  res.json(success(await getPublicHotelDetail(req.params.id)));
});

export const getPublicHotelRoomsController = asyncHandler(async (req, res) => {
  res.json(success(await getPublicHotelRooms(req.params.id)));
});

export const getMerchantHotelsController = asyncHandler(async (req, res) => {
  res.json(success(await getMerchantHotels(req.user.id)));
});

export const getMerchantHotelDetailController = asyncHandler(async (req, res) => {
  res.json(success(await getMerchantHotelById(req.user.id, req.params.id)));
});

export const createMerchantHotelController = asyncHandler(async (req, res) => {
  const payload = hotelSchema.parse(req.body);
  res.json(success(await saveMerchantHotel(req.user.id, payload), '保存成功'));
});

export const updateMerchantHotelController = asyncHandler(async (req, res) => {
  const payload = hotelSchema.parse(req.body);
  res.json(success(await saveMerchantHotel(req.user.id, payload, req.params.id), '更新成功'));
});

export const createRoomController = asyncHandler(async (req, res) => {
  const payload = roomSchema.parse(req.body);
  res.json(success(await upsertRoom(req.user.id, req.params.id, null, payload), '房型创建成功'));
});

export const updateRoomController = asyncHandler(async (req, res) => {
  const payload = roomSchema.parse(req.body);
  const room = await upsertRoom(req.user.id, req.body.hotelId, req.params.roomId, payload);
  res.json(success(room, '房型更新成功'));
});

export const deleteRoomController = asyncHandler(async (req, res) => {
  await deleteRoom(req.user.id, req.params.roomId);
  res.json(success(null, '房型删除成功'));
});

export const getAdminHotelsController = asyncHandler(async (req, res) => {
  res.json(success(await getAdminHotels(req.query)));
});

export const auditHotelController = asyncHandler(async (req, res) => {
  const payload = auditSchema.parse(req.body);
  res.json(success(await auditHotel(req.user.id, req.params.id, payload), '审核完成'));
});

export const publishHotelController = asyncHandler(async (req, res) => {
  res.json(success(await publishHotel(req.user.id, req.params.id), '发布成功'));
});

export const offlineHotelController = asyncHandler(async (req, res) => {
  res.json(success(await offlineHotel(req.user.id, req.params.id), '下线成功'));
});

export const restoreHotelController = asyncHandler(async (req, res) => {
  res.json(success(await restoreHotel(req.user.id, req.params.id), '恢复成功'));
});

export const createBookingController = asyncHandler(async (req, res) => {
  const payload = bookingSchema.parse(req.body);
  res.json(success(await createBooking(payload), '预订成功'));
});

export const getBookingsController = asyncHandler(async (req, res) => {
  res.json(success(await getBookings()));
});

export const getOperationLogsController = asyncHandler(async (req, res) => {
  res.json(success(await getOperationLogs()));
});
