// Simple hooks that return fallback URLs directly
// No AI image generation - uses static images only

export function useFishImage(
  fishId: string,
  fallbackUrl: string,
  commonName?: string,
  scientificName?: string
): string {
  return fallbackUrl;
}

export function usePlantImage(
  plantId: string,
  fallbackUrl: string,
  commonName?: string,
  scientificName?: string
): string {
  return fallbackUrl;
}

export async function getFishImageUrl(
  fishId: string,
  fallbackUrl: string
): Promise<string> {
  return fallbackUrl;
}

export async function getPlantImageUrl(
  plantId: string,
  fallbackUrl: string
): Promise<string> {
  return fallbackUrl;
}

export function clearImageCache() {
  // No-op - no cache to clear
}
