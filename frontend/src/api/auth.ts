import client from './client';

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    username: string;
    role: string;
}

export interface MeResponse {
    sub: string;
    username: string;
    role: string;
}

export const authApi = {
    login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
        const response = await client.post<LoginResponse>('/login', credentials);
        return response.data;
    },
    getMe: async (): Promise<MeResponse> => {
        const response = await client.get<MeResponse>('/me');
        return response.data;
    },
};
