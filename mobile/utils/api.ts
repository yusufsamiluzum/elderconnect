import axios from 'react-native-axios' // Wait, I'll just use axios. I installed axios.
// So:
import axios from 'axios';
import { Platform } from 'react-native';

// Determine backend URL based on platform.
// For Android Emulator, localhost is 10.0.2.2
// For iOS Simulator, localhost is localhost or 127.0.0.1
// Default Spring Boot backend port is typically 8080.
const BACKEND_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8080' 
  : 'http://localhost:8080';

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Example interceptors for JWT token mapping later
api.interceptors.request.use(
  async (config) => {
    // You would fetch token from AsyncStorage/SecureStore here
    // const token = await SecureStore.getItemAsync('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
