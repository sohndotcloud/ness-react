import DarkModeToggle from "~/components/darkmode";
import HabitTracker from "~/components/habit-tracker";
import {useRef} from "react";
import {useBar} from "~/context/bottombar-context";
import {useTheme} from "~/context/theme-context";
import Sidebar from "~/components/sidebar";
import MobileBlockOverlay from "~/components/mobile-overlay";
import Bottombar from "~/components/bottombar";

export function Main() {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastSpawn = useRef(0);
    const { isPlaying } = useBar();
    const { isDark } = useTheme();

    function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
        const now = Date.now();
        if (now - lastSpawn.current < 120) return;
        lastSpawn.current = now;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const ripple = document.createElement("span");
        ripple.className = "cursor-ripple";
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;
        containerRef.current?.appendChild(ripple);
        setTimeout(() => ripple.remove(), 900);
    }

    return (
        <main className="relative h-screen overflow-hidden bg-slate-200 dark:bg-slate-900">
            <div
                className="absolute inset-x-0 top-0 bottom-[75px] bg-cover bg-center opacity-90 pointer-events-none"
                aria-hidden="true"
            />
            <div
                className="absolute inset-x-0 top-0 bottom-[75px] dark:bg-[radial-gradient(ellipse_at_top,_rgba(34,211,238,0.06),_transparent_60%)] pointer-events-none"
                aria-hidden="true"
            />
            <Sidebar />
            <DarkModeToggle />
            <div className="relative h-screen flex flex-col min-h-0">
                { isPlaying && isDark &&
                    <div
                        ref={containerRef}
                        onPointerMove={handlePointerMove}
                        className="absolute inset-0 overflow-hidden pointer-events-auto touch-none"
                        aria-hidden="true"
                    />
                }
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <HabitTracker/>
                    <div className="h-6" aria-hidden="true" />
                </div>
                <MobileBlockOverlay />
                <Bottombar />
            </div>
        </main>
    );
}