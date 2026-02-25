import axiosInstance from "./axios";
import { API } from "./endpoints";

/**
 * Standardized Request Handler
 * [2026-02-01] Protocol: Ensures consistent data shape for Server Actions.
 */
const handleRequest = async (request: Promise<any>, fallbackMsg: string) => {
  try {
    const response = await request;
    // Handle cases where axios might return the full response or just data
    const data = response.data || response;
    return {
      success: true,
      ...data
    };
  } catch (err: any) {
    const message = err.response?.data?.message || err.message || fallbackMsg;
    return {
      success: false,
      message: message
    };
  }
};

/* --- AUTHENTICATION FLOWS --- */

export const register = (registerData: any) => 
  handleRequest(axiosInstance.post(API.AUTH.REGISTER, registerData), "Identity registration failed");

export const login = (data: any) => 
  handleRequest(axiosInstance.post(API.AUTH.LOGIN, data), "Authentication failed");

export const whoami = () => 
  handleRequest(axiosInstance.get(API.AUTH.WHOAMI), "Identity verification failed");

export const requestPasswordReset = (email: string) => 
  handleRequest(axiosInstance.post(API.AUTH.REQUEST_PASSWORD_RESET, { email }), "Recovery request failed");

export const resetPassword = (token: string, newPassword: string) => {
  const cleanToken = decodeURIComponent(token).replace(/^token=/, '');
  return handleRequest(
    axiosInstance.post(API.AUTH.RESET_PASSWORD(cleanToken), { newPassword }), 
    "Key reset failed"
  );
};

/* --- PROFILE & SOCIAL --- */

export const updateProfile = (updateData: FormData) => 
  handleRequest(
    axiosInstance.put(API.AUTH.UPDATEPROFILE, updateData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    "Profile synchronization failed"
  );

export const getUserProfile = (userId: string) => 
  handleRequest(axiosInstance.get(API.USERS.PROFILE(userId)), "Fetching profile failed");

export const toggleFollow = (userId: string) => 
  handleRequest(axiosInstance.post(API.USERS.FOLLOW(userId)), "Connection update failed");

/* --- ADMIN: USER MANAGEMENT --- */

/**
 * FETCH_ALL_USERS: Root access to identity database
 */
export const adminGetAllUsers = () => 
  handleRequest(axiosInstance.get(API.ADMIN.USERS), "Failed to retrieve user directory");

/**
 * UPDATE_USER: Root modification of peer data
 */
export const adminUpdateUser = (id: string, formData: FormData) => 
  handleRequest(
    axiosInstance.put(`${API.ADMIN.USERS}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    }), 
    "Admin update failed"
  );

/**
 * DELETE_USER: [2026-02-01] Protocol Compliance
 * Permanent removal of identity from registry.
 */
export const adminDeleteUser = (id: string) => 
  handleRequest(
    axiosInstance.delete(`${API.ADMIN.USERS}/${id}`),
    "Identity deletion protocol failed"
  );