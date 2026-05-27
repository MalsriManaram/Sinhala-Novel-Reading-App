import axios from "axios";
import * as SecureStore from "expo-secure-store";

const BASE = process.env.EXPO_PUBLIC_BACKEND_URL;

export const api = axios.create({ baseURL: `${BASE}/api` });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      const refresh = await SecureStore.getItemAsync("refresh_token");
      if (refresh) {
        try {
          const r = await axios.post(`${BASE}/api/auth/refresh`, { refresh_token: refresh });
          await SecureStore.setItemAsync("access_token", r.data.access_token);
          await SecureStore.setItemAsync("refresh_token", r.data.refresh_token);
          err.config.headers.Authorization = `Bearer ${r.data.access_token}`;
          return api(err.config);
        } catch (_) {
          await SecureStore.deleteItemAsync("access_token");
          await SecureStore.deleteItemAsync("refresh_token");
        }
      }
    }
    return Promise.reject(err);
  }
);

export const setTokens = async (access, refresh) => {
  await SecureStore.setItemAsync("access_token", access);
  await SecureStore.setItemAsync("refresh_token", refresh);
};

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync("access_token");
  await SecureStore.deleteItemAsync("refresh_token");
};
