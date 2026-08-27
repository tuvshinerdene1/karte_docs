//lib/abi.ts
import axios from 'axios';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
const API_BASE_URL = 'http://192.168.1.14:8080/api/v1';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type' : 'application/json',
    },
});

// request interceptor: attach JWT token if available
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined'){
            const token = localStorage.getItem('karte_token');
            if (token && config.headers){
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// response interceptors: redirect to login if 401 Unauthorized occurs
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof window !== 'undefined'){
            localStorage.removeItem ('karte_token');
            localStorage.removeItem('karte_user');
            if (!window.location.pathname.startsWith('/login')){
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
)