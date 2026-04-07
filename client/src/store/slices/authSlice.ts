import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('easyStayToken') || '',
  user: JSON.parse(localStorage.getItem('easyStayUser') || 'null'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem('easyStayToken', action.payload.token);
      localStorage.setItem('easyStayUser', JSON.stringify(action.payload.user));
    },
    clearAuth(state) {
      state.token = '';
      state.user = null;
      localStorage.removeItem('easyStayToken');
      localStorage.removeItem('easyStayUser');
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;

export const setAuthFromStorage = (dispatch) => {
  const token = localStorage.getItem('easyStayToken');
  const user = JSON.parse(localStorage.getItem('easyStayUser') || 'null');
  if (token && user) {
    dispatch(setAuth({ token, user }));
  }
};
