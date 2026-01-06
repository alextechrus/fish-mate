import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  Filter,
  X,
  Droplets,
  Ruler,
  Fish as FishIcon,
  Leaf,
  Sun,
  Sparkles,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
  DollarSign,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { fishDatabase, searchFish, getFishById } from '@/lib/data/fish-database';
import { plantDatabase, searchPlants, getPlantById, Plant } from '@/lib/data/plant-database';
import { Fish, WaterType, Temperament, CompatibilityResult } from '@/lib/types/fish';
import {
  checkMultipleFishCompatibility,
} from '@/lib/utils/compatibility';
import { cn } from '@/lib/cn';
import { useFishImage, usePlantImage } from '@/lib/hooks/useImageUrl';

type SearchMode = 'fish' | 'plants';
type ViewMode = 'browse' | 'compatibility';

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

const FishListItem = ({
  fish,
  onPress,
  isDark,
}: {
  fish: Fish;
  onPress: () => void;
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
            <Droplets
              size={12}
              color={fish.waterType === 'freshwater' ? '#3B82F6' : '#0EA5E9'}
            />
            <Text
              className={cn(
                'text-xs ml-1 capitalize',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {fish.waterType}
            </Text>
          </View>
          <View className="flex-row items-center">
            <DollarSign size={12} color="#10B981" />
            <Text
              className={cn(
                'text-xs ml-0.5',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              ${fish.price.min}-${fish.price.max}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const PlantListItem = ({
  plant,
  isDark,
}: {
  plant: Plant;
  isDark: boolean;
}) => {
  const difficultyColor = {
    easy: '#10B981',
    moderate: '#F59E0B',
    difficult: '#EF4444',
  }[plant.difficulty];

  return (
    <View
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
            <DollarSign size={12} color="#10B981" />
            <Text
              className={cn(
                'text-xs ml-0.5',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              ${plant.price.min}-${plant.price.max}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const SelectedFishChip = ({
  fish,
  onRemove,
  isDark,
}: {
  fish: Fish;
  onRemove: () => void;
  isDark: boolean;
}) => (
  <View
    className={cn(
      'flex-row items-center px-3 py-2 rounded-full mr-2 mb-2',
      isDark ? 'bg-slate-700' : 'bg-sky-100'
    )}
  >
    <FishImage fish={fish} className="w-6 h-6 rounded-full" />
    <Text
      className={cn(
        'text-sm font-medium mx-2',
        isDark ? 'text-white' : 'text-sky-900'
      )}
      numberOfLines={1}
    >
      {fish.commonName}
    </Text>
    <Pressable onPress={onRemove}>
      <X size={16} color={isDark ? '#94A3B8' : '#0369A1'} />
    </Pressable>
  </View>
);

const CompatibilityResultCard = ({
  result,
  onExpand,
  isExpanded,
  isDark,
}: {
  result: CompatibilityResult;
  onExpand: () => void;
  isExpanded: boolean;
  isDark: boolean;
}) => {
  const statusConfig = {
    compatible: {
      color: '#10B981',
      bgColor: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50',
      icon: CheckCircle,
      label: 'Compatible',
    },
    conditional: {
      color: '#F59E0B',
      bgColor: isDark ? 'bg-amber-900/30' : 'bg-amber-50',
      icon: AlertCircle,
      label: 'Conditional',
    },
    incompatible: {
      color: '#EF4444',
      bgColor: isDark ? 'bg-red-900/30' : 'bg-red-50',
      icon: AlertTriangle,
      label: 'Incompatible',
    },
  }[result.status];

  const StatusIcon = statusConfig.icon;

  return (
    <Pressable
      onPress={onExpand}
      className={cn('rounded-xl mb-3 overflow-hidden', statusConfig.bgColor)}
    >
      <View className="flex-row items-center p-4">
        <View className="flex-row items-center flex-1">
          <FishImage fish={result.fish1} className="w-10 h-10 rounded-lg" />
          <View className="mx-2">
            <StatusIcon size={20} color={statusConfig.color} />
          </View>
          <FishImage fish={result.fish2} className="w-10 h-10 rounded-lg" />
          <View className="ml-3 flex-1">
            <Text
              className={cn(
                'text-sm font-semibold',
                isDark ? 'text-white' : 'text-slate-900'
              )}
              numberOfLines={1}
            >
              {result.fish1.commonName} + {result.fish2.commonName}
            </Text>
            <Text
              className="text-xs font-medium"
              style={{ color: statusConfig.color }}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>
        {isExpanded ? (
          <ChevronUp size={20} color={isDark ? '#94A3B8' : '#64748B'} />
        ) : (
          <ChevronDown size={20} color={isDark ? '#94A3B8' : '#64748B'} />
        )}
      </View>

      {isExpanded && (
        <View
          className={cn(
            'px-4 pb-4 pt-2 border-t',
            isDark ? 'border-slate-700' : 'border-slate-200'
          )}
        >
          {result.reasons.map((reason, i) => (
            <View key={i} className="flex-row items-start mb-2">
              <Text
                className={cn(
                  'text-sm ml-2 flex-1',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                • {reason}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
};

export default function SearchScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // State
  const [searchMode, setSearchMode] = useState<SearchMode>('fish');
  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWaterType, setSelectedWaterType] = useState<WaterType | null>(null);
  const [selectedTemperament, setSelectedTemperament] = useState<Temperament | null>(null);
  const [selectedCareLevel, setSelectedCareLevel] = useState<'beginner' | 'intermediate' | 'advanced' | null>(null);
  const [selectedPlantDifficulty, setSelectedPlantDifficulty] = useState<'easy' | 'moderate' | 'difficult' | null>(null);
  const [selectedPlantLighting, setSelectedPlantLighting] = useState<'low' | 'medium' | 'high' | null>(null);

  // Compatibility state
  const [selectedFish, setSelectedFish] = useState<Fish[]>([]);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [tankSize, setTankSize] = useState<string>('');

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

  const compatibilityResults = useMemo(() => {
    if (selectedFish.length < 2) return null;
    const tankSizeNum = tankSize ? parseInt(tankSize, 10) : undefined;
    return checkMultipleFishCompatibility(
      selectedFish.map((f) => f.id),
      tankSizeNum
    );
  }, [selectedFish, tankSize]);

  // Fish for compatibility selector (exclude already selected)
  const availableFish = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchFish(searchQuery)
      .filter((f) => !selectedFish.some((s) => s.id === f.id))
      .slice(0, 10);
  }, [searchQuery, selectedFish]);

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

  const handleAddFish = (fish: Fish) => {
    setSelectedFish((prev) => [...prev, fish]);
    setSearchQuery('');
  };

  const handleRemoveFish = (fishId: string) => {
    setSelectedFish((prev) => prev.filter((f) => f.id !== fishId));
  };

  const getOverallStatusColor = (status: string) => {
    return {
      compatible: '#10B981',
      conditional: '#F59E0B',
      incompatible: '#EF4444',
    }[status] || '#64748B';
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

          {/* Mode Toggles */}
          <View className="flex-row mb-3">
            {/* Fish/Plants Toggle */}
            <View className="flex-row bg-white/20 rounded-lg p-1 mr-2">
              <Pressable
                onPress={() => setSearchMode('fish')}
                className={cn(
                  'flex-row items-center px-3 py-1.5 rounded-md',
                  searchMode === 'fish' ? 'bg-white' : ''
                )}
              >
                <FishIcon size={16} color={searchMode === 'fish' ? '#0EA5E9' : 'white'} />
                <Text
                  className={cn(
                    'text-sm font-medium ml-1.5',
                    searchMode === 'fish' ? 'text-sky-500' : 'text-white'
                  )}
                >
                  Fish
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setSearchMode('plants')}
                className={cn(
                  'flex-row items-center px-3 py-1.5 rounded-md',
                  searchMode === 'plants' ? 'bg-white' : ''
                )}
              >
                <Leaf size={16} color={searchMode === 'plants' ? '#10B981' : 'white'} />
                <Text
                  className={cn(
                    'text-sm font-medium ml-1.5',
                    searchMode === 'plants' ? 'text-emerald-500' : 'text-white'
                  )}
                >
                  Plants
                </Text>
              </Pressable>
            </View>

            {/* Browse/Compatibility Toggle (Fish only) */}
            {searchMode === 'fish' && (
              <View className="flex-row bg-white/20 rounded-lg p-1">
                <Pressable
                  onPress={() => setViewMode('browse')}
                  className={cn(
                    'px-3 py-1.5 rounded-md',
                    viewMode === 'browse' ? 'bg-white' : ''
                  )}
                >
                  <Text
                    className={cn(
                      'text-sm font-medium',
                      viewMode === 'browse' ? 'text-sky-500' : 'text-white'
                    )}
                  >
                    Browse
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setViewMode('compatibility')}
                  className={cn(
                    'flex-row items-center px-3 py-1.5 rounded-md',
                    viewMode === 'compatibility' ? 'bg-white' : ''
                  )}
                >
                  <Sparkles size={14} color={viewMode === 'compatibility' ? '#8B5CF6' : 'white'} />
                  <Text
                    className={cn(
                      'text-sm font-medium ml-1',
                      viewMode === 'compatibility' ? 'text-violet-500' : 'text-white'
                    )}
                  >
                    Check
                  </Text>
                </Pressable>
              </View>
            )}
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
              placeholder={viewMode === 'compatibility' ? 'Search fish to add...' : `Search ${searchMode}...`}
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
          {/* Browse Mode */}
          {viewMode === 'browse' && (
            <>
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
                <Text className={cn('text-sm mb-4', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  {searchMode === 'fish' ? `${filteredFish.length} fish found` : `${filteredPlants.length} plants found`}
                </Text>

                {searchMode === 'fish' ? (
                  filteredFish.map((fish) => (
                    <FishListItem
                      key={fish.id}
                      fish={fish}
                      onPress={() => router.push(`/fish/${fish.id}`)}
                      isDark={isDark}
                    />
                  ))
                ) : (
                  filteredPlants.map((plant) => (
                    <PlantListItem key={plant.id} plant={plant} isDark={isDark} />
                  ))
                )}
              </View>
            </>
          )}

          {/* Compatibility Mode */}
          {viewMode === 'compatibility' && searchMode === 'fish' && (
            <View className="px-5 pt-4">
              {/* Tank Size */}
              <View className="mb-4">
                <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-600')}>
                  Tank Size (Optional)
                </Text>
                <View className={cn('flex-row items-center px-4 py-3 rounded-xl', isDark ? 'bg-slate-800' : 'bg-white')}>
                  <TextInput
                    value={tankSize}
                    onChangeText={setTankSize}
                    placeholder="Enter gallons..."
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    keyboardType="numeric"
                    style={{
                      flex: 1,
                      fontSize: 16,
                      color: isDark ? '#FFFFFF' : '#0F172A',
                    }}
                  />
                  <Text className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>gallons</Text>
                </View>
              </View>

              {/* Selected Fish */}
              <View className="mb-4">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className={cn('text-sm font-semibold', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    Selected Fish ({selectedFish.length})
                  </Text>
                  {selectedFish.length > 0 && (
                    <Pressable onPress={() => setSelectedFish([])}>
                      <Text className="text-red-500 text-sm font-medium">Clear All</Text>
                    </Pressable>
                  )}
                </View>

                {selectedFish.length > 0 ? (
                  <View className="flex-row flex-wrap">
                    {selectedFish.map((fish) => (
                      <SelectedFishChip
                        key={fish.id}
                        fish={fish}
                        onRemove={() => handleRemoveFish(fish.id)}
                        isDark={isDark}
                      />
                    ))}
                  </View>
                ) : (
                  <View className={cn('p-4 rounded-xl items-center', isDark ? 'bg-slate-800' : 'bg-white')}>
                    <Text className={cn('text-sm text-center', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      Search and add at least 2 fish to check compatibility
                    </Text>
                  </View>
                )}
              </View>

              {/* Search Results for adding fish */}
              {searchQuery && availableFish.length > 0 && (
                <View className={cn('rounded-xl overflow-hidden mb-4', isDark ? 'bg-slate-800' : 'bg-white')}>
                  {availableFish.map((fish) => (
                    <Pressable
                      key={fish.id}
                      onPress={() => handleAddFish(fish)}
                      className={cn('flex-row items-center p-3 border-b', isDark ? 'border-slate-700' : 'border-slate-100')}
                    >
                      <FishImage fish={fish} className="w-10 h-10 rounded-lg" />
                      <View className="flex-1 ml-3">
                        <Text className={cn('text-sm font-medium', isDark ? 'text-white' : 'text-slate-900')}>
                          {fish.commonName}
                        </Text>
                        <Text className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                          {fish.waterType} • {fish.temperament}
                        </Text>
                      </View>
                      <Plus size={20} color="#0EA5E9" />
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Results */}
              {compatibilityResults && (
                <View className="mb-4">
                  <View className={cn('rounded-2xl p-5 mb-4', isDark ? 'bg-slate-800' : 'bg-white')}>
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-slate-900')}>
                        Overall Status
                      </Text>
                      <View
                        className="px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${getOverallStatusColor(compatibilityResults.overallStatus)}20` }}
                      >
                        <Text
                          className="text-sm font-semibold capitalize"
                          style={{ color: getOverallStatusColor(compatibilityResults.overallStatus) }}
                        >
                          {compatibilityResults.overallStatus}
                        </Text>
                      </View>
                    </View>

                    {compatibilityResults.tankSizeWarning && (
                      <View className="flex-row items-start p-3 rounded-lg bg-amber-500/10 mb-3">
                        <AlertTriangle size={18} color="#F59E0B" />
                        <Text className="text-amber-600 text-sm ml-2 flex-1">
                          {compatibilityResults.tankSizeWarning}
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text className={cn('text-sm font-semibold mb-3', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    Pair-by-Pair Analysis
                  </Text>
                  {compatibilityResults.results.map((result) => {
                    const key = `${result.fish1.id}-${result.fish2.id}`;
                    return (
                      <CompatibilityResultCard
                        key={key}
                        result={result}
                        isExpanded={expandedResult === key}
                        onExpand={() => setExpandedResult(expandedResult === key ? null : key)}
                        isDark={isDark}
                      />
                    );
                  })}
                </View>
              )}
            </View>
          )}

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
