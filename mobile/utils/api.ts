import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from './auth';

// Emulator: 10.0.2.2 maps to host machine's localhost
// Physical device: replace with your computer's local WiFi IP
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

export const getRecommendedPosts = () => api.get('/recommendations/posts');
export const getRecommendedEvents = () => api.get('/recommendations/events');
export const updateInterests = () => api.post('/recommendations/update-interests');
