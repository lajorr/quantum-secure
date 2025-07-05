import api from "../../../api/api";
import type { Message } from "../types/chat";

export const getUserDetails = async () => {
  try {
    const response = await api.get("/users/details", {
      timeout: 10000 // 10 second timeout
    });
    return response.data;
  } catch (error) {
    console.error("getUserDetails - API call failed:", error);
    throw error;
  }
};

export const getUserFiendList = async () => {
  try {
    const response = await api.get("/users/friends");
    return response.data;
  } catch (error) {
    console.error("Failed to get friends list:", error);
    throw error;
  }
};

export const fetchMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const response = await api.get(`/messages/${chatId}`);
    return response.data;
  } catch (error) {
    console.log("Error fetching messages:", error);
    throw error;
  }
};
