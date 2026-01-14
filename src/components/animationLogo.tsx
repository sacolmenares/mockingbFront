import { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const animationLoadingLogo = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Función para verificar si estamos en modo oscuro
        const checkDarkMode = () => {
            const isDarkMode = document.documentElement.classList.contains('dark') ||
                window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(isDarkMode);
        };

        checkDarkMode();

        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', checkDarkMode);

        return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', checkDarkMode);
        };
    }, []);

    return (
        <DotLottieReact
            key={isDark ? 'dark' : 'light'}
            src={isDark ? "animationLoadingWhite.lottie" : "animationLoadingDark.lottie"}
            loop
            autoplay
        />
    );
};