import { createContext, useContext, useState, type Dispatch, type SetStateAction, type ReactNode } from "react";

interface BarContextType {
    isPlaying: boolean;
    setIsPlaying: Dispatch<SetStateAction<boolean>>;
}

const BarContext = createContext<BarContextType | null>(null);

export function BarProvider({ children }: { children: ReactNode }) {
    const [ isPlaying, setIsPlaying ] = useState(false);

    return (
        <BarContext.Provider value={{ isPlaying, setIsPlaying,  }}>
            {children}
        </BarContext.Provider>
    );
}

export function useBar() {
    const ctx = useContext(BarContext);
    if (!ctx) throw new Error('useBar must be used within a BarProvider');
    return ctx;
}