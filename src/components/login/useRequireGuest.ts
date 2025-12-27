'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { getAuthToken } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';

/**
 * Hook to protect guest-only routes (like login page)
 * Redirects authenticated users away from the page
 * 
 * Features:
 * - Prevents flash of login page for authenticated users
 * - Handles async user context loading
 * - Secure token validation
 * - Clean redirect without adding to browser history
 * 
 * @param redirectTo - Path to redirect to if user is authenticated (default: '/')
 * @returns Object with loading state and isGuest flag
 */
export function useRequireGuest(redirectTo: string = '/') {
    const router = useRouter();
    const { currentUser } = useUser();
    const [isChecking, setIsChecking] = useState(true);
    const [isGuest, setIsGuest] = useState(false);
    const hasRedirected = useRef(false);

    useEffect(() => {
        // Only run on client side
        if (typeof window === 'undefined') {
            setIsChecking(false);
            setIsGuest(true);
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
                    setIsGuest(true);
                    setIsChecking(false);
                    return;
                }

                // Token exists - user might be authenticated
                // Check if user context has loaded
                if (currentUser !== null) {
                    // User is authenticated, redirect immediately
                    hasRedirected.current = true;
                    router.replace(redirectTo);
                    setIsGuest(false);
                    setIsChecking(false);
                    return;
                }

                // Token exists but user context not loaded yet
                // Wait for UserContext to initialize (max 300ms)
                // This handles race conditions during initial load
                const timeoutId = setTimeout(() => {
                    if (hasRedirected.current) return;

                    // Final check: verify authentication status
                    // If token still exists, user is likely authenticated
                    if (isAuthenticated()) {
                        hasRedirected.current = true;
                        router.replace(redirectTo);
                        setIsGuest(false);
                    } else {
                        // Token might be invalid or cleared, allow login
                        setIsGuest(true);
                    }
                    setIsChecking(false);
                }, 300);

                return () => clearTimeout(timeoutId);
            } catch (error) {
                console.error('Error checking authentication:', error);
                // On error, allow login (fail open for better UX)
                setIsGuest(true);
                setIsChecking(false);
            }
        };

        checkAuthentication();
    }, [currentUser, router, redirectTo]);

    // Handle case where user becomes authenticated after initial check
    useEffect(() => {
        if (!isChecking && currentUser !== null && !hasRedirected.current) {
            hasRedirected.current = true;
            router.replace(redirectTo);
        }
    }, [currentUser, isChecking, router, redirectTo]);

    return {
        isChecking,
        isGuest,
    };
}

