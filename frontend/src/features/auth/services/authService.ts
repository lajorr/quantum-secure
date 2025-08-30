import api from "../../../api/api";
import type { LoginResponse } from "../types/login_response";
import type { SignupResponse } from "../types/signup_response";

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
): Promise<SignupResponse> => {
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
    return response.data;
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

export const checkVerificationStatus = async (email: string) => {
  try {
    const response = await api.get(`/auth/check-verification/${email}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (token: string | null, newPassword: string) => {
  try {
    const response = await api.post("/auth/reset-password", {
      token,
      new_password: newPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

