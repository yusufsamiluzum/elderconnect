import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from './auth';

// For Android Emulator, localhost is 10.0.2.2
// For iOS Simulator, localhost is localhost or 127.0.0.1
// Default Spring Boot backend port is 8082 as configured earlier.
const BACKEND_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8082' 
  : 'http://localhost:8082';

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
