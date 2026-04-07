import dayjs from 'dayjs';
import { prisma } from '../db/prisma.js';
import { publishEvent } from '../sse/eventBus.js';
import { createLog } from './logService.js';

const includeHotel = {
  roomTypes: true,
  merchant: {
    select: {
      id: true,
      username: true,
    },
  },
};

const parseArrayField = (value: any) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch (error) {
    return [];
  }
};

const normalizeHotel = (hotel: any) => ({
  ...hotel,
  tags: parseArrayField(hotel.tags),
  facilities: parseArrayField(hotel.facilities),
  galleryImages: parseArrayField(hotel.galleryImages),
  nearbyInfo: parseArrayField(hotel.nearbyInfo),
  roomTypes: [...hotel.roomTypes].sort((a, b) => a.price - b.price),
});

const minRoomPrice = (hotel: any) =>
  hotel.roomTypes.length ? Math.min(...hotel.roomTypes.map((room) => room.price)) : 0;

const decorateHotel = (hotel: any) => {
  const normalized = normalizeHotel(hotel);
  return {
    ...normalized,
    minPrice: minRoomPrice(normalized),
    recommendedReason: normalized.tags.includes('亲子')
      ? '亲子优选，设施更适合家庭出游'
      : normalized.tags.includes('商务')
        ? '商务差旅优选，通勤效率更高'
        : normalized.tags.includes('近地铁')
          ? '地铁出行便捷，城市探索更轻松'
          : '评分稳定，性价比较高',
  };
};

const applyPublicFilters = (query: any) => {
  const where: any = {
    auditStatus: 'approved',
    publishStatus: 'published',
    isOffline: false,
  };

  if (query.city) where.city = query.city;
  if (query.star) where.star = Number(query.star);

  if (query.keyword) {
    where.OR = [
      { nameZh: { contains: query.keyword } },
      { nameEn: { contains: query.keyword } },
      { address: { contains: query.keyword } },
      { description: { contains: query.keyword } },
    ];
  }

  return where;
};

const filterByTags = (hotels: any[], query: any) => {
  if (!query.tags) return hotels;
  const tags = String(query.tags)
    .split(',')
    .filter(Boolean);
  if (!tags.length) return hotels;
  return hotels.filter((hotel) => tags.every((tag) => hotel.tags.includes(tag)));
};

const filterByPrice = (hotels: any[], query: any) => {
  const min = Number(query.minPrice || 0);
  const max = Number(query.maxPrice || 999999);
  return hotels.filter((hotel) => {
    const price = minRoomPrice(hotel);
    return price >= min && price <= max;
  });
};

const sortHotels = (hotels: any[], query: any) => {
  const sorted = [...hotels];
  if (query.sort === 'priceAsc') sorted.sort((a, b) => minRoomPrice(a) - minRoomPrice(b));
  else if (query.sort === 'priceDesc') sorted.sort((a, b) => minRoomPrice(b) - minRoomPrice(a));
  else sorted.sort((a, b) => dayjs(b.updatedAt).valueOf() - dayjs(a.updatedAt).valueOf());

  // Always place fully sold-out hotels at the bottom of the list.
  sorted.sort((a, b) => {
    const aSoldOut = a.roomTypes.length > 0 && a.roomTypes.every((room) => room.stock <= 0);
    const bSoldOut = b.roomTypes.length > 0 && b.roomTypes.every((room) => room.stock <= 0);
    if (aSoldOut === bSoldOut) return 0;
    return aSoldOut ? 1 : -1;
  });

  return sorted;
};

export const getBanners = async () =>
  prisma.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });

export const getPublicHotels = async (query: any) => {
  const page = Number(query.page || 1);
  const pageSize = Number(query.pageSize || 6);

  const all = await prisma.hotel.findMany({
    where: applyPublicFilters(query),
    include: includeHotel,
  });

  const filtered = sortHotels(filterByPrice(filterByTags(all.map(decorateHotel), query), query), query);
  const start = (page - 1) * pageSize;
  const list = filtered.slice(start, start + pageSize);

  return {
    list,
    page,
    pageSize,
    total: filtered.length,
    hasMore: start + pageSize < filtered.length,
  };
};

export const getPublicHotelDetail = async (id: any) => {
  const hotel = await prisma.hotel.findFirst({
    where: {
      id: Number(id),
      auditStatus: 'approved',
      publishStatus: 'published',
      isOffline: false,
    },
    include: includeHotel,
  });
  if (!hotel) throw new Error('酒店不存在或暂不可见');
  return decorateHotel(hotel);
};

