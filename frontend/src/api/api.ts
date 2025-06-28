import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;
console.log("API Base URL:", baseURL);

const api = axios.create({
  baseURL,
  headers: {
    Accept: "application/json",
  },
});

export default api;
