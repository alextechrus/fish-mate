import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type VolumeUnit = 'litres' | 'gallons';
export type TemperatureUnit = 'celsius' | 'fahrenheit';

interface SettingsState {
  volumeUnit: VolumeUnit;
  temperatureUnit: TemperatureUnit;
  setVolumeUnit: (unit: VolumeUnit) => void;
  setTemperatureUnit: (unit: TemperatureUnit) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      volumeUnit: 'litres',
      temperatureUnit: 'celsius',
      setVolumeUnit: (unit) => set({ volumeUnit: unit }),
      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
    }),
    {
      name: 'fishmate-settings',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Helper functions for conversions
export function convertGallonsToLitres(gallons: number): number {
  return Math.round(gallons * 3.785);
}

export function convertLitresToGallons(litres: number): number {
  return Math.round(litres / 3.785);
}

export function convertFahrenheitToCelsius(fahrenheit: number): number {
  return Math.round((fahrenheit - 32) * 5 / 9);
}

export function convertCelsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9 / 5) + 32);
}

export function formatVolume(gallons: number, unit: VolumeUnit): string {
  if (unit === 'litres') {
    return `${convertGallonsToLitres(gallons)}L`;
  }
  return `${gallons}g`;
}

export function formatTemperature(fahrenheit: number, unit: TemperatureUnit): string {
  if (unit === 'celsius') {
    return `${convertFahrenheitToCelsius(fahrenheit)}°C`;
  }
  return `${fahrenheit}°F`;
}

export function formatTemperatureRange(minF: number, maxF: number, unit: TemperatureUnit): string {
  if (unit === 'celsius') {
    return `${convertFahrenheitToCelsius(minF)}°-${convertFahrenheitToCelsius(maxF)}°C`;
  }
  return `${minF}°-${maxF}°F`;
}
