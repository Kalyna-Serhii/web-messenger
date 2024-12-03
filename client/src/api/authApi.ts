import apiClient from './index';

export const register = async (name: string, email: string, password: string) => {
    try {
        const response = await apiClient.post(
            '/register',
            { name, email, password },
            { withCredentials: true }
        );
        return response.data;
    } catch (error) {
        throw new Error('Registration error, check your details');
    }
};

export const login = async (email: string, password: string) => {
    try {
        const response = await apiClient.post(
            '/login',
            { email, password },
            { withCredentials: true }
        );

        return response.data;
    } catch (error) {
        throw new Error('Registration error, check your details');
    }
};

export const logout = async () => {
    try {
        await apiClient.post('/logout', {}, { withCredentials: true });
    } catch (error) {
        throw new Error('Error logging out');
    }
};
