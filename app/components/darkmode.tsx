import {useTheme} from "~/context/theme-context";

const SUN_PATH =
    "M12 4.5a1 1 0 011-1 7.5 7.5 0 100 15 1 1 0 010 2A9.5 9.5 0 1113 3.5a1 1 0 01-1 1z";
const MOON_PATH =
    "M12 4a1 1 0 011 1v1a1 1 0 01-2 0V5a1 1 0 011-1zm0 12a4 4 0 100-8 4 4 0 000 8zm7-5a1 1 0 010 2h-1a1 1 0 010-2h1zM6 11a1 1 0 010 2H5a1 1 0 010-2h1zm10.24-5.24a1 1 0 011.42 1.42l-.71.7a1 1 0 11-1.42-1.41l.71-.71zM6.05 15.36a1 1 0 011.42 1.41l-.71.71a1 1 0 01-1.42-1.42l.71-.7zm11.31 1.41a1 1 0 01-1.42 1.42l-.7-.71a1 1 0 111.41-1.42l.71.71zM7.46 6.05A1 1 0 116.05 7.46l-.71-.7A1 1 0 116.76 5.34l.7.71zM12 18a1 1 0 011 1v1a1 1 0 01-2 0v-1a1 1 0 011-1z";

export default function DarkModeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            aria-pressed={isDark}
            className="absolute top-4 right-5 z-20 flex h-[30px] w-[56px] items-center rounded-full border border-slate-300 bg-white/90 backdrop-blur transition-colors dark:border-slate-700 dark:bg-slate-800/90"
        >
      <span
          className={`flex h-[22px] w-[22px] items-center justify-center rounded-full bg-slate-600 transition-transform duration-300 dark:bg-slate-400 ${
              isDark ? "translate-x-[31px]" : "translate-x-[3px]"
          }`}
      >
        <svg viewBox="0 0 24 24" className="h-[13px] w-[13px] fill-white dark:fill-slate-900">
          <path d={isDark ? SUN_PATH : MOON_PATH} />
        </svg>
      </span>
        </button>
    );
}