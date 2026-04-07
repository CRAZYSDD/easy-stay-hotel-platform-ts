import axios from 'axios';

export const request = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 10000,
});

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('easyStayToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || '请求失败';
    if (error.response?.status === 401) {
      localStorage.removeItem('easyStayToken');
      localStorage.removeItem('easyStayUser');
    }
    return Promise.reject(new Error(message));
  }
);
