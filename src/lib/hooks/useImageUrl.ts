// Hooks for getting species images
// Uses AI-generated images from the species-images database
// Falls back to original URLs if generated image not available

import { ImageSourcePropType } from 'react-native';
import { fishImages, plantImages } from '../data/species-images';

// Type for image source that can be either a require() number or a URI object
export type ImageSource = number | { uri: string };

/**
 * Get the image source for a fish species
 * Uses AI-generated images when available, falls back to provided URL
 * Returns an ImageSource that can be used directly with Image component
 */
export function useFishImageSource(
  fishId: string,
  fallbackUrl: string,
  commonName?: string,
  scientificName?: string
): ImageSource {
  // Check if we have a generated image for this fish
  const generatedImage = fishImages[fishId];
  if (generatedImage) {
    return generatedImage;
  }

  // Fall back to the original URL
  return { uri: fallbackUrl };
}

/**
 * Get the image source for a plant species
 * Uses AI-generated images when available, falls back to provided URL
 * Returns an ImageSource that can be used directly with Image component
 */
export function usePlantImageSource(
  plantId: string,
  fallbackUrl: string,
  commonName?: string,
  scientificName?: string
): ImageSource {
  // Check if we have a generated image for this plant
  const generatedImage = plantImages[plantId];
  if (generatedImage) {
    return generatedImage;
  }

  // Fall back to the original URL
  return { uri: fallbackUrl };
}

/**
 * Legacy function - returns URL string only (for backwards compatibility)
 * Only returns generated image URL if it's a string, otherwise fallback
 */
export function useFishImage(
  fishId: string,
  fallbackUrl: string,
  commonName?: string,
  scientificName?: string
): string {
  // For backwards compatibility, just return the fallback URL
  // The new AI images use require() which returns a number
  // Components should migrate to useFishImageSource
  return fallbackUrl;
}

/**
 * Legacy function - returns URL string only (for backwards compatibility)
 * Only returns generated image URL if it's a string, otherwise fallback
 */
export function usePlantImage(
  plantId: string,
  fallbackUrl: string,
  commonName?: string,
  scientificName?: string
): string {
  // For backwards compatibility, just return the fallback URL
  // Components should migrate to usePlantImageSource
  return fallbackUrl;
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
