// context/auth-context.tsx
'use client';
import React, { createContext, useContext, useState } from 'react';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    // Initialize state lazily from localStorage to avoid needing a synchronous useEffect setter
    const [token, setToken] = useState<string | null>(() => {
        if (typeof window === 'undefined') return null;
        const storedToken = localStorage.getItem('karte_token');
        if (!storedToken) return null;
        try {
            return JSON.parse(storedToken);
        } catch {
            localStorage.removeItem('karte_token');
            return null;
        }
    });

    const [user, setUser] = useState<User | null>(() => {
        if (typeof window === 'undefined') return null;
        const storedUser = localStorage.getItem('karte_user');
        if (!storedUser) return null;
        try {
            return JSON.parse(storedUser);
        } catch {
            localStorage.removeItem('karte_user');
            return null;
        }
    });

    const [isLoading] = useState<boolean>(false);
    const router = useRouter();

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('karte_token', newToken);
        localStorage.setItem('karte_user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);

        // redirect based on role
        if (newUser.role === 'ROLE_SUPPORT') {
            router.push('/management');
        } else {
            router.push('/dashboard');
        }
    };

    const logout = () => {
        localStorage.removeItem('karte_token');
        localStorage.removeItem('karte_user');
        setToken(null);
        setUser(null);
        router.push('/login');
    };

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token && !!user,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};