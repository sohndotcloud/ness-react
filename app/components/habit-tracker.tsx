import React, { useState, type ReactNode } from "react";

// ─────────────────────────────────────────────────────────────
// WIREFRAME — Habit Tracker
// Low-fidelity layout study: grayscale, placeholder copy, boxes
// labeled by function rather than polished visual design.
// No external libraries — plain React + Tailwind + inline SVG.
// ─────────────────────────────────────────────────────────────

const DAYS: string[] = ["M", "T", "W", "T", "F", "S", "S"];

interface Habit {
  name: string;
  streak: number;
  done: (0 | 1)[];
}

const HABITS: Habit[] = [
  { name: "Habit name", streak: 12, done: [1, 1, 1, 0, 1, 1, 0] },
  { name: "Habit name", streak: 4, done: [1, 0, 1, 1, 0, 0, 0] },
  { name: "Habit name", streak: 27, done: [1, 1, 1, 1, 1, 1, 1] },
  { name: "Habit name", streak: 0, done: [0, 0, 0, 0, 0, 0, 0] },
];

// ── tiny inline icon set (no icon library) ─────────────────
interface IconProps {
  path: string;
  size?: number;
}

function Icon({ path, size = 16 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

const paths: Record<
  "check" | "plus" | "flame" | "menu" | "home" | "calendar" | "chart" | "settings",
  string
> = {
  check: "M20 6 9 17l-5-5",
  plus: "M12 5v14M5 12h14",
  flame:
    "M12 2c1 3-2 4-2 7a4 4 0 0 0 8 0c0-1-.5-2-1-3 2 1 3 3 3 6a6 6 0 1 1-12 0c0-4 2-6 4-10Z",
  menu: "M3 6h18M3 12h18M3 18h18",
  home: "M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z",
  calendar:
    "M3 8h18M7 3v4M17 3v4M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z",
  chart: "M4 20V10M12 20V4M20 20v-7",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.1-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2.1 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.3.9 2.1 1.2L10 21h4l.5-2.6c.8-.3 1.5-.7 2.1-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z",
};

interface BoxProps {
  className?: string;
  children?: ReactNode;
}

function Box({ className = "", children }: BoxProps) {
  return (
    <div className={`border border-dashed border-gray-400 bg-gray-50 ${className}`}>
      {children}
    </div>
  );
}

interface LabelProps {
  children: ReactNode;
}

function Label({ children }: LabelProps) {
  return (
    <span className="text-[10px] uppercase tracking-wide text-gray-400 font-mono">
      {children}
    </span>
  );
}

interface NavItemProps {
  iconPath: string;
  text: string;
  active?: boolean;
}

function NavItem({ iconPath, text, active = false }: NavItemProps) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded border border-dashed ${
        active
          ? "border-gray-500 bg-gray-200 text-gray-900"
          : "border-gray-300 text-gray-500"
      }`}
    >
      <Icon path={iconPath} size={16} />
      <span className="text-sm">{text}</span>
    </div>
  );
}

interface HabitRowProps {
  habit: Habit;
}

function HabitRow({ habit }: HabitRowProps) {
  return (
    <Box className="p-3 flex items-center gap-4">
      {/* drag / grip placeholder */}
      <div className="hidden sm:flex flex-col gap-0.5 shrink-0">
        {[0, 1, 2].map((i) => (
          <span key={i} className="w-3 h-px bg-gray-300" />
        ))}
      </div>

      <div className="flex-1 min-w-0">
        <div className="h-4 w-32 bg-gray-300 rounded-sm mb-1" />
        <div className="flex items-center gap-1 text-gray-400">
          <Icon path={paths.flame} size={12} />
          <span className="text-xs">{habit.streak}d streak</span>
        </div>
      </div>

      {/* 7-day check grid */}
      <div className="flex gap-1.5 shrink-0">
        {DAYS.map((d, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="text-[9px] text-gray-400 font-mono">{d}</span>
            <div
              className={`w-6 h-6 rounded-sm border flex items-center justify-center ${
                habit.done[i]
                  ? "border-gray-500 bg-gray-300"
                  : "border-dashed border-gray-300"
              }`}
            >
              {habit.done[i] ? (
                <span className="text-gray-600">
                  <Icon path={paths.check} size={12} />
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </Box>
  );
}

export default function HabitTracker() {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen w-full bg-white text-gray-700 font-sans flex">
      {/* ── Sidebar (desktop) ───────────────────────────────── */}
      <aside className="hidden md:flex md:flex-col w-56 shrink-0 border-r border-dashed border-gray-300 p-4 gap-6">
        <div className="flex items-center gap-2">
          <Box className="w-7 h-7 flex items-center justify-center shrink-0">
            <span className="text-xs font-mono">Lo</span>
          </Box>
          <span className="text-sm font-semibold">App name</span>
        </div>

        <nav className="flex flex-col gap-1.5">
          <NavItem iconPath={paths.home} text="Today" active />
          <NavItem iconPath={paths.calendar} text="Calendar" />
          <NavItem iconPath={paths.chart} text="Stats" />
          <NavItem iconPath={paths.settings} text="Settings" />
        </nav>

        <Box className="mt-auto p-3">
          <Label>User card</Label>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-8 h-8 rounded-full bg-gray-300 shrink-0" />
            <div className="flex-1">
              <div className="h-2.5 w-20 bg-gray-300 rounded-sm mb-1" />
              <div className="h-2 w-14 bg-gray-200 rounded-sm" />
            </div>
          </div>
        </Box>
      </aside>

      {/* ── Mobile top bar ──────────────────────────────────── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-10 bg-white border-b border-dashed border-gray-300 flex items-center justify-between px-4 h-12">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-500">
          <Icon path={paths.menu} size={20} />
        </button>
        <span className="text-sm font-semibold">App name</span>
        <div className="w-6 h-6 rounded-full bg-gray-300" />
      </div>
      {menuOpen && (
        <div className="md:hidden fixed top-12 inset-x-0 z-10 bg-white border-b border-dashed border-gray-300 p-4 flex flex-col gap-1.5">
          <NavItem iconPath={paths.home} text="Today" active />
          <NavItem iconPath={paths.calendar} text="Calendar" />
          <NavItem iconPath={paths.chart} text="Stats" />
          <NavItem iconPath={paths.settings} text="Settings" />
        </div>
      )}

      {/* ── Main content ────────────────────────────────────── */}
      <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 flex flex-col gap-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <Label>Page header</Label>
            <div className="h-6 w-40 bg-gray-300 rounded-sm mt-2 mb-1.5" />
            <div className="h-3 w-56 bg-gray-200 rounded-sm" />
          </div>
          <button className="flex items-center gap-1.5 text-sm border border-dashed border-gray-400 rounded px-3 py-2 text-gray-600 shrink-0">
            <Icon path={paths.plus} size={14} />
            Add habit
          </button>
        </div>

        {/* Summary stat cards */}
        <div className="grid grid-cols-3 gap-3">
          {(["Today", "Streak", "Rate"] as const).map((s) => (
            <Box key={s} className="p-3 flex flex-col gap-2">
              <Label>{s}</Label>
              <div className="h-6 w-10 bg-gray-300 rounded-sm" />
            </Box>
          ))}
        </div>

        {/* Habit list */}
        <div className="flex flex-col gap-3">
          <Label>Habit list — repeating row</Label>
          {HABITS.map((h, i) => (
            <HabitRow key={i} habit={h} />
          ))}

          {/* empty add-row affordance */}
          <Box className="p-3 flex items-center justify-center gap-2 text-gray-400">
            <Icon path={paths.plus} size={14} />
            <span className="text-sm">Add another habit</span>
          </Box>
        </div>

        {/* Secondary panel placeholder */}
        <Box className="p-4 flex flex-col gap-2">
          <Label>Weekly overview chart</Label>
          <div className="h-28 w-full flex items-end gap-2 mt-2">
            {[40, 70, 55, 90, 30, 65, 80].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-gray-300 rounded-t-sm"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </Box>
      </main>
    </div>
  );
}
