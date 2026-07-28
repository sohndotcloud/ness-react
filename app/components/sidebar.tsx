import React from "react";
import { useSideBar } from "~/context/sidebar-context";
import { useNavigate } from "react-router";
import { authService } from "~/api/authService";

const NAV_ITEMS = [
    { label: "Library", href: "/library" },
    { label: "Music", href: "/music" },
    { label: "Drive", href: "/drive" },
];

export default function Sidebar() {
    const { sideMenu, setSideMenu, toggleSideMenu } = useSideBar();
    const navigate = useNavigate();

    async function endTokenSession() {
        toggleSideMenu();
        await authService.logout();
        navigate("/login");
    }

    return (
        <div>
            <button
                onClick={() => toggleSideMenu()}
                className="absolute top-3 left-3 z-20 flex items-center justify-center w-10 h-10 rounded-md hover:bg-cyan-500/10 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
                aria-label="Toggle menu"
            >
                <div className="w-6 h-5 flex flex-col justify-between">
                    <span
                        className={`block h-0.5 w-full bg-slate-800 dark:bg-slate-200 rounded transition-all duration-300 ${
                            sideMenu ? "rotate-45 translate-y-[9px] bg-cyan-400 dark:bg-cyan-400" : ""
                        }`}
                    />
                    <span
                        className={`block h-0.5 w-full bg-slate-800 dark:bg-slate-200 rounded transition-all duration-300 ${
                            sideMenu ? "opacity-0" : "opacity-100"
                        }`}
                    />
                    <span
                        className={`block h-0.5 w-full bg-slate-800 dark:bg-slate-200 rounded transition-all duration-300 ${
                            sideMenu ? "-rotate-45 -translate-y-[9px] bg-cyan-400 dark:bg-cyan-400" : ""
                        }`}
                    />
                </div>
            </button>
            <div
                className={`absolute top-0 left-0 w-[280px] h-[calc(100vh-72px)] bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-r border-cyan-500/10 z-10 shadow-2xl transition-[transform,background-color] duration-300 ease-in-out ${
                    sideMenu ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="pt-20 px-4">
                    <div className="text-[10px] uppercase tracking-[0.15em] text-cyan-600 dark:text-cyan-400/70 font-mono px-4 mb-2">
                        Navigate
                    </div>
                    <div className="h-px bg-slate-300 dark:bg-slate-800 mb-2 transition-colors duration-300" />
                    <ul className="list-none">
                        {NAV_ITEMS.map((item) => (
                            <li key={item.label}>
                                <a
                                href={item.href}
                                className="flex items-center px-4 py-3 rounded-md text-sm text-slate-700 dark:text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors duration-150"
                                >
                                {item.label}
                            </a>
                            </li>
                            ))}
                    </ul>
                </div>
                <footer className="fixed bottom-0 right-0 p-2 text-sm text-gray-400">
                    <a onClick={endTokenSession}>Logout</a>
                </footer>
            </div>
            <div
                onClick={() => setSideMenu(false)}
                className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[5] transition-opacity duration-300 ease-in-out ${
                    sideMenu ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            />
        </div>
    );
}