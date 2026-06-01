// Image Generation Service for Fish and Plant Species
// Uses OpenAI's gpt-image-1 model to generate realistic aquarium images

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;

interface GeneratedImage {
  id: string;
  type: 'fish' | 'plant';
  commonName: string;
  scientificName: string;
  imageUrl: string;
  generatedAt: string;
}

/**
 * Generate an AI image for a fish species in an aquarium setting
 */
export async function generateFishImage(
  commonName: string,
  scientificName: string
): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured');
    return null;
  }

  const prompt = `A beautiful, realistic photograph of a ${commonName} (${scientificName}) swimming in a planted freshwater aquarium tank. The fish should be the main focus, clearly visible and well-lit. The background shows a natural aquarium environment with plants, gravel substrate, and soft lighting. Professional aquarium photography style, high detail, vibrant colors.`;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Image generation failed:', error);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch (error) {
    console.error('Error generating fish image:', error);
    return null;
  }
}

/**
 * Generate an AI image for a plant species in an aquarium setting
 */
export async function generatePlantImage(
  commonName: string,
  scientificName: string
): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured');
    return null;
  }

  const prompt = `A beautiful, realistic photograph of ${commonName} (${scientificName}) aquatic plant growing in a planted freshwater aquarium tank. The plant should be the main focus, showing its distinctive leaf structure and natural growth pattern. The background shows a natural aquarium environment with substrate, other plants, and soft lighting. Professional aquascaping photography style, high detail, lush green colors.`;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Image generation failed:', error);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch (error) {
    console.error('Error generating plant image:', error);
    return null;
  }
}

/**
 * Generate an AI image and return base64 for storage
 */
export async function generateImageBase64(
  type: 'fish' | 'plant',
  commonName: string,
  scientificName: string
): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured');
    return null;
  }

  const prompt = type === 'fish'
    ? `A beautiful, realistic photograph of a ${commonName} (${scientificName}) swimming in a planted freshwater aquarium tank. The fish should be the main focus, clearly visible and well-lit. The background shows a natural aquarium environment with plants, gravel substrate, and soft lighting. Professional aquarium photography style, high detail, vibrant colors.`
    : `A beautiful, realistic photograph of ${commonName} (${scientificName}) aquatic plant growing in a planted freshwater aquarium tank. The plant should be the main focus, showing its distinctive leaf structure and natural growth pattern. The background shows a natural aquarium environment with substrate, other plants, and soft lighting. Professional aquascaping photography style, high detail, lush green colors.`;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Image generation failed:', error);
      return null;
    }

    const data = await response.json();
    const base64 = data.data?.[0]?.b64_json;
    return base64 ? `data:image/png;base64,${base64}` : null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

/**
 * Generate a default empty aquarium tank image (called once, cached by the caller)
 */
export async function generateEmptyTankImage(): Promise<string | null> {
  if (!OPENAI_API_KEY) return null;

  const prompt =
    'A pristine professional photograph of a brand-new empty freshwater aquarium tank. ' +
    'Crystal clear water, fine natural gravel substrate, spotless glass panels, soft aquarium lighting. ' +
    'Absolutely no fish, no plants, no decorations — completely empty and ready to be set up. ' +
    'Commercial aquarium photography, studio quality, realistic.';

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify({ model: 'gpt-image-1', prompt, n: 1, size: '1024x1024' }),
    });
    if (!response.ok) { console.error('Empty tank generation failed:', await response.text()); return null; }
    const data = await response.json();
    const b64 = data.data?.[0]?.b64_json;
    if (b64) return `data:image/png;base64,${b64}`;
    return data.data?.[0]?.url ?? null;
  } catch (e) { console.error('Error generating empty tank image:', e); return null; }
}

/**
 * Generate an AI image of a complete aquarium tank with specified fish and plants
 */
export async function generateTankImage(
  fishNames: string[],
  plantNames: string[],
  waterType: 'freshwater' | 'saltwater',
  isDirty: boolean
): Promise<string | null> {
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API key not configured');
    return null;
  }

  const fishList = fishNames.length > 0 ? fishNames.join(', ') : 'tropical fish';
  const plantDesc = plantNames.length > 0
    ? `planted with ${plantNames.join(', ')}`
    : 'with natural gravel substrate and minimal hardscape';
  const waterDesc = waterType === 'saltwater' ? 'saltwater marine reef' : 'freshwater planted';

  const prompt = isDirty
    ? `A neglected ${waterDesc} aquarium tank containing ${fishList} fish, ${plantDesc}. ` +
      `Murky cloudy green water, algae coating the inside glass, debris on the substrate, brown deteriorating plants. ` +
      `The fish are clearly identifiable as ${fishList}. Realistic aquarium photography.`
    : `A stunning professional ${waterDesc} aquarium tank containing ${fishList} fish, ${plantDesc}. ` +
      `The fish are swimming naturally and are clearly recognisable as ${fishList}. ` +
      `Crystal clear water, spotless glass, vibrant healthy plants, perfect aquarium lighting, beautiful aquascape. ` +
      `National Geographic quality aquarium photography, highly realistic and detailed.`;

  try {
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt,
        n: 1,
        size: '1024x1024',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Tank image generation failed:', error);
      return null;
    }

    const data = await response.json();
    // gpt-image-1 returns b64_json by default; fall back to url if present
    const b64 = data.data?.[0]?.b64_json;
    if (b64) return `data:image/png;base64,${b64}`;
    const url = data.data?.[0]?.url;
    if (url) return url;
    return null;
  } catch (error) {
    console.error('Error generating tank image:', error);
    return null;
  }
}
