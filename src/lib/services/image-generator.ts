import * as FileSystem from 'expo-file-system';

const API_KEY = process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY;
const API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent';

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
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'x-goog-api-key': API_KEY || '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ['Image'],
          imageConfig: { aspectRatio: '1:1', imageSize: '1K' },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error?.message || 'API request failed',
      };
    }

    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: { data: string } }) => p.inlineData
    );

    if (!imagePart) {
      return {
        success: false,
        error: 'No image generated from API',
      };
    }

    const base64Image = imagePart.inlineData.data;
    const fileUri = FileSystem.documentDirectory + filename;

    await FileSystem.writeAsStringAsync(fileUri, base64Image, {
      encoding: FileSystem.EncodingType.Base64,
    });

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
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
