import { API } from '../api/endpoints';
import axiosInstance from '../api/axios';

export const getDiscoveryFeed = async (section: string) => {
  // Use the constant from endpoints.ts
  const response = await axiosInstance.get(API.PICKS.FEED, { 
    params: { filter: section === 'for-you' ? 'all' : 'following' }
  });
  return response.data;
};

export const createPick = async (formData: FormData) => {
  const response = await axiosInstance.post(API.PICKS.BASE, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * DELETE: Strictly uses 'delete' terminology.
 * Only works if the logged-in user is the owner (handled by backend).
 */
export const deletePick = async (pickId: string) => {
  const response = await axiosInstance.delete(API.PICKS.DELETE(pickId));
  return response.data;
};

/**
 * READ: Fetches all picks for a specific Place Hub (Google Link).
 */
export const getPlaceHubPicks = async (linkId: string) => {
  const encodedLink = encodeURIComponent(linkId);
  const response = await axiosInstance.get(`/picks/place/${encodedLink}`);
  return response.data;
};

/**
 * UPDATE: Modify review text, stars, or tags.
 * Strict ownership check is handled by the backend.
 * Using 'update' terminology as per design instructions.
 */
export const updatePick = async (pickId: string, formData: FormData) => {
  const response = await axiosInstance.put(API.PICKS.DETAIL(pickId), formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

/**
 * READ: Fetches picks by category for filtering.
 */
export const getPicksByCategory = async (category: string, page: number) => {
  const response = await axiosInstance.get(API.PICKS.cATEGORY_FEED(category), {
    params: { page }
  });
  return response.data;
};

/**
 * 
 */
export const getAllPicks = async (pickId: string) => {
  const response = await axiosInstance.get(API.PICKS.DETAIL(pickId));
  return response.data;
};
  