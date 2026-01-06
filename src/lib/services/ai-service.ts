import { Fish, CompatibilityResult } from '../types/fish';

const NANO_BANANA_API_URL = 'https://api.nanobanana.com/v1/chat/completions';

interface AICompatibilityExplanation {
  summary: string;
  detailedReasoning: string;
  tips: string[];
  alternativeSuggestions?: string[];
}

export const generateCompatibilityExplanation = async (
  result: CompatibilityResult
): Promise<AICompatibilityExplanation> => {
  const apiKey = process.env.EXPO_PUBLIC_NANOBANANA_API_KEY;

  if (!apiKey) {
    // Return a default explanation if no API key
    return getDefaultExplanation(result);
  }

  const prompt = buildCompatibilityPrompt(result);

  try {
    const response = await fetch(NANO_BANANA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'nanobanana-pro',
        messages: [
          {
            role: 'system',
            content: `You are an expert aquarium consultant. Provide helpful, accurate advice about fish compatibility in a friendly, beginner-accessible way. Always prioritize fish welfare. Respond in JSON format with keys: summary (1-2 sentences), detailedReasoning (2-3 paragraphs), tips (array of 3-5 practical tips), alternativeSuggestions (array of fish names if incompatible).`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        return JSON.parse(content);
      } catch {
        return getDefaultExplanation(result);
      }
    }

    return getDefaultExplanation(result);
  } catch (error) {
    console.log('AI explanation error:', error);
    return getDefaultExplanation(result);
  }
};

export const generateTankSuggestions = async (
  currentFish: Fish[],
  tankSize: number
): Promise<string[]> => {
  const apiKey = process.env.EXPO_PUBLIC_NANOBANANA_API_KEY;

  if (!apiKey || currentFish.length === 0) {
    return getDefaultSuggestions(currentFish);
  }

  const fishNames = currentFish.map(f => f.commonName).join(', ');
  const waterType = currentFish[0].waterType;

  try {
    const response = await fetch(NANO_BANANA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'nanobanana-pro',
        messages: [
          {
            role: 'system',
            content: 'You are an expert aquarium consultant. Suggest compatible fish for an existing tank setup. Respond with only a JSON array of 5 fish common names that would be compatible.',
          },
          {
            role: 'user',
            content: `I have a ${tankSize} gallon ${waterType} tank with: ${fishNames}. What other fish would be compatible?`,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (content) {
      try {
        return JSON.parse(content);
      } catch {
        return getDefaultSuggestions(currentFish);
      }
    }

    return getDefaultSuggestions(currentFish);
  } catch (error) {
    console.log('AI suggestions error:', error);
    return getDefaultSuggestions(currentFish);
  }
};

const buildCompatibilityPrompt = (result: CompatibilityResult): string => {
  const { fish1, fish2, status, reasons, warnings } = result;

  return `
Explain the compatibility between ${fish1.commonName} (${fish1.scientificName}) and ${fish2.commonName} (${fish2.scientificName}).

Fish 1 Details:
- Temperament: ${fish1.temperament}
- Size: up to ${fish1.maxSize} inches
- Water type: ${fish1.waterType}
- Temperature: ${fish1.waterParameters.temperatureMin}-${fish1.waterParameters.temperatureMax}°F
- pH: ${fish1.waterParameters.phMin}-${fish1.waterParameters.phMax}
- Tank zone: ${fish1.tankZone}
- Diet: ${fish1.diet}

Fish 2 Details:
- Temperament: ${fish2.temperament}
- Size: up to ${fish2.maxSize} inches
- Water type: ${fish2.waterType}
- Temperature: ${fish2.waterParameters.temperatureMin}-${fish2.waterParameters.temperatureMax}°F
- pH: ${fish2.waterParameters.phMin}-${fish2.waterParameters.phMax}
- Tank zone: ${fish2.tankZone}
- Diet: ${fish2.diet}

Compatibility Status: ${status}
${reasons.length > 0 ? `Reasons: ${reasons.join('; ')}` : ''}
${warnings && warnings.length > 0 ? `Warnings: ${warnings.join('; ')}` : ''}

Provide a beginner-friendly explanation of why these fish are ${status} and practical tips for keeping them together (or alternatives if incompatible).
`;
};

const getDefaultExplanation = (result: CompatibilityResult): AICompatibilityExplanation => {
  const { fish1, fish2, status, reasons, warnings, suggestions } = result;

  if (status === 'compatible') {
    return {
      summary: `${fish1.commonName} and ${fish2.commonName} make great tank mates!`,
      detailedReasoning: `These two species have compatible temperaments and overlapping water parameter requirements. Their similar care needs make them an excellent combination for a community tank.\n\n${fish1.commonName} prefers the ${fish1.tankZone} of the tank while ${fish2.commonName} prefers the ${fish2.tankZone}, which helps reduce territorial conflicts.`,
      tips: [
        'Introduce both fish at the same time if possible',
        'Ensure your tank meets both species\' minimum size requirements',
        'Provide appropriate hiding spots and plants',
        'Monitor water parameters regularly',
        'Feed a varied diet suitable for both species',
      ],
    };
  }

  if (status === 'conditional') {
    return {
      summary: `${fish1.commonName} and ${fish2.commonName} can potentially live together with some precautions.`,
      detailedReasoning: `While these fish can coexist, there are some considerations to keep in mind. ${warnings?.join(' ') || 'Close monitoring is recommended.'}\n\nSuccess often depends on tank size, individual fish personalities, and providing adequate space and hiding spots.`,
      tips: [
        'Use a larger tank than the minimum requirement',
        'Add plenty of hiding spaces and visual barriers',
        'Monitor fish behavior closely, especially during the first few weeks',
        'Have a backup plan in case fish don\'t get along',
        ...(suggestions || []),
      ],
    };
  }

  // Incompatible
  return {
    summary: `Unfortunately, ${fish1.commonName} and ${fish2.commonName} are not compatible.`,
    detailedReasoning: `These species should not be kept together. ${reasons.join(' ')}\n\nAttempting to house these fish together would likely result in stress, injury, or death for one or both species.`,
    tips: [
      'Keep these fish in separate tanks',
      'Research compatible alternatives',
      'Consider your existing fish when planning new additions',
    ],
    alternativeSuggestions: fish1.compatibleWith.slice(0, 5),
  };
};

const getDefaultSuggestions = (currentFish: Fish[]): string[] => {
  if (currentFish.length === 0) {
    return ['Neon Tetra', 'Corydoras', 'Guppy', 'Platy', 'Molly'];
  }

  const waterType = currentFish[0].waterType;

  if (waterType === 'saltwater') {
    return ['Clownfish', 'Royal Gramma', 'Firefish', 'Cardinalfish', 'Chromis'];
  }

  return ['Corydoras', 'Otocinclus', 'Harlequin Rasbora', 'Cherry Barb', 'Bristlenose Pleco'];
};
