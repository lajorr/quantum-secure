import api from "../../../api/api";
import type { LoginResponse } from "../types/login_response";

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const formData = new FormData();
  formData.append("username", email);
  formData.append("password", password);
  const response = await api.post("/login", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export const signup = (email: string, username: string, password: string) => {
  try {
    const response = api.post("/register", {
      email,
      username,
      password,
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const logout = (token: string | null) => {
  try {
    if (!token) return;
    const response = api.post("/logout", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};
