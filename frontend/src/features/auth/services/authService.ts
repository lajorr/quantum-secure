import api from "../../../api/api";
import type { LoginResponse } from "../types/login_response";

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const response = await api.post(
    "/auth/login",
    {
      email,
      password,
    },
    {
      withCredentials: true, // Ensure cookies are sent
    }
  );

  return response.data;
};

export const signup = async (
  email: string,
  username: string,
  password: string
) => {
  try {
    console.log("email", email, "username", username, "password", password);
    const response = await api.post(
      "/auth/register",
      {
        email,
        username,
        password,
      },
      {
        withCredentials: true, // Ensure cookies are sent
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    // Refresh token is automatically sent via HTTP-only cookie
    const response = await api.post("/auth/refresh_token", {
      withCredentials: true, // Ensure cookies are sent
    });
    console.log("refresyhhh", response);
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
