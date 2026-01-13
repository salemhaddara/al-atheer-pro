/**
 * Authentication utilities
 * Handles secure token storage and user session management
 */

import { getAuthToken, setAuthToken, removeAuthToken } from './api';
import { User } from '@/contexts/UserContext';

export interface AuthUser {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    full_name: string;
    username: string;
    email: string;
    phone_number: string | null;
    email_verified_at: string | null;
    phone_number_verified_at: string | null;
    is_verified: boolean;
    is_banned: boolean;
    ban_cause: string | null;
    last_login_at: string | null;
    is_system_owner_admin: boolean;
    profile_url: string | null;
    created_at: string;
    updated_at: string;
}

/**
 * Convert API user to app User type
 */
export function mapApiUserToUser(apiUser: AuthUser): User {
    return {
        id: String(apiUser.id),
        name: apiUser.full_name,
        email: apiUser.email,
        role: apiUser.is_system_owner_admin ? 'admin' : 'employee',
        position: undefined,
        department: undefined,
        permissions: apiUser.is_system_owner_admin ? ['all'] : undefined,
    };
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return getAuthToken() !== null;
}

/**
 * Store authentication data securely
 */
export function storeAuthData(token: string, user: AuthUser): void {
    setAuthToken(token);

    // Store user data
    if (typeof window !== 'undefined') {
        try {
            const appUser = mapApiUserToUser(user);
            localStorage.setItem('current_user', JSON.stringify(appUser));
            localStorage.setItem('auth_user', JSON.stringify(user));
        } catch (error) {
            console.error('Error storing user data:', error);
        }
    }
}

/**
 * Clear authentication data
 */
export function clearAuthData(): void {
    removeAuthToken();

    if (typeof window !== 'undefined') {
        localStorage.removeItem('current_user');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('cached_company_name');
        localStorage.removeItem('cached_current_institution');
        localStorage.removeItem('cached_institutions');
    }
}

/**
 * Get stored user data
 */
export function getStoredUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem('auth_user');
        if (stored) {
            return JSON.parse(stored) as AuthUser;
        }
    } catch (error) {
        console.error('Error getting stored user:', error);
    }

    return null;
}

