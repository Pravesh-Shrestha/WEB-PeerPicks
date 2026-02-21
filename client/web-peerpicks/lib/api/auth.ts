import axiosInstance from "./axios";
import { API } from "./endpoints";

/**
 * Helper to reduce repetition in error handling and data extraction.
 * Standardizing this ensures we never return 'undefined' to the Server Actions.
 */
const handleRequest = async (request: Promise<any>, fallbackMsg: string) => {
  try {
    const data = await request; // Axios interceptor already returned response.data
    return data; 
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || fallbackMsg;
    return {
      success: false,
      message: message
    };
  }
};

export const register = (registerData: any) => 
  handleRequest(axiosInstance.post(API.AUTH.REGISTER, registerData), "Identity registration failed");

// FIX: Now uses handleRequest to prevent the 'success of undefined' crash
export const login = (data: any) => 
  handleRequest(axiosInstance.post(API.AUTH.LOGIN, data), "Authentication failed");

// FIX: Added safety to whoami
export const whoami = () => 
  handleRequest(axiosInstance.get(API.AUTH.WHOAMI), "Identity verification failed");

export const updateProfile = async (updateData: FormData) => {
  try {
    const response = await axiosInstance.put(API.AUTH.UPDATEPROFILE, updateData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true 
    });
    
    return {
      success: true,
      data: response.data.user || response.data,
      message: response.data.message || "Profile synchronized"
    };
  } catch (err: any) {
    console.error("Profile Update Error:", err.response?.data || err.message);
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Synchronization failed"
    };
  }
};

export const adminUpdateUser = (id: string, formData: FormData) => 
  handleRequest(
    axiosInstance.put(`${API.ADMIN.USERS}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }), 
    "Admin update failed"
  );

export const requestPasswordReset = (email: string) => 
  handleRequest(axiosInstance.post(API.AUTH.REQUEST_PASSWORD_RESET, { email }), "Recovery request failed");

export const resetPassword = (token: string, newPassword: string) => {
  const cleanToken = decodeURIComponent(token).replace(/^token=/, '');
  return handleRequest(
    axiosInstance.post(API.AUTH.RESET_PASSWORD(cleanToken), { newPassword }), 
    "Key reset failed"
  );
};

export const getUserProfile = (userId: string) => 
  handleRequest(axiosInstance.get(API.USERS.PROFILE(userId)), "Fetching profile failed");

export const toggleFollow = (userId: string) => 
  handleRequest(axiosInstance.post(API.USERS.FOLLOW(userId)), "Connection update failed");