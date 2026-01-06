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
import {
  Search,
  Filter,
  X,
  Droplets,
  Waves,
  Thermometer,
  Ruler,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { fishDatabase, searchFish, filterFish } from '@/lib/data/fish-database';
import { Fish, WaterType, Temperament } from '@/lib/types/fish';
import { cn } from '@/lib/cn';

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

  const careLevelColor = {
    beginner: '#10B981',
    intermediate: '#F59E0B',
    advanced: '#EF4444',
  }[fish.careLevel];

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
      <Image
        source={{ uri: fish.imageUrl }}
        className="w-20 h-20 rounded-xl"
        resizeMode="cover"
      />
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
            <Ruler size={12} color={isDark ? '#94A3B8' : '#64748B'} />
            <Text
              className={cn(
                'text-xs ml-1',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {fish.minTankSize}g min
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

export default function BrowseScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedWaterType, setSelectedWaterType] = useState<WaterType | null>(
    null
  );
  const [selectedTemperament, setSelectedTemperament] =
    useState<Temperament | null>(null);
  const [selectedCareLevel, setSelectedCareLevel] = useState<
    'beginner' | 'intermediate' | 'advanced' | null
  >(null);

  const filteredFish = useMemo(() => {
    let results = fishDatabase;

    // Search query
    if (searchQuery.trim()) {
      results = searchFish(searchQuery);
    }

    // Apply filters
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

  const clearFilters = () => {
    setSelectedWaterType(null);
    setSelectedTemperament(null);
    setSelectedCareLevel(null);
  };

  const hasActiveFilters =
    selectedWaterType || selectedTemperament || selectedCareLevel;

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <View className="px-5 pt-4 pb-2">
          <Text
            className={cn(
              'text-2xl font-bold mb-4',
              isDark ? 'text-white' : 'text-slate-900'
            )}
          >
            Browse Fish
          </Text>

          {/* Search Bar */}
          <View
            className={cn(
              'flex-row items-center px-4 py-3 rounded-xl',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
          >
            <Search size={20} color={isDark ? '#64748B' : '#94A3B8'} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              className={cn(
                'flex-1 ml-3 text-base',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={20} color={isDark ? '#64748B' : '#94A3B8'} />
              </Pressable>
            ) : null}
          </View>

          {/* Filter Toggle */}
          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            className={cn(
              'flex-row items-center mt-3 px-4 py-2 rounded-lg self-start',
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
              'px-5 py-4 border-b',
              isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'
            )}
          >
            {/* Water Type */}
            <Text
              className={cn(
                'text-sm font-semibold mb-2',
                isDark ? 'text-slate-300' : 'text-slate-600'
              )}
            >
              Water Type
            </Text>
            <View className="flex-row flex-wrap mb-3">
              <FilterChip
                label="Freshwater"
                isActive={selectedWaterType === 'freshwater'}
                onPress={() =>
                  setSelectedWaterType(
                    selectedWaterType === 'freshwater' ? null : 'freshwater'
                  )
                }
                isDark={isDark}
              />
              <FilterChip
                label="Saltwater"
                isActive={selectedWaterType === 'saltwater'}
                onPress={() =>
                  setSelectedWaterType(
                    selectedWaterType === 'saltwater' ? null : 'saltwater'
                  )
                }
                isDark={isDark}
              />
            </View>

            {/* Temperament */}
            <Text
              className={cn(
                'text-sm font-semibold mb-2',
                isDark ? 'text-slate-300' : 'text-slate-600'
              )}
            >
              Temperament
            </Text>
            <View className="flex-row flex-wrap mb-3">
              <FilterChip
                label="Peaceful"
                isActive={selectedTemperament === 'peaceful'}
                onPress={() =>
                  setSelectedTemperament(
                    selectedTemperament === 'peaceful' ? null : 'peaceful'
                  )
                }
                isDark={isDark}
              />
              <FilterChip
                label="Semi-Aggressive"
                isActive={selectedTemperament === 'semi-aggressive'}
                onPress={() =>
                  setSelectedTemperament(
                    selectedTemperament === 'semi-aggressive'
                      ? null
                      : 'semi-aggressive'
                  )
                }
                isDark={isDark}
              />
              <FilterChip
                label="Aggressive"
                isActive={selectedTemperament === 'aggressive'}
                onPress={() =>
                  setSelectedTemperament(
                    selectedTemperament === 'aggressive' ? null : 'aggressive'
                  )
                }
                isDark={isDark}
              />
            </View>

            {/* Care Level */}
            <Text
              className={cn(
                'text-sm font-semibold mb-2',
                isDark ? 'text-slate-300' : 'text-slate-600'
              )}
            >
              Care Level
            </Text>
            <View className="flex-row flex-wrap mb-3">
              <FilterChip
                label="Beginner"
                isActive={selectedCareLevel === 'beginner'}
                onPress={() =>
                  setSelectedCareLevel(
                    selectedCareLevel === 'beginner' ? null : 'beginner'
                  )
                }
                isDark={isDark}
              />
              <FilterChip
                label="Intermediate"
                isActive={selectedCareLevel === 'intermediate'}
                onPress={() =>
                  setSelectedCareLevel(
                    selectedCareLevel === 'intermediate' ? null : 'intermediate'
                  )
                }
                isDark={isDark}
              />
              <FilterChip
                label="Advanced"
                isActive={selectedCareLevel === 'advanced'}
                onPress={() =>
                  setSelectedCareLevel(
                    selectedCareLevel === 'advanced' ? null : 'advanced'
                  )
                }
                isDark={isDark}
              />
            </View>

            {hasActiveFilters && (
              <Pressable onPress={clearFilters} className="self-start">
                <Text className="text-sky-500 text-sm font-medium">
                  Clear All Filters
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Results */}
        <ScrollView
          className="flex-1 px-5 pt-4"
          showsVerticalScrollIndicator={false}
        >
          <Text
            className={cn(
              'text-sm mb-4',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}
          >
            {filteredFish.length} fish found
          </Text>

          {filteredFish.map((fish) => (
            <FishListItem
              key={fish.id}
              fish={fish}
              onPress={() => router.push(`/fish/${fish.id}`)}
              isDark={isDark}
            />
          ))}

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
