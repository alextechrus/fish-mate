import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  generateFishImageOnDemand,
  generatePlantImageOnDemand,
} from '@/lib/services/image-generator';

const GENERATED_IMAGES_KEY = 'fishmate_generated_images';

interface GeneratedImagesStore {
  fish: Record<string, string>;
  plants: Record<string, string>;
}

let cachedImages: GeneratedImagesStore | null = null;
let pendingGenerations: Set<string> = new Set();

// Load images synchronously from cache
async function loadImagesFromStorage(): Promise<GeneratedImagesStore> {
  if (cachedImages) return cachedImages;

  try {
    const stored = await AsyncStorage.getItem(GENERATED_IMAGES_KEY);
    if (stored) {
      cachedImages = JSON.parse(stored);
      return cachedImages!;
    }
  } catch (error) {
    console.error('Failed to load generated images:', error);
  }

  cachedImages = { fish: {}, plants: {} };
  return cachedImages;
}

// Save image to storage
async function saveImageToStorage(
  type: 'fish' | 'plants',
  id: string,
  uri: string
): Promise<void> {
  const images = await loadImagesFromStorage();
  images[type][id] = uri;
  cachedImages = images;
  await AsyncStorage.setItem(GENERATED_IMAGES_KEY, JSON.stringify(images));
}

// Hook to get a fish image URL (generated or fallback)
// Will auto-generate if image doesn't exist
export function useFishImage(
  fishId: string,
  fallbackUrl: string,
  commonName?: string,
  scientificName?: string
): string {
  const [imageUrl, setImageUrl] = useState(fallbackUrl);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadOrGenerateImage() {
      const images = await loadImagesFromStorage();
      const generatedUri = images.fish[fishId];

      if (generatedUri && mounted) {
        // Verify file exists
        try {
          const info = await FileSystem.getInfoAsync(generatedUri);
          if (info.exists) {
            setImageUrl(generatedUri);
            return;
          }
        } catch {
          // File doesn't exist, will try to generate
        }
      }

      // If we have name info and no image, auto-generate
      if (commonName && scientificName && !pendingGenerations.has(fishId)) {
        pendingGenerations.add(fishId);
        setIsGenerating(true);

        try {
          const generatedImageUri = await generateFishImageOnDemand(
            fishId,
            commonName,
            scientificName
          );

          if (generatedImageUri && mounted) {
            await saveImageToStorage('fish', fishId, generatedImageUri);
            setImageUrl(generatedImageUri);
          }
        } catch (error) {
          console.error(`Failed to generate image for fish ${fishId}:`, error);
        } finally {
          pendingGenerations.delete(fishId);
          if (mounted) setIsGenerating(false);
        }
      }
    }

    loadOrGenerateImage();

    return () => {
      mounted = false;
    };
  }, [fishId, fallbackUrl, commonName, scientificName]);

  return imageUrl;
}

// Hook to get a plant image URL (generated or fallback)
// Will auto-generate if image doesn't exist
export function usePlantImage(
  plantId: string,
  fallbackUrl: string,
  commonName?: string,
  scientificName?: string
): string {
  const [imageUrl, setImageUrl] = useState(fallbackUrl);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadOrGenerateImage() {
      const images = await loadImagesFromStorage();
      const generatedUri = images.plants[plantId];

      if (generatedUri && mounted) {
        // Verify file exists
        try {
          const info = await FileSystem.getInfoAsync(generatedUri);
          if (info.exists) {
            setImageUrl(generatedUri);
            return;
          }
        } catch {
          // File doesn't exist, will try to generate
        }
      }

      // If we have name info and no image, auto-generate
      if (commonName && scientificName && !pendingGenerations.has(plantId)) {
        pendingGenerations.add(plantId);
        setIsGenerating(true);

        try {
          const generatedImageUri = await generatePlantImageOnDemand(
            plantId,
            commonName,
            scientificName
          );

          if (generatedImageUri && mounted) {
            await saveImageToStorage('plants', plantId, generatedImageUri);
            setImageUrl(generatedImageUri);
          }
        } catch (error) {
          console.error(
            `Failed to generate image for plant ${plantId}:`,
            error
          );
        } finally {
          pendingGenerations.delete(plantId);
          if (mounted) setIsGenerating(false);
        }
      }
    }

    loadOrGenerateImage();

    return () => {
      mounted = false;
    };
  }, [plantId, fallbackUrl, commonName, scientificName]);

  return imageUrl;
}

// Function to get image URL synchronously (for list rendering)
export async function getFishImageUrl(
  fishId: string,
  fallbackUrl: string
): Promise<string> {
  const images = await loadImagesFromStorage();
  const generatedUri = images.fish[fishId];

  if (generatedUri) {
    try {
      const info = await FileSystem.getInfoAsync(generatedUri);
      if (info.exists) {
        return generatedUri;
      }
    } catch {
      // Use fallback
    }
  }

  return fallbackUrl;
}

export async function getPlantImageUrl(
  plantId: string,
  fallbackUrl: string
): Promise<string> {
  const images = await loadImagesFromStorage();
  const generatedUri = images.plants[plantId];

  if (generatedUri) {
    try {
      const info = await FileSystem.getInfoAsync(generatedUri);
      if (info.exists) {
        return generatedUri;
      }
    } catch {
      // Use fallback
    }
  }

  return fallbackUrl;
}

// Clear cache when images are updated
export function clearImageCache() {
  cachedImages = null;
}
