import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Alamat backend. Isi EXPO_PUBLIC_API_URL di mobile/.env, contoh:
//   EXPO_PUBLIC_API_URL=https://nama-backend.up.railway.app/api   (backend di Railway)
//   EXPO_PUBLIC_API_URL=http://192.168.1.21:5000/api              (backend di laptop, pakai IP lokal)
export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.21:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menambahkan token secara otomatis ke setiap request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
