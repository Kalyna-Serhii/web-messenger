import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                    await axios.get('http://localhost:8080/api/refresh',
                    { withCredentials: true }
                );
                return apiClient(originalRequest);
            } catch (err) {
                console.error('Token update error:', err);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
