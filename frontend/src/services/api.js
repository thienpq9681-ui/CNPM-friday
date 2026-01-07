import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
});

// Thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const userService = {
    //update profile
  updateProfile: (data) => api.patch('/users/me', data),
  // thay đổi mật khẩu
  changePassword: (data) => api.post('/users/change-password', data),
  // thêm avatar
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/upload-avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};