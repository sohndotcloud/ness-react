import { useState, useEffect, useRef, useCallback } from 'react';

function formatTime(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function Timer() {
    const [minutes, setMinutes] = useState<number>(50);
    const [seconds, setSeconds] = useState<number>(0);
    const [remaining, setRemaining] = useState<number>(3000);
    const [isRunning, setIsRunning] = useState<boolean>(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [alarmStatus, setAlarmStatus] = useState<boolean>(false);
    const totalSeconds = minutes * 60 + seconds;

    useEffect(() => {
        if (!isRunning) return;

        intervalRef.current = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    setIsRunning(false);
                    setAlarmStatus(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    const handleStart = useCallback(() => {
        if (remaining === 0) return;
        setIsRunning(true);
    }, [remaining]);

    const handlePause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const handleReset = useCallback(() => {
        setIsRunning(false);
        setAlarmStatus(false);
        setRemaining(totalSeconds);
    }, [totalSeconds]);

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.max(0, Math.min(180, Number(e.target.value) || 0));
        setMinutes(val);
        if (!isRunning) setRemaining(val * 60 + seconds);
    };

    const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = Math.max(0, Math.min(59, Number(e.target.value) || 0));
        setSeconds(val);
        if (!isRunning) setRemaining(minutes * 60 + val);
    };

    return (
        <div className={"flex items-center gap-2 py-2 whitespace-nowrap" + (alarmStatus ? ' alarm' : '')}>
            <div className="w-[25px]">

            </div>
            <div className="w-[25px]">
                {formatTime(remaining)}
            </div>
            <div className="w-[25px]">

            </div>
            { isRunning ?
                <button
                    onClick={handlePause}
                    disabled={!isRunning}
                    className="w-[60px] px-2 py-1 text-xs border rounded"
                >
                    Pause
                </button> :
                <button
                    onClick={handleStart}
                    disabled={isRunning || remaining === 0}
                    className="w-[60px] px-2 py-1 text-xs border rounded"
                >
                    Start
                </button>
            }

            <button onClick={handleReset} className="w-[60px] px-2 py-1 text-xs border rounded">
                Reset
            </button>

            <div className="w-[25px]">

            </div>
        </div>
    );
}