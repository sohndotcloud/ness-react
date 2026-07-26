import { useState, useEffect } from 'react';
import rotationIcon from '../assets/rotation.png';

function useIsMobile(breakpoint = 640) {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        function checkWidth() {
            setIsMobile(window.innerWidth < breakpoint);
        }
        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, [breakpoint]);

    return isMobile;
}

export default function MobileBlockOverlay() {
    const isMobile = useIsMobile(640);

    if (!isMobile) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-8">
            <div className="flex flex-col items-center max-w-xs text-center">
                <img
                    src={rotationIcon}
                    alt=""
                    className="w-16 h-16 mb-6 opacity-90 dark:opacity-80 animate-[rotate-hint_2s_ease-in-out_infinite]"
                />
                <div className="text-[10px] uppercase tracking-[0.15em] text-cyan-600 dark:text-cyan-400/70 font-mono mb-2">
                    Screen too small
                </div>
                <p className="text-slate-700 dark:text-slate-200 text-sm leading-relaxed">
                    This experience is designed for larger screens.
                    <br />
                    Please rotate your device.
                </p>
            </div>
            <style>{`
                @keyframes rotate-hint {
                    0%, 100% { transform: rotate(0deg); }
                    50% { transform: rotate(90deg); }
                }
            `}</style>
        </div>
    );
}