// Fish compatibility app types

export type WaterType = 'freshwater' | 'saltwater' | 'brackish';
export type Temperament = 'peaceful' | 'semi-aggressive' | 'aggressive';
export type TankZone = 'top' | 'middle' | 'bottom' | 'all';
export type DietType = 'herbivore' | 'carnivore' | 'omnivore';
export type CompatibilityStatus = 'compatible' | 'conditional' | 'incompatible';

export interface WaterParameters {
  temperatureMin: number; // Fahrenheit
  temperatureMax: number;
  phMin: number;
  phMax: number;
  hardnessMin: number; // dGH
  hardnessMax: number;
}

export interface PriceRange {
  min: number;
  max: number;
  currency: string;
}

export interface Fish {
  id: string;
  commonName: string;
  scientificName: string;
  imageUrl: string;
  waterType: WaterType;
  temperament: Temperament;
  minTankSize: number; // gallons
  waterParameters: WaterParameters;
  diet: DietType;
  feedingNotes: string;
  tankZone: TankZone;
  maxSize: number; // inches
  reefSafe?: boolean; // for saltwater
  needsHidingSpaces: boolean;
  needsPlants: boolean;
  schoolingFish: boolean;
  minSchoolSize?: number;
  careLevel: 'beginner' | 'intermediate' | 'advanced';
  description: string;
  compatibleWith: string[]; // fish IDs
  incompatibleWith: string[]; // fish IDs
  conditionalWith: string[]; // fish IDs
  price: PriceRange;
}

export interface CompatibilityResult {
  status: CompatibilityStatus;
  fish1: Fish;
  fish2: Fish;
  reasons: string[];
  warnings?: string[];
  suggestions?: string[];
}

export interface TankSetup {
  id: string;
  name: string;
  size: number; // gallons
  waterType: WaterType;
  fishIds: string[];
  plantIds: string[];
  createdAt: Date;
}

export interface CompatibilityCheck {
  overallStatus: CompatibilityStatus;
  results: CompatibilityResult[];
  tankSizeWarning?: string;
  suggestions: string[];
}
