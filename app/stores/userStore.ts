import { create } from 'zustand';

interface AppStore {
    // Simple state
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
    isLoading: false,
    setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
