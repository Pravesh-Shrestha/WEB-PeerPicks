import { API } from "../api/endpoints";
import axiosInstance from "../api/axios";

/**
 * READ: Discovery Feed (Instagram-style)
 */
export const getDiscoveryFeed = async (
  page: number = 1,
  limit: number = 10,
  type: "new" | "following" = "new",
) => {
  try {
    // Result is the body: { success: true, data: [...] }
    const result: any = await axiosInstance.get(API.PICKS.FEED, {
      params: { page, limit, type },
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
 * Protocol: Corrects 404/Empty List by unwrapping nested data
 */
export const getPickDiscussion = async (pickId: string) => {
  try {
    const url = API.PICKS.DISCUSSION(pickId);
    const response: any = await axiosInstance.get(url);

    // Unwrapping: Axios (.data) -> Controller (.data)
    // This returns the object { parent, signals, count } directly
    return response.data?.data || response.data;
  } catch (error: any) {
    console.error("PICK_ACTION_ERROR:", error.response?.status);
    throw error;
  }
};

/**
 * SOCIAL: Post a comment to a specific pick
 */
export const postComment = async (pickId: string, payload: any) => {
  try {
    // If payload is just a string, convert to object. 
    // Otherwise, send the payload as-is.
    const data = typeof payload === "string" 
      ? { pickId, content: payload } 
      : payload;

    // We no longer spread and add 'parentPickId' because 
    // the controller wants 'pickId' inside the body.
    const response = await axiosInstance.post(API.COMMENTS.CREATE, data);

    return response; // axiosInstance already returns .data
  } catch (error) {
    console.error("TRANSMISSION_ERROR:", error);
    throw error;
  }
};
/**
 * SOCIAL: Update an existing comment
 * Allows users to edit their text signals without creating a new node.
 */
export const updateComment = async (commentId: string, text: string) => {
  // Changed param name to 'text'
  const result = await axiosInstance.patch(API.COMMENTS.UPDATE(commentId), {
    content: text, // Now 'text' is defined and matches the parameter
  });
  return result;
};

/**
 * SOCIAL: Delete a comment [2026-02-01 Protocol]
 * Protocol Adherence: Strictly using the term "delete" for the action name.
 */
export const deleteComment = async (commentId: string) => {
  try {
    // This hits the DELETE /api/social/comment/:id endpoint
    const result = await axiosInstance.delete(API.COMMENTS.DELETE(commentId));
    return result;
  } catch (error) {
    console.error("Failed to delete signal:", error);
    throw error;
  }
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
    updateData, // Correctly handles { description: editContent }
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
  try {
    const res = await axiosInstance.get(API.PICKS.USER_PICKS(userId), {
      withCredentials: true,
    });

    return res.data;
  } catch (err) {
    console.error("getUserPicks error:", err);
    return { data: [] };
  }
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

/**
 * FAVORITES: Handle Toggle Save
 */
export const handleToggleSave = async (pickId: string) => {
  try {
    const response: any = await axiosInstance.post(API.PICKS.FAVORITE(pickId));

    // Most backends return the NEW state after the toggle
    // If it was saved, it returns isFavorited: true.
    // If it was unsaved, it returns isFavorited: false.
    const isSaved =
      response?.data?.isFavorited ?? response?.isFavorited ?? false;

    return {
      success: true,
      isFavorited: isSaved, // This is key for the animation logic
    };
  } catch (error: any) {
    console.error("FAVORITE_TOGGLE_FAILURE:", error);
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

/**
 * READ: Fetch saved picks for logged-in user
 * IMPORTANT: This endpoint does NOT take userId
 */
export const getSavedPicks = async () => {
  try {
    const res: any = await axiosInstance.get(API.PICKS.MY_FAVORITES, {
      withCredentials: true,
    });

    // Axios unwrap: res.data → { success, data }
    return res.data;
  } catch (err) {
    console.error("getSavedPicks error:", err);
    return { data: [] };
  }
};

/**
 * ADMIN: Global Registry Feed
 * Mirrors the 'getDiscoveryFeed' architecture for reliable data flow.
 */
export const handleAdminGetAllPicks = async () => {
  try {
    const response = await axiosInstance.get(API.ADMIN.PICKS);
    return response;   // ✅ interceptor already unwrapped
  } catch (error: any) {
    return { success: false, picks: [] };
  }
};
/**
 * ADMIN: Update Pick Content
 * Allows modification of descriptions, categories, or metadata.
 */
export const handleAdminUpdatePick = async (pickId: string, updateData: any) => {
  try {
    const response: any = await axiosInstance.patch(
      API.PICKS.UPDATE(pickId),
      updateData
    );
    return response.data;
  } catch (error) {
    console.error("ADMIN_PICK_UPDATE_FAILURE:", error);
    throw error;
  }
};

/**
 * ADMIN: Delete Pick [2026-02-01 Protocol]
 * Permanently removes a pick from the network registry.
 * Replaces all "purge" logic with "delete".
 */
export const handleAdminDeletePick  = async (pickId: string) => {
  try {
    const response: any = await axiosInstance.delete(API.PICKS.DELETE(pickId));
    return {
      success: true,
      message: "PICK_DELETED_SUCCESSFULLY",
      data: response.data
    };
  } catch (error: any) {
    console.error("ADMIN_DELETE_PROTOCOL_FAILED:", error.response?.status);
    return {
      success: false,
      message: error.response?.data?.message || "DELETE_ACTION_REJECTED"
    };
  }
};

/**
 * ADMIN: Bulk Delete Picks
 * Optimized for cleaning up spam or multiple violations.
 */
export const handleAdminBulkDeletePicks = async (pickIds: string[]) => {
  try {
    // Assuming backend supports a batch delete or mapping multiple requests
    const deletions = pickIds.map(id => axiosInstance.delete(API.PICKS.DELETE(id)));
    await Promise.all(deletions);
    return { success: true, count: pickIds.length };
  } catch (error) {
    console.error("BULK_DELETE_FAILURE:", error);
    throw error;
  }
};