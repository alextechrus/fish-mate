// Hooks for getting species images
// Uses AI-generated images from the species-images database
// Falls back to original URLs if generated image not available

import { ImageSourcePropType } from 'react-native';
import { fishImages, plantImages } from '../data/species-images';
import { ImageSource } from '../types/fish';

/**
 * Get the image source for a fish species
 * Uses AI-generated images when available, falls back to provided URL/asset
 * Returns an ImageSourcePropType that can be used directly with Image component
 */
export function useFishImageSource(
  fishId: string,
  fallbackUrl: ImageSource,
  commonName?: string,
  scientificName?: string
): ImageSourcePropType {
  // Check if we have a generated image for this fish
  const generatedImage = fishImages[fishId];
  if (generatedImage) {
    return generatedImage;
  }

  // Handle fallback - could be a require() number or a URL string
  if (typeof fallbackUrl === 'number') {
    return fallbackUrl;
  }
  return { uri: fallbackUrl };
}

/**
 * Get the image source for a plant species
 * Uses AI-generated images when available, falls back to provided URL/asset
 * Returns an ImageSourcePropType that can be used directly with Image component
 */
export function usePlantImageSource(
  plantId: string,
  fallbackUrl: ImageSource,
  commonName?: string,
  scientificName?: string
): ImageSourcePropType {
  // Check if we have a generated image for this plant
  const generatedImage = plantImages[plantId];
  if (generatedImage) {
    return generatedImage;
  }

  // Handle fallback - could be a require() number or a URL string
  if (typeof fallbackUrl === 'number') {
    return fallbackUrl;
  }
  return { uri: fallbackUrl };
}

/**
 * Legacy function - maintained for backwards compatibility but now handles both types
 * Returns ImageSourcePropType that can be used directly with Image component
 * @deprecated Use useFishImageSource instead
 */
export function useFishImage(
  fishId: string,
  fallbackUrl: ImageSource,
  commonName?: string,
  scientificName?: string
): ImageSourcePropType {
  return useFishImageSource(fishId, fallbackUrl, commonName, scientificName);
}

/**
 * Legacy function - maintained for backwards compatibility but now handles both types
 * Returns ImageSourcePropType that can be used directly with Image component
 * @deprecated Use usePlantImageSource instead
 */
export function usePlantImage(
  plantId: string,
  fallbackUrl: ImageSource,
  commonName?: string,
  scientificName?: string
): ImageSourcePropType {
  return usePlantImageSource(plantId, fallbackUrl, commonName, scientificName);
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
