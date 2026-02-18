// List of API endpoints used in the application

export const API = {
    AUTH: {
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        WHOAMI: '/api/auth/whoami',
        UPDATEPROFILE: '/api/auth/update-profile',
        REQUEST_PASSWORD_RESET: '/api/auth/request-password-reset',
        RESET_PASSWORD: (token: string) => `/api/auth/reset-password/${token}`,
    },
    // Added Picks (Reviews) Section
    PICKS: {
        BASE: '/api/picks',
        FEED: '/api/picks/feed',
        DISCOVER: '/api/picks/discover',
        cATEGORY_FEED: (category: string) => `/api/picks/category/${category}`,
        FOLLOWING: '/api/picks/following',
        DETAIL: (id: string) => `/api/picks/${id}`,
        // Using "delete" term as requested
        DELETE: (id: string) => `/api/picks/${id}`,
        
        // Social & Engagement
        LIKE: (id: string) => `/api/picks/${id}/like`,
        COMMENT: (id: string) => `/api/picks/${id}/comment`,
        SHARE: (id: string) => `/api/picks/${id}/share`,
        COUNTER: (id: string) => `/api/picks/${id}/counter`,
    },
    ADMIN: {
        USERS: '/api/admin/users',
        STATS: '/api/admin/dashboard-stats',
    }
};