'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { getAuthToken } from '@/lib/api';
import { isAuthenticated as checkAuth } from '@/lib/auth';

/**
 * Hook to protect authenticated routes
 * Redirects unauthenticated users to the login page
 * 
 * Features:
 * - Prevents flash of protected content for unauthenticated users
 * - Handles async user context loading
 * - Secure token validation
 * - Clean redirect without adding to browser history
 * 
 * @param redirectTo - Path to redirect to if user is not authenticated (default: '/login')
 * @returns Object with loading state and isAuthenticated flag
 */
export function useRequireAuth(redirectTo: string = '/login') {
    const router = useRouter();
    const pathname = usePathname();
    const { currentUser } = useUser();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') {
            setIsChecking(false);
            setIsAuthenticated(false);
            return;
        }

        // Prevent multiple redirects
        if (hasRedirected.current) {
            return;
        }

        const checkAuthentication = () => {
            try {
                // Fast check: No token means definitely not authenticated
                const token = getAuthToken();
                
                if (!token) {
                    // No token, redirect to login
                    hasRedirected.current = true;
                    router.replace(`${redirectTo}?redirect=${encodeURIComponent(pathname || '/')}`);
                    setIsAuthenticated(false);
                    setIsChecking(false);
                    return;
                }

                // Token exists - check if user context has loaded
                if (currentUser !== null) {
                    // User is authenticated
                    setIsAuthenticated(true);
                    setIsChecking(false);
                    return;
                }

                // Token exists but user context not loaded yet
                // Wait for UserContext to initialize (max 3 seconds)
                // This handles race conditions during initial load, especially on page refresh
                const timeoutId = setTimeout(() => {
                    if (hasRedirected.current) return;

                    // Final check: verify authentication status
                    if (checkAuth()) {
                        // Still have token, user should be authenticated
                        // Wait a bit more for user context to load (up to 2 more seconds)
                        const secondTimeoutId = setTimeout(() => {
                            if (hasRedirected.current) return;
                            
                            if (currentUser !== null) {
                                setIsAuthenticated(true);
                                setIsChecking(false);
                            } else if (checkAuth()) {
                                // Token still exists, assume user is authenticated
                                // Don't redirect - let the page load
                                setIsAuthenticated(true);
                                setIsChecking(false);
                            } else {
                                // Token was cleared, redirect to login
                                hasRedirected.current = true;
                                router.replace(`${redirectTo}?redirect=${encodeURIComponent(pathname || '/')}`);
                                setIsAuthenticated(false);
                                setIsChecking(false);
                            }
                        }, 2000);

                        return () => clearTimeout(secondTimeoutId);
                    } else {
                        // No token, redirect to login
                        hasRedirected.current = true;
                        router.replace(`${redirectTo}?redirect=${encodeURIComponent(pathname || '/')}`);
                        setIsAuthenticated(false);
                        setIsChecking(false);
                    }
                }, 3000);

                return () => clearTimeout(timeoutId);
            } catch (error) {
                console.error('Error checking authentication:', error);
                // On error, only redirect if no token exists
                const token = getAuthToken();
                if (!token) {
                    hasRedirected.current = true;
                    router.replace(redirectTo);
                    setIsAuthenticated(false);
                } else {
                    // Token exists, assume authenticated despite error
                    setIsAuthenticated(true);
                }
                setIsChecking(false);
            }
        };

        checkAuthentication();
    }, [currentUser, router, redirectTo, pathname]);

    // Handle case where user logs out while on a protected page
    useEffect(() => {
        if (!isChecking && currentUser === null && !hasRedirected.current) {
            const token = getAuthToken();
            if (!token) {
                hasRedirected.current = true;
                router.replace(`${redirectTo}?redirect=${encodeURIComponent(pathname || '/')}`);
            }
        }
    }, [currentUser, isChecking, router, redirectTo, pathname]);

    return {
        isChecking,
        isAuthenticated,
    };
}

