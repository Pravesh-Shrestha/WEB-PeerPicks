import { API } from "../api/endpoints";
import axiosInstance from "../api/axios";

/**
 * READ: Discovery Feed (Instagram-style)
 */
export const getDiscoveryFeed = async (
  page: number = 1,
  limit: number = 10,
) => {
  try {
    // Result is the body: { success: true, data: [...] }
    const result: any = await axiosInstance.get(API.PICKS.FEED, {
      params: { page, limit },
    });
    return result;
  } catch (error) {
    console.error("Error fetching discovery feed:", error);
    return { success: false, data: [] };
  }
};

/**
 * CREATE: Process new social post
 */
export const createPick = async (formData: FormData) => {
  const result = await axiosInstance.post(API.PICKS.BASE, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return result;
};
/**
 * READ: Fetches the hydrated discussion thread
 */
export const getPickDiscussion = async (pickId: string) => {
  try {
    const result = await axiosInstance.get(API.PICKS.DISCUSSION(pickId));
    return result;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { success: true, data: [] };
    }
    throw error;
  }
};

/**
 * SOCIAL: Post a comment to a specific pick
 */
export const postComment = async (pickId: string, description: string) => {
  // FIXED: Using the correct API endpoint key
  const result = await axiosInstance.post(API.PICKS.COMMENT(pickId), {
    description,
  });
  return result;
};

/**
 * SOCIAL: Support (Upvote/Downvote) toggle
 */
export const handleVote = async (pickId: string) => {
  const result = await axiosInstance.post(API.PICKS.VOTE(pickId));
  return result;
};

/**
 * SOCIAL: Follow/Unfollow User toggle
 */
export const toggleFollow = async (userId: string) => {
  // FIXED: Using API object instead of hardcoded strings
  const result = await axiosInstance.post(API.USERS.FOLLOW(userId));
  return result;
};

/**
 * READ: Fetches all picks for a specific Place Hub
 */
export const getPlaceHubPicks = async (linkId: string) => {
  const encodedLink = encodeURIComponent(linkId);
  const result = await axiosInstance.get(API.PICKS.PLACE(encodedLink));
  return result;
};

/**
 * UPDATE: Modify review text, stars, or tags.
 */
export const updatePick = async (pickId: string, updateData: any) => {
  const result = await axiosInstance.patch(
    API.PICKS.DETAIL(pickId),
    updateData,
  );
  return result;
};

/**
 * READ: Fetches picks by category
 */
export const getPicksByCategory = async (
  category: string,
  page: number = 1,
) => {
  const result = await axiosInstance.get(API.PICKS.CATEGORY_FEED(category), {
    params: { page },
  });
  return result;
};

/**
 * READ: Fetch a single pick detail
 */
export const getPickDetail = async (pickId: string) => {
  const result = await axiosInstance.get(API.PICKS.DETAIL(pickId));
  return result;
};

/**
 * READ: Fetch all picks by a specific user
 */
export const getUserPicks = async (userId: string) => {
  const result = await axiosInstance.get(API.PICKS.USER_PICKS(userId));
  return result;
};

/**
 * READ: Fetch picks within a specific radius
 */
export const getNearbyPicks = async (
  lat: number,
  lng: number,
  radius: number = 5000,
) => {
  const result = await axiosInstance.get(API.MAP.NEARBY, {
    params: { lat, lng, radius },
  });
  return result;
};

export const handleToggleSave = async (pickId: string) => {
  try {
    const response = await axiosInstance.post(API.PICKS.FAVORITE(pickId));
    
    // Log exactly what the response looks like to find the missing key
    console.log("FULL RESPONSE:", response); 

    // If response.data is undefined, axios might not be parsing the JSON 
    // or the backend is sending an empty body.
    const isSaved = response?.data?.isFavorited ?? response?.data?.isSaved ?? false;

    return {
      success: true,
      isFavorited: isSaved
    };
  } catch (error: any) {
    console.error("Action Error:", error.message);
    return { success: false, isFavorited: false };
  }
};

export const handleDeletePick = async (pickId: string) => {
  try {
    // Using the "delete" term as requested for the protocol
    await axiosInstance.delete(API.PICKS.DELETE(pickId));
    return { success: true };
  } catch (error: any) {
    return { success: false };
  }
};
