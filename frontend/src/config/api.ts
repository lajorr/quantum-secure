import axios from "axios";

const baseUrl = "http://localhost:8000";
export const api = () => {
  const axiosConfig = {
    baseURL: baseUrl,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const instance = axios.create(axiosConfig);
  return instance;
};

export default api;
