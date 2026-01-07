// Aquatic plants types and database

export type PlantDifficulty = 'easy' | 'moderate' | 'difficult';
export type PlantLighting = 'low' | 'medium' | 'high';
export type PlantPlacement = 'foreground' | 'midground' | 'background' | 'floating';

export interface PlantWaterParameters {
  temperatureMin: number;
  temperatureMax: number;
  phMin: number;
  phMax: number;
  hardnessMin: number;
  hardnessMax: number;
}

export interface Plant {
  id: string;
  commonName: string;
  scientificName: string;
  imageUrl: string;
  description: string;
  difficulty: PlantDifficulty;
  lighting: PlantLighting;
  placement: PlantPlacement;
  growthRate: 'slow' | 'moderate' | 'fast';
  waterParameters: PlantWaterParameters;
  co2Required: boolean;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  compatibleWithFish: string[]; // fish IDs that won't damage the plant
  incompatibleWithFish: string[]; // fish IDs that may eat/uproot the plant
  careNotes: string;
}

export const plantDatabase: Plant[] = [
  // EASY PLANTS
  {
    id: 'java-fern',
    commonName: 'Java Fern',
    scientificName: 'Microsorum pteropus',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Microsorum_pteropus.jpg/1280px-Microsorum_pteropus.jpg',
    description: 'Hardy, low-maintenance plant perfect for beginners. Attach to driftwood or rocks - do not bury the rhizome.',
    difficulty: 'easy',
    lighting: 'low',
    placement: 'midground',
    growthRate: 'slow',
    waterParameters: {
      temperatureMin: 68,
      temperatureMax: 82,
      phMin: 6.0,
      phMax: 7.5,
      hardnessMin: 3,
      hardnessMax: 8,
    },
    co2Required: false,
    price: { min: 5, max: 12, currency: 'USD' },
    compatibleWithFish: ['neon-tetra', 'cardinal-tetra', 'guppy', 'betta', 'corydoras', 'angelfish', 'dwarf-gourami'],
    incompatibleWithFish: ['oscar', 'jack-dempsey', 'silver-dollar'],
    careNotes: 'Attach to hardscape, never bury rhizome. Tolerates low light and various water conditions.',
  },
  {
    id: 'anubias',
    commonName: 'Anubias',
    scientificName: 'Anubias barteri',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Anubias_barteri_var._nana.jpg/1280px-Anubias_barteri_var._nana.jpg',
    description: 'Extremely hardy plant with thick, dark green leaves. Great for tanks with plant-eating fish.',
    difficulty: 'easy',
    lighting: 'low',
    placement: 'foreground',
    growthRate: 'slow',
    waterParameters: {
      temperatureMin: 72,
      temperatureMax: 82,
      phMin: 6.0,
      phMax: 7.5,
      hardnessMin: 3,
      hardnessMax: 10,
    },
    co2Required: false,
    price: { min: 6, max: 15, currency: 'USD' },
    compatibleWithFish: ['neon-tetra', 'betta', 'corydoras', 'angelfish', 'oscar', 'cichlids'],
    incompatibleWithFish: [],
    careNotes: 'Very tough leaves resist most fish. Attach to rocks or driftwood. Prone to algae in high light.',
  },
  {
    id: 'amazon-sword',
    commonName: 'Amazon Sword',
    scientificName: 'Echinodorus amazonicus',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Echinodorus_grisebachii_Bleherae.jpg/1280px-Echinodorus_grisebachii_Bleherae.jpg',
    description: 'Large, dramatic centerpiece plant with broad green leaves. Creates excellent shelter for fish.',
    difficulty: 'easy',
    lighting: 'medium',
    placement: 'background',
    growthRate: 'moderate',
    waterParameters: {
      temperatureMin: 72,
      temperatureMax: 82,
      phMin: 6.5,
      phMax: 7.5,
      hardnessMin: 3,
      hardnessMax: 8,
    },
    co2Required: false,
    price: { min: 7, max: 18, currency: 'USD' },
    compatibleWithFish: ['angelfish', 'discus', 'neon-tetra', 'corydoras', 'guppy'],
    incompatibleWithFish: ['oscar', 'jack-dempsey', 'silver-dollar'],
    careNotes: 'Heavy root feeder - use root tabs. Can grow very large (20+ inches). Needs nutrient-rich substrate.',
  },
  {
    id: 'java-moss',
    commonName: 'Java Moss',
    scientificName: 'Taxiphyllum barbieri',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Vesicularia_dubyana.jpg/1280px-Vesicularia_dubyana.jpg',
    description: 'Versatile moss that attaches to any surface. Perfect for breeding tanks and shrimp.',
    difficulty: 'easy',
    lighting: 'low',
    placement: 'foreground',
    growthRate: 'moderate',
    waterParameters: {
      temperatureMin: 59,
      temperatureMax: 86,
      phMin: 5.0,
      phMax: 8.0,
      hardnessMin: 0,
      hardnessMax: 20,
    },
    co2Required: false,
    price: { min: 4, max: 10, currency: 'USD' },
    compatibleWithFish: ['neon-tetra', 'betta', 'guppy', 'shrimp', 'corydoras', 'otocinclus'],
    incompatibleWithFish: ['goldfish', 'cichlids'],
    careNotes: 'Extremely adaptable. Great for fry and shrimp hiding spots. Trim regularly to prevent debris buildup.',
  },
  {
    id: 'hornwort',
    commonName: 'Hornwort',
    scientificName: 'Ceratophyllum demersum',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Ceratophyllum_demersum_sl1.jpg/1280px-Ceratophyllum_demersum_sl1.jpg',
    description: 'Fast-growing floating or planted stem. Excellent for absorbing excess nutrients.',
    difficulty: 'easy',
    lighting: 'medium',
    placement: 'background',
    growthRate: 'fast',
    waterParameters: {
      temperatureMin: 59,
      temperatureMax: 86,
      phMin: 6.0,
      phMax: 7.5,
      hardnessMin: 5,
      hardnessMax: 15,
    },
    co2Required: false,
    price: { min: 3, max: 8, currency: 'USD' },
    compatibleWithFish: ['guppy', 'platy', 'molly', 'betta', 'goldfish'],
    incompatibleWithFish: [],
    careNotes: 'Can be planted or left floating. Sheds needles in poor conditions. Great natural filter.',
  },
  {
    id: 'water-wisteria',
    commonName: 'Water Wisteria',
    scientificName: 'Hygrophila difformis',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Hygrophila_difformis.jpg/1280px-Hygrophila_difformis.jpg',
    description: 'Beautiful lacy leaves that change shape based on lighting. Fast grower and nutrient absorber.',
    difficulty: 'easy',
    lighting: 'medium',
    placement: 'background',
    growthRate: 'fast',
    waterParameters: {
      temperatureMin: 70,
      temperatureMax: 82,
      phMin: 6.5,
      phMax: 7.5,
      hardnessMin: 2,
      hardnessMax: 8,
    },
    co2Required: false,
    price: { min: 4, max: 9, currency: 'USD' },
    compatibleWithFish: ['neon-tetra', 'guppy', 'betta', 'corydoras', 'angelfish'],
    incompatibleWithFish: ['goldfish', 'silver-dollar'],
    careNotes: 'Leaves change from lacy to broader based on light. Propagates easily from cuttings.',
  },
  // MODERATE PLANTS
  {
    id: 'cryptocoryne',
    commonName: 'Cryptocoryne Wendtii',
    scientificName: 'Cryptocoryne wendtii',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Cryptocoryne_wendtii.jpg/1024px-Cryptocoryne_wendtii.jpg',
    description: 'Popular rosette plant with bronze-green leaves. May melt initially but recovers strong.',
    difficulty: 'moderate',
    lighting: 'low',
    placement: 'midground',
    growthRate: 'slow',
    waterParameters: {
      temperatureMin: 72,
      temperatureMax: 82,
      phMin: 6.0,
      phMax: 8.0,
      hardnessMin: 1,
      hardnessMax: 18,
    },
    co2Required: false,
    price: { min: 5, max: 12, currency: 'USD' },
    compatibleWithFish: ['betta', 'corydoras', 'neon-tetra', 'angelfish', 'discus'],
    incompatibleWithFish: ['oscar', 'large-cichlids'],
    careNotes: 'May experience "crypt melt" when moved - leave it alone and it will recover. Spreads via runners.',
  },
  {
    id: 'vallisneria',
    commonName: 'Vallisneria',
    scientificName: 'Vallisneria spiralis',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Vallisneria_spiralis.jpg/800px-Vallisneria_spiralis.jpg',
    description: 'Grass-like plant with long ribbon leaves. Creates beautiful flowing background.',
    difficulty: 'moderate',
    lighting: 'medium',
    placement: 'background',
    growthRate: 'fast',
    waterParameters: {
      temperatureMin: 64,
      temperatureMax: 82,
      phMin: 6.5,
      phMax: 8.5,
      hardnessMin: 4,
      hardnessMax: 18,
    },
    co2Required: false,
    price: { min: 4, max: 10, currency: 'USD' },
    compatibleWithFish: ['angelfish', 'discus', 'guppy', 'corydoras'],
    incompatibleWithFish: ['goldfish', 'oscar', 'silver-dollar'],
    careNotes: 'Spreads aggressively via runners. Sensitive to Excel/liquid carbon. Prefers harder water.',
  },
  {
    id: 'dwarf-sagittaria',
    commonName: 'Dwarf Sagittaria',
    scientificName: 'Sagittaria subulata',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Sagittaria_subulata.jpg/1024px-Sagittaria_subulata.jpg',
    description: 'Grass-like carpet plant that spreads quickly. Great for natural aquascape look.',
    difficulty: 'moderate',
    lighting: 'medium',
    placement: 'foreground',
    growthRate: 'fast',
    waterParameters: {
      temperatureMin: 68,
      temperatureMax: 82,
      phMin: 6.0,
      phMax: 8.0,
      hardnessMin: 2,
      hardnessMax: 15,
    },
    co2Required: false,
    price: { min: 5, max: 12, currency: 'USD' },
    compatibleWithFish: ['neon-tetra', 'corydoras', 'otocinclus', 'shrimp'],
    incompatibleWithFish: ['goldfish', 'cichlids'],
    careNotes: 'Spreads via runners to create lawn effect. May need trimming to control height.',
  },
  {
    id: 'ludwigia-repens',
    commonName: 'Ludwigia Repens',
    scientificName: 'Ludwigia repens',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Ludwigia_repens.jpg/1024px-Ludwigia_repens.jpg',
    description: 'Stunning red stem plant that adds color contrast. Relatively easy red plant for beginners.',
    difficulty: 'moderate',
    lighting: 'high',
    placement: 'background',
    growthRate: 'moderate',
    waterParameters: {
      temperatureMin: 68,
      temperatureMax: 82,
      phMin: 6.0,
      phMax: 8.0,
      hardnessMin: 3,
      hardnessMax: 8,
    },
    co2Required: false,
    price: { min: 4, max: 10, currency: 'USD' },
    compatibleWithFish: ['neon-tetra', 'guppy', 'betta', 'angelfish'],
    incompatibleWithFish: ['goldfish', 'silver-dollar'],
    careNotes: 'Needs high light for red coloration. Iron supplementation enhances color.',
  },
  // DIFFICULT PLANTS
  {
    id: 'dwarf-baby-tears',
    commonName: 'Dwarf Baby Tears',
    scientificName: 'Hemianthus callitrichoides',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Hemianthus_callitrichoides.jpg/1280px-Hemianthus_callitrichoides.jpg',
    description: 'Smallest aquarium plant - creates lush carpet. The holy grail of carpet plants.',
    difficulty: 'difficult',
    lighting: 'high',
    placement: 'foreground',
    growthRate: 'slow',
    waterParameters: {
      temperatureMin: 68,
      temperatureMax: 82,
      phMin: 5.0,
      phMax: 7.5,
      hardnessMin: 0,
      hardnessMax: 10,
    },
    co2Required: true,
    price: { min: 8, max: 20, currency: 'USD' },
    compatibleWithFish: ['neon-tetra', 'shrimp', 'otocinclus', 'small-rasboras'],
    incompatibleWithFish: ['goldfish', 'cichlids', 'loaches', 'corydoras'],
    careNotes: 'Requires CO2, high light, and rich substrate. Can float up if disturbed by bottom dwellers.',
  },
  {
    id: 'rotala-rotundifolia',
    commonName: 'Rotala Rotundifolia',
    scientificName: 'Rotala rotundifolia',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Rotala_rotundifolia.jpg/1024px-Rotala_rotundifolia.jpg',
    description: 'Delicate stem plant that develops pink/red coloration under high light.',
    difficulty: 'difficult',
    lighting: 'high',
    placement: 'background',
    growthRate: 'fast',
    waterParameters: {
      temperatureMin: 68,
      temperatureMax: 82,
      phMin: 5.5,
      phMax: 7.5,
      hardnessMin: 0,
      hardnessMax: 10,
    },
    co2Required: true,
    price: { min: 5, max: 12, currency: 'USD' },
    compatibleWithFish: ['neon-tetra', 'cardinal-tetra', 'shrimp', 'small-fish'],
    incompatibleWithFish: ['goldfish', 'large-fish'],
    careNotes: 'Needs CO2 and high light for best color. Trim and replant tops for bushy growth.',
  },
  {
    id: 'monte-carlo',
    commonName: 'Monte Carlo',
    scientificName: 'Micranthemum tweediei',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Micranthemum_umbrosum.jpg/1280px-Micranthemum_umbrosum.jpg',
    description: 'Popular carpeting plant easier than dwarf baby tears but still challenging.',
    difficulty: 'difficult',
    lighting: 'high',
    placement: 'foreground',
    growthRate: 'moderate',
    waterParameters: {
      temperatureMin: 68,
      temperatureMax: 77,
      phMin: 6.0,
      phMax: 7.5,
      hardnessMin: 0,
      hardnessMax: 10,
    },
    co2Required: true,
    price: { min: 7, max: 15, currency: 'USD' },
    compatibleWithFish: ['neon-tetra', 'shrimp', 'small-rasboras', 'otocinclus'],
    incompatibleWithFish: ['goldfish', 'cichlids', 'large-loaches'],
    careNotes: 'Slightly easier carpet than HC Cuba. Still needs CO2 and high light.',
  },
  // FLOATING PLANTS
  {
    id: 'amazon-frogbit',
    commonName: 'Amazon Frogbit',
    scientificName: 'Limnobium laevigatum',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Limnobium_laevigatum.jpg/1024px-Limnobium_laevigatum.jpg',
    description: 'Floating plant with lily pad-like leaves. Excellent for bettas and shading.',
    difficulty: 'easy',
    lighting: 'medium',
    placement: 'floating',
    growthRate: 'fast',
    waterParameters: {
      temperatureMin: 64,
      temperatureMax: 84,
      phMin: 6.0,
      phMax: 7.5,
      hardnessMin: 0,
      hardnessMax: 12,
    },
    co2Required: false,
    price: { min: 5, max: 12, currency: 'USD' },
    compatibleWithFish: ['betta', 'guppy', 'gourami', 'corydoras'],
    incompatibleWithFish: [],
    careNotes: 'Roots provide shelter for fry. Keep surface agitation low. Remove excess regularly.',
  },
  {
    id: 'red-root-floater',
    commonName: 'Red Root Floater',
    scientificName: 'Phyllanthus fluitans',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Phyllanthus_fluitans.jpg/1024px-Phyllanthus_fluitans.jpg',
    description: 'Stunning floating plant with red roots and leaves that turn red in high light.',
    difficulty: 'moderate',
    lighting: 'high',
    placement: 'floating',
    growthRate: 'moderate',
    waterParameters: {
      temperatureMin: 70,
      temperatureMax: 82,
      phMin: 6.5,
      phMax: 7.5,
      hardnessMin: 0,
      hardnessMax: 10,
    },
    co2Required: false,
    price: { min: 6, max: 15, currency: 'USD' },
    compatibleWithFish: ['betta', 'guppy', 'neon-tetra', 'shrimp'],
    incompatibleWithFish: [],
    careNotes: 'Leaves turn red under high light. Minimal surface agitation required.',
  },
  {
    id: 'duckweed',
    commonName: 'Duckweed',
    scientificName: 'Lemna minor',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Lemna_minor_001.JPG/1280px-Lemna_minor_001.JPG',
    description: 'Tiny floating plant that multiplies rapidly. Great nutrient export but can take over.',
    difficulty: 'easy',
    lighting: 'low',
    placement: 'floating',
    growthRate: 'fast',
    waterParameters: {
      temperatureMin: 50,
      temperatureMax: 86,
      phMin: 5.0,
      phMax: 9.0,
      hardnessMin: 0,
      hardnessMax: 25,
    },
    co2Required: false,
    price: { min: 2, max: 5, currency: 'USD' },
    compatibleWithFish: ['goldfish', 'guppy', 'betta', 'all-fish'],
    incompatibleWithFish: [],
    careNotes: 'WARNING: Nearly impossible to remove once established. Great natural food for goldfish.',
  },
];

// Helper functions
export const getPlantById = (id: string): Plant | undefined => {
  return plantDatabase.find(plant => plant.id === id);
};

export const getEasyPlants = (): Plant[] => {
  return plantDatabase.filter(plant => plant.difficulty === 'easy');
};

export const getPlantsByLighting = (lighting: PlantLighting): Plant[] => {
  return plantDatabase.filter(plant => plant.lighting === lighting);
};

export const getFloatingPlants = (): Plant[] => {
  return plantDatabase.filter(plant => plant.placement === 'floating');
};

export const searchPlants = (query: string): Plant[] => {
  const lowerQuery = query.toLowerCase();
  return plantDatabase.filter(plant =>
    plant.commonName.toLowerCase().includes(lowerQuery) ||
    plant.scientificName.toLowerCase().includes(lowerQuery)
  );
};

export const getCompatiblePlantsForFish = (fishId: string): Plant[] => {
  return plantDatabase.filter(plant =>
    plant.compatibleWithFish.includes(fishId) ||
    !plant.incompatibleWithFish.includes(fishId)
  );
};

export const getIncompatiblePlantsForFish = (fishId: string): Plant[] => {
  return plantDatabase.filter(plant =>
    plant.incompatibleWithFish.includes(fishId)
  );
};
