import { defineStore } from 'pinia';
import { pinia } from '@/internal/pinia';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface AppState {}

// const ll = localStorage;

export const useAppStore = defineStore({
  id: 'app-store',
  state: (): AppState => ({}),
  getters: {},
  actions: {},
});

export function useAppStoreWithOut() {
  return useAppStore(pinia);
}
