import React, { useEffect, useRef, useState, useCallback } from "react";
import { useBar } from "~/context/bottombar-context";
import { useUserWeather } from "~/util/useUserWeather";
import Timer from '~/components/timer';
import { useTheme } from "~/context/theme-context";

const STREAMS = {
    light: { url: "http://stream.sohn.cloud/sun", label: "Sun" },
    dark: { url: "http://stream.sohn.cloud/rain", label: "Rain" },
};

const FADE_DURATION_MS = 2500;
const FADE_STEPS = 50;

export default function Bottombar() {
    const { weather, error, loading } = useUserWeather();
    const { isPlaying, setIsPlaying } = useBar();
    const { isDark } = useTheme();
    const [time, setTime] = useState<Date | null>(null);

    const lightRef = useRef<HTMLAudioElement | null>(null);
    const darkRef = useRef<HTMLAudioElement | null>(null);
    const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Set up both streams once
    useEffect(() => {
        const light = new Audio(STREAMS.light.url);
        const dark = new Audio(STREAMS.dark.url);
        light.volume = isDark ? 0 : 1;
        dark.volume = isDark ? 1 : 0;
        lightRef.current = light;
        darkRef.current = dark;

        return () => {
            light.pause();
            dark.pause();
            lightRef.current = null;
            darkRef.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Start/stop both together
    const togglePlay = useCallback((playing: boolean) => {
        if (!lightRef.current || !darkRef.current) return;
        if (playing) {
            lightRef.current.pause();
            darkRef.current.pause();
        } else {
            lightRef.current.play().catch(err => console.warn('Playback blocked:', err));
            darkRef.current.play().catch(err => console.warn('Playback blocked:', err));
        }
        setIsPlaying(!playing);
    }, [setIsPlaying]);

    // Crossfade on theme change
    useEffect(() => {
        const light = lightRef.current;
        const dark = darkRef.current;
        if (!light || !dark) return;

        if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

        const stepTime = FADE_DURATION_MS / FADE_STEPS;
        const fadeInTarget = isDark ? dark : light;
        const fadeOutTarget = isDark ? light : dark;
        const startIn = fadeInTarget.volume;
        const startOut = fadeOutTarget.volume;
        let step = 0;

        fadeIntervalRef.current = setInterval(() => {
            step++;
            const progress = Math.min(step / FADE_STEPS, 1);
            fadeInTarget.volume = startIn + (1 - startIn) * progress;
            fadeOutTarget.volume = startOut + (0 - startOut) * progress;

            if (progress >= 1 && fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
                fadeIntervalRef.current = null;
            }
        }, stepTime);

        return () => {
            if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
        };
    }, [isDark]);

    useEffect(() => {
        setTime(new Date());
        const intervalId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            const target = event.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
                return;
            }
            if (event.code === "Space") {
                event.preventDefault();
                togglePlay(isPlaying);
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPlaying, togglePlay]);

    const currentStream = isDark ? STREAMS.dark : STREAMS.light;

    return (
        <div className="fixed bottom-0 left-0 w-full z-20 h-[72px] bg-white/85 dark:bg-slate-950/85 backdrop-blur-md border-t border-cyan-500/10">
            <div className="flex items-center h-full max-w-[1400px] mx-auto px-5 gap-5">

                <button
                    onClick={() => togglePlay(isPlaying)}
                    aria-label={isPlaying ? "Pause" : "Play"}
                    className="flex-shrink-0 w-10 h-10 rounded-full border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/15 hover:border-cyan-400/50 transition-colors duration-200 flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
                >
                    {isPlaying ? (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <rect x="2" y="1" width="3.5" height="12" rx="0.5" fill="#67e8f9" />
                            <rect x="8.5" y="1" width="3.5" height="12" rx="0.5" fill="#67e8f9" />
                        </svg>
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2.5 1.2C2.5 0.7 3.1 0.4 3.5 0.7L12.5 6.5C12.9 6.7 12.9 7.3 12.5 7.5L3.5 13.3C3.1 13.6 2.5 13.3 2.5 12.8V1.2Z" fill="#67e8f9" />
                        </svg>
                    )}
                </button>

                {/* Signature: live equalizer — only animates while actually playing */}
                <div className="flex-shrink-0 flex items-end gap-[3px] h-5 w-6">
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className={`w-[3px] bg-cyan-400 rounded-full ${isPlaying ? 'animate-[eq_1s_ease-in-out_infinite]' : 'h-1 opacity-30'}`}
                            style={isPlaying ? { animationDelay: `${i * 0.15}s` } : undefined}
                        />
                    ))}
                </div>

                {/* Status label */}
                <div className="flex-shrink-0 min-w-0">
                    <div className="text-[10px] uppercase tracking-[0.15em] text-cyan-600 dark:text-cyan-400/70 font-mono">
                        {isPlaying ? "Now Playing" : "Paused"}
                    </div>
                    <div className="text-sm text-slate-700 dark:text-slate-100 font-medium truncate max-w-[160px]">
                        {currentStream.label}
                    </div>
                </div>

                <div className="flex-1" />
                <div className="hidden sm:block relative w-px h-8 bg-slate-800">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rain-container" aria-hidden="true">
                        {isPlaying && !isDark && Array.from({ length: 5 }).map((_, i) => (
                            <span
                                key={i}
                                className="raindrop"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `0s`,
                                    animationDuration: `${0.5 + Math.random() * 0.5}s`,
                                }}
                            />
                        ))}
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-6 font-mono text-sm">
                    <div className="text-right">
                        <div className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Temp</div>
                        <div className="text-slate-700 dark:text-slate-200 tabular-nums">
                            {weather?.temperature !== undefined ? `${weather.temperature}°F` : '—'}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Time</div>
                        <div className="text-slate-700 dark:text-slate-200 tabular-nums">
                            {time ? time.toLocaleTimeString() : '—'}
                        </div>
                    </div>
                </div>

                <div className="hidden sm:block w-px h-8 bg-slate-800" />

                <div className="flex-shrink-0 text-slate-700 dark:text-slate-200">
                    <Timer />
                </div>
            </div>

            <style>{`
                @keyframes eq {
                    0%, 100% { height: 4px; }
                    50% { height: 18px; }
                }
            `}</style>
        </div>
    );
}