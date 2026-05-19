import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import useAuthStore from '../store/authStore';

const apiClient = axios.create({
  baseURL: 'http://localhost:3000',
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  },
);

export default apiClient;
