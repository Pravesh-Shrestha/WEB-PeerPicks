import axiosInstance from "./axios";
import { API } from "./endpoints";

export const socialApi = {
  /**
   * TOGGLE UPVOTE
   * Maps to: POST /api/social/vote/:id
   */
  toggleUpvote: async (pickId: string) => {
    try {
      const response: any = await axiosInstance.post(API.PICKS.VOTE(pickId));
      return response.data?.data || response.data || response; 
    } catch (error) {
      console.error("UPVOTE_SIGNAL_FAILURE:", error);
      throw error;
    }
  },

  /**
   * SAVE PICK (Favorite)
   * Maps to: POST /api/social/favorite/:id
   */
  toggleSave: async (pickId: string) => {
    try {
      const response: any = await axiosInstance.post(API.PICKS.FAVORITE(pickId));
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error("SAVE_SIGNAL_FAILURE:", error);
      throw error;
    }
  },

  /**
   * COMMENT / REPLY
   * Maps to: POST /api/social/comment
   */
  postComment: async (pickId: string, content: string) => {
    try {
      const response: any = await axiosInstance.post(API.COMMENTS.CREATE, {
        pickId,
        content
      });
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error("COMMENT_SIGNAL_FAILURE:", error);
      throw error;
    }
  },

  /**
   * UPDATE COMMENT
   * Maps to: PATCH /api/social/comment/:id
   * Fixes: Variable naming mismatch from image_9dd6b8.png
   */
  updateComment: async (commentId: string, content: string) => {
    try {
      const response: any = await axiosInstance.patch(API.COMMENTS.UPDATE(commentId), {
        content
      });
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error("COMMENT_UPDATE_FAILURE:", error);
      throw error;
    }
  },

  /**
   * DELETE COMMENT
   * [2026-02-01 PROTOCOL] Terminology: "delete"
   */
  deleteComment: async (commentId: string) => {
    try {
      const response: any = await axiosInstance.delete(API.COMMENTS.DELETE(commentId));
      return response.data?.data || response.data || response;
    } catch (error) {
      console.error("COMMENT_DELETE_FAILURE:", error);
      throw error;
    }
  }
};