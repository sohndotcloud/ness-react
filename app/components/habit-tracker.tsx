import React, { useEffect, useRef, useState } from "react";
import { Check, Flame, Plus, Trash2, X, type LucideIcon } from "lucide-react";
import axiosClient from "~/api/axiosClient";

const DAY_LABELS: string[] = ["M", "T", "W", "T", "F", "S", "S"];
const STREAK_LOOKBACK_DAYS = 90;

interface Habit {
    id: string;
    name: string;
    streak: number;
    done: (0 | 1)[];
}

interface HabitRequest {
    name: string;
    description?: string;
    frequency?: string;
    targetCount?: number;
}

interface HabitResponse {
    id: string;
    name: string;
    description: string | null;
    frequency: string;
    targetCount: number;
}

interface HabitLogRequest {
    count: number;
    logDate?: string;
}

interface HabitLogResponse {
    id: string;
    habitId: string;
    logDate: string;
    count: number;
}

function getTodayIndex(): number {
    const jsDay = new Date().getDay();
    return jsDay === 0 ? 6 : jsDay - 1;
}

function toIsoDate(d: Date): string {
    return d.toISOString().slice(0, 10);
}

function getDateForDayIndex(dayIndex: number): string {
    const today = new Date();
    const todayIndex = getTodayIndex();
    const diff = dayIndex - todayIndex;
    const target = new Date(today);
    target.setDate(today.getDate() + diff);
    return toIsoDate(target);
}

function habitResponseToHabit(res: HabitResponse): Habit {
    return {
        id: res.id,
        name: res.name,
        streak: 0,
        done: [0, 0, 0, 0, 0, 0, 0],
    };
}

