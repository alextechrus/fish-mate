import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TankSetup, WaterType } from '../types/fish';

// Activity log types
export type ActivityType = 'created' | 'fish_added' | 'fish_removed' | 'plant_added' | 'plant_removed' | 'water_change' | 'reminder_set' | 'tank_cleaned';

export interface TankActivity {
  id: string;
  type: ActivityType;
  description: string;
  timestamp: Date;
  data?: {
    fishId?: string;
    fishName?: string;
    plantId?: string;
    plantName?: string;
  };
}

// Water change reminder types
export interface WaterChangeReminder {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek: number; // 0-6, Sunday to Saturday
  hour: number; // 0-23
  minute: number; // 0-59
  lastReminder?: Date;
}

// Extended tank setup with new fields
export interface ExtendedTankSetup extends TankSetup {
  activities: TankActivity[];
  waterChangeReminder?: WaterChangeReminder;
  lastCleanedAt?: string;
  generatedImageUrl?: string;
  generatedImageDirtyUrl?: string;
  isPublic?: boolean;
}

interface TankState {
  tanks: ExtendedTankSetup[];
  activeTankId: string | null;
  selectedTankId: string | null; // For focused view
  favoriteTankId: string | null; // Only one tank can be favorite
  addTank: (name: string, size: number, waterType: WaterType) => string;
  removeTank: (id: string) => void;
  updateTank: (id: string, updates: Partial<ExtendedTankSetup>) => void;
  renameTank: (id: string, newName: string) => void;
  addFishToTank: (tankId: string, fishId: string, fishName?: string) => void;
  removeFishFromTank: (tankId: string, fishId: string, fishName?: string) => void;
  addPlantToTank: (tankId: string, plantId: string, plantName?: string) => void;
  removePlantFromTank: (tankId: string, plantId: string, plantName?: string) => void;
  setActiveTank: (id: string | null) => void;
  setSelectedTank: (id: string | null) => void;
  setFavoriteTank: (id: string | null) => void;
  getActiveTank: () => ExtendedTankSetup | undefined;
  getSortedTanks: () => ExtendedTankSetup[]; // Returns tanks with favorite first
  addActivity: (tankId: string, activity: Omit<TankActivity, 'id' | 'timestamp'>) => void;
  setWaterChangeReminder: (tankId: string, reminder: WaterChangeReminder) => void;
  logWaterChange: (tankId: string) => void;
  confirmCleaned: (tankId: string) => void;
  updateTankImage: (tankId: string, url: string, isDirty: boolean) => void;
  toggleTankPublic: (tankId: string) => void;
}

