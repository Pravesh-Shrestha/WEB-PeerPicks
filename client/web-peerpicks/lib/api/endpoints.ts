// List of API endpoints used in the application

export const API = {
  AUTH: {
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    WHOAMI: "/api/auth/me",
    UPDATEPROFILE: "/api/auth/update-profile",
    REQUEST_PASSWORD_RESET: "/api/auth/request-password-reset",
    RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
  },

  USERS: {
    BASE: "/api/users",
    PROFILE: (id: string) => `/api/picks/user/${id}`,
    FOLLOW: (id: string) => `/api/social/follow/${id}`,
    UNFOLLOW: (id: string) => `/api/social/unfollow/${id}`,
    FOLLOWING_STATUS: (followerId: string, targetId: string) =>
      `/api/picks/user/${followerId}/is-following/${targetId}`,
  },

  PICKS: {
    BASE: "/api/picks",
    FEED: "/api/picks/feed",

    // Discussion & Social Interaction
    DISCUSSION: (id: string) => `/api/picks/${id}/discussion`,
    VOTE: (id: string) => `/api/social/vote/${id}`,

    // Favorites
    FAVORITE: (id: string) => `/api/social/favorite/${id}`, // Toggle action
    MY_FAVORITES: "/api/social/favorites", // To fetch the list

    // Feeds & Detail
    PLACE: (linkId: string) => `/api/picks/place/${linkId}`,
    CATEGORY_FEED: (category: string) => `/api/picks/category/${category}`,
    USER_PICKS: (userId: string) => `/api/picks/user/${userId}`,
    DETAIL: (id: string) => `/api/picks/${id}`,

    // Ownership (Protocol Compliance: "delete" [2026-02-01])
    DELETE: (id: string) => `/api/picks/${id}`,
    UPDATE: (id: string) => `/api/picks/${id}`,
  },

  ADMIN: {
    USERS: "/api/admin/users",
    STATS: "/api/admin/dashboard-stats",
    PICKS: "/api/admin/picks",
  },

  /**
   * NOTIFICATION SYSTEM
   * Updated to match Controller logic and Delete Protocol
   */
  NOTIFICATIONS: {
    BASE: "/api/notifications",
    STREAM: "/api/notifications/stream", // The SSE Bridge
    GET_ALL: "/api/notifications", // To fetch the full signal feed
    UNREAD_COUNT: "/api/notifications/unread-count",
    MARK_READ: "/api/notifications/read",
    DELETE: (id: string) => `/api/notifications/${id}`,
  },

  MAP: {
    NEARBY: "/api/map/nearby",
  },

  // ADD THIS SECTION: Dedicated for reading/writing comments
  COMMENTS: {
    CREATE: "/api/social/comment",
    // FIX: Match the backend 'discussion' route instead of /social/comments/
    GET_BY_PICK: (id: string) => `/api/picks/${id}/discussion`,
    UPDATE: (id: string) => `/api/social/comment/${id}`,
    DELETE: (id: string) => `/api/social/comment/${id}`,
  },
};
