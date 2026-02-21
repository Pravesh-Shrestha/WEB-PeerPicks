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

axiosInstance.interceptors.request.use(async (config) => {
    const token = await getAuthToken();
    if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use(
    (response) => response.data, // PRO TIP: Unwrap .data here so your components get the clean object
    (error) => {
        if (error.response?.status === 401) {
            console.warn('Node session expired. Re-authenticating...');
            // In a real app, you'd trigger a logout function from your AuthContext here
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;