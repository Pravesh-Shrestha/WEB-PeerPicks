import axios from 'axios';
import { getAuthToken } from '../cookie';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(async (config) => {
    const token = await getAuthToken();
    if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
}, (error) => Promise.reject(error));

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Logic for unauthorized access
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;