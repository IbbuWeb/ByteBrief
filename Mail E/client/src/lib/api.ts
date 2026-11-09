import axios from "axios";

const API_BASE = "";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      window.location.href = "/app/login";
    }
    return Promise.reject(err);
  }
);

export default api;
