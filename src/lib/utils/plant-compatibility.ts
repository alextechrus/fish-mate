// Plant compatibility explanations utility
// Provides detailed reasons why certain fish are compatible or incompatible with plants

import { getFishById } from '@/lib/data/fish-database';
import { Fish } from '@/lib/types/fish';

export interface CompatibilityExplanation {
  fishId: string;
  fishName: string;
  status: 'compatible' | 'incompatible';
  reason: string;
  details: string;
}

// Reasons why fish might be incompatible with plants
const incompatibilityReasons: Record<string, { reason: string; details: string }> = {
  // Large aggressive cichlids that dig and uproot
  'oscar': {
    reason: 'Digs and uproots plants',
    details: 'Oscars are notorious plant destroyers. They dig in substrate while hunting for food and during territorial displays, uprooting even well-established plants. Their large size (up to 14") means they can damage even hardy plants.',
  },
  'jack-dempsey': {
    reason: 'Aggressive digging behavior',
    details: 'Jack Dempseys are substrate diggers that frequently rearrange their environment. They uproot plants while creating territories and during breeding. Only the toughest attached plants survive.',
  },
  // Herbivorous fish that eat plants
  'silver-dollar': {
    reason: 'Herbivorous - eats plants',
    details: 'Silver Dollars are primarily herbivorous and will consume most soft-leaved aquarium plants. They can strip a planted tank bare within days. Only tough plants like Anubias and Java Fern survive.',
  },
  'goldfish': {
    reason: 'Eats and uproots plants',
    details: 'Goldfish are omnivorous grazers that eat soft plants and dig constantly in substrate. Their large appetite and messy eating habits make them incompatible with most aquarium plants.',
  },
  // Cichlids in general
  'cichlids': {
    reason: 'Digging and territorial behavior',
    details: 'Most cichlids dig in substrate and rearrange decorations. During breeding, they become especially destructive, clearing areas around their territory.',
  },
  'large-cichlids': {
    reason: 'Size and digging behavior',
    details: 'Large cichlids combine powerful digging instincts with the size to uproot any plant. They require open swimming space and often view plants as obstacles to remove.',
  },
  // Bottom dwellers that may disturb carpet plants
  'loaches': {
    reason: 'Burrowing disturbs carpet plants',
    details: 'Loaches love to burrow and dig in substrate, which can uproot delicate carpet plants like Dwarf Baby Tears and Monte Carlo that need to establish root systems.',
  },
  'large-loaches': {
    reason: 'Size and burrowing disrupts carpets',
    details: 'Larger loaches are powerful burrowers that can easily uproot carpet plants and disturb fine substrates needed for carpeting species.',
  },
  'corydoras': {
    reason: 'Foraging disturbs delicate carpets',
    details: 'While generally plant-safe, Corydoras constantly forage in substrate which can disturb delicate carpet plants before they establish. Fine-leaved carpets may float up.',
  },
  // Generic large fish
  'large-fish': {
    reason: 'Size causes physical damage',
    details: 'Large, active fish can break delicate stems and leaves simply by swimming past. High-light stem plants with fine foliage are particularly vulnerable.',
  },
};

// Reasons why fish are compatible with plants
const compatibilityReasons: Record<string, { reason: string; details: string }> = {
  'neon-tetra': {
    reason: 'Small, peaceful, mid-water swimmer',
    details: 'Neon Tetras swim in the middle water column and never bother plants. Their small size and peaceful nature make them ideal for planted tanks.',
  },
  'cardinal-tetra': {
    reason: 'Gentle schooling fish',
    details: 'Like Neon Tetras, Cardinals are peaceful mid-water swimmers that ignore plants. They look stunning against green plant backgrounds.',
  },
  'guppy': {
    reason: 'Plant-friendly surface dweller',
    details: 'Guppies primarily swim near the surface and don\'t disturb plants. They may nibble algae off leaves, which actually helps plants stay healthy.',
  },
  'betta': {
    reason: 'Rests on plant leaves',
    details: 'Bettas love plants and use broad leaves as resting spots near the surface. They never damage plants and appreciate the shelter plants provide.',
  },
  'corydoras': {
    reason: 'Gentle bottom dweller',
    details: 'Corydoras are peaceful bottom feeders that don\'t uproot plants. They may stir substrate slightly while foraging but cause no real damage to established plants.',
  },
  'otocinclus': {
    reason: 'Beneficial algae cleaner',
    details: 'Otocinclus are perfect planted tank fish - they eat algae off plant leaves without damaging them, keeping your plants clean and healthy.',
  },
  'shrimp': {
    reason: 'Algae cleaners, too small to damage',
    details: 'Shrimp are beneficial for planted tanks. They eat algae and detritus, helping keep plants clean. They\'re too small to cause any damage.',
  },
  'angelfish': {
    reason: 'Appreciates planted environments',
    details: 'Angelfish are natural inhabitants of densely planted Amazon waters. They swim gracefully among plants without damaging them.',
  },
  'discus': {
    reason: 'Gentle giants for planted tanks',
    details: 'Discus are peaceful despite their size. They appreciate the shelter and natural feel of planted tanks and never disturb the plants.',
  },
  'dwarf-gourami': {
    reason: 'Surface dweller, plant-friendly',
    details: 'Dwarf Gouramis are labyrinth fish that stay near the surface. They appreciate floating plants and never bother rooted plants.',
  },
  'harlequin-rasbora': {
    reason: 'Peaceful schooling fish',
    details: 'Harlequin Rasboras are gentle schooling fish that look beautiful against planted backgrounds. They never touch or damage plants.',
  },
  'small-rasboras': {
    reason: 'Tiny and completely plant-safe',
    details: 'Small rasbora species are ideal for planted tanks. Their tiny size means they can\'t damage plants even accidentally.',
  },
  'platy': {
    reason: 'Peaceful, may eat algae off leaves',
    details: 'Platys are peaceful livebearers that occasionally graze algae from plant leaves, which benefits the plants.',
  },
  'molly': {
    reason: 'Generally plant-safe',
    details: 'Mollies are mostly compatible with plants, though they may nibble on soft new growth if underfed. Keep them well-fed for best results.',
  },
  'gourami': {
    reason: 'Surface fish, plant-friendly',
    details: 'Gouramis appreciate floating plants and leave rooted plants alone. They add a calm presence to planted tanks.',
  },
  'all-fish': {
    reason: 'Universal compatibility',
    details: 'This hardy plant tolerates almost any fish. Its tough structure or growing style makes it virtually indestructible.',
  },
};

