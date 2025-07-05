import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;
// const baseURL = "http://192.168.49.97:8000";

const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
  },
});

export default api;
