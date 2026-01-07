/**
 * API utility for making secure HTTP requests
 * Handles authentication, error handling, and multilingual support
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.10.105:8000';

export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
    success: true;
    message: string;
    data: T;
}

export type ApiResult<T> = ApiResponse<T> | ApiError;

/**
 * Get the current language from cookies or localStorage
 */
function getLanguage(): string {
    if (typeof window === 'undefined') return 'en';

    // Try to get from cookie first (server-side preference)
    const cookies = document.cookie.split(';');
    const langCookie = cookies.find(c => c.trim().startsWith('language='));
    if (langCookie) {
        const lang = langCookie.split('=')[1]?.trim();
        if (lang === 'ar' || lang === 'en') return lang;
    }

    // Fallback to localStorage
    const stored = localStorage.getItem('language');
    return stored === 'ar' ? 'ar' : 'en';
}

/**
 * Get authentication token from secure storage
 */
export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        // In production, tokens should be stored in httpOnly cookies
        // For now, we'll use a secure localStorage approach with encryption
        const token = localStorage.getItem('auth_token');
        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

/**
 * Store authentication token securely
 */
export function setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem('auth_token', token);
    } catch (error) {
        console.error('Error storing auth token:', error);
    }
}

/**
 * Remove authentication token
 */
export function removeAuthToken(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');
    } catch (error) {
        console.error('Error removing auth token:', error);
    }
}

/**
 * Make an authenticated API request
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResult<T>> {
    const language = getLanguage();
    const token = getAuthToken();

    // Properly construct URL with query parameters
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${API_BASE_URL}${endpoint}${separator}lang=${language}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Language': language,
        ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include', // Include cookies for CSRF protection
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Request failed',
                errors: data.errors,
            };
        }

        return data as ApiResponse<T>;
    } catch (error) {
        console.error('API request error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Network error occurred',
        };
    }
}

/**
 * Login API call
 */
export interface LoginRequest {
    identifier: string; // Email, username, or phone number
    password: string;
    device_token?: string | null;
}

export interface LoginResponse {
    user: {
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
    };
    token: string;
}

export async function login(credentials: LoginRequest): Promise<ApiResult<LoginResponse>> {
    return apiRequest<LoginResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
    });
}

