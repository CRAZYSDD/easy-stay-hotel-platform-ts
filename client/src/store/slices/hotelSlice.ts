import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { hotelApi } from '../../api/hotel';

interface HotelListParams {
  page: number;
  pageSize: number;
  city: string;
  keyword: string;
  star: string;
  minPrice: number;
  maxPrice: number;
  tags: string;
  sort: string;
}

export const fetchBanners = createAsyncThunk('hotel/fetchBanners', async () => {
  const res = await hotelApi.getBanners();
  return res.data;
});

export const fetchHotels = createAsyncThunk('hotel/fetchHotels', async (params: HotelListParams) => {
  const res = await hotelApi.getHotels(params);
  return res.data;
});

export const fetchHotelDetail = createAsyncThunk('hotel/fetchHotelDetail', async (id: string | number) => {
  const [detailRes, roomRes] = await Promise.all([hotelApi.getHotelDetail(id), hotelApi.getHotelRooms(id)]);
  return {
    detail: detailRes.data,
    rooms: roomRes.data,
  };
});

const hotelSlice = createSlice({
  name: 'hotel',
  initialState: {
    banners: [],
    list: [],
    page: 1,
    pageSize: 6,
    hasMore: true,
    total: 0,
    loading: false,
    error: '',
    detail: null,
    rooms: [],
  },
  reducers: {
    resetHotelList(state) {
      state.list = [];
      state.page = 1;
      state.hasMore = true;
      state.error = '';
    },
    addRecentView(state, action) {
      const current = JSON.parse(localStorage.getItem('easyStayRecent') || '[]');
      const next = [action.payload, ...current.filter((item) => item.id !== action.payload.id)].slice(0, 8);
      localStorage.setItem('easyStayRecent', JSON.stringify(next));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.banners = action.payload;
      })
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.page = action.payload.page;
        state.pageSize = action.payload.pageSize;
        state.total = action.payload.total;
        state.hasMore = action.payload.hasMore;
        state.list = action.payload.page === 1 ? action.payload.list : [...state.list, ...action.payload.list];
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '加载失败';
      })
      .addCase(fetchHotelDetail.pending, (state) => {
        state.loading = true;
        state.detail = null;
        state.rooms = [];
        state.error = '';
      })
      .addCase(fetchHotelDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.detail = action.payload.detail;
        state.rooms = action.payload.rooms;
      })
      .addCase(fetchHotelDetail.rejected, (state, action) => {
        state.loading = false;
        state.detail = null;
        state.rooms = [];
        state.error = action.error.message || '详情加载失败';
      });
  },
});

export const { resetHotelList, addRecentView } = hotelSlice.actions;
export default hotelSlice.reducer;
