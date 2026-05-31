// src/lib/state/explore-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ExploreState {
  savedTankIds: string[];
  toggleSaved: (tankId: string) => void;
  isSaved: (tankId: string) => boolean;
}

export const useExploreStore = create<ExploreState>()(
  persist(
    (set, get) => ({
      savedTankIds: [],
      toggleSaved: (tankId) => {
        set(state => ({
          savedTankIds: state.savedTankIds.includes(tankId)
            ? state.savedTankIds.filter(id => id !== tankId)
            : [...state.savedTankIds, tankId],
        }));
      },
      isSaved: (tankId) => get().savedTankIds.includes(tankId),
    }),
    {
      name: 'explore-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
