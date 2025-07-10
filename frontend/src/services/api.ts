import axios from "axios";
import { API_URL } from "../config/apiConfig";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
