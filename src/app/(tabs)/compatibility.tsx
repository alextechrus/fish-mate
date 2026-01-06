import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Search,
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { fishDatabase, searchFish, getFishById } from '@/lib/data/fish-database';
import { Fish, CompatibilityResult, CompatibilityStatus } from '@/lib/types/fish';
import {
  checkMultipleFishCompatibility,
  checkTwoFishCompatibility,
  getSuggestedCompatibleFish,
} from '@/lib/utils/compatibility';
import { generateCompatibilityExplanation } from '@/lib/services/ai-service';
import { cn } from '@/lib/cn';
import { useMutation } from '@tanstack/react-query';

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
    <Image
      source={{ uri: fish.imageUrl }}
      className="w-6 h-6 rounded-full"
      resizeMode="cover"
    />
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

const FishSearchItem = ({
  fish,
  onSelect,
  isDark,
}: {
  fish: Fish;
  onSelect: () => void;
  isDark: boolean;
}) => (
  <Pressable
    onPress={onSelect}
    className={cn(
      'flex-row items-center p-3 border-b',
      isDark ? 'border-slate-700' : 'border-slate-100'
    )}
  >
    <Image
      source={{ uri: fish.imageUrl }}
      className="w-10 h-10 rounded-lg"
      resizeMode="cover"
    />
    <View className="flex-1 ml-3">
      <Text
        className={cn(
          'text-sm font-medium',
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
        {fish.waterType} • {fish.temperament}
      </Text>
    </View>
    <Plus size={20} color="#0EA5E9" />
  </Pressable>
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
          <Image
            source={{ uri: result.fish1.imageUrl }}
            className="w-10 h-10 rounded-lg"
            resizeMode="cover"
          />
          <View className="mx-2">
            <StatusIcon size={20} color={statusConfig.color} />
          </View>
          <Image
            source={{ uri: result.fish2.imageUrl }}
            className="w-10 h-10 rounded-lg"
            resizeMode="cover"
          />
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
              <Info size={14} color={statusConfig.color} className="mt-0.5" />
              <Text
                className={cn(
                  'text-sm ml-2 flex-1',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                {reason}
              </Text>
            </View>
          ))}

          {result.warnings?.map((warning, i) => (
            <View key={`w-${i}`} className="flex-row items-start mb-2">
              <AlertCircle size={14} color="#F59E0B" className="mt-0.5" />
              <Text
                className={cn(
                  'text-sm ml-2 flex-1',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                {warning}
              </Text>
            </View>
          ))}

          {result.suggestions?.map((suggestion, i) => (
            <View key={`s-${i}`} className="flex-row items-start mb-2">
              <Lightbulb size={14} color="#10B981" className="mt-0.5" />
              <Text
                className={cn(
                  'text-sm ml-2 flex-1',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                {suggestion}
              </Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
};

export default function CompatibilityScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedFish, setSelectedFish] = useState<Fish[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [expandedResult, setExpandedResult] = useState<string | null>(null);
  const [tankSize, setTankSize] = useState<string>('');

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchFish(searchQuery)
      .filter((f) => !selectedFish.some((s) => s.id === f.id))
      .slice(0, 10);
  }, [searchQuery, selectedFish]);

  const compatibilityResults = useMemo(() => {
    if (selectedFish.length < 2) return null;
    const tankSizeNum = tankSize ? parseInt(tankSize, 10) : undefined;
    return checkMultipleFishCompatibility(
      selectedFish.map((f) => f.id),
      tankSizeNum
    );
  }, [selectedFish, tankSize]);

  const suggestedFish = useMemo(() => {
    if (selectedFish.length === 0) return fishDatabase.filter((f) => f.careLevel === 'beginner').slice(0, 6);
    return getSuggestedCompatibleFish(
      selectedFish.map((f) => f.id),
      fishDatabase
    ).slice(0, 6);
  }, [selectedFish]);

  const handleAddFish = (fish: Fish) => {
    setSelectedFish((prev) => [...prev, fish]);
    setSearchQuery('');
    setShowSearch(false);
  };

  const handleRemoveFish = (fishId: string) => {
    setSelectedFish((prev) => prev.filter((f) => f.id !== fishId));
  };

  const clearAll = () => {
    setSelectedFish([]);
    setTankSize('');
  };

  const getOverallStatusColor = (status: CompatibilityStatus) => {
    return {
      compatible: '#10B981',
      conditional: '#F59E0B',
      incompatible: '#EF4444',
    }[status];
  };

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
            paddingTop: 16,
            paddingBottom: 20,
          }}
        >
          <View className="flex-row items-center mb-2">
            <Sparkles size={24} color="white" />
            <Text className="text-white text-2xl font-bold ml-2">
              Compatibility Checker
            </Text>
          </View>
          <Text className="text-white/80 text-sm">
            Select fish to check if they can live together
          </Text>
        </LinearGradient>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Tank Size Input */}
          <View className="px-5 pt-4">
            <Text
              className={cn(
                'text-sm font-semibold mb-2',
                isDark ? 'text-slate-300' : 'text-slate-600'
              )}
            >
              Tank Size (Optional)
            </Text>
            <View
              className={cn(
                'flex-row items-center px-4 py-3 rounded-xl',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
            >
              <TextInput
                value={tankSize}
                onChangeText={setTankSize}
                placeholder="Enter gallons..."
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                keyboardType="numeric"
                className={cn(
                  'flex-1 text-base',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              />
              <Text
                className={cn(
                  'text-sm',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}
              >
                gallons
              </Text>
            </View>
          </View>

          {/* Selected Fish */}
          <View className="px-5 pt-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text
                className={cn(
                  'text-sm font-semibold',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                Selected Fish ({selectedFish.length})
              </Text>
              {selectedFish.length > 0 && (
                <Pressable onPress={clearAll}>
                  <Text className="text-red-500 text-sm font-medium">
                    Clear All
                  </Text>
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
              <View
                className={cn(
                  'p-4 rounded-xl items-center',
                  isDark ? 'bg-slate-800' : 'bg-white'
                )}
              >
                <Text
                  className={cn(
                    'text-sm text-center',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                >
                  No fish selected. Add at least 2 fish to check compatibility.
                </Text>
              </View>
            )}

            {/* Add Fish Button/Search */}
            {showSearch ? (
              <View
                className={cn(
                  'mt-3 rounded-xl overflow-hidden',
                  isDark ? 'bg-slate-800' : 'bg-white'
                )}
              >
                <View
                  className={cn(
                    'flex-row items-center px-4 py-3 border-b',
                    isDark ? 'border-slate-700' : 'border-slate-100'
                  )}
                >
                  <Search size={20} color={isDark ? '#64748B' : '#94A3B8'} />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search fish..."
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    autoFocus
                    className={cn(
                      'flex-1 ml-3 text-base',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  />
                  <Pressable onPress={() => setShowSearch(false)}>
                    <X size={20} color={isDark ? '#64748B' : '#94A3B8'} />
                  </Pressable>
                </View>

                {searchResults.map((fish) => (
                  <FishSearchItem
                    key={fish.id}
                    fish={fish}
                    onSelect={() => handleAddFish(fish)}
                    isDark={isDark}
                  />
                ))}

                {searchQuery && searchResults.length === 0 && (
                  <View className="p-4">
                    <Text
                      className={cn(
                        'text-sm text-center',
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      )}
                    >
                      No fish found
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <Pressable
                onPress={() => setShowSearch(true)}
                className={cn(
                  'flex-row items-center justify-center mt-3 py-3 rounded-xl',
                  isDark ? 'bg-slate-800' : 'bg-white'
                )}
              >
                <Plus size={20} color="#0EA5E9" />
                <Text className="text-sky-500 font-semibold ml-2">Add Fish</Text>
              </Pressable>
            )}
          </View>

          {/* Results */}
          {compatibilityResults && (
            <View className="px-5 pt-6">
              {/* Overall Status */}
              <View
                className={cn(
                  'rounded-2xl p-5 mb-4',
                  isDark ? 'bg-slate-800' : 'bg-white'
                )}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text
                    className={cn(
                      'text-lg font-bold',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    Overall Status
                  </Text>
                  <View
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: `${getOverallStatusColor(
                        compatibilityResults.overallStatus
                      )}20`,
                    }}
                  >
                    <Text
                      className="text-sm font-semibold capitalize"
                      style={{
                        color: getOverallStatusColor(
                          compatibilityResults.overallStatus
                        ),
                      }}
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

                {compatibilityResults.suggestions.length > 0 && (
                  <View>
                    <Text
                      className={cn(
                        'text-sm font-semibold mb-2',
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      )}
                    >
                      Suggestions
                    </Text>
                    {compatibilityResults.suggestions.map((suggestion, i) => (
                      <View key={i} className="flex-row items-start mb-2">
                        <Lightbulb size={14} color="#10B981" />
                        <Text
                          className={cn(
                            'text-sm ml-2 flex-1',
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          )}
                        >
                          {suggestion}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Pair Results */}
              <Text
                className={cn(
                  'text-sm font-semibold mb-3',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                Pair-by-Pair Analysis
              </Text>
              {compatibilityResults.results.map((result) => {
                const key = `${result.fish1.id}-${result.fish2.id}`;
                return (
                  <CompatibilityResultCard
                    key={key}
                    result={result}
                    isExpanded={expandedResult === key}
                    onExpand={() =>
                      setExpandedResult(expandedResult === key ? null : key)
                    }
                    isDark={isDark}
                  />
                );
              })}
            </View>
          )}

          {/* Suggested Fish */}
          {suggestedFish.length > 0 && (
            <View className="px-5 pt-6 pb-8">
              <Text
                className={cn(
                  'text-lg font-bold mb-3',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                {selectedFish.length > 0
                  ? 'Suggested Compatible Fish'
                  : 'Popular Beginner Fish'}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginHorizontal: -20 }}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              >
                {suggestedFish.map((fish) => (
                  <Pressable
                    key={fish.id}
                    onPress={() => handleAddFish(fish)}
                    className={cn(
                      'w-32 mr-3 rounded-xl overflow-hidden',
                      isDark ? 'bg-slate-800' : 'bg-white'
                    )}
                  >
                    <Image
                      source={{ uri: fish.imageUrl }}
                      className="w-full h-20"
                      resizeMode="cover"
                    />
                    <View className="p-2">
                      <Text
                        className={cn(
                          'text-xs font-semibold',
                          isDark ? 'text-white' : 'text-slate-900'
                        )}
                        numberOfLines={1}
                      >
                        {fish.commonName}
                      </Text>
                      <Text
                        className={cn(
                          'text-xs',
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        )}
                      >
                        {fish.temperament}
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
