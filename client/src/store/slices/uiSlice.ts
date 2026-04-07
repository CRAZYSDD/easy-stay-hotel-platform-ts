import { createSlice } from '@reduxjs/toolkit';
import dayjs from 'dayjs';

const SEARCH_CITY_OPTIONS = ['上海', '北京', '杭州', '深圳', '成都', '南京'];

const getSavedSearch = () =>
  JSON.parse(localStorage.getItem('easyStaySearchState') || 'null') || {
    city: '上海',
    keyword: '',
    tags: [],
    star: '',
    priceRange: [0, 1200],
    sort: '',
    checkInDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
    checkOutDate: dayjs().add(2, 'day').format('YYYY-MM-DD'),
  };

const getSavedFavorites = () => JSON.parse(localStorage.getItem('easyStayFavorites') || '[]');
const getSavedSearchHistory = () =>
  JSON.parse(localStorage.getItem('easyStaySearchHistory') || '[]').filter((item) => SEARCH_CITY_OPTIONS.includes(item));

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    searchState: getSavedSearch(),
    favorites: getSavedFavorites(),
    searchHistory: getSavedSearchHistory(),
  },
  reducers: {
    setSearchState(state, action) {
      state.searchState = { ...state.searchState, ...action.payload };
      localStorage.setItem('easyStaySearchState', JSON.stringify(state.searchState));
    },
    resetSearchFiltersKeepTrip(state) {
      state.searchState = {
        ...state.searchState,
        keyword: '',
        tags: [],
        star: '',
        priceRange: [0, 1200],
        sort: '',
      };
      localStorage.setItem('easyStaySearchState', JSON.stringify(state.searchState));
    },
    saveSearchHistory(state, action) {
      const current = state.searchHistory;
      const value = action.payload.trim();
      if (!value || !SEARCH_CITY_OPTIONS.includes(value)) return;
      const next = [value, ...current.filter((item) => item !== value)].slice(0, 8);
      state.searchHistory = next;
      localStorage.setItem('easyStaySearchHistory', JSON.stringify(next));
    },
    removeSearchHistory(state, action) {
      const next = state.searchHistory.filter((item) => item !== action.payload);
      state.searchHistory = next;
      localStorage.setItem('easyStaySearchHistory', JSON.stringify(next));
    },
    toggleFavorite(state, action) {
      const exists = state.favorites.includes(action.payload);
      const next = exists ? state.favorites.filter((item) => item !== action.payload) : [...state.favorites, action.payload];
      state.favorites = next;
      localStorage.setItem('easyStayFavorites', JSON.stringify(next));
    },
  },
});

export const { setSearchState, resetSearchFiltersKeepTrip, saveSearchHistory, removeSearchHistory, toggleFavorite } = uiSlice.actions;
export default uiSlice.reducer;
