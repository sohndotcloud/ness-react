import React from "react";
import {useSideBar} from "~/context/sidebar-context";


export default function Sidebar() {
    const { sideMenu, setSideMenu, toggleSideMenu } = useSideBar();
    return (
        <div>
            <button
                onClick={() => toggleSideMenu()}
                className="absolute top-3 left-3 z-20 flex items-center justify-center w-10 h-10 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle menu"
            >
                <div className="w-6 h-5 flex flex-col justify-between">
          <span
              className={`block h-0.5 w-full dark:bg-gray-800 bg-gray-800 dark:bg-white rounded transition-transform duration-300 ${
                  sideMenu ? "rotate-45 translate-y-[9px]" : ""
              }`}
          />
                    <span
                        className={`block h-0.5 w-full bg-gray-800 dark:bg-white rounded transition-opacity duration-300 ${
                            sideMenu ? "opacity-0" : "opacity-100"
                        }`}
                    />
                    <span
                        className={`block h-0.5 w-full bg-gray-800 dark:bg-white rounded transition-transform duration-300 ${
                            sideMenu ? "-rotate-45 -translate-y-[9px]" : ""
                        }`}
                    />
                </div>
            </button>

            { sideMenu && (
                <div className="absolute top-0 left-0 w-[350px] border-r border-[#000000] h-[calc(100vh-75px)] bg-white dark:bg-slate-900 z-5 border border-gray-200 dark:border-gray-800 shadow-xl ring-1 ring-black/5">
                    <div className="text-center w-[320px] p-4">
                        <ul className="list-none marker:text-blue-500 pl-10 pt-10 text-left list-disc list-inside">
                            <li className="px-4 py-4 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors"><a href="/library">Library</a></li>
                            <li className="px-4 py-4 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors">Music</li>
                            <li className="px-4 py-4 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md cursor-pointer transition-colors">Drive</li>
                        </ul>
                    </div>
                </div>
            )}

            <div
                onClick={() => setSideMenu(false)}
                className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-1 transition-opacity duration-300 ease-in-out ${
                    sideMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
                }`}
            />

        </div>
    )
}