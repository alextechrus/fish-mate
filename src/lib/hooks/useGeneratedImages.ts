import { useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GENERATED_IMAGES_KEY = 'fishmate_generated_images';

interface GeneratedImagesStore {
  fish: Record<string, string>; // id -> local file URI
  plants: Record<string, string>; // id -> local file URI
}

export function useGeneratedImages() {
  const [images, setImages] = useState<GeneratedImagesStore>({
    fish: {},
    plants: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load stored image mappings on mount
  useEffect(() => {
    loadStoredImages();
  }, []);

  const loadStoredImages = async () => {
    try {
      const stored = await AsyncStorage.getItem(GENERATED_IMAGES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as GeneratedImagesStore;
        // Verify files still exist
        const validFish: Record<string, string> = {};
        const validPlants: Record<string, string> = {};

        for (const [id, uri] of Object.entries(parsed.fish)) {
          const info = await FileSystem.getInfoAsync(uri);
          if (info.exists) {
            validFish[id] = uri;
          }
        }

        for (const [id, uri] of Object.entries(parsed.plants)) {
          const info = await FileSystem.getInfoAsync(uri);
          if (info.exists) {
            validPlants[id] = uri;
          }
        }

        setImages({ fish: validFish, plants: validPlants });
      }
    } catch (error) {
      console.error('Failed to load stored images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveImageMapping = useCallback(
    async (type: 'fish' | 'plants', id: string, uri: string) => {
      setImages((prev) => {
        const updated = {
          ...prev,
          [type]: {
            ...prev[type],
            [id]: uri,
          },
        };
        // Persist to storage
        AsyncStorage.setItem(GENERATED_IMAGES_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const getFishImage = useCallback(
    (id: string, fallbackUrl: string): string => {
      return images.fish[id] || fallbackUrl;
    },
    [images.fish]
  );

  const getPlantImage = useCallback(
    (id: string, fallbackUrl: string): string => {
      return images.plants[id] || fallbackUrl;
    },
    [images.plants]
  );

  const hasFishImage = useCallback(
    (id: string): boolean => {
      return !!images.fish[id];
    },
    [images.fish]
  );

  const hasPlantImage = useCallback(
    (id: string): boolean => {
      return !!images.plants[id];
    },
    [images.plants]
  );

  const clearAllImages = useCallback(async () => {
    // Delete all files
    for (const uri of Object.values(images.fish)) {
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch (e) {
        console.error('Failed to delete fish image:', e);
      }
    }
    for (const uri of Object.values(images.plants)) {
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      } catch (e) {
        console.error('Failed to delete plant image:', e);
      }
    }
    // Clear storage
    await AsyncStorage.removeItem(GENERATED_IMAGES_KEY);
    setImages({ fish: {}, plants: {} });
  }, [images]);

  return {
    images,
    isLoading,
    saveImageMapping,
    getFishImage,
    getPlantImage,
    hasFishImage,
    hasPlantImage,
    clearAllImages,
    fishCount: Object.keys(images.fish).length,
    plantCount: Object.keys(images.plants).length,
  };
}
