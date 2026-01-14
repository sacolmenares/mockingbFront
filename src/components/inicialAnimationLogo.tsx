import { useState, useEffect } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export const InicialAnimationLoadingLogo = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const checkDarkMode = () => {
            const isDarkMode = document.documentElement.classList.contains('dark') ||
                window.matchMedia('(prefers-color-scheme: dark)').matches;
            setIsDark(isDarkMode);
        };

        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="relative flex items-center justify-center h-full w-full">
            <DotLottieReact
                key={isDark ? 'dark-test' : 'light-test'}
                src={isDark ? "/whiteLoadingLogo.lottie" : "/whiteLoadingLogo.lottie"}
                loop
                autoplay
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
};