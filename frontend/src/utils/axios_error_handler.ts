import type { AxiosError } from "axios";

export const axiosErrorHandler = (error: AxiosError) => {
  let message: string | null = null;

  switch (error.status) {
    case 400:
      message =
        (error.response?.data as Record<string, any>).detail || "Bad Request";
      break;
    case 401:
    case 403:
      message = "Unauthorized";
      break;
    case 404:
      message = "Not Found";
      break;
    case 409:
      message = "Conflict";
      break;
    case 422:
      message =
        (error.response?.data as Record<string, any>).detail[0].msg ||
        "Unprocessable Entity";
      break;
    case 500:
      message = "Internal Server Error";
      break;
    case 503:
      message = "Service Unavailable";
  }

  return message || "Unknown Error";
};
