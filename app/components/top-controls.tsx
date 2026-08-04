// app/components/top-controls.tsx
import { useNavigate } from "react-router";
import { useAuth } from "~/context/auth-context";
import DarkModeToggle from "~/components/darkmode";

export default function TopControls() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate("/login", { replace: true });
        }
    };

    return (
        <div className="absolute top-3 right-5 z-20 flex items-center gap-3">
            <button
                type="button"
                onClick={handleLogout}
                className="font-mono text-xs uppercase tracking-wide text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"
            >
                Log out
            </button>
            <DarkModeToggle />
        </div>
    );
}