export const getPublicHotelRooms = async (id: any) =>
  (await prisma.roomType.findMany({
    where: { hotelId: Number(id) },
    orderBy: { price: 'asc' },
  })).sort((a, b) => {
    const aSoldOut = a.stock <= 0;
    const bSoldOut = b.stock <= 0;
    if (aSoldOut === bSoldOut) return 0;
    return aSoldOut ? 1 : -1;
  });

export const getMerchantHotels = async (merchantId: any) =>
  (await prisma.hotel.findMany({
    where: { merchantId },
    include: { roomTypes: { orderBy: { price: 'asc' } } },
    orderBy: { updatedAt: 'desc' },
  })).map(normalizeHotel);

export const getMerchantHotelById = async (merchantId: any, id: any) => {
  const hotel = await prisma.hotel.findFirst({
    where: { id: Number(id), merchantId },
    include: { roomTypes: { orderBy: { price: 'asc' } } },
  });
  if (!hotel) throw new Error('酒店不存在');
  return normalizeHotel(hotel);
};

export const saveMerchantHotel = async (merchantId: any, payload: any, hotelId: any = null) => {
  const hotelData = {
    merchantId,
    nameZh: payload.nameZh,
    nameEn: payload.nameEn,
    city: payload.city,
    address: payload.address,
    star: payload.star,
    description: payload.description,
    openYear: payload.openYear,
    coverImage: payload.coverImage,
    galleryImages: JSON.stringify(payload.galleryImages || []),
    tags: JSON.stringify(payload.tags || []),
    facilities: JSON.stringify(payload.facilities || []),
    nearbyInfo: JSON.stringify(payload.nearbyInfo || []),
    discountInfo: payload.discountInfo,
    latitude: payload.latitude ?? null,
    longitude: payload.longitude ?? null,
    publishStatus: payload.publishStatus || 'draft',
    auditStatus: 'pending',
    auditReason: '',
  };

  let hotel;
  if (hotelId) {
    const existing = await prisma.hotel.findFirst({
      where: { id: Number(hotelId), merchantId },
      include: { roomTypes: true },
    });
    if (!existing) throw new Error('酒店不存在');

    hotel = await prisma.hotel.update({
      where: { id: Number(hotelId) },
      data: hotelData,
    });

    const currentIds = new Set(existing.roomTypes.map((room) => room.id));
    const incomingIds = new Set(payload.roomTypes.filter((room) => room.id).map((room) => Number(room.id)));
    const removeIds = [...currentIds].filter((id) => !incomingIds.has(id));
    if (removeIds.length) {
      await prisma.roomType.deleteMany({ where: { id: { in: removeIds } } });
    }
  } else {
    hotel = await prisma.hotel.create({ data: hotelData });
  }

  for (const room of payload.roomTypes) {
    const roomData = {
      hotelId: hotel.id,
      roomName: room.roomName,
      bedType: room.bedType,
      breakfastIncluded: room.breakfastIncluded,
      cancelPolicy: room.cancelPolicy,
      price: room.price,
      originalPrice: room.originalPrice,
      stock: room.stock,
      roomArea: room.roomArea,
      maxGuests: room.maxGuests,
      roomImage: room.roomImage,
    };

    if (room.id) {
      await prisma.roomType.update({
        where: { id: Number(room.id) },
        data: roomData,
      });
    } else {
      await prisma.roomType.create({ data: roomData });
    }
  }

  await createLog(merchantId, hotelId ? 'UPDATE_HOTEL' : 'CREATE_HOTEL', `${payload.nameZh} 已保存`);
  publishEvent('hotel-updated', {
    hotelId: hotel.id,
    action: hotelId ? 'updated' : 'created',
    changedAt: dayjs().toISOString(),
  });
  return getMerchantHotelById(merchantId, hotel.id);
};

export const upsertRoom = async (merchantId: any, hotelId: any, roomId: any, payload: any) => {
  const hotel = await prisma.hotel.findFirst({ where: { id: Number(hotelId), merchantId } });
  if (!hotel) throw new Error('酒店不存在');

  if (roomId) {
    return prisma.roomType.update({
      where: { id: Number(roomId) },
      data: { ...payload, hotelId: Number(hotelId) },
    });
  }

  return prisma.roomType.create({
    data: { ...payload, hotelId: Number(hotelId) },
  });
};

export const deleteRoom = async (merchantId: any, roomId: any) => {
  const room = await prisma.roomType.findFirst({
    where: {
      id: Number(roomId),
      hotel: { merchantId },
    },
  });
  if (!room) throw new Error('房型不存在');
  await prisma.roomType.delete({ where: { id: Number(roomId) } });
};