function deriveHabitStateFromLogs(logs: HabitLogResponse[]): { done: (0 | 1)[]; streak: number } {
    const logDates = new Set(logs.map((l) => l.logDate));

    const done = Array.from({ length: 7 }, (_, i) =>
        (logDates.has(getDateForDayIndex(i)) ? 1 : 0)
    ) as (0 | 1)[];

    let streak = 0;
    const cursor = new Date();
    while (logDates.has(toIsoDate(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }

    return { done, streak };
}

async function fetchHabitLogs(habitId: string): Promise<HabitLogResponse[]> {
    try {
        const res = await axiosClient.get<HabitLogResponse[]>(
            `/habits/${habitId}/logs`,
            { params: { days: STREAK_LOOKBACK_DAYS } }
        );
        return res.data;
    } catch (err) {
        console.error("Failed to fetch habit logs", err);
        return [];
    }
}

async function createHabitLog(
    habitId: string,
    logRequest: HabitLogRequest
): Promise<HabitLogResponse | undefined> {
    try {
        const res = await axiosClient.post<HabitLogResponse>(
            `/habits/${habitId}/logs`,
            logRequest
        );
        return res.data;
    } catch (err) {
        console.error("Failed to create habit log", err);
        return undefined;
    }
}

async function deleteHabitLog(habitId: string, logDate: string): Promise<boolean> {
    try {
        await axiosClient.delete(`/habits/${habitId}/logs/${logDate}`);
        return true;
    } catch (err) {
        console.error("Failed to delete habit log", err);
        return false;
    }
}

interface DayCellProps {
    isDone: boolean;
    isToday: boolean;
    linkPrev: boolean;
    linkNext: boolean;
    onToggle: () => void;
}

function DayCell({ isDone, isToday, linkPrev, linkNext, onToggle }: DayCellProps) {
    const radius =
        linkPrev && linkNext
            ? "rounded-none"
            : linkPrev
                ? "rounded-r-md rounded-l-none"
                : linkNext
                    ? "rounded-l-md rounded-r-none"
                    : "rounded-md";

    const stateClasses = isDone
        ? "border bg-cyan-500 border-cyan-500 text-white"
        : isToday
            ? "border-2 border-cyan-400 hover:bg-cyan-500/10"
            : "border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-cyan-500/10";

    return (
        <button
            type="button"
            onClick={(e) => (isToday ? onToggle() : e.preventDefault())}
            aria-label={isDone ? "Mark as not done" : "Mark as done"}
            aria-pressed={isDone}
            className={`w-6 h-6 sm:w-7 sm:h-7 ${radius} flex items-center justify-center transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${stateClasses}`}
        >
            {isDone && isToday && <Check size={13} strokeWidth={2.5} />}
        </button>
    );
}

interface HabitRowProps {
    habit: Habit;
    todayIndex: number;
    showDayLabels: boolean;
    onToggleDay: (habitId: string, dayIndex: number) => void;
    onDelete: (habitId: string) => void;
}

function HabitRow({ habit, todayIndex, showDayLabels, onToggleDay, onDelete }: HabitRowProps) {
    const [togglingDay, setTogglingDay] = useState<number | null>(null);

    async function handleToggle(dayIndex: number) {
        if (togglingDay !== null) return;
        setTogglingDay(dayIndex);

        const wasDone = habit.done[dayIndex] === 1;
        const logDate = getDateForDayIndex(dayIndex);

        onToggleDay(habit.id, dayIndex);

        try {
            if (wasDone) {
                const success = await deleteHabitLog(habit.id, logDate);
                if (!success) onToggleDay(habit.id, dayIndex);
            } else {
                const created = await createHabitLog(habit.id, { count: 1, logDate });
                if (!created) onToggleDay(habit.id, dayIndex);
            }
        } finally {
            setTogglingDay(null);
        }
    }

    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-md border border-cyan-500/10 shadow-sm p-3 sm:p-3.5 flex items-center gap-2 sm:gap-4 hover:bg-cyan-500/5 transition-colors duration-150">
            <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{habit.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                    <Flame
                        size={12}
                        className={habit.streak > 0 ? "text-cyan-500 dark:text-cyan-400" : "text-slate-300 dark:text-slate-600"}
                    />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
            {habit.streak} day{habit.streak === 1 ? "" : "s"} streak
          </span>
                </div>
            </div>

            <div className="flex items-center shrink-0">
                {DAY_LABELS.map((d, i) => {
                    const linkNext = i < 6 && habit.done[i] === 1 && habit.done[i + 1] === 1;
                    const linkPrev = i > 0 && habit.done[i - 1] === 1 && habit.done[i] === 1;
                    return (
                        <div
                            key={i}
                            className={`flex flex-col items-center gap-1 ${
                                i < 6 ? (linkNext ? "mr-0" : "mr-1 sm:mr-1.5") : ""
                            }`}
                        >
              <span
                  className={`text-[10px] font-mono leading-none ${showDayLabels ? "" : "invisible"} ${
                      i === todayIndex
                          ? "text-cyan-600 dark:text-cyan-400 font-semibold"
                          : "text-slate-300 dark:text-slate-600"
                  }`}
              >
                {d}
              </span>
                            <DayCell
                                isDone={habit.done[i] === 1}
                                isToday={i === todayIndex}
                                linkPrev={linkPrev}
                                linkNext={linkNext}
                                onToggle={() => handleToggle(i)}
                            />
                        </div>
                    );
                })}
            </div>

            <button
                type="button"
                onClick={() => onDelete(habit.id)}
                aria-label={`Delete ${habit.name}`}
                className="shrink-0 text-slate-300 hover:text-red-500 hover:bg-red-500/10 dark:text-slate-600 dark:hover:text-red-400 rounded-md p-1 sm:p-1.5 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
}

interface AddHabitRowProps {
    onAdd: (name: string) => Promise<void>;
}

function AddHabitRow({ onAdd }: AddHabitRowProps) {
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [value, setValue] = useState<string>("");
    const [submitting, setSubmitting] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    function openForm(): void {
        setIsAdding(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    }

    async function submit(): Promise<void> {
        const trimmed = value.trim();
        if (!trimmed || submitting) return;
        setSubmitting(true);
        try {
            await onAdd(trimmed);
            setValue("");
            setIsAdding(false);
        } finally {
            setSubmitting(false);
        }
    }

    function cancel(): void {
        setValue("");
        setIsAdding(false);
    }

    if (!isAdding) {
        return (
            <button
                type="button"
                onClick={openForm}
                className="w-full border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-md p-3.5 flex items-center justify-center gap-2 text-slate-400 hover:border-slate-300 hover:text-cyan-600 hover:bg-cyan-500/10 dark:text-slate-500 dark:hover:border-slate-600 dark:hover:text-cyan-300 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
                <Plus size={15} />
                <span className="text-sm">Add another habit</span>
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2 rounded-md border-2 border-cyan-400 bg-cyan-500/10 p-2.5 focus-within:outline focus-within:outline-2 focus-within:outline-cyan-400">
            <input
                ref={inputRef}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") submit();
                    if (e.key === "Escape") cancel();
                }}
                placeholder="Habit name…"
                disabled={submitting}
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
            />
            <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="shrink-0 rounded-md bg-cyan-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-cyan-600 dark:hover:bg-cyan-400 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 disabled:opacity-50"
            >
                {submitting ? "Adding…" : "Add"}
            </button>
            <button
                type="button"
                onClick={cancel}
                aria-label="Cancel"
                className="shrink-0 rounded-md p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
            >
                <X size={16} />
            </button>
        </div>
    );
}

interface StatCardProps {
    icon: LucideIcon;
    value: string | number;
    sub: string;
}

function StatCard({ icon: IconCmp, value, sub }: StatCardProps) {
    return (
        <div className="flex items-center gap-3 rounded-md border border-cyan-500/10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <IconCmp size={18} strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
                <p className="text-2xl font-bold tabular-nums leading-tight text-slate-800 dark:text-slate-200">{value}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{sub}</p>
            </div>
        </div>
    );
}

export default function HabitTracker() {
    const [habits, setHabits] = useState<Habit[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const todayIndex = getTodayIndex();

    useEffect(() => {
        let cancelled = false;

        async function loadHabits() {
            setLoading(true);
            setError(null);
            try {
                const res = await axiosClient.get<HabitResponse[]>("/habits");
                if (cancelled) return;

                const baseHabits = res.data.map(habitResponseToHabit);
                setHabits(baseHabits);
                setLoading(false);

                baseHabits.forEach(async (habit) => {
                    const logs = await fetchHabitLogs(habit.id);
                    if (cancelled) return;
                    const { done, streak } = deriveHabitStateFromLogs(logs);
                    setHabits((prev) =>
                        prev.map((h) => (h.id === habit.id ? { ...h, done, streak } : h))
                    );
                });
            } catch (err) {
                if (!cancelled) {
                    setError("Failed to fetch habits");
                    setLoading(false);
                }
            }
        }

        loadHabits();
        return () => {
            cancelled = true;
        };
    }, []);

    const now = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const dateLabel = now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
    });

    const todayCompleted = habits.filter((h) => h.done[todayIndex] === 1).length;
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);

    function toggleDay(habitId: string, dayIndex: number): void {
        setHabits((prev) =>
            prev.map((h) => {
                if (h.id !== habitId) return h;
                const done = [...h.done];
                const wasDone = done[dayIndex] === 1;
                done[dayIndex] = wasDone ? 0 : 1;
                let streak = h.streak;
                if (dayIndex === todayIndex) {
                    streak = wasDone ? Math.max(0, h.streak - 1) : h.streak + 1;
                }
                return { ...h, done, streak };
            })
        );
    }

    async function addHabit(name: string): Promise<void> {
        const habitRequest: HabitRequest = {
            name,
            description: "",
            frequency: "daily",
            targetCount: 30,
        };
        try {
            const res = await axiosClient.post<HabitResponse>("/habits", habitRequest);
            setHabits((prev) => [...prev, habitResponseToHabit(res.data)]);
        } catch (err) {
            setError("Failed to add habit");
        }
    }

    async function deleteHabit(id: string): Promise<void> {
        const prevHabits = habits;
        setHabits((prev) => prev.filter((h) => h.id !== id));
        try {
            await axiosClient.delete(`/habits/${id}`);
        } catch (err) {
            setError("Failed to delete habit");
            setHabits(prevHabits);
        }
    }

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
            <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 sm:p-6 md:p-8">
                <header>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{dateLabel}</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-200 sm:text-3xl">
                        {greeting}
                    </h1>
                </header>

                <section className="grid grid-cols-2 gap-3">
                    <StatCard icon={Check} value={`${todayCompleted}/${habits.length}`} sub="done today" />
                    <StatCard icon={Flame} value={bestStreak} sub="day streak" />
                </section>

                <section className="flex flex-col gap-2">
                    <div className="px-1 mb-2 font-mono text-[10px] uppercase tracking-[0.15em] text-cyan-600 dark:text-cyan-400/70">
                        Habits
                    </div>
                    <div className="h-px bg-slate-300 dark:bg-slate-800 mb-2" />

                    {error && <p className="py-2 text-center text-sm text-red-500">{error}</p>}

                    {loading ? (
                        <p className="py-2 text-center text-sm text-slate-400 dark:text-slate-500">Loading habits…</p>
                    ) : (
                        <>
                            {habits.map((h) => (
                                <HabitRow
                                    key={h.id}
                                    habit={h}
                                    todayIndex={todayIndex}
                                    showDayLabels={true}
                                    onToggleDay={toggleDay}
                                    onDelete={deleteHabit}
                                />
                            ))}
                            {habits.length === 0 && (
                                <p className="py-2 text-center text-sm text-slate-400 dark:text-slate-500">
                                    No habits yet — add your first one to start a streak.
                                </p>
                            )}
                        </>
                    )}

                    <AddHabitRow onAdd={addHabit} />
                </section>
            </main>
        </div>
    );
}