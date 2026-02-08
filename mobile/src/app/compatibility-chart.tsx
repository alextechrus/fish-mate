import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Search,
  X,
  Plus,
  ChevronLeft,
  Grid3X3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { fishDatabase, searchFish, getFishById } from '@/lib/data/fish-database';
import { Fish } from '@/lib/types/fish';
import { checkTwoFishCompatibility } from '@/lib/utils/compatibility';
import { cn } from '@/lib/cn';
import { getImageSource } from '@/lib/utils/image-source';

const MAX_FISH = 5;

type CompatibilityScore = 'compatible' | 'conditional' | 'incompatible';

interface ChartCell {
  fish1: Fish;
  fish2: Fish;
  status: CompatibilityScore;
  reasons: string[];
}

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
      source={getImageSource(fish.imageUrl)}
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

const CompatibilityMatrix = ({
  selectedFish,
  isDark,
  onCellPress,
}: {
  selectedFish: Fish[];
  isDark: boolean;
  onCellPress: (cell: ChartCell) => void;
}) => {
  const screenWidth = Dimensions.get('window').width;
  const cellSize = Math.min(60, (screenWidth - 120) / (selectedFish.length + 1));
  const headerCellSize = cellSize;

  // Generate compatibility matrix
  const matrix = useMemo(() => {
    const result: (ChartCell | null)[][] = [];
    for (let i = 0; i < selectedFish.length; i++) {
      const row: (ChartCell | null)[] = [];
      for (let j = 0; j < selectedFish.length; j++) {
        if (i === j) {
          row.push(null); // Diagonal - same fish
        } else {
          const compatibility = checkTwoFishCompatibility(selectedFish[i], selectedFish[j]);
          row.push({
            fish1: selectedFish[i],
            fish2: selectedFish[j],
            status: compatibility.status,
            reasons: [...(compatibility.reasons || []), ...(compatibility.warnings || [])],
          });
        }
      }
      result.push(row);
    }
    return result;
  }, [selectedFish]);

  const getStatusColor = (status: CompatibilityScore) => {
    switch (status) {
      case 'compatible':
        return '#10B981';
      case 'conditional':
        return '#F59E0B';
      case 'incompatible':
        return '#EF4444';
    }
  };

  const getStatusBg = (status: CompatibilityScore) => {
    switch (status) {
      case 'compatible':
        return isDark ? '#10B98130' : '#10B98120';
      case 'conditional':
        return isDark ? '#F59E0B30' : '#F59E0B20';
      case 'incompatible':
        return isDark ? '#EF444430' : '#EF444420';
    }
  };

  const StatusIcon = ({ status }: { status: CompatibilityScore }) => {
    const color = getStatusColor(status);
    const size = 20;
    switch (status) {
      case 'compatible':
        return <CheckCircle2 size={size} color={color} />;
      case 'conditional':
        return <AlertTriangle size={size} color={color} />;
      case 'incompatible':
        return <XCircle size={size} color={color} />;
    }
  };

  if (selectedFish.length < 2) {
    return (
      <View className={cn(
        'rounded-2xl p-8 items-center mx-5',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}>
        <Grid3X3 size={48} color={isDark ? '#475569' : '#94A3B8'} />
        <Text className={cn(
          'text-base font-semibold mt-4 text-center',
          isDark ? 'text-white' : 'text-slate-900'
        )}>
          Add at least 2 fish
        </Text>
        <Text className={cn(
          'text-sm mt-2 text-center',
          isDark ? 'text-slate-400' : 'text-slate-500'
        )}>
          Select 2-5 fish to see their compatibility chart
        </Text>
      </View>
    );
  }

  return (
    <View className={cn(
      'rounded-2xl p-4 mx-5 overflow-hidden',
      isDark ? 'bg-slate-800' : 'bg-white'
    )}>
      {/* Legend */}
      <View className="flex-row justify-center mb-4 flex-wrap">
        <View className="flex-row items-center mx-2 mb-2">
          <View className="w-4 h-4 rounded-full mr-1" style={{ backgroundColor: '#10B981' }} />
          <Text className={cn('text-xs', isDark ? 'text-slate-300' : 'text-slate-600')}>
            Compatible
          </Text>
        </View>
        <View className="flex-row items-center mx-2 mb-2">
          <View className="w-4 h-4 rounded-full mr-1" style={{ backgroundColor: '#F59E0B' }} />
          <Text className={cn('text-xs', isDark ? 'text-slate-300' : 'text-slate-600')}>
            Use Caution
          </Text>
        </View>
        <View className="flex-row items-center mx-2 mb-2">
          <View className="w-4 h-4 rounded-full mr-1" style={{ backgroundColor: '#EF4444' }} />
          <Text className={cn('text-xs', isDark ? 'text-slate-300' : 'text-slate-600')}>
            Not Compatible
          </Text>
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Header row with fish images */}
          <View className="flex-row">
            {/* Empty corner cell */}
            <View style={{ width: headerCellSize, height: headerCellSize }} />
            {/* Column headers */}
            {selectedFish.map((fish) => (
              <View
                key={`header-${fish.id}`}
                style={{ width: cellSize, height: headerCellSize }}
                className="items-center justify-center p-1"
              >
                <Image
                  source={getImageSource(fish.imageUrl)}
                  style={{ width: cellSize - 8, height: cellSize - 8, borderRadius: 8 }}
                  resizeMode="cover"
                />
              </View>
            ))}
          </View>

          {/* Matrix rows */}
          {selectedFish.map((rowFish, rowIndex) => (
            <View key={`row-${rowFish.id}`} className="flex-row">
              {/* Row header with fish image */}
              <View
                style={{ width: headerCellSize, height: cellSize }}
                className="items-center justify-center p-1"
              >
                <Image
                  source={getImageSource(rowFish.imageUrl)}
                  style={{ width: headerCellSize - 8, height: cellSize - 8, borderRadius: 8 }}
                  resizeMode="cover"
                />
              </View>

              {/* Matrix cells */}
              {matrix[rowIndex].map((cell, colIndex) => (
                <Pressable
                  key={`cell-${rowIndex}-${colIndex}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: cell ? getStatusBg(cell.status) : (isDark ? '#1E293B' : '#F1F5F9'),
                    borderRadius: 8,
                    margin: 2,
                  }}
                  className="items-center justify-center"
                  onPress={() => cell && onCellPress(cell)}
                  disabled={!cell}
                >
                  {cell ? (
                    <StatusIcon status={cell.status} />
                  ) : (
                    <View
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: isDark ? '#334155' : '#CBD5E1' }}
                    />
                  )}
                </Pressable>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Tap hint */}
      <View className="flex-row items-center justify-center mt-4">
        <Info size={14} color={isDark ? '#64748B' : '#94A3B8'} />
        <Text className={cn('text-xs ml-1', isDark ? 'text-slate-500' : 'text-slate-400')}>
          Tap a cell for details
        </Text>
      </View>
    </View>
  );
};

const CompatibilityDetailModal = ({
  cell,
  onClose,
  isDark,
}: {
  cell: ChartCell | null;
  onClose: () => void;
  isDark: boolean;
}) => {
  if (!cell) return null;

  const getStatusConfig = (status: CompatibilityScore) => {
    switch (status) {
      case 'compatible':
        return {
          color: '#10B981',
          bg: isDark ? 'bg-emerald-900/30' : 'bg-emerald-50',
          label: 'Compatible',
          icon: CheckCircle2,
        };
      case 'conditional':
        return {
          color: '#F59E0B',
          bg: isDark ? 'bg-amber-900/30' : 'bg-amber-50',
          label: 'Use Caution',
          icon: AlertTriangle,
        };
      case 'incompatible':
        return {
          color: '#EF4444',
          bg: isDark ? 'bg-red-900/30' : 'bg-red-50',
          label: 'Not Compatible',
          icon: XCircle,
        };
    }
  };

  const config = getStatusConfig(cell.status);
  const StatusIcon = config.icon;

  return (
    <Pressable
      className="absolute inset-0 bg-black/50 items-center justify-center p-5"
      onPress={onClose}
    >
      <Pressable
        className={cn(
          'w-full rounded-2xl overflow-hidden',
          isDark ? 'bg-slate-800' : 'bg-white'
        )}
        onPress={(e) => e.stopPropagation()}
      >
        {/* Header with fish images */}
        <View className={cn('p-4 flex-row items-center justify-center', config.bg)}>
          <Image
            source={getImageSource(cell.fish1.imageUrl)}
            className="w-16 h-16 rounded-xl"
            resizeMode="cover"
          />
          <View className="mx-4 items-center">
            <StatusIcon size={32} color={config.color} />
            <Text
              className="text-xs font-semibold mt-1"
              style={{ color: config.color }}
            >
              {config.label}
            </Text>
          </View>
          <Image
            source={getImageSource(cell.fish2.imageUrl)}
            className="w-16 h-16 rounded-xl"
            resizeMode="cover"
          />
        </View>

        {/* Fish names */}
        <View className="px-4 pt-4">
          <Text
            className={cn(
              'text-center text-base font-bold',
              isDark ? 'text-white' : 'text-slate-900'
            )}
          >
            {cell.fish1.commonName} + {cell.fish2.commonName}
          </Text>
        </View>

        {/* Reasons */}
        <View className="p-4">
          {cell.reasons.length > 0 ? (
            cell.reasons.map((reason, index) => (
              <View key={index} className="flex-row items-start mb-2">
                <View
                  className="w-2 h-2 rounded-full mt-1.5 mr-2"
                  style={{ backgroundColor: config.color }}
                />
                <Text
                  className={cn(
                    'text-sm flex-1',
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  )}
                >
                  {reason}
                </Text>
              </View>
            ))
          ) : (
            <Text
              className={cn(
                'text-sm text-center',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              These fish are compatible tank mates!
            </Text>
          )}
        </View>

        {/* Close button */}
        <Pressable
          onPress={onClose}
          className={cn(
            'mx-4 mb-4 py-3 rounded-xl items-center',
            isDark ? 'bg-slate-700' : 'bg-slate-100'
          )}
        >
          <Text className={cn(
            'font-semibold',
            isDark ? 'text-white' : 'text-slate-900'
          )}>
            Close
          </Text>
        </Pressable>
      </Pressable>
    </Pressable>
  );
};

export default function CompatibilityChartScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedFish, setSelectedFish] = useState<Fish[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCell, setSelectedCell] = useState<ChartCell | null>(null);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return fishDatabase.slice(0, 10);
    return searchFish(searchQuery)
      .filter((f) => !selectedFish.some((s) => s.id === f.id))
      .slice(0, 10);
  }, [searchQuery, selectedFish]);

  const handleAddFish = (fish: Fish) => {
    if (selectedFish.length < MAX_FISH) {
      setSelectedFish((prev) => [...prev, fish]);
      setSearchQuery('');
      setShowSearch(false);
    }
  };

  const handleRemoveFish = (fishId: string) => {
    setSelectedFish((prev) => prev.filter((f) => f.id !== fishId));
  };

  const clearAll = () => {
    setSelectedFish([]);
  };

  // Calculate overall compatibility score
  const overallScore = useMemo(() => {
    if (selectedFish.length < 2) return null;

    let compatible = 0;
    let conditional = 0;
    let incompatible = 0;

    for (let i = 0; i < selectedFish.length; i++) {
      for (let j = i + 1; j < selectedFish.length; j++) {
        const result = checkTwoFishCompatibility(selectedFish[i], selectedFish[j]);
        if (result.status === 'compatible') compatible++;
        else if (result.status === 'conditional') conditional++;
        else incompatible++;
      }
    }

    const total = compatible + conditional + incompatible;
    return {
      compatible,
      conditional,
      incompatible,
      total,
      percentage: Math.round((compatible / total) * 100),
    };
  }, [selectedFish]);

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
            paddingBottom: 20,
          }}
        >
          <View className="flex-row items-center mb-3">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3"
            >
              <ChevronLeft size={24} color="white" />
            </Pressable>
            <View className="flex-1">
              <Text className="text-white text-xl font-bold">
                Compatibility Chart
              </Text>
              <Text className="text-white/80 text-sm">
                Select up to 5 fish to compare
              </Text>
            </View>
            <View className="bg-white/20 rounded-full px-3 py-1">
              <Text className="text-white font-bold">
                {selectedFish.length}/{MAX_FISH}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Selected Fish Row */}
          <View className="px-5 pt-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text
                className={cn(
                  'text-sm font-semibold',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                Selected Fish
              </Text>
              {selectedFish.length > 0 && (
                <Pressable onPress={clearAll}>
                  <Text className="text-red-500 text-sm font-medium">
                    Clear All
                  </Text>
                </Pressable>
              )}
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ paddingRight: 20 }}
            >
              {selectedFish.map((fish) => (
                <View
                  key={fish.id}
                  className={cn(
                    'mr-3 rounded-xl overflow-hidden',
                    isDark ? 'bg-slate-800' : 'bg-white'
                  )}
                  style={{ width: 80 }}
                >
                  <Image
                    source={getImageSource(fish.imageUrl)}
                    className="w-full h-16"
                    resizeMode="cover"
                  />
                  <View className="p-2">
                    <Text
                      className={cn(
                        'text-xs font-medium',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                      numberOfLines={1}
                    >
                      {fish.commonName}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleRemoveFish(fish.id)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 items-center justify-center"
                  >
                    <X size={14} color="white" />
                  </Pressable>
                </View>
              ))}

              {/* Add button */}
              {selectedFish.length < MAX_FISH && (
                <Pressable
                  onPress={() => setShowSearch(true)}
                  className={cn(
                    'rounded-xl items-center justify-center',
                    isDark ? 'bg-slate-800' : 'bg-white'
                  )}
                  style={{ width: 80, height: 92 }}
                >
                  <View className="w-10 h-10 rounded-full bg-sky-500/20 items-center justify-center">
                    <Plus size={24} color="#0EA5E9" />
                  </View>
                  <Text className="text-sky-500 text-xs font-medium mt-2">
                    Add Fish
                  </Text>
                </Pressable>
              )}
            </ScrollView>
          </View>

          {/* Overall Score */}
          {overallScore && (
            <View className="px-5 pt-6">
              <View
                className={cn(
                  'rounded-2xl p-4',
                  isDark ? 'bg-slate-800' : 'bg-white'
                )}
              >
                <Text
                  className={cn(
                    'text-base font-bold mb-3',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Overall Compatibility
                </Text>

                {/* Score bars */}
                <View className="flex-row h-4 rounded-full overflow-hidden mb-3">
                  {overallScore.compatible > 0 && (
                    <View
                      style={{
                        flex: overallScore.compatible,
                        backgroundColor: '#10B981',
                      }}
                    />
                  )}
                  {overallScore.conditional > 0 && (
                    <View
                      style={{
                        flex: overallScore.conditional,
                        backgroundColor: '#F59E0B',
                      }}
                    />
                  )}
                  {overallScore.incompatible > 0 && (
                    <View
                      style={{
                        flex: overallScore.incompatible,
                        backgroundColor: '#EF4444',
                      }}
                    />
                  )}
                </View>

                <View className="flex-row justify-between">
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-emerald-500 mr-1" />
                    <Text className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {overallScore.compatible} pairs
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-amber-500 mr-1" />
                    <Text className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {overallScore.conditional} pairs
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    <View className="w-3 h-3 rounded-full bg-red-500 mr-1" />
                    <Text className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {overallScore.incompatible} pairs
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Compatibility Matrix */}
          <View className="pt-6 pb-8">
            <Text
              className={cn(
                'text-base font-bold mb-3 px-5',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              Compatibility Matrix
            </Text>
            <CompatibilityMatrix
              selectedFish={selectedFish}
              isDark={isDark}
              onCellPress={setSelectedCell}
            />
          </View>
        </ScrollView>

        {/* Search Modal */}
        {showSearch && (
          <Pressable
            className="absolute inset-0 bg-black/50"
            onPress={() => setShowSearch(false)}
          >
            <View className={cn(
              'absolute bottom-0 left-0 right-0 rounded-t-3xl',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}>
              <SafeAreaView edges={['bottom']}>
                <View className="p-4">
                  <View className="flex-row items-center justify-between mb-4">
                    <Text className={cn(
                      'text-lg font-bold',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}>
                      Add Fish
                    </Text>
                    <Pressable onPress={() => setShowSearch(false)}>
                      <X size={24} color={isDark ? '#94A3B8' : '#64748B'} />
                    </Pressable>
                  </View>

                  <View
                    className={cn(
                      'flex-row items-center px-4 py-3 rounded-xl mb-4',
                      isDark ? 'bg-slate-700' : 'bg-slate-100'
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
                  </View>

                  <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={false}>
                    {searchResults
                      .filter((f) => !selectedFish.some((s) => s.id === f.id))
                      .map((fish) => (
                        <FishSearchItem
                          key={fish.id}
                          fish={fish}
                          onSelect={() => handleAddFish(fish)}
                          isDark={isDark}
                        />
                      ))}
                  </ScrollView>
                </View>
              </SafeAreaView>
            </View>
          </Pressable>
        )}

        {/* Detail Modal */}
        {selectedCell && (
          <CompatibilityDetailModal
            cell={selectedCell}
            onClose={() => setSelectedCell(null)}
            isDark={isDark}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
