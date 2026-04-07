import { request } from './request';

export const authApi = {
  register: (payload) => request.post('/auth/register', payload),
  login: (payload) => request.post('/auth/login', payload),
  me: () => request.get('/auth/me'),
};

export const hotelApi = {
  getBanners: () => request.get('/banners'),
  getHotels: (params) => request.get('/hotels', { params }),
  getHotelDetail: (id) => request.get(`/hotels/${id}`),
  getHotelRooms: (id) => request.get(`/hotels/${id}/rooms`),
  reverseGeocode: (params) => request.get('/location/regeo', { params }),
  createBooking: (payload) => request.post('/bookings', payload),
  getBookings: () => request.get('/bookings'),
  subscribeEvents: () => new EventSource('http://localhost:4000/api/events'),
};

export const merchantApi = {
  listHotels: () => request.get('/merchant/hotels'),
  getHotel: (id) => request.get(`/merchant/hotels/${id}`),
  createHotel: (payload) => request.post('/merchant/hotels', payload),
  updateHotel: (id, payload) => request.put(`/merchant/hotels/${id}`, payload),
};

export const adminApi = {
  listHotels: (params) => request.get('/admin/hotels', { params }),
  auditHotel: (id, payload) => request.patch(`/admin/hotels/${id}/audit`, payload),
  publishHotel: (id) => request.patch(`/admin/hotels/${id}/publish`),
  offlineHotel: (id) => request.patch(`/admin/hotels/${id}/offline`),
  restoreHotel: (id) => request.patch(`/admin/hotels/${id}/restore`),
  getLogs: () => request.get('/admin/logs'),
};
