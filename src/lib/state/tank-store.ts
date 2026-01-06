import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TankSetup, WaterType } from '../types/fish';

interface TankState {
  tanks: TankSetup[];
  activeTankId: string | null;
  addTank: (name: string, size: number, waterType: WaterType) => string;
  removeTank: (id: string) => void;
  updateTank: (id: string, updates: Partial<TankSetup>) => void;
  addFishToTank: (tankId: string, fishId: string) => void;
  removeFishFromTank: (tankId: string, fishId: string) => void;
  setActiveTank: (id: string | null) => void;
  getActiveTank: () => TankSetup | undefined;
}

export const useTankStore = create<TankState>()(
  persist(
    (set, get) => ({
      tanks: [],
      activeTankId: null,

      addTank: (name, size, waterType) => {
        const id = `tank-${Date.now()}`;
        const newTank: TankSetup = {
          id,
          name,
          size,
          waterType,
          fishIds: [],
          createdAt: new Date(),
        };
        set(state => ({
          tanks: [...state.tanks, newTank],
          activeTankId: id,
        }));
        return id;
      },

      removeTank: (id) => {
        set(state => ({
          tanks: state.tanks.filter(t => t.id !== id),
          activeTankId: state.activeTankId === id ? null : state.activeTankId,
        }));
      },

      updateTank: (id, updates) => {
        set(state => ({
          tanks: state.tanks.map(t =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      addFishToTank: (tankId, fishId) => {
        set(state => ({
          tanks: state.tanks.map(t =>
            t.id === tankId
              ? { ...t, fishIds: [...t.fishIds, fishId] }
              : t
          ),
        }));
      },

      removeFishFromTank: (tankId, fishId) => {
        set(state => ({
          tanks: state.tanks.map(t =>
            t.id === tankId
              ? { ...t, fishIds: t.fishIds.filter(id => id !== fishId) }
              : t
          ),
        }));
      },

      setActiveTank: (id) => {
        set({ activeTankId: id });
      },

      getActiveTank: () => {
        const state = get();
        return state.tanks.find(t => t.id === state.activeTankId);
      },
    }),
    {
      name: 'tank-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