// Default explanations for fish not in our database
const defaultCompatible = {
  reason: 'Generally plant-safe species',
  details: 'This fish species typically doesn\'t bother plants. They swim at levels that don\'t disturb root systems and don\'t eat plant matter.',
};

const defaultIncompatible = {
  reason: 'May damage or eat plants',
  details: 'This fish species may dig in substrate, eat plant matter, or otherwise damage plants through their natural behaviors.',
};

export function getCompatibilityExplanation(
  fishId: string,
  status: 'compatible' | 'incompatible'
): CompatibilityExplanation {
  const fish = getFishById(fishId);
  const fishName = fish?.commonName || fishId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  if (status === 'incompatible') {
    const explanation = incompatibilityReasons[fishId] || defaultIncompatible;
    return {
      fishId,
      fishName,
      status,
      reason: explanation.reason,
      details: explanation.details,
    };
  }

  const explanation = compatibilityReasons[fishId] || defaultCompatible;
  return {
    fishId,
    fishName,
    status,
    reason: explanation.reason,
    details: explanation.details,
  };
}

export function getPlantCompatibilityExplanations(
  compatibleFishIds: string[],
  incompatibleFishIds: string[]
): {
  compatible: CompatibilityExplanation[];
  incompatible: CompatibilityExplanation[];
} {
  return {
    compatible: compatibleFishIds.map(id => getCompatibilityExplanation(id, 'compatible')),
    incompatible: incompatibleFishIds.map(id => getCompatibilityExplanation(id, 'incompatible')),
  };
}

// Lighting level definitions with PAR values
export interface LightingDefinition {
  level: 'low' | 'medium' | 'high';
  parRange: string;
  description: string;
  examples: string;
  requirements: string;
}

export const lightingDefinitions: Record<'low' | 'medium' | 'high', LightingDefinition> = {
  low: {
    level: 'low',
    parRange: '15-30 PAR',
    description: 'Minimal lighting requirements',
    examples: 'Basic aquarium LED, single T8 fluorescent, window light',
    requirements: 'Standard aquarium lighting is sufficient. No special equipment needed. Plants grow slowly but steadily.',
  },
  medium: {
    level: 'medium',
    parRange: '30-50 PAR',
    description: 'Moderate lighting requirements',
    examples: 'Quality LED fixture, dual T5 fluorescent, planted tank lights',
    requirements: 'Requires a decent planted tank light. Most modern LED fixtures work well. Some plants may benefit from CO2.',
  },
  high: {
    level: 'high',
    parRange: '50-100+ PAR',
    description: 'Intense lighting requirements',
    examples: 'High-output LED, professional planted tank lights, multiple fixtures',
    requirements: 'Requires powerful lighting specifically designed for planted tanks. CO2 injection usually necessary to prevent algae. Fertilization regime required.',
  },
};

// Difficulty level definitions
export interface DifficultyDefinition {
  level: 'easy' | 'moderate' | 'difficult';
  description: string;
  requirements: string[];
  suitableFor: string;
}

export const difficultyDefinitions: Record<'easy' | 'moderate' | 'difficult', DifficultyDefinition> = {
  easy: {
    level: 'easy',
    description: 'Beginner-friendly plants that thrive with minimal care',
    requirements: [
      'Basic aquarium lighting',
      'No CO2 injection needed',
      'Standard water parameters',
      'Minimal fertilization',
      'Forgiving of mistakes',
    ],
    suitableFor: 'Perfect for beginners, low-tech tanks, and busy aquarists who want beautiful plants without demanding maintenance.',
  },
  moderate: {
    level: 'moderate',
    description: 'Plants requiring some attention and stable conditions',
    requirements: [
      'Moderate to good lighting',
      'CO2 beneficial but not required',
      'Consistent water parameters',
      'Regular fertilization helps',
      'Some aquarium experience recommended',
    ],
    suitableFor: 'Ideal for hobbyists with some experience who want to expand beyond basic plants without committing to high-tech setups.',
  },
  difficult: {
    level: 'difficult',
    description: 'Demanding plants requiring specific conditions and care',
    requirements: [
      'High-intensity lighting (50+ PAR)',
      'CO2 injection required',
      'Precise water parameters',
      'Regular fertilization schedule',
      'Nutrient-rich substrate',
      'Consistent maintenance routine',
    ],
    suitableFor: 'For experienced aquarists with high-tech setups who enjoy the challenge of growing demanding species and creating aquascapes.',
  },
};
