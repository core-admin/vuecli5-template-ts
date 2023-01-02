import { defineStore } from 'pinia';
import { pinia } from '@/internal/pinia';

interface AppState {
  title: string;
}

export const useAppStore = defineStore({
  id: 'app-store',
  state: (): AppState => ({
    title: 'app',
  }),
  actions: {},
});

export function useAppStoreWithOut() {
  return useAppStore(pinia);
}
