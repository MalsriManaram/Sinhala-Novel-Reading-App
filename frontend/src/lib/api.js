import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;

export const api = axios.create({
  baseURL: `${BASE}/api`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      const original = err.config;
      if (refresh && !original._retry) {
        original._retry = true;
        try {
          const r = await axios.post(`${BASE}/api/auth/refresh`, { refresh_token: refresh });
          localStorage.setItem("access_token", r.data.access_token);
          localStorage.setItem("refresh_token", r.data.refresh_token);
          original.headers.Authorization = `Bearer ${r.data.access_token}`;
          return api(original);
        } catch (_) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }
    }
    return Promise.reject(err);
  }
);
