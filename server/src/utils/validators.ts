import { z } from 'zod';

const roomSchema = z.object({
  id: z.coerce.number().optional(),
  roomName: z.string().min(2),
  bedType: z.string().min(2),
  breakfastIncluded: z.boolean(),
  cancelPolicy: z.string().min(2),
  price: z.coerce.number().min(1),
  originalPrice: z.coerce.number().min(1),
  stock: z.coerce.number().int().min(0),
  roomArea: z.coerce.number().int().min(10),
  maxGuests: z.coerce.number().int().min(1),
  roomImage: z.string().url(),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6).max(20),
  role: z.enum(['merchant', 'admin']),
});

export const loginSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6).max(20),
});

export const hotelSchema = z.object({
  nameZh: z.string().min(2),
  nameEn: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(5),
  star: z.coerce.number().int().min(1).max(5),
  description: z.string().min(10),
  openYear: z.coerce.number().int().min(1990).max(2100),
  coverImage: z.string().url(),
  galleryImages: z.array(z.string().url()).default([]),
  tags: z.array(z.string()).default([]),
  facilities: z.array(z.string()).default([]),
  nearbyInfo: z.array(z.string()).default([]),
  discountInfo: z.string().default(''),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
  publishStatus: z.enum(['draft', 'published']).optional(),
  roomTypes: z.array(roomSchema).min(1),
});

export const auditSchema = z.object({
  auditStatus: z.enum(['approved', 'rejected']),
  auditReason: z.string().optional().nullable(),
});

export const bookingSchema = z.object({
  hotelId: z.coerce.number().int(),
  roomTypeId: z.coerce.number().int(),
  checkInDate: z.string(),
  checkOutDate: z.string(),
  nights: z.coerce.number().int().min(1),
  guestCount: z.coerce.number().int().min(1),
  totalPrice: z.coerce.number().min(1),
  contactName: z.string().min(2),
  contactPhone: z.string().min(6),
});

export const locationSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
});

export { roomSchema };
