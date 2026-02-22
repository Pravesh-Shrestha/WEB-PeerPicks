import axios from 'axios';
import { getAuthToken } from '@/lib/cookie';

// VETERAN MOVE: Use a relative URL if you are using Next.js Rewrites.
// This prevents CORS issues and makes switching to production seamless.
const BASE_URL = 'http://localhost:3000'; 

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    // Flexible content-type is correct, especially for your FormData 'picks'
});

// axios.ts
axiosInstance.interceptors.request.use(async (config) => {
    const token = await getAuthToken();
    
    // CRITICAL: Only attach if token is a truthy string and NOT "null"
    if (token && token !== "null" && token !== "undefined" && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    } else if (config.headers) {
        // Ensure no stale header is left during login attempts
        delete config.headers['Authorization'];
    }
    return config;
}, (error) => Promise.reject(error));

// axios.ts - Update the response interceptor
axiosInstance.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Node session expired. Clearing identity...');
            // CRITICAL: Wipe the header so the next user doesn't use it
            delete axiosInstance.defaults.headers.common['Authorization'];
            
            // If you have access to window, you can force a hard reload
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;