import { create } from "zustand";

const MAX_COMPARE_BATCHES = 3;

interface DashboardState {
  selectedCategory: string | null;
  setSelectedCategory: (category: string | null) => void;
  compareBatchIds: string[];
  toggleCompareBatch: (batchId: string) => void;
  removeCompareBatch: (batchId: string) => void;
  clearCompareBatches: () => void;
  isComparing: boolean;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  selectedCategory: null,
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  compareBatchIds: [],
  isComparing: false,

  toggleCompareBatch: (batchId) => {
    const { compareBatchIds } = get();
    const exists = compareBatchIds.includes(batchId);

    if (exists) {
      const newIds = compareBatchIds.filter((id) => id !== batchId);
      set({ compareBatchIds: newIds, isComparing: newIds.length > 0 });
    } else {
      if (compareBatchIds.length >= MAX_COMPARE_BATCHES) return;
      const newIds = [...compareBatchIds, batchId];
      set({ compareBatchIds: newIds, isComparing: true });
    }
  },

  removeCompareBatch: (batchId) => {
    const { compareBatchIds } = get();
    const newIds = compareBatchIds.filter((id) => id !== batchId);
    set({ compareBatchIds: newIds, isComparing: newIds.length > 0 });
  },

  clearCompareBatches: () => {
    set({ compareBatchIds: [], isComparing: false });
  },
}));
