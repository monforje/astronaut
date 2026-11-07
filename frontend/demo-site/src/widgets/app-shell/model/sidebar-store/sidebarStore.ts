import { create } from "zustand";
import { readStorage, writeStorage } from "@/shared/lib";

export const RAIL_KEY = "astronaut:sidebar-rail";

interface SidebarState {
  /** Сайдбар свёрнут в rail 56 px. */
  rail: boolean;
  setRail: (rail: boolean) => void;
}

/** Свёрнутость сайдбара запоминается между визитами; делят оболочка и сайдбар, поэтому это стор, а не `useState`. */
export const useSidebarStore = create<SidebarState>((set) => ({
  rail: readStorage(RAIL_KEY) === "1",
  setRail: (rail) => {
    writeStorage(RAIL_KEY, rail ? "1" : "0");
    set({ rail });
  },
}));
