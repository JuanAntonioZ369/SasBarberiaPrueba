"use client";
import { createContext, useContext, useEffect, useState } from "react";

type ViewMode = { mode: "admin" } | { mode: "store"; storeId: string; storeName: string };

const ViewModeContext = createContext<{
  viewMode: ViewMode;
  enterStore: (storeId: string, storeName: string) => void;
  exitStore: () => void;
}>({
  viewMode: { mode: "admin" },
  enterStore: () => {},
  exitStore: () => {},
});

export function ViewModeProvider({ children }: { children: React.ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>({ mode: "admin" });

  useEffect(() => {
    const stored = localStorage.getItem("sas_view_mode");
    if (stored) {
      try { setViewMode(JSON.parse(stored)); } catch {}
    }
  }, []);

  function enterStore(storeId: string, storeName: string) {
    const v = { mode: "store" as const, storeId, storeName };
    localStorage.setItem("sas_view_mode", JSON.stringify(v));
    setViewMode(v);
  }

  function exitStore() {
    localStorage.removeItem("sas_view_mode");
    setViewMode({ mode: "admin" });
  }

  return (
    <ViewModeContext.Provider value={{ viewMode, enterStore, exitStore }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export const useViewMode = () => useContext(ViewModeContext);
