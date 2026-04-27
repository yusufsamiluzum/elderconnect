import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from './auth';

// Physical device: use the computer's local WiFi IP
const BACKEND_URL = 'http://localhost:8082'; // desktop

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
