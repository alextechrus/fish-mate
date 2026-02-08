import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TankSetup } from '../types/fish';

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  sharedTanks: SharedTank[];
}

export interface SharedTank {
  id: string;
  tankId: string;
  tankName: string;
  sharedBy: string;
  sharedByName: string;
  sharedAt: Date;
  tankData: TankSetup;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;

  // Tank sharing
  shareTank: (tank: TankSetup, recipientEmail: string) => Promise<boolean>;
  getSharedTanks: () => SharedTank[];
  removeSharedTank: (sharedTankId: string) => void;
}

// Simple local storage for demo users (in production, use a real backend)
const USERS_STORAGE_KEY = 'fishmate-users';

const getStoredUsers = async (): Promise<Record<string, { password: string; user: User }>> => {
  try {
    const data = await AsyncStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
};

const storeUsers = async (users: Record<string, { password: string; user: User }>) => {
  await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });

        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));

          const users = await getStoredUsers();
          const normalizedEmail = email.toLowerCase().trim();

          if (users[normalizedEmail] && users[normalizedEmail].password === password) {
            const userData = users[normalizedEmail].user;
            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false
            });
            return true;
          }

          set({ isLoading: false });
          return false;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },

      register: async (email, password, name) => {
        set({ isLoading: true });

        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 500));

          const users = await getStoredUsers();
          const normalizedEmail = email.toLowerCase().trim();

          if (users[normalizedEmail]) {
            set({ isLoading: false });
            return false; // Email already exists
          }

          const newUser: User = {
            id: `user-${Date.now()}`,
            email: normalizedEmail,
            name: name.trim(),
            createdAt: new Date(),
            sharedTanks: [],
          };

          users[normalizedEmail] = { password, user: newUser };
          await storeUsers(users);

          set({
            user: newUser,
            isAuthenticated: true,
            isLoading: false
          });
          return true;
        } catch {
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      shareTank: async (tank, recipientEmail) => {
        const currentUser = get().user;
        if (!currentUser) return false;

        try {
          const users = await getStoredUsers();
          const normalizedEmail = recipientEmail.toLowerCase().trim();

          if (!users[normalizedEmail]) {
            return false; // Recipient not found
          }

          const sharedTank: SharedTank = {
            id: `shared-${Date.now()}`,
            tankId: tank.id,
            tankName: tank.name,
            sharedBy: currentUser.id,
            sharedByName: currentUser.name,
            sharedAt: new Date(),
            tankData: tank,
          };

          // Add to recipient's shared tanks
          users[normalizedEmail].user.sharedTanks.push(sharedTank);
          await storeUsers(users);

          return true;
        } catch {
          return false;
        }
      },

      getSharedTanks: () => {
        return get().user?.sharedTanks || [];
      },

      removeSharedTank: (sharedTankId) => {
        set(state => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              sharedTanks: state.user.sharedTanks.filter(t => t.id !== sharedTankId),
            },
          };
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
