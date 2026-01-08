// Species Image Database
// This file stores AI-generated image URLs for all fish and plant species
// Images are generated once and stored here for consistent display across all users

export interface SpeciesImage {
  id: string;
  type: 'fish' | 'plant';
  commonName: string;
  scientificName: string;
  imageUrl: string;
  generatedAt: string;
}

// Pre-generated AI images for fish species
// These images show each fish in a planted aquarium setting
// Using asset require for local images
export const fishImages: Record<string, number> = {
  'neon-tetra': require('../../../assets/images/species/fish-neon-tetra.png'),
  'cardinal-tetra': require('../../../assets/images/species/fish-cardinal-tetra.png'),
  'guppy': require('../../../assets/images/species/fish-guppy.png'),
  'platy': require('../../../assets/images/species/fish-platy.png'),
  'molly': require('../../../assets/images/species/fish-molly.png'),
  'corydoras': require('../../../assets/images/species/fish-corydoras.png'),
  'otocinclus': require('../../../assets/images/species/fish-otocinclus.png'),
  'harlequin-rasbora': require('../../../assets/images/species/fish-harlequin-rasbora.png'),
  'betta': require('../../../assets/images/species/fish-betta.png'),
  'dwarf-gourami': require('../../../assets/images/species/fish-dwarf-gourami.png'),
  'tiger-barb': require('../../../assets/images/species/fish-tiger-barb.png'),
  'angelfish': require('../../../assets/images/species/fish-angelfish.png'),
  'swordtail': require('../../../assets/images/species/fish-swordtail.png'),
  'oscar': require('../../../assets/images/species/fish-oscar.png'),
  'jack-dempsey': require('../../../assets/images/species/fish-jack-dempsey.png'),
  'clownfish': require('../../../assets/images/species/fish-clownfish.png'),
  'royal-gramma': require('../../../assets/images/species/fish-royal-gramma.png'),
  'yellow-tang': require('../../../assets/images/species/fish-yellow-tang.png'),
  'firefish': require('../../../assets/images/species/fish-firefish.png'),
  'blue-tang': require('../../../assets/images/species/fish-blue-tang.png'),
};

// Pre-generated AI images for plant species
// These images show each plant in an aquarium setting
export const plantImages: Record<string, number> = {
  // Images will be populated after generation
};

/**
 * Get the image source for a fish species
 * Returns require() result for local images or fallback URL
 */
export function getFishImageSource(fishId: string, fallbackUrl?: string): number | { uri: string } {
  const localImage = fishImages[fishId];
  if (localImage) return localImage;
  return { uri: fallbackUrl || getPlaceholderImage('fish') };
}

/**
 * Get the image source for a plant species
 * Returns require() result for local images or fallback URL
 */
export function getPlantImageSource(plantId: string, fallbackUrl?: string): number | { uri: string } {
  const localImage = plantImages[plantId];
  if (localImage) return localImage;
  return { uri: fallbackUrl || getPlaceholderImage('plant') };
}

/**
 * Get a placeholder image URL
 */
function getPlaceholderImage(type: 'fish' | 'plant'): string {
  if (type === 'fish') {
    return 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400';
  }
  return 'https://images.unsplash.com/photo-1518882605630-8991c6885592?w=400';
}

/**
 * Check if an image has been generated for a species
 */
export function hasGeneratedImage(type: 'fish' | 'plant', id: string): boolean {
  if (type === 'fish') {
    return !!fishImages[id];
  }
  return !!plantImages[id];
}
