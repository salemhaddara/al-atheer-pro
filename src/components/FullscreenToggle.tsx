'use client';

import { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';

export function FullscreenToggle() {
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        console.log('FullscreenToggle mounted');
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            console.error('Error toggling fullscreen:', error);
        }
    };

    return (
        <button
            onClick={toggleFullscreen}
            className="fixed bottom-6 left-6 z-[99999] h-14 w-14 flex items-center justify-center rounded-full shadow-xl text-white transition-all duration-200 hover:scale-110 cursor-pointer"
            style={{
                position: 'fixed',
                bottom: '24px',
                left: '24px',
                zIndex: 99999,
                backgroundColor: '#000000',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                border: 'none',
                outline: 'none'
            }}
            title={isFullscreen ? 'خروج من وضع ملء الشاشة' : 'وضع ملء الشاشة'}
        >
            {isFullscreen ? (
                <Minimize className="h-6 w-6 text-white" style={{ color: '#ffffff' }} />
            ) : (
                <Maximize className="h-6 w-6 text-white" style={{ color: '#ffffff' }} />
            )}
        </button>
    );
}

