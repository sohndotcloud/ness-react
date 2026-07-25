import React, { useEffect, useRef, useState } from "react";
import { useBar } from "~/context/bottombar-context";
import { useUserWeather } from "~/util/useUserWeather";
import Timer from '~/components/timer';

export default function Bottombar() {
    const { weather, error, loading } = useUserWeather();
    const { isPlaying, setIsPlaying } = useBar();
    const [time, setTime] = useState<Date | null>(null);
    const title = "Blond";
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        const audio = new Audio("http://stream.sohn.cloud/rain");
        audioRef.current = audio;
        return () => {
            audio.pause();
            audioRef.current = null;
        };
    }, []);

    function togglePlay(isPlaying: boolean, setIsPlaying: (v: boolean) => void) {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(err => console.warn('Playback blocked:', err));
        }
        setIsPlaying(!isPlaying);
    }

    useEffect(() => {
        setTime(new Date());
        const intervalId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            // Don't hijack spacebar while typing in inputs/textareas
            const target = event.target as HTMLElement;
            if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
                return;
            }

            if (event.code === "Space") {
                event.preventDefault(); // stops page from scrolling
                togglePlay(isPlaying, setIsPlaying);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isPlaying]);

    return (
        <div className="fixed bottom-0 left-0 w-full z-20 h-[72px] bg-slate-950/85 backdrop-blur-md border-t border-cyan-500/10">
            <div className="flex items-center h-full max-w-[1400px] mx-auto px-5 gap-5">

                <button
                    onClick={() => togglePlay(isPlaying, setIsPlaying)}
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
                    <div className="text-[10px] uppercase tracking-[0.15em] text-cyan-400/70 font-mono">
                        {isPlaying ? "Now Playing" : "Paused"}
                    </div>
                    <div className="text-sm text-slate-100 font-medium truncate max-w-[160px]">
                        Rain
                    </div>
                </div>

                <div className="flex-1" />
                <div className="hidden sm:block w-px h-8 bg-slate-800" >
                    <div className="absolute inset-0 overflow-hidden pointer-events-none rain-container" aria-hidden="true">
                        { isPlaying && Array.from({ length: 5 }).map((_, i) => (
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
                        <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Temp</div>
                        <div className="text-slate-200 tabular-nums">
                            {weather?.temperature !== undefined ? `${weather.temperature}°F` : '—'}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Time</div>
                        <div className="text-slate-200 tabular-nums">
                            {time ? time.toLocaleTimeString() : '—'}
                        </div>
                    </div>
                </div>

                <div className="hidden sm:block w-px h-8 bg-slate-800" />

                <div className="flex-shrink-0 text-slate-200 ">
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