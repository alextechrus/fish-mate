import { useState, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GENERATED_IMAGES_KEY = 'fishmate_generated_images';

interface GeneratedImagesStore {
  fish: Record<string, string>;
  plants: Record<string, string>;
}

let cachedImages: GeneratedImagesStore | null = null;

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

  return { fish: {}, plants: {} };
}

// Hook to get a fish image URL (generated or fallback)
export function useFishImage(fishId: string, fallbackUrl: string): string {
  const [imageUrl, setImageUrl] = useState(fallbackUrl);

  useEffect(() => {
    let mounted = true;

    async function loadImage() {
      const images = await loadImagesFromStorage();
      const generatedUri = images.fish[fishId];

      if (generatedUri && mounted) {
        // Verify file exists
        try {
          const info = await FileSystem.getInfoAsync(generatedUri);
          if (info.exists) {
            setImageUrl(generatedUri);
          }
        } catch {
          // Use fallback
        }
      }
    }

    loadImage();

    return () => {
      mounted = false;
    };
  }, [fishId, fallbackUrl]);

  return imageUrl;
}

// Hook to get a plant image URL (generated or fallback)
export function usePlantImage(plantId: string, fallbackUrl: string): string {
  const [imageUrl, setImageUrl] = useState(fallbackUrl);

  useEffect(() => {
    let mounted = true;

    async function loadImage() {
      const images = await loadImagesFromStorage();
      const generatedUri = images.plants[plantId];

      if (generatedUri && mounted) {
        // Verify file exists
        try {
          const info = await FileSystem.getInfoAsync(generatedUri);
          if (info.exists) {
            setImageUrl(generatedUri);
          }
        } catch {
          // Use fallback
        }
      }
    }

    loadImage();

    return () => {
      mounted = false;
    };
  }, [plantId, fallbackUrl]);

  return imageUrl;
}

// Function to get image URL synchronously (for list rendering)
export async function getFishImageUrl(fishId: string, fallbackUrl: string): Promise<string> {
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

export async function getPlantImageUrl(plantId: string, fallbackUrl: string): Promise<string> {
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
