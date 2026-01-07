// Hooks for getting species images
// Uses AI-generated images from the species-images database
// Falls back to original URLs if generated image not available

import { fishImages, plantImages } from '../data/species-images';

/**
 * Get the image URL for a fish species
 * Uses AI-generated images when available, falls back to provided URL
 */
export function useFishImage(
  fishId: string,
  fallbackUrl: string,
  commonName?: string,
  scientificName?: string
): string {
  // Check if we have a generated image for this fish
  const generatedUrl = fishImages[fishId];
  if (generatedUrl) {
    return generatedUrl;
  }

  // Fall back to the original URL
  return fallbackUrl;
}

/**
 * Get the image URL for a plant species
 * Uses AI-generated images when available, falls back to provided URL
 */
export function usePlantImage(
  plantId: string,
  fallbackUrl: string,
  commonName?: string,
  scientificName?: string
): string {
  // Check if we have a generated image for this plant
  const generatedUrl = plantImages[plantId];
  if (generatedUrl) {
    return generatedUrl;
  }

  // Fall back to the original URL
  return fallbackUrl;
}

/**
 * Async version - get fish image URL
 */
export async function getFishImageUrl(
  fishId: string,
  fallbackUrl: string
): Promise<string> {
  const generatedUrl = fishImages[fishId];
  return generatedUrl || fallbackUrl;
}

/**
 * Async version - get plant image URL
 */
export async function getPlantImageUrl(
  plantId: string,
  fallbackUrl: string
): Promise<string> {
  const generatedUrl = plantImages[plantId];
  return generatedUrl || fallbackUrl;
}

/**
 * Check if a species has a generated image
 */
export function hasGeneratedImage(type: 'fish' | 'plant', id: string): boolean {
  if (type === 'fish') {
    return !!fishImages[id];
  }
  return !!plantImages[id];
}

/**
 * Clear image cache (no-op for now, future use)
 */
export function clearImageCache() {
  // No-op - images are stored in static database
}
