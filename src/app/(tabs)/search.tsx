import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Filter,
  X,
  Fish as FishIcon,
  Leaf,
  Sun,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  PoundSterling,
  Star,
  Sparkles,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { fishDatabase, searchFish } from '@/lib/data/fish-database';
import { plantDatabase, searchPlants, Plant } from '@/lib/data/plant-database';
import { Fish, WaterType, Temperament } from '@/lib/types/fish';
import { checkTwoFishCompatibility } from '@/lib/utils/compatibility';
import { CompatibilityStatus } from '@/lib/types/fish';
import { cn } from '@/lib/cn';
import { useFishImage, usePlantImage } from '@/lib/hooks/useImageUrl';

type SearchMode = 'fish' | 'plants';

const FilterChip = ({
  label,
  isActive,
  onPress,
  isDark,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  isDark: boolean;
}) => (
  <Pressable
    onPress={onPress}
    className={cn(
      'px-4 py-2 rounded-full mr-2 mb-2',
      isActive
        ? 'bg-sky-500'
        : isDark
        ? 'bg-slate-700'
        : 'bg-white border border-slate-200'
    )}
  >
    <Text
      className={cn(
        'text-sm font-medium',
        isActive ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-600'
      )}
    >
      {label}
    </Text>
  </Pressable>
);

// Fish image component that uses generated images
const FishImage = ({ fish, className }: { fish: Fish; className?: string }) => {
  const imageUrl = useFishImage(fish.id, fish.imageUrl);
  return (
    <Image
      source={{ uri: imageUrl }}
      className={className || 'w-20 h-20 rounded-xl'}
      resizeMode="cover"
    />
  );
};

// Plant image component that uses generated images
const PlantImage = ({ plant, className }: { plant: Plant; className?: string }) => {
  const imageUrl = usePlantImage(plant.id, plant.imageUrl);
  return (
    <Image
      source={{ uri: imageUrl }}
      className={className || 'w-20 h-20 rounded-xl'}
      resizeMode="cover"
    />
  );
};

const careLevelColor = {
  beginner: '#10B981',
  intermediate: '#F59E0B',
  advanced: '#EF4444',
};

