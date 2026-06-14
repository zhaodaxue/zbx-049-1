import { create } from "zustand";

interface DashboardState {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
