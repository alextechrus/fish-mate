import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Sparkles,
  Fish as FishIcon,
  Leaf,
  CheckCircle,
  XCircle,
  RefreshCw,
  Trash2,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { cn } from '@/lib/cn';
import { fishDatabase } from '@/lib/data/fish-database';
import { plantDatabase } from '@/lib/data/plant-database';
import {
  generateImage,
  getFishPrompt,
  getPlantPrompt,
  GenerationResult,
} from '@/lib/services/image-generator';
import { useGeneratedImages } from '@/lib/hooks/useGeneratedImages';

type GenerationStatus = 'idle' | 'generating' | 'complete';

interface ItemStatus {
  id: string;
  name: string;
  status: 'pending' | 'generating' | 'success' | 'error';
  imageUri?: string;
  error?: string;
}

export default function GenerateImagesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const {
    saveImageMapping,
    hasFishImage,
    hasPlantImage,
    fishCount,
    plantCount,
    clearAllImages,
  } = useGeneratedImages();

  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>('idle');
  const [currentItem, setCurrentItem] = useState<string>('');
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [fishStatuses, setFishStatuses] = useState<ItemStatus[]>([]);
  const [plantStatuses, setPlantStatuses] = useState<ItemStatus[]>([]);

  const generateFishImages = useCallback(async () => {
    setGenerationStatus('generating');
    const statuses: ItemStatus[] = fishDatabase.map((fish) => ({
      id: fish.id,
      name: fish.commonName,
      status: hasFishImage(fish.id) ? 'success' : 'pending',
      imageUri: undefined,
    }));
    setFishStatuses(statuses);
    setProgress({ current: 0, total: fishDatabase.length });

    for (let i = 0; i < fishDatabase.length; i++) {
      const fish = fishDatabase[i];

      // Skip if already has image
      if (hasFishImage(fish.id)) {
        setProgress({ current: i + 1, total: fishDatabase.length });
        continue;
      }

      setCurrentItem(fish.commonName);

      // Update status to generating
      setFishStatuses((prev) =>
        prev.map((s) =>
          s.id === fish.id ? { ...s, status: 'generating' } : s
        )
      );

      const prompt = getFishPrompt(fish.commonName, fish.scientificName);
      const filename = `fish_${fish.id}.png`;

      const result = await generateImage(prompt, filename);

      if (result.success && result.imageUri) {
        await saveImageMapping('fish', fish.id, result.imageUri);
        setFishStatuses((prev) =>
          prev.map((s) =>
            s.id === fish.id
              ? { ...s, status: 'success', imageUri: result.imageUri }
              : s
          )
        );
      } else {
        setFishStatuses((prev) =>
          prev.map((s) =>
            s.id === fish.id
              ? { ...s, status: 'error', error: result.error }
              : s
          )
        );
      }

      setProgress({ current: i + 1, total: fishDatabase.length });

      // Delay between requests
      if (i < fishDatabase.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    setGenerationStatus('complete');
    setCurrentItem('');
  }, [hasFishImage, saveImageMapping]);

  const generatePlantImages = useCallback(async () => {
    setGenerationStatus('generating');
    const statuses: ItemStatus[] = plantDatabase.map((plant) => ({
      id: plant.id,
      name: plant.commonName,
      status: hasPlantImage(plant.id) ? 'success' : 'pending',
      imageUri: undefined,
    }));
    setPlantStatuses(statuses);
    setProgress({ current: 0, total: plantDatabase.length });

    for (let i = 0; i < plantDatabase.length; i++) {
      const plant = plantDatabase[i];

      // Skip if already has image
      if (hasPlantImage(plant.id)) {
        setProgress({ current: i + 1, total: plantDatabase.length });
        continue;
      }

      setCurrentItem(plant.commonName);

      // Update status to generating
      setPlantStatuses((prev) =>
        prev.map((s) =>
          s.id === plant.id ? { ...s, status: 'generating' } : s
        )
      );

      const prompt = getPlantPrompt(plant.commonName, plant.scientificName);
      const filename = `plant_${plant.id}.png`;

      const result = await generateImage(prompt, filename);

      if (result.success && result.imageUri) {
        await saveImageMapping('plants', plant.id, result.imageUri);
        setPlantStatuses((prev) =>
          prev.map((s) =>
            s.id === plant.id
              ? { ...s, status: 'success', imageUri: result.imageUri }
              : s
          )
        );
      } else {
        setPlantStatuses((prev) =>
          prev.map((s) =>
            s.id === plant.id
              ? { ...s, status: 'error', error: result.error }
              : s
          )
        );
      }

      setProgress({ current: i + 1, total: plantDatabase.length });

      // Delay between requests
      if (i < plantDatabase.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    setGenerationStatus('complete');
    setCurrentItem('');
  }, [hasPlantImage, saveImageMapping]);

  const generateAllImages = useCallback(async () => {
    await generateFishImages();
    await generatePlantImages();
  }, [generateFishImages, generatePlantImages]);

  const handleClearAll = useCallback(async () => {
    await clearAllImages();
    setFishStatuses([]);
    setPlantStatuses([]);
    setGenerationStatus('idle');
  }, [clearAllImages]);

  const StatusIcon = ({ status }: { status: ItemStatus['status'] }) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={18} color="#10B981" />;
      case 'error':
        return <XCircle size={18} color="#EF4444" />;
      case 'generating':
        return <ActivityIndicator size="small" color="#0EA5E9" />;
      default:
        return <View className="w-[18px] h-[18px] rounded-full bg-slate-300" />;
    }
  };

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#8B5CF6', '#7C3AED']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 20,
          }}
        >
          <View className="flex-row items-center mb-3">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3"
            >
              <ArrowLeft size={22} color="white" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">
                Generate Images
              </Text>
              <Text className="text-white/70 text-sm">
                Create unique AI images for fish & plants
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View className="flex-row mt-2">
            <View className="flex-row items-center mr-6">
              <FishIcon size={18} color="white" />
              <Text className="text-white ml-2">
                {fishCount}/{fishDatabase.length} fish
              </Text>
            </View>
            <View className="flex-row items-center">
              <Leaf size={18} color="white" />
              <Text className="text-white ml-2">
                {plantCount}/{plantDatabase.length} plants
              </Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-5">
            {/* Info Card */}
            <View
              className={cn(
                'p-4 rounded-2xl mb-5',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
            >
              <View className="flex-row items-center mb-2">
                <Sparkles size={20} color="#8B5CF6" />
                <Text
                  className={cn(
                    'text-base font-bold ml-2',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  AI Image Generation
                </Text>
              </View>
              <Text
                className={cn(
                  'text-sm leading-5',
                  isDark ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                This will generate unique, realistic images for each fish and
                plant species. Each image takes about 30 seconds to generate.
                Images are saved locally and will be used throughout the app.
              </Text>
            </View>

            {/* Progress */}
            {generationStatus === 'generating' && (
              <View
                className={cn(
                  'p-4 rounded-2xl mb-5',
                  isDark ? 'bg-slate-800' : 'bg-white'
                )}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text
                    className={cn(
                      'text-sm font-semibold',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    Generating: {currentItem}
                  </Text>
                  <Text
                    className={cn(
                      'text-sm',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    {progress.current}/{progress.total}
                  </Text>
                </View>
                <View
                  className={cn(
                    'h-2 rounded-full overflow-hidden',
                    isDark ? 'bg-slate-700' : 'bg-slate-200'
                  )}
                >
                  <View
                    className="h-full bg-violet-500 rounded-full"
                    style={{
                      width: `${(progress.current / progress.total) * 100}%`,
                    }}
                  />
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row gap-3 mb-5">
              <Pressable
                onPress={generateAllImages}
                disabled={generationStatus === 'generating'}
                className={cn(
                  'flex-1 py-4 rounded-xl flex-row items-center justify-center',
                  generationStatus === 'generating'
                    ? 'bg-slate-400'
                    : 'bg-violet-500'
                )}
              >
                {generationStatus === 'generating' ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Sparkles size={18} color="white" />
                    <Text className="text-white font-bold ml-2">
                      Generate All
                    </Text>
                  </>
                )}
              </Pressable>

              <Pressable
                onPress={handleClearAll}
                disabled={generationStatus === 'generating'}
                className={cn(
                  'py-4 px-5 rounded-xl',
                  isDark ? 'bg-red-900/50' : 'bg-red-50'
                )}
              >
                <Trash2 size={18} color="#EF4444" />
              </Pressable>
            </View>

            {/* Individual Generate Buttons */}
            <View className="flex-row gap-3 mb-5">
              <Pressable
                onPress={generateFishImages}
                disabled={generationStatus === 'generating'}
                className={cn(
                  'flex-1 py-3 rounded-xl flex-row items-center justify-center',
                  isDark ? 'bg-slate-800' : 'bg-white',
                  generationStatus === 'generating' && 'opacity-50'
                )}
              >
                <FishIcon size={16} color="#0EA5E9" />
                <Text
                  className={cn(
                    'font-semibold ml-2',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Fish Only
                </Text>
              </Pressable>

              <Pressable
                onPress={generatePlantImages}
                disabled={generationStatus === 'generating'}
                className={cn(
                  'flex-1 py-3 rounded-xl flex-row items-center justify-center',
                  isDark ? 'bg-slate-800' : 'bg-white',
                  generationStatus === 'generating' && 'opacity-50'
                )}
              >
                <Leaf size={16} color="#10B981" />
                <Text
                  className={cn(
                    'font-semibold ml-2',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Plants Only
                </Text>
              </Pressable>
            </View>

            {/* Fish Status List */}
            {fishStatuses.length > 0 && (
              <View className="mb-5">
                <Text
                  className={cn(
                    'text-base font-bold mb-3',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Fish Images
                </Text>
                {fishStatuses.map((item) => (
                  <View
                    key={item.id}
                    className={cn(
                      'flex-row items-center p-3 rounded-xl mb-2',
                      isDark ? 'bg-slate-800' : 'bg-white'
                    )}
                  >
                    {item.imageUri ? (
                      <Image
                        source={{ uri: item.imageUri }}
                        className="w-12 h-12 rounded-lg"
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        className={cn(
                          'w-12 h-12 rounded-lg items-center justify-center',
                          isDark ? 'bg-slate-700' : 'bg-slate-100'
                        )}
                      >
                        <FishIcon
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
                      {item.name}
                    </Text>
                    <StatusIcon status={item.status} />
                  </View>
                ))}
              </View>
            )}

            {/* Plant Status List */}
            {plantStatuses.length > 0 && (
              <View className="mb-5">
                <Text
                  className={cn(
                    'text-base font-bold mb-3',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Plant Images
                </Text>
                {plantStatuses.map((item) => (
                  <View
                    key={item.id}
                    className={cn(
                      'flex-row items-center p-3 rounded-xl mb-2',
                      isDark ? 'bg-slate-800' : 'bg-white'
                    )}
                  >
                    {item.imageUri ? (
                      <Image
                        source={{ uri: item.imageUri }}
                        className="w-12 h-12 rounded-lg"
                        resizeMode="cover"
                      />
                    ) : (
                      <View
                        className={cn(
                          'w-12 h-12 rounded-lg items-center justify-center',
                          isDark ? 'bg-slate-700' : 'bg-slate-100'
                        )}
                      >
                        <Leaf
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
                      {item.name}
                    </Text>
                    <StatusIcon status={item.status} />
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className="h-10" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