export const getAdminHotels = async (query: any) => {
  const where: any = {};
  if (query.auditStatus) where.auditStatus = query.auditStatus;
  if (query.publishStatus) where.publishStatus = query.publishStatus;
  if (query.isOffline === 'true') where.isOffline = true;
  if (query.isOffline === 'false') where.isOffline = false;

  const hotels = await prisma.hotel.findMany({
    where,
    include: includeHotel,
    orderBy: { updatedAt: 'desc' },
  });
  return hotels.map(normalizeHotel);
};

export const auditHotel = async (userId: any, id: any, payload: any) => {
  if (payload.auditStatus === 'rejected' && !payload.auditReason) {
    throw new Error('审核不通过时必须填写原因');
  }

  const hotel = await prisma.hotel.update({
    where: { id: Number(id) },
    data: {
      auditStatus: payload.auditStatus,
      auditReason: payload.auditStatus === 'rejected' ? payload.auditReason : '',
    },
  });
  await createLog(userId, 'AUDIT_HOTEL', `${hotel.nameZh} -> ${payload.auditStatus}`);
  publishEvent('hotel-status-changed', {
    hotelId: hotel.id,
    auditStatus: hotel.auditStatus,
    publishStatus: hotel.publishStatus,
    isOffline: hotel.isOffline,
  });
  return hotel;
};

export const publishHotel = async (userId: any, id: any) => {
  const hotel = await prisma.hotel.findUnique({ where: { id: Number(id) } });
  if (!hotel) throw new Error('酒店不存在');
  if (hotel.auditStatus !== 'approved') throw new Error('仅审核通过的酒店可发布');

  const updated = await prisma.hotel.update({
    where: { id: Number(id) },
    data: { publishStatus: 'published', isOffline: false },
  });
  await createLog(userId, 'PUBLISH_HOTEL', `${updated.nameZh} 已发布`);
  publishEvent('hotel-status-changed', {
    hotelId: updated.id,
    auditStatus: updated.auditStatus,
    publishStatus: updated.publishStatus,
    isOffline: updated.isOffline,
  });
  return updated;
};

export const offlineHotel = async (userId, id) => {
  const updated = await prisma.hotel.update({
    where: { id: Number(id) },
    data: { isOffline: true, publishStatus: 'offline' },
  });
  await createLog(userId, 'OFFLINE_HOTEL', `${updated.nameZh} 已下线`);
  publishEvent('hotel-status-changed', {
    hotelId: updated.id,
    auditStatus: updated.auditStatus,
    publishStatus: updated.publishStatus,
    isOffline: updated.isOffline,
  });
  return updated;
};

export const restoreHotel = async (userId, id) => {
  const hotel = await prisma.hotel.findUnique({ where: { id: Number(id) } });
  if (!hotel) throw new Error('酒店不存在');

  const updated = await prisma.hotel.update({
    where: { id: Number(id) },
    data: { isOffline: false, publishStatus: 'published' },
  });
  await createLog(userId, 'RESTORE_HOTEL', `${updated.nameZh} 已恢复上线`);
  publishEvent('hotel-status-changed', {
    hotelId: updated.id,
    auditStatus: updated.auditStatus,
    publishStatus: updated.publishStatus,
    isOffline: updated.isOffline,
  });
  return updated;
};

export const createBooking = async (payload) => {
  const room = await prisma.roomType.findUnique({ where: { id: Number(payload.roomTypeId) } });
  if (!room) throw new Error('房型不存在');
  if (room.stock <= 0) throw new Error('房型库存不足');

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        hotelId: Number(payload.hotelId),
        roomTypeId: Number(payload.roomTypeId),
        checkInDate: new Date(payload.checkInDate),
        checkOutDate: new Date(payload.checkOutDate),
        nights: payload.nights,
        guestCount: payload.guestCount,
        totalPrice: payload.totalPrice,
        contactName: payload.contactName,
        contactPhone: payload.contactPhone,
      },
    });

    await tx.roomType.update({
      where: { id: Number(payload.roomTypeId) },
      data: { stock: { decrement: 1 } },
    });

    return created;
  });

  publishEvent('booking-created', {
    hotelId: booking.hotelId,
    roomTypeId: booking.roomTypeId,
    createdAt: booking.createdAt,
  });
  return booking;
};

export const getBookings = async () =>
  prisma.booking.findMany({
    include: { hotel: true, roomType: true },
    orderBy: { createdAt: 'desc' },
  });

export const getOperationLogs = async () =>
  prisma.operationLog.findMany({
    include: {
      user: {
        select: {
          username: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
