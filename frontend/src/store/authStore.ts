import { create } from 'zustand';

function getRoleFromToken(token: string | null): string {
    if (!token) return 'user';
    try {
        const payload = JSON.parse(atob(token.split('.')[1] ?? '{}'));
        return payload.role === 'admin' ? 'admin' : 'user';
    } catch {
        return 'user';
    }
}

function getUsernameFromToken(token: string | null): string {
    if (!token) return '';
    try {
        const payload = JSON.parse(atob(token.split('.')[1] ?? '{}'));
        return typeof payload.username === 'string' ? payload.username : '';
    } catch {
        return '';
    }
}

interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    role: string;
    username: string;
    setToken: (token: string) => void;
    /** Set session from login/me when using cookie-based auth (no token). */
    setSession: (username: string, role: string) => void;
    setUsername: (username: string) => void;
    setRole: (role: string) => void;
    logout: () => void;
}

const STORAGE_KEY = 'auth_token';

export const useAuthStore = create<AuthState>((set) => {
    const storedToken = localStorage.getItem(STORAGE_KEY);
    const role = getRoleFromToken(storedToken);
    const username = getUsernameFromToken(storedToken);

    return {
        token: storedToken,
        isAuthenticated: !!storedToken,
        role,
        username,

        setToken: (token: string) => {
            localStorage.setItem(STORAGE_KEY, token);
            set({
                token,
                isAuthenticated: true,
                role: getRoleFromToken(token),
                username: getUsernameFromToken(token),
            });
        },

        setSession: (username: string, role: string) => {
            localStorage.setItem(STORAGE_KEY, "cookie");
            set({
                token: "cookie",
                isAuthenticated: true,
                role,
                username,
            });
        },

        setUsername: (username: string) => {
            set({ username });
        },

        setRole: (role: string) => {
            set({ role });
        },

        logout: () => {
            localStorage.removeItem(STORAGE_KEY);
            set({ token: null, isAuthenticated: false, role: 'user', username: '' });
        },
    };
});
