'use client';

import { useState, useEffect } from 'react';

interface LoginImageSectionProps {
    isRTL: boolean;
}

export function LoginImageSection({ isRTL }: LoginImageSectionProps) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Add shimmer animation to document head
    useEffect(() => {
        const styleId = 'login-shimmer-animation';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes loginShimmer {
                0% {
                    background-position: -200% 0;
                }
                100% {
                    background-position: 200% 0;
                }
            }
            .login-shimmer {
                animation: loginShimmer 2s infinite;
                background-size: 200% 100%;
            }
        `;
        document.head.appendChild(style);

        return () => {
            const existingStyle = document.getElementById(styleId);
            if (existingStyle) {
                existingStyle.remove();
            }
        };
    }, []);

    return (
        <div className={`w-full w-1/2 relative bg-gradient-to-br from-primary/95 to-primary/80 overflow-hidden h-full ${isRTL ? 'order-last' : ''}`}>
            {/* Shimmer Loading Effect */}
            {!imageLoaded && !imageError && (
                <div className="absolute inset-0 z-20 bg-gradient-to-br from-primary/95 to-primary/80">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent login-shimmer" />
                </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 z-10" />

            {/* Institution Image Section */}
            {!imageError && (
                <img
                    src="https://images.pexels.com/photos/269077/pexels-photo-269077.jpeg"
                    alt="Institution"
                    className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                    onLoad={() => setImageLoaded(true)}
                    onError={() => {
                        setImageError(true);
                        setImageLoaded(false);
                    }}
                />
            )}
        </div>
    );
}

