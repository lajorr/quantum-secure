import api from "../../../api/api";

export const getUserDetails = async () => {
  const token = localStorage.getItem("token");
  console.log("getUserDetails - Token:", token);
  
  if (!token) {
    console.log("getUserDetails - No token, returning undefined");
    return;
  }
  
  try {
    console.log("getUserDetails - Making API call to /users/details");
    const response = await api.get("/users/details", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("getUserDetails - API call successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("getUserDetails - API call failed:", error);
    throw error;
  }
};

export const getUserFiendList = async () => {
  const token = localStorage.getItem("token");
  if (!token) return;
  const response = await api.get("/users/friends", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
