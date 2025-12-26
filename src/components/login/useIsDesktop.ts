'use client';

import { useState, useEffect } from 'react';

const DESKTOP_BREAKPOINT = 768;

export function useIsDesktop() {
    const [isDesktop, setIsDesktop] = useState<boolean>(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
        };

        // Check on mount
        checkScreenSize();

        // Listen for resize events
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    return isDesktop;
}

