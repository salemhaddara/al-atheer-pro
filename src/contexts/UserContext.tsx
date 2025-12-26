'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getAuthToken } from '@/lib/api';
import { getStoredUser, mapApiUserToUser, clearAuthData } from '@/lib/auth';

export type UserRole = 'admin' | 'employee';

export type Permission =
    | 'manage_drawers'           // Manage cash drawers (open, close, add money)
    | 'view_drawers'              // View drawer status
    | 'manage_pos'               // Manage POS terminals
    | 'all';                     // All permissions (admin)

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    assignedWarehouseId?: string; // المستودع المخصص للموظف
    assignedPosId?: string;       // POS terminal assigned to employee
    position?: string;
    department?: string;
    permissions?: Permission[];  // User permissions
}

interface UserContextType {
    currentUser: User | null;
    setCurrentUser: (user: User | null) => void;
    login: (user: User) => void;
    logout: () => void;
    isAdmin: () => boolean;
    isEmployee: () => boolean;
    hasAccessToWarehouse: (warehouseId: string) => boolean;
    hasPermission: (permission: Permission) => boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const STORAGE_KEY = 'current_user';

export function UserProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUserState] = useState<User | null>(null);

    // Load user from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                // Check if user has a valid auth token
                const token = getAuthToken();
                if (!token) {
                    // No token, clear any stale user data
                    setCurrentUserState(null);
                    return;
                }

                // Try to get user from auth storage first (from API login)
                const authUser = getStoredUser();
                if (authUser) {
                    const appUser = mapApiUserToUser(authUser);
                    setCurrentUserState(appUser);
                    return;
                }

                // Fallback to legacy storage
                const stored = localStorage.getItem(STORAGE_KEY);
                if (stored) {
                    const user = JSON.parse(stored);
                    setCurrentUserState(user);
                }
            } catch (error) {
                console.error('Error loading user from storage:', error);
                setCurrentUserState(null);
            }
        }
    }, []);

    const setCurrentUser = (user: User | null) => {
        setCurrentUserState(user);
        if (user && typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
        }
    };

    const login = (user: User) => {
        setCurrentUser(user);
    };

    const logout = () => {
        // Clear auth data (token and user)
        clearAuthData();
        setCurrentUser(null);
    };

    const isAdmin = () => {
        return currentUser?.role === 'admin';
    };

    const isEmployee = () => {
        return currentUser?.role === 'employee';
    };

    const hasAccessToWarehouse = (warehouseId: string): boolean => {
        if (!currentUser) return false;
        // Admin has access to all warehouses
        if (currentUser.role === 'admin') return true;
        // Employee only has access to assigned warehouse
        return currentUser.assignedWarehouseId === warehouseId;
    };

    const hasPermission = (permission: Permission): boolean => {
        if (!currentUser) return false;
        // Admin has all permissions
        if (currentUser.role === 'admin' || currentUser.permissions?.includes('all')) return true;
        // Check if user has specific permission
        return currentUser.permissions?.includes(permission) || false;
    };

    return (
        <UserContext.Provider
            value={{
                currentUser,
                setCurrentUser,
                login,
                logout,
                isAdmin,
                isEmployee,
                hasAccessToWarehouse,
                hasPermission
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