const FishListItem = ({
  fish,
  onPress,
  onCheckCompatibility,
  isDark,
}: {
  fish: Fish;
  onPress: () => void;
  onCheckCompatibility: () => void;
  isDark: boolean;
}) => {
  const temperamentColor = {
    peaceful: '#10B981',
    'semi-aggressive': '#F59E0B',
    aggressive: '#EF4444',
  }[fish.temperament];

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row p-4 mb-3 rounded-2xl',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <FishImage fish={fish} />
      <View className="flex-1 ml-4 justify-center">
        <Text
          className={cn(
            'text-base font-bold mb-1',
            isDark ? 'text-white' : 'text-slate-900'
          )}
        >
          {fish.commonName}
        </Text>
        <Text
          className={cn(
            'text-xs italic mb-2',
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          {fish.scientificName}
        </Text>
        <View className="flex-row flex-wrap">
          <View className="flex-row items-center mr-3">
            <View
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: temperamentColor }}
            />
            <Text
              className={cn(
                'text-xs capitalize',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {fish.temperament}
            </Text>
          </View>
          <View className="flex-row items-center mr-3">
            <Star size={12} color={careLevelColor[fish.careLevel]} />
            <Text
              className={cn(
                'text-xs ml-1 capitalize',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {fish.careLevel}
            </Text>
          </View>
          <View className="flex-row items-center">
            <PoundSterling size={12} color="#10B981" />
            <Text
              className={cn(
                'text-xs ml-0.5',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {fish.price.min}-{fish.price.max}
            </Text>
          </View>
        </View>
      </View>
      <Pressable
        onPress={(e) => {
          e.stopPropagation();
          onCheckCompatibility();
        }}
        className="self-center p-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Sparkles size={20} color="#8B5CF6" />
      </Pressable>
    </Pressable>
  );
};

const PlantListItem = ({
  plant,
  onPress,
  isDark,
}: {
  plant: Plant;
  onPress: () => void;
  isDark: boolean;
}) => {
  const difficultyColor = {
    easy: '#10B981',
    moderate: '#F59E0B',
    difficult: '#EF4444',
  }[plant.difficulty];

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row p-4 mb-3 rounded-2xl',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.2 : 0.05,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <PlantImage plant={plant} />
      <View className="flex-1 ml-4 justify-center">
        <Text
          className={cn(
            'text-base font-bold mb-1',
            isDark ? 'text-white' : 'text-slate-900'
          )}
        >
          {plant.commonName}
        </Text>
        <Text
          className={cn(
            'text-xs italic mb-2',
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          {plant.scientificName}
        </Text>
        <View className="flex-row flex-wrap">
          <View className="flex-row items-center mr-3">
            <View
              className="w-2 h-2 rounded-full mr-1"
              style={{ backgroundColor: difficultyColor }}
            />
            <Text
              className={cn(
                'text-xs capitalize',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {plant.difficulty}
            </Text>
          </View>
          <View className="flex-row items-center mr-3">
            <Sun size={12} color="#F59E0B" />
            <Text
              className={cn(
                'text-xs ml-1 capitalize',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {plant.lighting} light
            </Text>
          </View>
          <View className="flex-row items-center">
            <PoundSterling size={12} color="#10B981" />
            <Text
              className={cn(
                'text-xs ml-0.5',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {plant.price.min}-{plant.price.max}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

// Compatibility Check Modal
const CompatibilityModal = ({
  visible,
  onClose,
  selectedFish,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  selectedFish: Fish | null;
  isDark: boolean;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !selectedFish) return [];
    return searchFish(searchQuery)
      .filter((f) => f.id !== selectedFish.id)
      .slice(0, 8);
  }, [searchQuery, selectedFish]);

  const getCompatibilityWithFish = (otherFish: Fish) => {
    if (!selectedFish) return null;
    return checkTwoFishCompatibility(selectedFish, otherFish);
  };

  const statusConfig: Record<CompatibilityStatus, { color: string; icon: typeof CheckCircle; label: string }> = {
    compatible: { color: '#10B981', icon: CheckCircle, label: 'Compatible' },
    conditional: { color: '#F59E0B', icon: AlertCircle, label: 'Caution' },
    incompatible: { color: '#EF4444', icon: AlertTriangle, label: 'Incompatible' },
  };

  if (!selectedFish) return null;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end">
        <Pressable className="flex-1" onPress={onClose} />
        <View
          className={cn(
            'rounded-t-3xl p-5',
            isDark ? 'bg-slate-900' : 'bg-white'
          )}
          style={{ maxHeight: '80%' }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center flex-1">
              <FishImage fish={selectedFish} className="w-12 h-12 rounded-lg" />
              <View className="ml-3 flex-1">
                <Text
                  className={cn(
                    'text-lg font-bold',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Check Compatibility
                </Text>
                <Text
                  className={cn(
                    'text-sm',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                >
                  {selectedFish.commonName}
                </Text>
              </View>
            </View>
            <Pressable onPress={onClose}>
              <X size={24} color={isDark ? '#94A3B8' : '#64748B'} />
            </Pressable>
          </View>

          {/* Search */}
          <View
            className={cn(
              'flex-row items-center px-4 py-3 rounded-xl mb-4',
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            )}
          >
            <Search size={20} color={isDark ? '#94A3B8' : '#64748B'} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search for another fish..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: isDark ? '#FFFFFF' : '#0F172A',
              }}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              </Pressable>
            ) : null}
          </View>

          {/* Results */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {searchResults.length > 0 ? (
              searchResults.map((fish) => {
                const result = getCompatibilityWithFish(fish);
                const config = result ? statusConfig[result.status] : null;
                const StatusIcon = config?.icon || CheckCircle;

                return (
                  <Pressable
                    key={fish.id}
                    onPress={() => {
                      onClose();
                      router.push(`/fish/${fish.id}`);
                    }}
                    className={cn(
                      'flex-row items-center p-3 rounded-xl mb-2',
                      isDark ? 'bg-slate-800' : 'bg-slate-50'
                    )}
                  >
                    <FishImage fish={fish} className="w-14 h-14 rounded-lg" />
                    <View className="flex-1 ml-3">
                      <Text
                        className={cn(
                          'text-sm font-semibold',
                          isDark ? 'text-white' : 'text-slate-900'
                        )}
                      >
                        {fish.commonName}
                      </Text>
                      <Text
                        className={cn(
                          'text-xs',
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        )}
                      >
                        {fish.temperament} • {fish.waterType}
                      </Text>
                      {result && result.reasons.length > 0 && (
                        <Text
                          className="text-xs mt-1"
                          style={{ color: config?.color }}
                          numberOfLines={1}
                        >
                          {result.reasons[0]}
                        </Text>
                      )}
                    </View>
                    {config && (
                      <View className="items-center">
                        <StatusIcon size={24} color={config.color} />
                        <Text
                          className="text-xs font-medium mt-1"
                          style={{ color: config.color }}
                        >
                          {config.label}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })
            ) : searchQuery.trim() ? (
              <Text
                className={cn(
                  'text-center py-8',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}
              >
                No fish found
              </Text>
            ) : (
              <Text
                className={cn(
                  'text-center py-8',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}
              >
                Search for fish to check compatibility with {selectedFish.commonName}
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default function SearchScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // State
  const [searchMode, setSearchMode] = useState<SearchMode>('fish');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWaterType, setSelectedWaterType] = useState<WaterType | null>(null);
  const [selectedTemperament, setSelectedTemperament] = useState<Temperament | null>(null);
  const [selectedCareLevel, setSelectedCareLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
  const [selectedPlantDifficulty, setSelectedPlantDifficulty] = useState<'easy' | 'moderate' | 'difficult' | null>(null);
  const [selectedPlantLighting, setSelectedPlantLighting] = useState<'low' | 'medium' | 'high' | null>(null);

  // Compatibility modal state
  const [compatibilityModalVisible, setCompatibilityModalVisible] = useState(false);
  const [selectedFishForCompatibility, setSelectedFishForCompatibility] = useState<Fish | null>(null);

  // Filtered results
  const filteredFish = useMemo(() => {
    let results = fishDatabase;

    if (searchQuery.trim()) {
      results = searchFish(searchQuery);
    }

    if (selectedWaterType) {
      results = results.filter((f) => f.waterType === selectedWaterType);
    }
    if (selectedTemperament) {
      results = results.filter((f) => f.temperament === selectedTemperament);
    }
    if (selectedCareLevel) {
      results = results.filter((f) => f.careLevel === selectedCareLevel);
    }

    return results;
  }, [searchQuery, selectedWaterType, selectedTemperament, selectedCareLevel]);

  const filteredPlants = useMemo(() => {
    let results = plantDatabase;

    if (searchQuery.trim()) {
      results = searchPlants(searchQuery);
    }

    if (selectedPlantDifficulty) {
      results = results.filter((p) => p.difficulty === selectedPlantDifficulty);
    }
    if (selectedPlantLighting) {
      results = results.filter((p) => p.lighting === selectedPlantLighting);
    }

    return results;
  }, [searchQuery, selectedPlantDifficulty, selectedPlantLighting]);

  const clearFilters = () => {
    setSelectedWaterType(null);
    setSelectedTemperament(null);
    setSelectedCareLevel(null);
    setSelectedPlantDifficulty(null);
    setSelectedPlantLighting(null);
  };

  const hasActiveFilters =
    selectedWaterType || selectedTemperament || selectedCareLevel ||
    selectedPlantDifficulty || selectedPlantLighting;

  const handleCheckCompatibility = (fish: Fish) => {
    setSelectedFishForCompatibility(fish);
    setCompatibilityModalVisible(true);
  };

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#0EA5E9', '#0284C7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 16,
          }}
        >
          <View className="flex-row items-center mb-3">
            <Search size={24} color="white" />
            <Text className="text-white text-2xl font-bold ml-2">
              Search
            </Text>
          </View>

          {/* Fish/Plants Toggle */}
          <View className="flex-row bg-white/20 rounded-lg p-1 mb-3">
            <Pressable
              onPress={() => setSearchMode('fish')}
              className={cn(
                'flex-1 flex-row items-center justify-center px-3 py-2 rounded-md',
                searchMode === 'fish' ? 'bg-white' : ''
              )}
            >
              <FishIcon size={18} color={searchMode === 'fish' ? '#0EA5E9' : 'white'} />
              <Text
                className={cn(
                  'text-sm font-medium ml-2',
                  searchMode === 'fish' ? 'text-sky-500' : 'text-white'
                )}
              >
                Fish
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setSearchMode('plants')}
              className={cn(
                'flex-1 flex-row items-center justify-center px-3 py-2 rounded-md',
                searchMode === 'plants' ? 'bg-white' : ''
              )}
            >
              <Leaf size={18} color={searchMode === 'plants' ? '#10B981' : 'white'} />
              <Text
                className={cn(
                  'text-sm font-medium ml-2',
                  searchMode === 'plants' ? 'text-emerald-500' : 'text-white'
                )}
              >
                Plants
              </Text>
            </Pressable>
          </View>

          {/* Search Bar */}
          <View
            className={cn(
              'flex-row items-center px-4 py-3 rounded-xl',
              'bg-white/20'
            )}
          >
            <Search size={20} color="white" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={`Search ${searchMode}...`}
              placeholderTextColor="rgba(255,255,255,0.6)"
              style={{
                flex: 1,
                marginLeft: 12,
                fontSize: 16,
                color: 'white',
              }}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={20} color="white" />
              </Pressable>
            ) : null}
          </View>
        </LinearGradient>

        {/* Content */}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Filter Toggle */}
          <View className="px-5 pt-4">
            <Pressable
              onPress={() => setShowFilters(!showFilters)}
              className={cn(
                'flex-row items-center px-4 py-2 rounded-lg self-start',
                hasActiveFilters
                  ? 'bg-sky-500'
                  : isDark
                  ? 'bg-slate-800'
                  : 'bg-white'
              )}
            >
              <Filter
                size={16}
                color={hasActiveFilters ? 'white' : isDark ? '#94A3B8' : '#64748B'}
              />
              <Text
                className={cn(
                  'text-sm font-medium ml-2',
                  hasActiveFilters
                    ? 'text-white'
                    : isDark
                    ? 'text-slate-300'
                    : 'text-slate-600'
                )}
              >
                Filters {hasActiveFilters ? '(Active)' : ''}
              </Text>
            </Pressable>
          </View>

          {/* Filters Panel */}
          {showFilters && (
            <View
              className={cn(
                'mx-5 mt-3 p-4 rounded-xl',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
            >
              {searchMode === 'fish' ? (
                <>
                  <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    Water Type
                  </Text>
                  <View className="flex-row flex-wrap mb-3">
                    <FilterChip label="Freshwater" isActive={selectedWaterType === 'freshwater'} onPress={() => setSelectedWaterType(selectedWaterType === 'freshwater' ? null : 'freshwater')} isDark={isDark} />
                    <FilterChip label="Saltwater" isActive={selectedWaterType === 'saltwater'} onPress={() => setSelectedWaterType(selectedWaterType === 'saltwater' ? null : 'saltwater')} isDark={isDark} />
                  </View>

                  <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    Temperament
                  </Text>
                  <View className="flex-row flex-wrap mb-3">
                    <FilterChip label="Peaceful" isActive={selectedTemperament === 'peaceful'} onPress={() => setSelectedTemperament(selectedTemperament === 'peaceful' ? null : 'peaceful')} isDark={isDark} />
                    <FilterChip label="Semi-Aggressive" isActive={selectedTemperament === 'semi-aggressive'} onPress={() => setSelectedTemperament(selectedTemperament === 'semi-aggressive' ? null : 'semi-aggressive')} isDark={isDark} />
                    <FilterChip label="Aggressive" isActive={selectedTemperament === 'aggressive'} onPress={() => setSelectedTemperament(selectedTemperament === 'aggressive' ? null : 'aggressive')} isDark={isDark} />
                  </View>

                  <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    Care Level
                  </Text>
                  <View className="flex-row flex-wrap">
                    <FilterChip label="Beginner" isActive={selectedCareLevel === 'beginner'} onPress={() => setSelectedCareLevel(selectedCareLevel === 'beginner' ? null : 'beginner')} isDark={isDark} />
                    <FilterChip label="Intermediate" isActive={selectedCareLevel === 'intermediate'} onPress={() => setSelectedCareLevel(selectedCareLevel === 'intermediate' ? null : 'intermediate')} isDark={isDark} />
                    <FilterChip label="Advanced" isActive={selectedCareLevel === 'advanced'} onPress={() => setSelectedCareLevel(selectedCareLevel === 'advanced' ? null : 'advanced')} isDark={isDark} />
                  </View>
                </>
              ) : (
                <>
                  <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    Difficulty
                  </Text>
                  <View className="flex-row flex-wrap mb-3">
                    <FilterChip label="Easy" isActive={selectedPlantDifficulty === 'easy'} onPress={() => setSelectedPlantDifficulty(selectedPlantDifficulty === 'easy' ? null : 'easy')} isDark={isDark} />
                    <FilterChip label="Moderate" isActive={selectedPlantDifficulty === 'moderate'} onPress={() => setSelectedPlantDifficulty(selectedPlantDifficulty === 'moderate' ? null : 'moderate')} isDark={isDark} />
                    <FilterChip label="Difficult" isActive={selectedPlantDifficulty === 'difficult'} onPress={() => setSelectedPlantDifficulty(selectedPlantDifficulty === 'difficult' ? null : 'difficult')} isDark={isDark} />
                  </View>

                  <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    Lighting
                  </Text>
                  <View className="flex-row flex-wrap">
                    <FilterChip label="Low" isActive={selectedPlantLighting === 'low'} onPress={() => setSelectedPlantLighting(selectedPlantLighting === 'low' ? null : 'low')} isDark={isDark} />
                    <FilterChip label="Medium" isActive={selectedPlantLighting === 'medium'} onPress={() => setSelectedPlantLighting(selectedPlantLighting === 'medium' ? null : 'medium')} isDark={isDark} />
                    <FilterChip label="High" isActive={selectedPlantLighting === 'high'} onPress={() => setSelectedPlantLighting(selectedPlantLighting === 'high' ? null : 'high')} isDark={isDark} />
                  </View>
                </>
              )}

              {hasActiveFilters && (
                <Pressable onPress={clearFilters} className="mt-3">
                  <Text className="text-sky-500 text-sm font-medium">Clear All Filters</Text>
                </Pressable>
              )}
            </View>
          )}

          {/* Results */}
          <View className="px-5 pt-4">
            <View className="flex-row items-center justify-between mb-4">
              <Text className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>
                {searchMode === 'fish' ? `${filteredFish.length} fish found` : `${filteredPlants.length} plants found`}
              </Text>
              {searchMode === 'fish' && (
                <View className="flex-row items-center">
                  <Sparkles size={14} color="#8B5CF6" />
                  <Text className={cn('text-xs ml-1', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    Tap sparkle to check compatibility
                  </Text>
                </View>
              )}
            </View>

            {searchMode === 'fish' ? (
              filteredFish.map((fish) => (
                <FishListItem
                  key={fish.id}
                  fish={fish}
                  onPress={() => router.push(`/fish/${fish.id}`)}
                  onCheckCompatibility={() => handleCheckCompatibility(fish)}
                  isDark={isDark}
                />
              ))
            ) : (
              filteredPlants.map((plant) => (
                <PlantListItem
                  key={plant.id}
                  plant={plant}
                  onPress={() => router.push(`/plant/${plant.id}`)}
                  isDark={isDark}
                />
              ))
            )}
          </View>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>

      {/* Compatibility Modal */}
      <CompatibilityModal
        visible={compatibilityModalVisible}
        onClose={() => {
          setCompatibilityModalVisible(false);
          setSelectedFishForCompatibility(null);
        }}
        selectedFish={selectedFishForCompatibility}
        isDark={isDark}
      />
    </View>
  );
}
