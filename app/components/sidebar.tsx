import React, { useEffect, useRef, useState } from "react";
import { useSideBar } from "~/context/sidebar-context";
import { useNavigate } from "react-router";
import { authService } from "~/api/authService";
import axiosClient from "~/api/axiosClient";
import { useHabitsRefresh } from "~/context/habits-refresh-context";

interface SignalContact {
    name: string;
    number: string;
}

interface VerifiedResponse {
    registered: boolean;
    number: string;
}

export default function Sidebar() {
    const { sideMenu, setSideMenu, toggleSideMenu } = useSideBar();
    const navigate = useNavigate();
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const { triggerRefresh } = useHabitsRefresh();

    const [habitName, setHabitName] = useState("");
    const [notify, setNotify] = useState(false);
    const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
    const [contacts, setContacts] = useState<SignalContact[]>([]);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [verified, setVerified] = useState(false);
    const [message, setMessage] = useState("");

    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Initial check: is the account verified, and load contacts or QR code accordingly.
    useEffect(() => {
        if (!notify || contacts.length > 0) return;

        setLoadingContacts(true);
        const url = import.meta.env.VITE_API_DOMAIN + "/contacts";

        axiosClient
            .get<VerifiedResponse>("/verify/status")
            .then((res) => {
                setVerified(res.data.registered);

                if (res.data.registered) {
                    return axiosClient
                        .get<SignalContact[]>(url)
                        .then((r) => setContacts(r.data));
                } else {
                    return axiosClient
                        .get("/verify/qrcode", { responseType: "blob" })
                        .then((r) => {
                            const objectUrl = URL.createObjectURL(r.data);
                            setQrUrl(objectUrl);
                        });
                }
            })
            .catch((err) => console.error("Failed to check Signal status", err))
            .finally(() => setLoadingContacts(false));
    }, [notify, contacts.length]);

    useEffect(() => {
        if (!notify || verified) {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
            return;
        }

        if (pollingRef.current) return; // already polling

        pollingRef.current = setInterval(() => {
            axiosClient
                .get<VerifiedResponse>("/verify/status")
                .then((res) => {
                    if (res.data.registered) {
                        setVerified(true);
                        const url = import.meta.env.VITE_API_DOMAIN + "/contacts";
                        return axiosClient
                            .get<SignalContact[]>(url)
                            .then((r) => setContacts(r.data));
                    }
                })
                .catch((err) => console.error("Failed to poll Signal status", err));
        }, 5000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
                pollingRef.current = null;
            }
        };
    }, [notify, verified]);

    useEffect(() => {
        return () => {
            if (qrUrl) URL.revokeObjectURL(qrUrl);
        };
    }, [qrUrl]);

    async function endTokenSession() {
        toggleSideMenu();
        await authService.logout();
        navigate("/login");
    }

    function toggleContact(number: string) {
        setSelectedContacts((prev) =>
            prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number]
        );
    }

    async function handleAddHabit(e: React.FormEvent) {
        e.preventDefault();
        if (!habitName.trim()) return;

        setSubmitting(true);
        try {
            await axiosClient.post("/habits", {
                name: habitName,
                notify2: notify,
                signalContactNumbers: notify ? selectedContacts : [],
                message,
            });
            setHabitName("");
            setNotify(false);
            setSelectedContacts([]);
            triggerRefresh();
        } catch (err) {
            console.error("Failed to add habit", err);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div>
            <button
                onClick={() => toggleSideMenu()}
                className="absolute top-3 left-3 z-20 flex items-center justify-center w-10 h-10 rounded-md hover:bg-cyan-500/10 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
                aria-label="Toggle menu"
            >
                <div className="relative w-6 h-6">
                    <span
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-800 dark:bg-slate-200 rounded transition-transform duration-300 ${
                            sideMenu ? "rotate-135 bg-cyan-400 dark:bg-cyan-400" : "rotate-0"
                        }`}
                    />
                    <span
                        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-800 dark:bg-slate-200 rounded transition-transform duration-300 ${
                            sideMenu ? "rotate-45 bg-cyan-400 dark:bg-cyan-400" : "rotate-90"
                        }`}
                    />
                </div>
            </button>
            <div
                className={`absolute top-0 left-0 w-[280px] h-[100vh] bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-r border-cyan-500/10 z-10 shadow-2xl transition-[transform,background-color] duration-300 ease-in-out overflow-y-auto ${
                    sideMenu ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="pt-20 px-4">
                    <div className="text-[10px] uppercase tracking-[0.15em] text-cyan-600 dark:text-cyan-400/70 font-mono px-4 mb-2">
                        Add Habit
                    </div>
                    <div className="h-px bg-slate-300 dark:bg-slate-800 mb-3 transition-colors duration-300" />

                    <form onSubmit={handleAddHabit} className="px-4 pb-6 flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                            <label
                                htmlFor="habit-name"
                                className="text-xs font-mono uppercase tracking-wide text-slate-500 dark:text-slate-400"
                            >
                                Habit name
                            </label>
                            <input
                                id="habit-name"
                                type="text"
                                value={habitName}
                                onChange={(e) => setHabitName(e.target.value)}
                                placeholder="e.g. Read 20 minutes"
                                className="w-full px-3 py-2 rounded-md text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
                                required
                            />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={notify}
                                onChange={(e) => setNotify(e.target.checked)}
                                className="w-4 h-4 rounded accent-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
                            />
                            Notify via Signal
                        </label>

                        {notify && (
                            <div className="flex flex-col gap-1">
                                {verified ? (
                                    <>
                                        <span className="text-xs font-mono uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                            Contacts
                                        </span>
                                        <div className="w-full max-h-40 overflow-y-auto rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
                                            {loadingContacts && (
                                                <div className="px-3 py-2 text-sm text-slate-400 dark:text-slate-600">
                                                    Loading contacts...
                                                </div>
                                            )}
                                            {!loadingContacts && contacts.length === 0 && (
                                                <div className="px-3 py-2 text-sm text-slate-400 dark:text-slate-600">
                                                    No contacts found
                                                </div>
                                            )}
                                            {contacts.map((c) => (
                                                <label
                                                    key={c.number}
                                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 cursor-pointer select-none hover:bg-cyan-500/10"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedContacts.includes(c.number)}
                                                        onChange={() => toggleContact(c.number)}
                                                        className="w-4 h-4 rounded accent-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
                                                    />
                                                    {c.name || c.number}
                                                </label>
                                            ))}
                                        </div>
                                        {selectedContacts.length > 0 && (
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {selectedContacts.length} selected
                                            </span>
                                        )}
                                        <div className="flex flex-col gap-1 mt-1">
                                            <div className="flex items-center justify-between">
                                                <label
                                                    htmlFor="notify-message"
                                                    className="text-xs font-mono uppercase tracking-wide text-slate-500 dark:text-slate-400"
                                                >
                                                    Message
                                                </label>
                                                <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
                                                {message.length}/255
                                            </span>
                                            </div>
                                            <textarea
                                                id="notify-message"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value.slice(0, 255))}
                                                maxLength={255}
                                                rows={3}
                                                placeholder="Optional message to send with the notification"
                                                className="w-full px-3 py-2 rounded-md text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 resize-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 py-2">
                                        <span className="text-xs font-mono uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                            Scan to link Signal
                                        </span>
                                        {loadingContacts && (
                                            <div className="text-sm text-slate-400 dark:text-slate-600">
                                                Loading QR code...
                                            </div>
                                        )}
                                        {!loadingContacts && qrUrl && (
                                            <img
                                                src={qrUrl}
                                                alt="Signal QR code"
                                                className="w-40 h-40 rounded-md border border-slate-300 dark:border-slate-700"
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting || !habitName.trim()}
                            className="mt-1 w-full px-3 py-2 rounded-md text-sm font-medium bg-cyan-500/90 hover:bg-cyan-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
                        >
                            {submitting ? "Adding..." : "Add habit"}
                        </button>
                    </form>
                </div>
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