export function getTankCleanliness(tank: ExtendedTankSetup): 'clean' | 'due-soon' | 'overdue' {
  if (!tank.lastCleanedAt) {
    return tank.fishIds.length > 0 ? 'due-soon' : 'clean';
  }
  const daysSince = (Date.now() - new Date(tank.lastCleanedAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince > 14) return 'overdue';
  if (daysSince > 10) return 'due-soon';
  return 'clean';
}

export const useTankStore = create<TankState>()(
  persist(
    (set, get) => ({
      tanks: [],
      activeTankId: null,
      selectedTankId: null,
      favoriteTankId: null,

      addTank: (name, size, waterType) => {
        const id = `tank-${Date.now()}`;
        const newTank: ExtendedTankSetup = {
          id,
          name,
          size,
          waterType,
          fishIds: [],
          plantIds: [],
          createdAt: new Date(),
          activities: [{
            id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            type: 'created',
            description: `Tank "${name}" was created`,
            timestamp: new Date(),
          }],
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
          selectedTankId: state.selectedTankId === id ? null : state.selectedTankId,
        }));
      },

      updateTank: (id, updates) => {
        set(state => ({
          tanks: state.tanks.map(t =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      renameTank: (id, newName) => {
        set(state => ({
          tanks: state.tanks.map(t =>
            t.id === id ? { ...t, name: newName } : t
          ),
        }));
      },

      addFishToTank: (tankId, fishId, fishName) => {
        set(state => ({
          tanks: state.tanks.map(t => {
            if (t.id !== tankId) return t;
            const activity: TankActivity = {
              id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              type: 'fish_added',
              description: fishName ? `Added ${fishName}` : 'Added a fish',
              timestamp: new Date(),
              data: { fishId, fishName },
            };
            return {
              ...t,
              fishIds: [...t.fishIds, fishId],
              activities: [...(t.activities || []), activity],
            };
          }),
        }));
      },

      removeFishFromTank: (tankId, fishId, fishName) => {
        set(state => ({
          tanks: state.tanks.map(t => {
            if (t.id !== tankId) return t;
            const activity: TankActivity = {
              id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              type: 'fish_removed',
              description: fishName ? `Removed ${fishName}` : 'Removed a fish',
              timestamp: new Date(),
              data: { fishId, fishName },
            };
            return {
              ...t,
              fishIds: t.fishIds.filter(id => id !== fishId),
              activities: [...(t.activities || []), activity],
            };
          }),
        }));
      },

      addPlantToTank: (tankId, plantId, plantName) => {
        set(state => ({
          tanks: state.tanks.map(t => {
            if (t.id !== tankId) return t;
            const activity: TankActivity = {
              id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              type: 'plant_added',
              description: plantName ? `Added ${plantName}` : 'Added a plant',
              timestamp: new Date(),
              data: { plantId, plantName },
            };
            return {
              ...t,
              plantIds: [...(t.plantIds || []), plantId],
              activities: [...(t.activities || []), activity],
            };
          }),
        }));
      },

      removePlantFromTank: (tankId, plantId, plantName) => {
        set(state => ({
          tanks: state.tanks.map(t => {
            if (t.id !== tankId) return t;
            const activity: TankActivity = {
              id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              type: 'plant_removed',
              description: plantName ? `Removed ${plantName}` : 'Removed a plant',
              timestamp: new Date(),
              data: { plantId, plantName },
            };
            return {
              ...t,
              plantIds: (t.plantIds || []).filter(id => id !== plantId),
              activities: [...(t.activities || []), activity],
            };
          }),
        }));
      },

      setActiveTank: (id) => {
        set({ activeTankId: id });
      },

      setSelectedTank: (id) => {
        set({ selectedTankId: id });
      },

      setFavoriteTank: (id) => {
        set({ favoriteTankId: id });
      },

      getActiveTank: () => {
        const state = get();
        return state.tanks.find(t => t.id === state.activeTankId);
      },

      getSortedTanks: () => {
        const state = get();
        const { tanks, activeTankId, favoriteTankId } = state;
        // Active (main) tank first, then favorite, then rest
        const active = activeTankId ? tanks.find(t => t.id === activeTankId) : undefined;
        const favorite = favoriteTankId && favoriteTankId !== activeTankId
          ? tanks.find(t => t.id === favoriteTankId)
          : undefined;
        const rest = tanks.filter(t => t.id !== activeTankId && t.id !== favoriteTankId);
        return [
          ...(active ? [active] : []),
          ...(favorite ? [favorite] : []),
          ...rest,
        ];
      },

      addActivity: (tankId, activity) => {
        set(state => ({
          tanks: state.tanks.map(t => {
            if (t.id !== tankId) return t;
            const newActivity: TankActivity = {
              ...activity,
              id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              timestamp: new Date(),
            };
            return {
              ...t,
              activities: [...(t.activities || []), newActivity],
            };
          }),
        }));
      },

      setWaterChangeReminder: (tankId, reminder) => {
        set(state => ({
          tanks: state.tanks.map(t => {
            if (t.id !== tankId) return t;
            const activity: TankActivity = {
              id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              type: 'reminder_set',
              description: reminder.enabled
                ? `Water change reminder set for ${reminder.frequency}`
                : 'Water change reminder disabled',
              timestamp: new Date(),
            };
            return {
              ...t,
              waterChangeReminder: reminder,
              activities: [...(t.activities || []), activity],
            };
          }),
        }));
      },

      logWaterChange: (tankId) => {
        set(state => ({
          tanks: state.tanks.map(t => {
            if (t.id !== tankId) return t;
            const activity: TankActivity = {
              id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              type: 'water_change',
              description: 'Performed water change',
              timestamp: new Date(),
            };
            return {
              ...t,
              activities: [...(t.activities || []), activity],
              waterChangeReminder: t.waterChangeReminder
                ? { ...t.waterChangeReminder, lastReminder: new Date() }
                : undefined,
            };
          }),
        }));
      },

      confirmCleaned: (tankId) => {
        set(state => ({
          tanks: state.tanks.map(t => {
            if (t.id !== tankId) return t;
            const activity: TankActivity = {
              id: `activity-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              type: 'tank_cleaned',
              description: 'Marked tank as cleaned',
              timestamp: new Date(),
            };
            return {
              ...t,
              lastCleanedAt: new Date().toISOString(),
              activities: [...(t.activities || []), activity],
            };
          }),
        }));
      },

      updateTankImage: (tankId, url, isDirty) => {
        set(state => ({
          tanks: state.tanks.map(t => {
            if (t.id !== tankId) return t;
            return isDirty
              ? { ...t, generatedImageDirtyUrl: url }
              : { ...t, generatedImageUrl: url };
          }),
        }));
      },

      toggleTankPublic: (tankId) => {
        set(state => ({
          tanks: state.tanks.map(t =>
            t.id === tankId ? { ...t, isPublic: !t.isPublic } : t
          ),
        }));
      },
    }),
    {
      name: 'tank-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
