import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useAccountStore } from '../store/accountStore';

const client = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // send session cookie (session_id) on same- and cross-origin requests
});



// Request Interceptor: Inject Token and Account ID
client.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const activeAccountId = useAccountStore.getState().activeAccountId;
        if (activeAccountId && activeAccountId !== 'undefined') {
            config.headers['X-Account-ID'] = activeAccountId;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle 401 Unauthorized
client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            useAuthStore.getState().logout();
        }
        return Promise.reject(error);
    }
);

export default client;
