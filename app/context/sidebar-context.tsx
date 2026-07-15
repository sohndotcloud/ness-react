import { createContext, useContext, useState, type Dispatch, type SetStateAction, type ReactNode } from "react";

interface SideBarContextType {
    sideMenu: boolean;
    setSideMenu: Dispatch<SetStateAction<boolean>>;
    toggleSideMenu: () => void;
}

const SideBarContext = createContext<SideBarContextType | null>(null);

export function SideBarProvider({ children }: { children: ReactNode }) {
    const [sideMenu, setSideMenu] = useState(false);
    const toggleSideMenu = () => setSideMenu(!sideMenu);
    return (
        <SideBarContext.Provider value={{ sideMenu, setSideMenu, toggleSideMenu }}>
            {children}
        </SideBarContext.Provider>
    );
}

export function useSideBar() {
    const ctx = useContext(SideBarContext);
    if (!ctx) throw new Error('useSideBar must be used within a SideBarProvider');
    return ctx;
}