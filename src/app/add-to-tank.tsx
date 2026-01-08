import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import {
  ChevronLeft,
  Fish as FishIcon,
  Leaf,
  Check,
  Plus,
  AlertTriangle,
  CheckCircle,
  X,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { useTankStore, ExtendedTankSetup } from '@/lib/state/tank-store';
import { getFishById, fishDatabase } from '@/lib/data/fish-database';
import { getPlantById, plantDatabase } from '@/lib/data/plant-database';
import type { Plant } from '@/lib/data/plant-database';
import { checkTwoFishCompatibility, getSuggestedCompatibleFish } from '@/lib/utils/compatibility';
import { Fish, WaterType } from '@/lib/types/fish';
import { cn } from '@/lib/cn';
import { useFishImage, usePlantImage } from '@/lib/hooks/useImageUrl';

// Fish image component
const FishImageDisplay = ({ fish }: { fish: Fish }) => {
  const imageUrl = useFishImage(fish.id, fish.imageUrl, fish.commonName, fish.scientificName);
  return (
    <Image
      source={{ uri: imageUrl }}
      className="w-16 h-16 rounded-xl"
      resizeMode="cover"
    />
  );
};

// Plant image component
const PlantImageDisplay = ({ plant }: { plant: Plant }) => {
  const imageUrl = usePlantImage(plant.id, plant.imageUrl, plant.commonName, plant.scientificName);
  return (
    <Image
      source={{ uri: imageUrl }}
      className="w-16 h-16 rounded-xl"
      resizeMode="cover"
    />
  );
};

// Fish selection item
const FishItem = ({
  fish,
  isSelected,
  isCompatible,
  compatibilityStatus,
  onToggle,
  isDark,
}: {
  fish: Fish;
  isSelected: boolean;
  isCompatible: boolean;
  compatibilityStatus: 'compatible' | 'conditional' | 'incompatible' | 'unknown';
  onToggle: () => void;
  isDark: boolean;
}) => {
  const statusColor = compatibilityStatus === 'compatible'
    ? '#10B981'
    : compatibilityStatus === 'conditional'
    ? '#F59E0B'
    : compatibilityStatus === 'incompatible'
    ? '#EF4444'
    : '#64748B';

  return (
    <Pressable
      onPress={onToggle}
      className={cn(
        'flex-row items-center p-3 rounded-xl mb-2',
        isSelected ? 'border-2 border-sky-500' : '',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}
    >
      <View className="relative">
        <FishImageDisplay fish={fish} />
        {isSelected && (
          <View className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-sky-500 items-center justify-center">
            <Check size={14} color="white" strokeWidth={3} />
          </View>
        )}
      </View>
      <View className="flex-1 ml-3">
        <Text
          className={cn(
            'text-base font-semibold',
            isDark ? 'text-white' : 'text-slate-900'
          )}
        >
          {fish.commonName}
        </Text>
        <Text
          className={cn(
            'text-xs italic',
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          {fish.scientificName}
        </Text>
        <View className="flex-row items-center mt-1">
          <View
            className="w-2 h-2 rounded-full mr-1"
            style={{ backgroundColor: statusColor }}
          />
          <Text className="text-xs capitalize" style={{ color: statusColor }}>
            {compatibilityStatus === 'unknown' ? 'No fish in tank' : compatibilityStatus}
          </Text>
        </View>
      </View>
      <View
        className={cn(
          'w-8 h-8 rounded-full items-center justify-center',
          isSelected ? 'bg-sky-500' : isDark ? 'bg-slate-700' : 'bg-slate-100'
        )}
      >
        {isSelected ? (
          <Check size={16} color="white" />
        ) : (
          <Plus size={16} color={isDark ? '#94A3B8' : '#64748B'} />
        )}
      </View>
    </Pressable>
  );
};

// Plant selection item
const PlantItem = ({
  plant,
  isSelected,
  onToggle,
  isDark,
}: {
  plant: Plant;
  isSelected: boolean;
  onToggle: () => void;
  isDark: boolean;
}) => {
  return (
    <Pressable
      onPress={onToggle}
      className={cn(
        'flex-row items-center p-3 rounded-xl mb-2',
        isSelected ? 'border-2 border-emerald-500' : '',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}
    >
      <View className="relative">
        <PlantImageDisplay plant={plant} />
        {isSelected && (
          <View className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 items-center justify-center">
            <Check size={14} color="white" strokeWidth={3} />
          </View>
        )}
      </View>
      <View className="flex-1 ml-3">
        <Text
          className={cn(
            'text-base font-semibold',
            isDark ? 'text-white' : 'text-slate-900'
          )}
        >
          {plant.commonName}
        </Text>
        <Text
          className={cn(
            'text-xs italic',
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          {plant.scientificName}
        </Text>
        <View className="flex-row items-center mt-1">
          <Text
            className={cn(
              'text-xs capitalize',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}
          >
            {plant.difficulty} • {plant.lighting} light
          </Text>
        </View>
      </View>
      <View
        className={cn(
          'w-8 h-8 rounded-full items-center justify-center',
          isSelected ? 'bg-emerald-500' : isDark ? 'bg-slate-700' : 'bg-slate-100'
        )}
      >
        {isSelected ? (
          <Check size={16} color="white" />
        ) : (
          <Plus size={16} color={isDark ? '#94A3B8' : '#64748B'} />
        )}
      </View>
    </Pressable>
  );
};

export default function AddToTankScreen() {
  const { tankId, mode: initialMode } = useLocalSearchParams<{ tankId: string; mode?: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [mode, setMode] = useState<'fish' | 'plants'>(initialMode === 'plants' ? 'plants' : 'fish');
  const [selectedFishIds, setSelectedFishIds] = useState<string[]>([]);
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([]);
  const [multiSelectEnabled, setMultiSelectEnabled] = useState(true);

  const tanks = useTankStore((s) => s.tanks);
  const addFishToTank = useTankStore((s) => s.addFishToTank);
  const addPlantToTank = useTankStore((s) => s.addPlantToTank);

  const tank = tanks.find(t => t.id === tankId) as ExtendedTankSetup | undefined;

  // Get current fish in tank
  const currentFish = useMemo(() => {
    return tank?.fishIds
      .map((id) => getFishById(id))
      .filter((f): f is Fish => f !== undefined) || [];
  }, [tank?.fishIds]);

  // Get compatible fish based on current tank
  const { compatibleFish, conditionalFish, incompatibleFish } = useMemo(() => {
    const compatible: Fish[] = [];
    const conditional: Fish[] = [];
    const incompatible: Fish[] = [];

    // Filter fish by water type first
    const waterTypeFiltered = fishDatabase.filter(f =>
      tank ? f.waterType === tank.waterType : true
    );

    // If tank has no fish, all are "compatible"
    if (currentFish.length === 0) {
      return { compatibleFish: waterTypeFiltered, conditionalFish: [], incompatibleFish: [] };
    }

    // Check compatibility with each existing fish
    for (const fish of waterTypeFiltered) {
      // Skip if already in tank
      if (tank?.fishIds.includes(fish.id)) continue;

      let worstStatus: 'compatible' | 'conditional' | 'incompatible' = 'compatible';

      for (const existingFish of currentFish) {
        const result = checkTwoFishCompatibility(fish, existingFish);
        if (result.status === 'incompatible') {
          worstStatus = 'incompatible';
          break;
        } else if (result.status === 'conditional') {
          worstStatus = 'conditional';
        }
      }

      if (worstStatus === 'compatible') {
        compatible.push(fish);
      } else if (worstStatus === 'conditional') {
        conditional.push(fish);
      } else {
        incompatible.push(fish);
      }
    }

    return { compatibleFish: compatible, conditionalFish: conditional, incompatibleFish: incompatible };
  }, [currentFish, tank]);

  // Get plants (plants don't have waterType, they work with both)
  const filteredPlants = useMemo(() => {
    return plantDatabase.filter(p => !tank?.plantIds?.includes(p.id));
  }, [tank]);

  // Get compatibility status for a fish
  const getFishCompatibilityStatus = (fish: Fish): 'compatible' | 'conditional' | 'incompatible' | 'unknown' => {
    if (currentFish.length === 0) return 'unknown';
    if (compatibleFish.find(f => f.id === fish.id)) return 'compatible';
    if (conditionalFish.find(f => f.id === fish.id)) return 'conditional';
    return 'incompatible';
  };

  const toggleFishSelection = (fishId: string) => {
    if (multiSelectEnabled) {
      setSelectedFishIds(prev =>
        prev.includes(fishId)
          ? prev.filter(id => id !== fishId)
          : [...prev, fishId]
      );
    } else {
      setSelectedFishIds([fishId]);
    }
  };

  const togglePlantSelection = (plantId: string) => {
    if (multiSelectEnabled) {
      setSelectedPlantIds(prev =>
        prev.includes(plantId)
          ? prev.filter(id => id !== plantId)
          : [...prev, plantId]
      );
    } else {
      setSelectedPlantIds([plantId]);
    }
  };

  const handleAddSelected = () => {
    if (!tank) return;

    if (mode === 'fish') {
      selectedFishIds.forEach(fishId => {
        const fish = getFishById(fishId);
        addFishToTank(tank.id, fishId, fish?.commonName);
      });
    } else {
      selectedPlantIds.forEach(plantId => {
        const plant = getPlantById(plantId);
        addPlantToTank(tank.id, plantId, plant?.commonName);
      });
    }

    router.back();
  };

  const selectedCount = mode === 'fish' ? selectedFishIds.length : selectedPlantIds.length;

  if (!tank) {
    return (
      <View className={cn('flex-1 items-center justify-center', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <Text className={isDark ? 'text-white' : 'text-slate-900'}>Tank not found</Text>
      </View>
    );
  }

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#1E293B', '#0F172A'] : mode === 'fish' ? ['#0EA5E9', '#0284C7'] : ['#10B981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View className="px-5 py-4">
            <View className="flex-row items-center justify-between mb-4">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
              >
                <ChevronLeft size={24} color="white" />
              </Pressable>
              <Text className="text-white text-lg font-bold">Add to {tank.name}</Text>
              <View className="w-10" />
            </View>

            {/* Mode Toggle */}
            <View className="flex-row bg-white/20 rounded-xl p-1">
              <Pressable
                onPress={() => setMode('fish')}
                className={cn(
                  'flex-1 flex-row items-center justify-center py-2 rounded-lg',
                  mode === 'fish' ? 'bg-white' : ''
                )}
              >
                <FishIcon size={18} color={mode === 'fish' ? '#0EA5E9' : 'white'} />
                <Text
                  className={cn(
                    'ml-2 font-semibold',
                    mode === 'fish' ? 'text-sky-500' : 'text-white'
                  )}
                >
                  Fish
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMode('plants')}
                className={cn(
                  'flex-1 flex-row items-center justify-center py-2 rounded-lg',
                  mode === 'plants' ? 'bg-white' : ''
                )}
              >
                <Leaf size={18} color={mode === 'plants' ? '#10B981' : 'white'} />
                <Text
                  className={cn(
                    'ml-2 font-semibold',
                    mode === 'plants' ? 'text-emerald-500' : 'text-white'
                  )}
                >
                  Plants
                </Text>
              </Pressable>
            </View>

            {/* Multi-select toggle */}
            <View className="flex-row items-center justify-between mt-4">
              <Text className="text-white/80 text-sm">Add multiple at once</Text>
              <Pressable
                onPress={() => setMultiSelectEnabled(!multiSelectEnabled)}
                className={cn(
                  'w-12 h-7 rounded-full justify-center px-1',
                  multiSelectEnabled ? 'bg-white' : 'bg-white/30'
                )}
              >
                <View
                  className={cn(
                    'w-5 h-5 rounded-full',
                    multiSelectEnabled ? 'bg-sky-500 self-end' : 'bg-white self-start'
                  )}
                />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-4">
          {mode === 'fish' ? (
            <>
              {/* Compatible Fish Section */}
              {compatibleFish.length > 0 && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <CheckCircle size={16} color="#10B981" />
                    <Text
                      className={cn(
                        'text-sm font-semibold ml-2',
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      )}
                    >
                      Compatible ({compatibleFish.length})
                    </Text>
                  </View>
                  {compatibleFish.map((fish) => (
                    <FishItem
                      key={fish.id}
                      fish={fish}
                      isSelected={selectedFishIds.includes(fish.id)}
                      isCompatible={true}
                      compatibilityStatus="compatible"
                      onToggle={() => toggleFishSelection(fish.id)}
                      isDark={isDark}
                    />
                  ))}
                </View>
              )}

              {/* Conditional Fish Section */}
              {conditionalFish.length > 0 && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <AlertTriangle size={16} color="#F59E0B" />
                    <Text
                      className={cn(
                        'text-sm font-semibold ml-2',
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      )}
                    >
                      Use Caution ({conditionalFish.length})
                    </Text>
                  </View>
                  {conditionalFish.map((fish) => (
                    <FishItem
                      key={fish.id}
                      fish={fish}
                      isSelected={selectedFishIds.includes(fish.id)}
                      isCompatible={false}
                      compatibilityStatus="conditional"
                      onToggle={() => toggleFishSelection(fish.id)}
                      isDark={isDark}
                    />
                  ))}
                </View>
              )}

              {/* Incompatible Fish Section */}
              {incompatibleFish.length > 0 && (
                <View className="mb-6">
                  <View className="flex-row items-center mb-3">
                    <X size={16} color="#EF4444" />
                    <Text
                      className={cn(
                        'text-sm font-semibold ml-2',
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      )}
                    >
                      Not Recommended ({incompatibleFish.length})
                    </Text>
                  </View>
                  {incompatibleFish.map((fish) => (
                    <FishItem
                      key={fish.id}
                      fish={fish}
                      isSelected={selectedFishIds.includes(fish.id)}
                      isCompatible={false}
                      compatibilityStatus="incompatible"
                      onToggle={() => toggleFishSelection(fish.id)}
                      isDark={isDark}
                    />
                  ))}
                </View>
              )}

              {currentFish.length === 0 && (
                <View className="mb-6">
                  <Text
                    className={cn(
                      'text-sm font-semibold mb-3',
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    )}
                  >
                    All {tank.waterType} Fish ({compatibleFish.length})
                  </Text>
                  {compatibleFish.map((fish) => (
                    <FishItem
                      key={fish.id}
                      fish={fish}
                      isSelected={selectedFishIds.includes(fish.id)}
                      isCompatible={true}
                      compatibilityStatus="unknown"
                      onToggle={() => toggleFishSelection(fish.id)}
                      isDark={isDark}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            // Plants Section
            <View className="mb-6">
              <Text
                className={cn(
                  'text-sm font-semibold mb-3',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                {tank.waterType === 'freshwater' ? 'Freshwater' : 'Saltwater'} Plants ({filteredPlants.length})
              </Text>
              {filteredPlants.map((plant) => (
                <PlantItem
                  key={plant.id}
                  plant={plant}
                  isSelected={selectedPlantIds.includes(plant.id)}
                  onToggle={() => togglePlantSelection(plant.id)}
                  isDark={isDark}
                />
              ))}
            </View>
          )}
        </View>

        <View className="h-24" />
      </ScrollView>

      {/* Bottom Add Button */}
      {selectedCount > 0 && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          className="absolute bottom-0 left-0 right-0 px-5 pb-8 pt-4"
          style={{
            backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <Pressable
            onPress={handleAddSelected}
            className={cn(
              'py-4 rounded-xl items-center flex-row justify-center',
              mode === 'fish' ? 'bg-sky-500' : 'bg-emerald-500'
            )}
          >
            <Plus size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">
              Add {selectedCount} {mode === 'fish' ? (selectedCount === 1 ? 'Fish' : 'Fish') : (selectedCount === 1 ? 'Plant' : 'Plants')}
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
