import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import {
  ChevronLeft,
  Wand2,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { fishDatabase } from '@/lib/data/fish-database';
import { plantDatabase } from '@/lib/data/plant-database';
import { cn } from '@/lib/cn';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY;

interface GenerationResult {
  id: string;
  name: string;
  status: 'pending' | 'generating' | 'success' | 'error';
  imageUrl?: string;
  error?: string;
}

export default function GenerateImagesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentType, setCurrentType] = useState<'fish' | 'plant' | null>(null);
  const [fishResults, setFishResults] = useState<GenerationResult[]>(
    fishDatabase.map((f) => ({
      id: f.id,
      name: f.commonName,
      status: 'pending',
    }))
  );
  const [plantResults, setPlantResults] = useState<GenerationResult[]>(
    plantDatabase.map((p) => ({
      id: p.id,
      name: p.commonName,
      status: 'pending',
    }))
  );
  const [generatedCode, setGeneratedCode] = useState<string>('');

  const generateImage = useCallback(
    async (
      type: 'fish' | 'plant',
      id: string,
      commonName: string,
      scientificName: string
    ): Promise<string | null> => {
      if (!OPENAI_API_KEY) {
        console.error('OpenAI API key not configured');
        return null;
      }

      const prompt =
        type === 'fish'
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
        console.error('Error generating image:', error);
        return null;
      }
    },
    []
  );

  const generateAllFishImages = useCallback(async () => {
    setIsGenerating(true);
    setCurrentType('fish');

    const results: Record<string, string> = {};

    for (let i = 0; i < fishDatabase.length; i++) {
      const fish = fishDatabase[i];

      // Update status to generating
      setFishResults((prev) =>
        prev.map((r) =>
          r.id === fish.id ? { ...r, status: 'generating' } : r
        )
      );

      try {
        const imageUrl = await generateImage(
          'fish',
          fish.id,
          fish.commonName,
          fish.scientificName
        );

        if (imageUrl) {
          results[fish.id] = imageUrl;
          setFishResults((prev) =>
            prev.map((r) =>
              r.id === fish.id
                ? { ...r, status: 'success', imageUrl }
                : r
            )
          );
        } else {
          setFishResults((prev) =>
            prev.map((r) =>
              r.id === fish.id
                ? { ...r, status: 'error', error: 'Generation failed' }
                : r
            )
          );
        }
      } catch (error) {
        setFishResults((prev) =>
          prev.map((r) =>
            r.id === fish.id
              ? { ...r, status: 'error', error: String(error) }
              : r
          )
        );
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Generate code snippet
    const codeSnippet = `export const fishImages: Record<string, string> = {\n${Object.entries(
      results
    )
      .map(([id, url]) => `  '${id}': '${url}',`)
      .join('\n')}\n};`;

    setGeneratedCode((prev) => prev + '\n\n// FISH IMAGES\n' + codeSnippet);
    setIsGenerating(false);
    setCurrentType(null);
  }, [generateImage]);

  const generateAllPlantImages = useCallback(async () => {
    setIsGenerating(true);
    setCurrentType('plant');

    const results: Record<string, string> = {};

    for (let i = 0; i < plantDatabase.length; i++) {
      const plant = plantDatabase[i];

      // Update status to generating
      setPlantResults((prev) =>
        prev.map((r) =>
          r.id === plant.id ? { ...r, status: 'generating' } : r
        )
      );

      try {
        const imageUrl = await generateImage(
          'plant',
          plant.id,
          plant.commonName,
          plant.scientificName
        );

        if (imageUrl) {
          results[plant.id] = imageUrl;
          setPlantResults((prev) =>
            prev.map((r) =>
              r.id === plant.id
                ? { ...r, status: 'success', imageUrl }
                : r
            )
          );
        } else {
          setPlantResults((prev) =>
            prev.map((r) =>
              r.id === plant.id
                ? { ...r, status: 'error', error: 'Generation failed' }
                : r
            )
          );
        }
      } catch (error) {
        setPlantResults((prev) =>
          prev.map((r) =>
            r.id === plant.id
              ? { ...r, status: 'error', error: String(error) }
              : r
          )
        );
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    // Generate code snippet
    const codeSnippet = `export const plantImages: Record<string, string> = {\n${Object.entries(
      results
    )
      .map(([id, url]) => `  '${id}': '${url}',`)
      .join('\n')}\n};`;

    setGeneratedCode((prev) => prev + '\n\n// PLANT IMAGES\n' + codeSnippet);
    setIsGenerating(false);
    setCurrentType(null);
  }, [generateImage]);

  const getStatusIcon = (status: GenerationResult['status']) => {
    switch (status) {
      case 'generating':
        return <ActivityIndicator size="small" color="#0EA5E9" />;
      case 'success':
        return <CheckCircle2 size={20} color="#10B981" />;
      case 'error':
        return <XCircle size={20} color="#EF4444" />;
      default:
        return <ImageIcon size={20} color={isDark ? '#64748B' : '#94A3B8'} />;
    }
  };

  const successCount = (results: GenerationResult[]) =>
    results.filter((r) => r.status === 'success').length;

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#8B5CF6', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 20,
          }}
        >
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3"
            >
              <ChevronLeft size={24} color="white" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">
                Generate AI Images
              </Text>
              <Text className="text-white/80 text-sm">
                Create images for all species
              </Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView className="flex-1 px-5 pt-4">
          {/* API Key Warning */}
          {!OPENAI_API_KEY && (
            <View className="bg-amber-500/20 rounded-xl p-4 mb-4">
              <Text className="text-amber-600 font-semibold">
                OpenAI API Key Required
              </Text>
              <Text className="text-amber-600/80 text-sm mt-1">
                Add EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY to your environment
                variables in the ENV tab.
              </Text>
            </View>
          )}

          {/* Fish Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className={cn(
                  'text-lg font-bold',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                Fish Images ({successCount(fishResults)}/{fishResults.length})
              </Text>
              <Pressable
                onPress={generateAllFishImages}
                disabled={isGenerating}
                className={cn(
                  'flex-row items-center px-4 py-2 rounded-full',
                  isGenerating && currentType === 'fish'
                    ? 'bg-slate-300'
                    : 'bg-purple-500'
                )}
              >
                {isGenerating && currentType === 'fish' ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Wand2 size={16} color="white" />
                )}
                <Text className="text-white font-semibold ml-2">
                  {isGenerating && currentType === 'fish'
                    ? 'Generating...'
                    : 'Generate All'}
                </Text>
              </Pressable>
            </View>

            <View
              className={cn(
                'rounded-xl overflow-hidden',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
            >
              {fishResults.map((result, index) => (
                <View
                  key={result.id}
                  className={cn(
                    'flex-row items-center p-3',
                    index < fishResults.length - 1 &&
                      (isDark ? 'border-b border-slate-700' : 'border-b border-slate-100')
                  )}
                >
                  {result.imageUrl ? (
                    <Image
                      source={{ uri: result.imageUrl }}
                      className="w-10 h-10 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      className={cn(
                        'w-10 h-10 rounded-lg items-center justify-center',
                        isDark ? 'bg-slate-700' : 'bg-slate-100'
                      )}
                    >
                      <ImageIcon
                        size={20}
                        color={isDark ? '#64748B' : '#94A3B8'}
                      />
                    </View>
                  )}
                  <Text
                    className={cn(
                      'flex-1 ml-3 font-medium',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    {result.name}
                  </Text>
                  {getStatusIcon(result.status)}
                </View>
              ))}
            </View>
          </View>

          {/* Plant Section */}
          <View className="mb-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text
                className={cn(
                  'text-lg font-bold',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                Plant Images ({successCount(plantResults)}/{plantResults.length})
              </Text>
              <Pressable
                onPress={generateAllPlantImages}
                disabled={isGenerating}
                className={cn(
                  'flex-row items-center px-4 py-2 rounded-full',
                  isGenerating && currentType === 'plant'
                    ? 'bg-slate-300'
                    : 'bg-emerald-500'
                )}
              >
                {isGenerating && currentType === 'plant' ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Wand2 size={16} color="white" />
                )}
                <Text className="text-white font-semibold ml-2">
                  {isGenerating && currentType === 'plant'
                    ? 'Generating...'
                    : 'Generate All'}
                </Text>
              </Pressable>
            </View>

            <View
              className={cn(
                'rounded-xl overflow-hidden',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
            >
              {plantResults.map((result, index) => (
                <View
                  key={result.id}
                  className={cn(
                    'flex-row items-center p-3',
                    index < plantResults.length - 1 &&
                      (isDark ? 'border-b border-slate-700' : 'border-b border-slate-100')
                  )}
                >
                  {result.imageUrl ? (
                    <Image
                      source={{ uri: result.imageUrl }}
                      className="w-10 h-10 rounded-lg"
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      className={cn(
                        'w-10 h-10 rounded-lg items-center justify-center',
                        isDark ? 'bg-slate-700' : 'bg-slate-100'
                      )}
                    >
                      <ImageIcon
                        size={20}
                        color={isDark ? '#64748B' : '#94A3B8'}
                      />
                    </View>
                  )}
                  <Text
                    className={cn(
                      'flex-1 ml-3 font-medium',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    {result.name}
                  </Text>
                  {getStatusIcon(result.status)}
                </View>
              ))}
            </View>
          </View>

          {/* Generated Code Output */}
          {generatedCode && (
            <View className="mb-8">
              <Text
                className={cn(
                  'text-lg font-bold mb-3',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                Generated Code (Copy this)
              </Text>
              <View
                className={cn(
                  'rounded-xl p-4',
                  isDark ? 'bg-slate-800' : 'bg-slate-100'
                )}
              >
                <Text
                  className={cn(
                    'text-xs font-mono',
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  )}
                  selectable
                >
                  {generatedCode}
                </Text>
              </View>
            </View>
          )}

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
