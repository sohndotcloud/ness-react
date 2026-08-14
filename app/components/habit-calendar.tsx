import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Flame, Plus, X, type LucideIcon } from "lucide-react";
import axiosClient from "~/api/axiosClient";
import { useTheme } from "~/context/theme-context";
import CursorRippleLayer from "~/components/ripple-effect";

export interface Habit {
  id: string;
  name: string;
  color: string;
  createdDate: string;
}

export interface HabitEntry {
  habitId: string;
  date: string;
  completed: boolean;
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
  createdAt: string;
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

const HABIT_COLOR_PALETTE = [
  "#22d3ee",
  "#a78bfa",
  "#34d399",
  "#f472b6",
  "#fbbf24",
  "#60a5fa",
  "#fb923c",
  "#4ade80",
];

function colorForHabitIndex(index: number): string {
  return HABIT_COLOR_PALETTE[index % HABIT_COLOR_PALETTE.length];
}

function createIsodate(iso: string): string {
  const d = new Date(iso);
  return toDateKey(d.getFullYear(), d.getMonth(), d.getDate());
}

function habitResponseToHabit(res: HabitResponse, index: number): Habit {
  return {
    id: res.id,
    name: res.name,
    color: colorForHabitIndex(index),
    createdDate: createIsodate(res.createdAt),
  };
}

async function fetchHabits(): Promise<HabitResponse[]> {
  try {
    const res = await axiosClient.get<HabitResponse[]>("/habits");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch habits", err);
    return [];
  }
}

async function createHabit(request: HabitRequest): Promise<HabitResponse | undefined> {
  try {
    const res = await axiosClient.post<HabitResponse>("/habits", request);
    return res.data;
  } catch (err) {
    console.error("Failed to create habit", err);
    return undefined;
  }
}

async function deleteHabit(habitId: string): Promise<boolean> {
  try {
    await axiosClient.delete(`/habits/${habitId}`);
    return true;
  } catch (err) {
    console.error("Failed to delete habit", err);
    return false;
  }
}

async function fetchHabitLogs(habitId: string, days: number): Promise<HabitLogResponse[]> {
  try {
    const res = await axiosClient.get<HabitLogResponse[]>(`/habits/${habitId}/logs`, {
      params: { days },
    });
    return res.data;
  } catch (err) {
    console.error("Failed to fetch habit logs", err);
    return [];
  }
}

async function createHabitLog(
    habitId: string,
    logRequest: { count: number; date: string }
): Promise<HabitLogResponse | undefined> {
  try {
    const res = await axiosClient.post<HabitLogResponse>(`/habits/${habitId}/logs`, logRequest);
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

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDateKey(year: number, month: number, day: number): string {
  return `${year}-${pad(month + 1)}-${pad(day)}`;
}

type MonthMatrix = (number | null)[][];

function getMonthMatrix(year: number, month: number, weekStartsOn: 0 | 1 = 0): MonthMatrix {
  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (firstOfMonth.getDay() - weekStartsOn + 7) % 7;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: MonthMatrix = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const STREAK_LOOKBACK_DAYS = 90;

function daysBackNeeded(year: number, month: number): number {
  const today = new Date();
  const firstOfMonth = new Date(year, month, 1);
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = Math.ceil((today.getTime() - firstOfMonth.getTime()) / msPerDay);
  return Math.max(diff + 31, STREAK_LOOKBACK_DAYS);
}

const WEEKDAY_LABELS_SUN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;
const WEEKDAY_LABELS_MON = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

const MONTH_LABELS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
] as const;

interface RGB {
  r: number;
  g: number;
  b: number;
}

function heatColorRGB(t: number, isDark: boolean): RGB {
  const floor = 0.25;
  const eased = floor + t * (1 - floor);
  const from: RGB = isDark ? { r: 30, g: 41, b: 59 } : { r: 226, g: 232, b: 240 };
  const to: RGB = { r: 6, g: 182, b: 212 };
  return {
    r: Math.round(from.r + (to.r - from.r) * eased),
    g: Math.round(from.g + (to.g - from.g) * eased),
    b: Math.round(from.b + (to.b - from.b) * eased),
  };
}

function rgbToCss({ r, g, b }: RGB): string {
  return `rgb(${r}, ${g}, ${b})`;
}

function relativeLuminance({ r, g, b }: RGB): number {
  const channel = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function dateTextColor(bg: RGB | null, isDark: boolean): string {
  if (!bg) return isDark ? "#94a3b8" : "#475569";
  return relativeLuminance(bg) > 0.19 ? "#0f172a" : "#f8fafc";
}

export interface HabitCalendarProps {
  weekStartsOn?: 0 | 1;
  initialDate?: Date;
}

function habitsActiveOn(habits: Habit[], dateKey: string): Habit[] {
  return habits.filter((h) => h.createdDate <= dateKey);
}

function computeStreak(habitId: string, entriesByDate: Map<string, HabitEntry[]>): number {
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const dateKey = toDateKey(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
    const hasCompletedEntry = (entriesByDate.get(dateKey) ?? []).some(
        (e) => e.habitId === habitId && e.completed
    );
    if (!hasCompletedEntry) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default function HabitCalendar({
                                        weekStartsOn = 0,
                                        initialDate = new Date(),
                                      }: HabitCalendarProps) {
  const [cursor, setCursor] = useState<Date>(
      () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);
  const [isAddingHabit, setIsAddingHabit] = useState<boolean>(false);
  const [newHabitName, setNewHabitName] = useState<string>("");
  const [addingHabit, setAddingHabit] = useState<boolean>(false);
  const newHabitInputRef = useRef<HTMLInputElement>(null);
  const isDark = useTheme().isDark;

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const habitResponses = await fetchHabits();
        if (cancelled) return;

        const loadedHabits = habitResponses.map(habitResponseToHabit);
        setHabits(loadedHabits);

        const days = daysBackNeeded(year, month);
        const logsPerHabit = await Promise.all(
            loadedHabits.map((h) => fetchHabitLogs(h.id, days))
        );
        if (cancelled) return;

        const nextEntries: HabitEntry[] = [];
        logsPerHabit.forEach((logs, i) => {
          const habitId = loadedHabits[i].id;
          logs.forEach((log) => {
            nextEntries.push({ habitId, date: log.logDate, completed: true });
          });
        });
        setEntries(nextEntries);
      } catch (err) {
        if (!cancelled) setError("Failed to load calendar data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const weekdayLabels = weekStartsOn === 1 ? WEEKDAY_LABELS_MON : WEEKDAY_LABELS_SUN;
  const weeks = useMemo(
      () => getMonthMatrix(year, month, weekStartsOn),
      [year, month, weekStartsOn]
  );

  const entriesByDate = useMemo(() => {
    const map = new Map<string, HabitEntry[]>();
    for (const e of entries) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return map;
  }, [entries]);

  const todayKey = toDateKey(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate()
  );

  function goToMonth(delta: number) {
    setCursor(new Date(year, month + delta, 1));
    setSelectedDay(null);
  }

  const selectedEntries = selectedDay ? entriesByDate.get(selectedDay) ?? [] : [];
  const selectedActiveHabits = selectedDay ? habitsActiveOn(habits, selectedDay) : [];

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const activeHabitsToday = habitsActiveOn(habits, todayKey);
  const completedToday = (entriesByDate.get(todayKey) ?? []).filter(
      (e) => e.completed && activeHabitsToday.some((h) => h.id === e.habitId)
  ).length;
  const tasksLeftToday = Math.max(activeHabitsToday.length - completedToday, 0);
  const bestStreak = habits.reduce(
      (max, h) => Math.max(max, computeStreak(h.id, entriesByDate)),
      0
  );

  function openAddHabit() {
    setIsAddingHabit(true);
    setTimeout(() => newHabitInputRef.current?.focus(), 0);
  }

  function cancelAddHabit() {
    setNewHabitName("");
    setIsAddingHabit(false);
  }

  async function submitAddHabit() {
    const trimmed = newHabitName.trim();
    if (!trimmed || addingHabit) return;
    setAddingHabit(true);
    try {
      const created = await createHabit({
        name: trimmed,
        description: "",
        frequency: "daily",
        targetCount: 30,
      });
      if (created) {
        setHabits((prev) => [...prev, habitResponseToHabit(created, prev.length)]);
      }
      setNewHabitName("");
      setIsAddingHabit(false);
    } finally {
      setAddingHabit(false);
    }
  }

  async function handleToggleHabitOnDate(habitId: string, dateKey: string) {
    if (dateKey !== todayKey) {
      return;
    }

    const key = `${habitId}:${dateKey}`;
    if (togglingKey) return;
    setTogglingKey(key);

    const wasCompleted = entries.some(
        (e) => e.habitId === habitId && e.date === dateKey && e.completed
    );

    setEntries((prev) =>
        wasCompleted
            ? prev.filter((e) => !(e.habitId === habitId && e.date === dateKey))
            : [...prev, { habitId, date: dateKey, completed: true }]
    );

    try {
      if (wasCompleted) {
        const success = await deleteHabitLog(habitId, dateKey);
        if (!success) {
          setEntries((prev) => [...prev, { habitId, date: dateKey, completed: true }]);
        }
      } else {
        const created = await createHabitLog(habitId, { count: 1, date: dateKey });
        if (!created) {
          setEntries((prev) => prev.filter((e) => !(e.habitId === habitId && e.date === dateKey)));
        }
      }
    } finally {
      setTogglingKey(null);
    }
  }

  async function handleDeleteHabit(habitId: string) {
    const prevHabits = habits;
    const prevEntries = entries;
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setEntries((prev) => prev.filter((e) => e.habitId !== habitId));
    const success = await deleteHabit(habitId);
    if (!success) {
      setHabits(prevHabits);
      setEntries(prevEntries);
      setError("Failed to delete habit");
    }
  }

  return (
      <div className="flex min-h-screen w-full items-start justify-center bg-slate-50 p-4 dark:bg-slate-950 pt-14 sm:pt-20">
        <CursorRippleLayer/>
        <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-4 text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 sm:p-6">
          <div className="mb-4">
            <p className="font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">{dateLabel}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{greeting}</h1>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <StatCard icon={Check} value={tasksLeftToday} sub="tasks left today" />
            <StatCard icon={Flame} value={bestStreak} sub="day streak" />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">
                {year}
              </p>
              <h2 className="font-mono text-lg uppercase tracking-wide text-slate-900 dark:text-slate-100">
                {MONTH_LABELS[month]}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                  type="button"
                  onClick={() => goToMonth(-1)}
                  aria-label="Previous month"
                  className="rounded-md border border-slate-200 p-2 text-slate-500 outline-none transition-colors hover:border-cyan-500/50 hover:text-cyan-600 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-800 dark:text-slate-400 dark:hover:text-cyan-400 dark:focus-visible:ring-offset-slate-950"
              >
                <ChevronLeft />
              </button>
              <button
                  type="button"
                  onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
                  className="rounded-md border border-slate-200 px-2.5 py-2 font-mono text-[11px] uppercase tracking-wider text-slate-500 outline-none transition-colors hover:border-cyan-500/50 hover:text-cyan-600 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-800 dark:text-slate-400 dark:hover:text-cyan-400 dark:focus-visible:ring-offset-slate-950"
              >
                Today
              </button>
              <button
                  type="button"
                  onClick={() => goToMonth(1)}
                  aria-label="Next month"
                  className="rounded-md border border-slate-200 p-2 text-slate-500 outline-none transition-colors hover:border-cyan-500/50 hover:text-cyan-600 focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-slate-800 dark:text-slate-400 dark:hover:text-cyan-400 dark:focus-visible:ring-offset-slate-950"
              >
                <ChevronRight />
              </button>
            </div>
          </div>

          {error && <p className="mb-3 text-center font-mono text-xs text-red-500 dark:text-red-400">{error}</p>}

          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5">
            {habits.map((h) => (
                <div key={h.id} className="flex items-center gap-1.5">
              <span
                  className="h-2 w-2 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10"
                  style={{ backgroundColor: h.color }}
              />
                  <span className="font-mono text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {h.name}
              </span>
                  <button
                      type="button"
                      onClick={() => handleDeleteHabit(h.id)}
                      aria-label={`Delete ${h.name}`}
                      className="shrink-0 rounded p-0.5 text-slate-400 outline-none transition-colors hover:text-red-500 focus-visible:ring-2 focus-visible:ring-cyan-500 dark:text-slate-600 dark:hover:text-red-400"
                  >
                    <X size={10} />
                  </button>
                </div>
            ))}
          </div>

          <div className="mb-1 grid grid-cols-7">
            {weekdayLabels.map((d) => (
                <div
                    key={d}
                    className="py-1 text-center font-mono text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-600"
                >
                  {d}
                </div>
            ))}
          </div>

          {loading ? (
              <p className="py-6 text-center font-mono text-xs uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Loading calendar…
              </p>
          ) : (
              <div className="grid grid-cols-7 gap-1">
                {weeks.flatMap((week, wi) =>
                    week.map((day, di) => {
                      if (day === null) {
                        return <div key={`${wi}-${di}`} className="aspect-square" />;
                      }
                      const dateKey = toDateKey(year, month, day);
                      const dayEntries = entriesByDate.get(dateKey) ?? [];
                      const activeHabits = habitsActiveOn(habits, dateKey);
                      const completed = dayEntries.filter(
                          (e) => e.completed && activeHabits.some((h) => h.id === e.habitId)
                      );
                      const isToday = dateKey === todayKey;
                      const isSelected = dateKey === selectedDay;
                      const ratio = activeHabits.length > 0 ? completed.length / activeHabits.length : 0;
                      const bg = ratio > 0 ? heatColorRGB(ratio, isDark) : null;

                      return (
                          <button
                              key={dateKey}
                              type="button"
                              onClick={() => setSelectedDay(dateKey)}
                              aria-label={`${dateKey}, ${completed.length} of ${activeHabits.length} habits completed`}
                              style={{ backgroundColor: bg ? rgbToCss(bg) : undefined }}
                              className={[
                                "group relative flex aspect-square flex-col items-center justify-center rounded-md border p-1 outline-none transition-colors",
                                isSelected
                                    ? "border-cyan-500"
                                    : ratio > 0
                                        ? "border-slate-200 hover:border-cyan-500/40 dark:border-slate-800/80"
                                        : "border-slate-200 hover:border-cyan-500/40 hover:bg-slate-100 dark:border-slate-800/80 dark:hover:bg-slate-900",
                                "focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950",
                              ].join(" ")}
                          >
                    <span
                        style={
                          isToday
                              ? isDark
                                  ? {
                                    color: "#ffffff",
                                    textShadow:
                                        "0 0 2px rgba(255,255,255,0.95), 0 0 6px rgba(255,255,255,0.85), 0 0 12px rgba(255,255,255,0.5)",
                                  }
                                  : {
                                    color: "#0e7490",
                                    textShadow:
                                        "0 0 2px rgba(8,145,178,0.7), 0 0 6px rgba(8,145,178,0.45)",
                                  }
                              : { color: dateTextColor(bg, isDark) }
                        }
                        className="font-mono text-[11px] font-semibold [text-shadow:0_1px_2px_rgb(0_0_0_/_0.35)]"
                    >
                      {day}
                    </span>
                          </button>
                      );
                    })
                )}
              </div>
          )}

          {selectedDay && (
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-100 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                <div className="mb-2 flex items-center justify-between">
                  <p className="font-mono text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {selectedDay}
                  </p>
                  <button
                      type="button"
                      onClick={() => setSelectedDay(null)}
                      aria-label="Close detail"
                      className="rounded p-1 text-slate-400 outline-none transition-colors hover:text-cyan-600 focus-visible:ring-2 focus-visible:ring-cyan-500 dark:text-slate-500 dark:hover:text-cyan-400"
                  >
                    <XIcon />
                  </button>
                </div>

                {selectedActiveHabits.length === 0 ? (
                    <p className="font-mono text-xs text-slate-400 dark:text-slate-500">No habits yet.</p>
                ) : (
                    <ul className="space-y-1.5">
                      { selectedActiveHabits.map((h) => {
                        const entry = selectedEntries.find((e) => e.habitId === h.id);
                        const done = entry?.completed ?? false;
                        const key = `${h.id}:${selectedDay}`;
                        const isToggling = togglingKey === key;
                        return (
                            <li key={h.id}>
                              <button
                                  type="button"
                                  onClick={() => handleToggleHabitOnDate(h.id, selectedDay)}
                                  disabled={isToggling}
                                  className="flex w-full items-center gap-2 rounded-md p-1 outline-none transition-colors hover:bg-slate-200/60 focus-visible:ring-2 focus-visible:ring-cyan-500 disabled:opacity-50 dark:hover:bg-slate-800/60"
                              >
                        <span
                            className="h-2 w-2 shrink-0 rounded-full ring-1 ring-inset ring-black/10 dark:ring-white/10"
                            style={{ backgroundColor: h.color, opacity: done ? 1 : 0.25 }}
                        />
                                <span
                                    className={[
                                      "font-mono text-xs uppercase tracking-wide",
                                      done ? "text-slate-800 dark:text-slate-200" : "text-slate-400 dark:text-slate-600",
                                    ].join(" ")}
                                >
                          {h.name}
                        </span>
                                {done && (
                                    <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                            Done
                          </span>
                                )}
                              </button>
                            </li>
                        );
                      })}
                    </ul>
                )}
              </div>
          )}
        </div>
      </div>
  );
}

function ChevronLeft() {
  return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
  );
}

function ChevronRight() {
  return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
  );
}

function XIcon() {
  return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
  );
}

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  sub: string;
}

function StatCard({ icon: IconCmp, value, sub }: StatCardProps) {
  return (
      <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-100/60 p-3 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
          <IconCmp size={16} strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <p className="text-xl font-bold tabular-nums leading-tight text-slate-900 dark:text-slate-100">{value}</p>
          <p className="truncate font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-500">{sub}</p>
        </div>
      </div>
  );
}