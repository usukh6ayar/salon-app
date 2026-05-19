import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoggedIn: false,

  login: async (user, token) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));

    set({
      user,
      token,
      isLoggedIn: true,
    });
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['token', 'user']);

    set({
      user: null,
      token: null,
      isLoggedIn: false,
    });
  },

  loadFromStorage: async () => {
    const [token, userJson] = await Promise.all([
      AsyncStorage.getItem('token'),
      AsyncStorage.getItem('user'),
    ]);

    if (!token) {
      set({
        user: null,
        token: null,
        isLoggedIn: false,
      });
      return;
    }

    set({
      user: userJson ? JSON.parse(userJson) : null,
      token,
      isLoggedIn: true,
    });
  },
}));

export default useAuthStore;
