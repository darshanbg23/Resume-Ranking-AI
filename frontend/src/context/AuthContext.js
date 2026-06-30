import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import apiClient from '../services/api';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    // Load user from storage on mount and validate token
    useEffect(() => {
        const initAuth = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                const token = localStorage.getItem('auth_token');
                const refreshToken = localStorage.getItem('refresh_token');
                if (storedUser && token) {
                    // Try to validate the token by calling get_user
                    try {
                        const response = await apiClient.get('/auth/user/');
                        if (response.data.status && response.data.data) {
                            const freshUserData = response.data.data;
                            // Merge stored role with fresh data
                            const parsedStored = JSON.parse(storedUser);
                            const mergedUser = { ...parsedStored, ...freshUserData };
                            localStorage.setItem('user', JSON.stringify(mergedUser));
                            setUser(mergedUser);
                        }
                        else {
                            // Token invalid, try refresh
                            if (refreshToken) {
                                await attemptTokenRefresh(refreshToken, storedUser);
                            }
                            else {
                                clearAuth();
                            }
                        }
                    }
                    catch {
                        // Token might be expired, try refresh
                        if (refreshToken) {
                            await attemptTokenRefresh(refreshToken, storedUser);
                        }
                        else {
                            clearAuth();
                        }
                    }
                }
            }
            finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);
    const attemptTokenRefresh = async (refreshToken, storedUser) => {
        try {
            const response = await apiClient.post('/auth/refresh/', { refresh: refreshToken });
            if (response.data.status && response.data.data) {
                localStorage.setItem('auth_token', response.data.data.access);
                if (response.data.data.refresh) {
                    localStorage.setItem('refresh_token', response.data.data.refresh);
                }
                setUser(JSON.parse(storedUser));
            }
            else {
                clearAuth();
            }
        }
        catch {
            clearAuth();
        }
    };
    const clearAuth = () => {
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
    };
    const login = useCallback(async (email, password) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post('/auth/login/', { email, password });
            if (response.data.status && response.data.data) {
                const { user: userData, access, refresh } = response.data.data;
                // Store tokens and user
                localStorage.setItem('auth_token', access);
                if (refresh)
                    localStorage.setItem('refresh_token', refresh);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                return userData;
            }
            else {
                throw new Error(response.data.message || 'Login failed');
            }
        }
        catch (error) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            throw new Error(message);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const logout = useCallback(() => {
        clearAuth();
    }, []);
    const register = useCallback(async (data) => {
        setIsLoading(true);
        try {
            const response = await apiClient.post('/auth/register/', data);
            if (response.data.status && response.data.data) {
                const { user: userData, access, refresh } = response.data.data;
                // Store tokens and user — auto-login after signup
                localStorage.setItem('auth_token', access);
                if (refresh)
                    localStorage.setItem('refresh_token', refresh);
                localStorage.setItem('user', JSON.stringify(userData));
                setUser(userData);
                return userData;
            }
            else {
                throw new Error(response.data.message || 'Registration failed');
            }
        }
        catch (error) {
            const message = error.response?.data?.message || error.response?.data?.errors || error.message || 'Registration failed';
            throw new Error(typeof message === 'string' ? message : JSON.stringify(message));
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    const updateUser = useCallback((userData) => {
        setUser(prev => {
            if (!prev)
                return prev;
            const updated = { ...prev, ...userData };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    }, []);
    return (_jsx(AuthContext.Provider, { value: { user, isAuthenticated: !!user, isLoading, login, logout, register, updateUser }, children: children }));
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
