export type UserRole = 'merchant' | 'admin';
export type AuditStatus = 'pending' | 'approved' | 'rejected';
export type PublishStatus = 'draft' | 'published' | 'offline';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface User {
  id: number;
  username: string;
  role: UserRole;
}

export interface RoomType {
  id: number;
  hotelId?: number;
  roomName: string;
  bedType: string;
  breakfastIncluded: boolean;
  cancelPolicy: string;
  price: number;
  originalPrice: number;
  stock: number;
  roomArea: number;
  maxGuests: number;
  roomImage: string;
}

export interface Hotel {
  id: number;
  merchantId?: number;
  merchant?: User;
  nameZh: string;
  nameEn: string;
  city: string;
  address: string;
  star: number;
  description: string;
  openYear: number;
  coverImage: string;
  galleryImages: string[];
  tags: string[];
  facilities: string[];
  nearbyInfo: string[];
  discountInfo: string;
  recommendedReason?: string;
  minPrice: number;
  latitude?: number | null;
  longitude?: number | null;
  auditStatus: AuditStatus;
  auditReason?: string | null;
  publishStatus: PublishStatus;
  roomTypes: RoomType[];
  soldOut?: boolean;
}

export interface Banner {
  id: number;
  title: string;
  image: string;
  targetHotelId: number;
  sortOrder: number;
  isActive: boolean;
}

export interface Booking {
  id: number;
  hotelId: number;
  roomTypeId: number;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestCount: number;
  totalPrice: number;
  contactName: string;
  contactPhone: string;
}

export interface SearchState {
  city: string;
  keyword: string;
  tags: string[];
  star: string;
  priceRange: [number, number];
  sort: string;
  checkInDate: string;
  checkOutDate: string;
}
