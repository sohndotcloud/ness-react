import React, { createContext, useContext, useState, useCallback } from "react";

interface HabitsRefreshContextValue {
  refreshToken: number;
  triggerRefresh: () => void;
}

const HabitsRefreshContext = createContext<HabitsRefreshContextValue | undefined>(undefined);

export function HabitsRefreshProvider({ children }: { children: React.ReactNode }) {
  const [refreshToken, setRefreshToken] = useState(0);
  const triggerRefresh = useCallback(() => setRefreshToken((t) => t + 1), []);

  return (
    <HabitsRefreshContext.Provider value={{ refreshToken, triggerRefresh }}>
      {children}
    </HabitsRefreshContext.Provider>
  );
}

export function useHabitsRefresh() {
  const ctx = useContext(HabitsRefreshContext);
  if (!ctx) throw new Error("useHabitsRefresh must be used within HabitsRefreshProvider");
  return ctx;
}
