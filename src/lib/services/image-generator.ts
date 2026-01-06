import * as FileSystem from 'expo-file-system';

const API_KEY = process.env.EXPO_PUBLIC_VIBECODE_IDEOGRAM_API_KEY;
const API_ENDPOINT = 'https://api.ideogram.ai/v1/ideogram-v3/generate';

export interface GenerationResult {
  id: string;
  name: string;
  success: boolean;
  imageUri?: string;
  error?: string;
}

export async function generateImage(
  prompt: string,
  filename: string
): Promise<{ success: boolean; imageUri?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('aspect_ratio', '1x1');
    formData.append('rendering_speed', 'TURBO');
    formData.append('magic_prompt', 'ON');
    formData.append('style_type', 'REALISTIC');
    formData.append('num_images', '1');

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Api-Key': API_KEY || '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `API request failed with status ${response.status}`,
      };
    }

    const data = await response.json();

    if (!data.data?.[0]?.url) {
      return {
        success: false,
        error: 'No image URL in response',
      };
    }

    const imageUrl = data.data[0].url;
    const fileUri = FileSystem.documentDirectory + filename;

    // Download the image immediately as URLs expire quickly
    await FileSystem.downloadAsync(imageUrl, fileUri);

    return {
      success: true,
      imageUri: fileUri,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Fish-specific prompt generator
export function getFishPrompt(fishName: string, scientificName: string): string {
  return `A photorealistic, high-quality aquarium photograph of a single ${fishName} (${scientificName}) fish swimming in a clean fish tank with soft aquarium lighting. The fish should be clearly visible and in sharp focus against a slightly blurred planted aquarium background. Professional aquarium photography style, natural colors, no text or watermarks.`;
}

// Plant-specific prompt generator
export function getPlantPrompt(plantName: string, scientificName: string): string {
  return `A photorealistic, high-quality aquarium photograph of ${plantName} (${scientificName}) aquatic plant growing in a fish tank aquarium. The plant should be healthy, vibrant green, and clearly visible with good lighting. Professional aquarium plant photography, natural underwater look, soft aquarium lighting, no text or watermarks.`;
}

// Generate all fish images
export async function generateAllFishImages(
  fishList: Array<{ id: string; commonName: string; scientificName: string }>,
  onProgress?: (completed: number, total: number, current: string) => void
): Promise<GenerationResult[]> {
  const results: GenerationResult[] = [];
  const total = fishList.length;

  for (let i = 0; i < fishList.length; i++) {
    const fish = fishList[i];
    onProgress?.(i, total, fish.commonName);

    const prompt = getFishPrompt(fish.commonName, fish.scientificName);
    const filename = `fish_${fish.id}.png`;

    const result = await generateImage(prompt, filename);

    results.push({
      id: fish.id,
      name: fish.commonName,
      success: result.success,
      imageUri: result.imageUri,
      error: result.error,
    });

    // Small delay between requests to avoid rate limiting
    if (i < fishList.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  onProgress?.(total, total, 'Complete');
  return results;
}

// Generate all plant images
export async function generateAllPlantImages(
  plantList: Array<{ id: string; commonName: string; scientificName: string }>,
  onProgress?: (completed: number, total: number, current: string) => void
): Promise<GenerationResult[]> {
  const results: GenerationResult[] = [];
  const total = plantList.length;

  for (let i = 0; i < plantList.length; i++) {
    const plant = plantList[i];
    onProgress?.(i, total, plant.commonName);

    const prompt = getPlantPrompt(plant.commonName, plant.scientificName);
    const filename = `plant_${plant.id}.png`;

    const result = await generateImage(prompt, filename);

    results.push({
      id: plant.id,
      name: plant.commonName,
      success: result.success,
      imageUri: result.imageUri,
      error: result.error,
    });

    // Small delay between requests to avoid rate limiting
    if (i < plantList.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }

  onProgress?.(total, total, 'Complete');
  return results;
}

// Check if an image already exists
export async function checkImageExists(filename: string): Promise<boolean> {
  try {
    const fileUri = FileSystem.documentDirectory + filename;
    const info = await FileSystem.getInfoAsync(fileUri);
    return info.exists;
  } catch {
    return false;
  }
}

// Get the local image URI if it exists
export async function getLocalImageUri(
  type: 'fish' | 'plant',
  id: string
): Promise<string | null> {
  const filename = `${type}_${id}.png`;
  const exists = await checkImageExists(filename);
  if (exists) {
    return FileSystem.documentDirectory + filename;
  }
  return null;
}

// Generate a single fish image on demand
export async function generateFishImageOnDemand(
  id: string,
  commonName: string,
  scientificName: string
): Promise<string | null> {
  const filename = `fish_${id}.png`;

  // Check if already exists
  const exists = await checkImageExists(filename);
  if (exists) {
    return FileSystem.documentDirectory + filename;
  }

  const prompt = getFishPrompt(commonName, scientificName);
  const result = await generateImage(prompt, filename);

  return result.success ? result.imageUri ?? null : null;
}

// Generate a single plant image on demand
export async function generatePlantImageOnDemand(
  id: string,
  commonName: string,
  scientificName: string
): Promise<string | null> {
  const filename = `plant_${id}.png`;

  // Check if already exists
  const exists = await checkImageExists(filename);
  if (exists) {
    return FileSystem.documentDirectory + filename;
  }

  const prompt = getPlantPrompt(commonName, scientificName);
  const result = await generateImage(prompt, filename);

  return result.success ? result.imageUri ?? null : null;
}
