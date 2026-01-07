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
export const fishImages: Record<string, string> = {
  // Images will be populated after generation
};

// Pre-generated AI images for plant species
// These images show each plant in an aquarium setting
export const plantImages: Record<string, string> = {
  // Images will be populated after generation
};

/**
 * Get the image URL for a fish species
 * Falls back to a placeholder if not yet generated
 */
export function getFishImageUrl(fishId: string, fallbackUrl?: string): string {
  return fishImages[fishId] || fallbackUrl || getPlaceholderImage('fish');
}

/**
 * Get the image URL for a plant species
 * Falls back to a placeholder if not yet generated
 */
export function getPlantImageUrl(plantId: string, fallbackUrl?: string): string {
  return plantImages[plantId] || fallbackUrl || getPlaceholderImage('plant');
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
