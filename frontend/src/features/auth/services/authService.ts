import api from "../../../api/api";
import type { LoginResponse } from "../types/login_response";

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const formData = new FormData();
  formData.append("username", email);
  formData.append("password", password);
  const response = await api.post("/auth/login", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const signup = (email: string, username: string, password: string) => {
  try {
    const response = api.post("/auth/register", {
      email,
      username,
      password,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    // Refresh token is automatically sent via HTTP-only cookie
    const response = await api.post("/auth/refresh_token");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response;
  } catch (error) {
    throw error;
  }
};
