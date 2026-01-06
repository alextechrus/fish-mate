import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronLeft,
  Thermometer,
  Droplets,
  Sun,
  Leaf,
  AlertTriangle,
  CheckCircle,
  Layers,
  Plus,
  Info,
  X,
  PoundSterling,
  MapPin,
  ExternalLink,
  Beaker,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Zap,
  Award,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { getPlantById } from '@/lib/data/plant-database';
import { getFishById } from '@/lib/data/fish-database';
import { Fish } from '@/lib/types/fish';
import { cn } from '@/lib/cn';
import { useTankStore } from '@/lib/state/tank-store';
import { usePlantImage, useFishImage } from '@/lib/hooks/useImageUrl';
import {
  getCompatibilityExplanation,
  lightingDefinitions,
  difficultyDefinitions,
} from '@/lib/utils/plant-compatibility';

// Info tooltips content
const sectionInfo: Record<string, { title: string; content: string }> = {
  waterParameters: {
    title: 'Why Water Parameters Matter',
    content: 'Water parameters are critical for plant health. Temperature, pH, and hardness must match your plant\'s requirements. Incorrect parameters can cause melting, stunted growth, or death. Always cycle your tank and test water regularly.',
  },
  lighting: {
    title: 'Understanding PAR Lighting',
    content: 'PAR (Photosynthetically Active Radiation) measures usable light for plants.\n\nLow Light: 15-30 PAR - Basic aquarium lights suffice.\n\nMedium Light: 30-50 PAR - Quality planted tank LED needed.\n\nHigh Light: 50-100+ PAR - Professional lighting required, usually with CO2.',
  },
  placement: {
    title: 'Why Placement Matters',
    content: 'Proper placement ensures all plants get adequate light and space. Foreground plants stay short, background plants grow tall. Floating plants provide shade. Consider growth rate and final size when planting.',
  },
  fishCompatibility: {
    title: 'Why Fish Compatibility Matters',
    content: 'Some fish will eat, uproot, or damage plants. Herbivorous fish like goldfish and silver dollars destroy most plants. Cichlids dig and uproot. Choose fish that complement your planted tank goals.',
  },
  difficulty: {
    title: 'Understanding Plant Difficulty',
    content: 'Easy: Thrives with basic lighting, no CO2, minimal care.\n\nModerate: Needs decent light, benefits from CO2, stable conditions.\n\nDifficult: Requires high light, CO2 injection, and precise care routine.',
  },
};

const InfoModal = ({
  visible,
  onClose,
  info,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  info: { title: string; content: string } | null;
  isDark: boolean;
}) => {
  if (!info) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        className="flex-1 justify-center items-center bg-black/50 px-6"
        onPress={onClose}
      >
        <View
          className={cn(
            'rounded-2xl p-6 w-full max-w-sm',
            isDark ? 'bg-slate-800' : 'bg-white'
          )}
        >
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-row items-center flex-1">
              <Info size={20} color="#10B981" />
              <Text
                className={cn(
                  'text-lg font-bold ml-2 flex-1',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                {info.title}
              </Text>
            </View>
            <Pressable onPress={onClose}>
              <X size={24} color={isDark ? '#94A3B8' : '#64748B'} />
            </Pressable>
          </View>
          <Text
            className={cn(
              'text-sm leading-6',
              isDark ? 'text-slate-300' : 'text-slate-600'
            )}
          >
            {info.content}
          </Text>
        </View>
      </Pressable>
    </Modal>
  );
};

const SectionHeader = ({
  title,
  infoKey,
  onInfoPress,
  isDark,
}: {
  title: string;
  infoKey?: string;
  onInfoPress?: (key: string) => void;
  isDark: boolean;
}) => (
  <View className="flex-row items-center justify-between mb-3">
    <Text
      className={cn(
        'text-lg font-bold',
        isDark ? 'text-white' : 'text-slate-900'
      )}
    >
      {title}
    </Text>
    {infoKey && onInfoPress && (
      <Pressable
        onPress={() => onInfoPress(infoKey)}
        className="p-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Info size={18} color={isDark ? '#94A3B8' : '#64748B'} />
      </Pressable>
    )}
  </View>
);

const StatCard = ({
  icon: Icon,
  title,
  value,
  isDark,
  iconColor,
}: {
  icon: React.ElementType;
  title: string;
  value: string;
  isDark: boolean;
  iconColor?: string;
}) => (
  <View
    className={cn(
      'flex-1 p-4 rounded-xl mr-3 last:mr-0',
      isDark ? 'bg-slate-800' : 'bg-white'
    )}
  >
    <Icon size={20} color={iconColor || (isDark ? '#94A3B8' : '#64748B')} />
    <Text
      className={cn(
        'text-xs mt-2 mb-1',
        isDark ? 'text-slate-400' : 'text-slate-500'
      )}
    >
      {title}
    </Text>
    <Text
      className={cn(
        'text-sm font-semibold',
        isDark ? 'text-white' : 'text-slate-900'
      )}
    >
      {value}
    </Text>
  </View>
);

// Separate component for fish image to handle hook properly
const FishImageDisplay = ({ fishId }: { fishId: string }) => {
  const fish = getFishById(fishId);
  const imageUrl = useFishImage(fishId, fish?.imageUrl || '');

  if (!fish) return null;

  return (
    <Image
      source={{ uri: imageUrl }}
      className="w-12 h-12 rounded-lg"
      resizeMode="cover"
    />
  );
};

const FishCompatibilityItem = ({
  fish,
  status,
  onPress,
  isDark,
  expanded,
  onToggleExpand,
}: {
  fish: Fish;
  status: 'compatible' | 'incompatible';
  onPress: () => void;
  isDark: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
}) => {
  const statusConfig = {
    compatible: { color: '#10B981', icon: CheckCircle, label: 'Safe' },
    incompatible: { color: '#EF4444', icon: AlertTriangle, label: 'Avoid' },
  }[status];

  const StatusIcon = statusConfig.icon;
  const explanation = getCompatibilityExplanation(fish.id, status);

  return (
    <View
      className={cn(
        'rounded-xl mb-2 overflow-hidden',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}
    >
      <Pressable
        onPress={onToggleExpand}
        className="flex-row items-center p-3"
      >
        <FishImageDisplay fishId={fish.id} />
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
            {explanation.reason}
          </Text>
        </View>
        <View className="flex-row items-center">
          <StatusIcon size={16} color={statusConfig.color} />
          <Text
            className="text-xs font-medium ml-1 mr-2"
            style={{ color: statusConfig.color }}
          >
            {statusConfig.label}
          </Text>
          {expanded ? (
            <ChevronUp size={16} color={isDark ? '#94A3B8' : '#64748B'} />
          ) : (
            <ChevronDown size={16} color={isDark ? '#94A3B8' : '#64748B'} />
          )}
        </View>
      </Pressable>

      {expanded && (
        <View
          className={cn(
            'px-3 pb-3 pt-0 border-t',
            isDark ? 'border-slate-700' : 'border-slate-100'
          )}
        >
          <Text
            className={cn(
              'text-xs leading-5 mt-2',
              isDark ? 'text-slate-300' : 'text-slate-600'
            )}
          >
            {explanation.details}
          </Text>
          <Pressable
            onPress={onPress}
            className={cn(
              'mt-3 py-2 rounded-lg flex-row items-center justify-center',
              isDark ? 'bg-slate-700' : 'bg-slate-100'
            )}
          >
            <Text
              className={cn(
                'text-xs font-medium',
                isDark ? 'text-slate-300' : 'text-slate-600'
              )}
            >
              View Fish Profile
            </Text>
            <ExternalLink size={12} color={isDark ? '#94A3B8' : '#64748B'} className="ml-1" />
          </Pressable>
        </View>
      )}
    </View>
  );
};

// Wrapper to filter valid fish
const FishCompatibilityList = ({
  fishIds,
  status,
  onPress,
  isDark,
  expandedFishId,
  onToggleExpand,
}: {
  fishIds: string[];
  status: 'compatible' | 'incompatible';
  onPress: (id: string) => void;
  isDark: boolean;
  expandedFishId: string | null;
  onToggleExpand: (id: string) => void;
}) => {
  const validFish = fishIds
    .map(id => getFishById(id))
    .filter((f): f is Fish => f !== undefined)
    .slice(0, 5);

  return (
    <>
      {validFish.map((fish) => (
        <FishCompatibilityItem
          key={fish.id}
          fish={fish}
          status={status}
          onPress={() => onPress(fish.id)}
          isDark={isDark}
          expanded={expandedFishId === fish.id}
          onToggleExpand={() => onToggleExpand(fish.id)}
        />
      ))}
    </>
  );
};

export default function PlantProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const addPlantToTank = useTankStore((s) => s.addPlantToTank);
  const tanks = useTankStore((s) => s.tanks);

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    info: { title: string; content: string } | null;
  }>({ visible: false, info: null });

  const [expandedFishId, setExpandedFishId] = useState<string | null>(null);

  const plant = getPlantById(id || '');

  // Call hook unconditionally with fallback - pass name for auto-generation
  const imageUrl = usePlantImage(
    id || '',
    plant?.imageUrl || '',
    plant?.commonName,
    plant?.scientificName
  );

  if (!plant) {
    return (
      <View className={cn('flex-1 items-center justify-center', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <Text className={cn('text-lg', isDark ? 'text-white' : 'text-slate-900')}>
          Plant not found
        </Text>
      </View>
    );
  }

  const handleInfoPress = (key: string) => {
    const info = sectionInfo[key];
    if (info) {
      setInfoModal({ visible: true, info });
    }
  };

  const handleAddToTank = () => {
    if (tanks.length === 0) {
      router.push('/(tabs)/my-tank');
      return;
    }
    // Add to first tank for now
    addPlantToTank(tanks[0].id, plant.id);
    router.back();
  };

  const handleFindStore = () => {
    const query = encodeURIComponent(`aquarium plant store near me ${plant.commonName}`);
    Linking.openURL(`https://www.google.com/search?q=${query}`);
  };

  const avgPrice = (plant.price.min + plant.price.max) / 2;

  const difficultyColor = {
    easy: '#10B981',
    moderate: '#F59E0B',
    difficult: '#EF4444',
  }[plant.difficulty];

  const lightingColor = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#EF4444',
  }[plant.lighting];

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative">
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-64"
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent', 'transparent', isDark ? '#0F172A' : '#F8FAFC']}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />

          {/* Back Button */}
          <SafeAreaView
            edges={['top']}
            className="absolute top-0 left-0 right-0"
          >
            <View className="flex-row justify-between items-center px-4 pt-2">
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
              >
                <ChevronLeft size={24} color="white" />
              </Pressable>
              <Pressable
                onPress={handleAddToTank}
                className="flex-row items-center px-4 py-2 rounded-full bg-emerald-500"
              >
                <Plus size={18} color="white" />
                <Text className="text-white font-semibold text-sm ml-1">
                  Add to Tank
                </Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </View>

        <View className="px-5 -mt-8">
          {/* Name Card */}
          <View
            className={cn(
              'rounded-2xl p-5 mb-4',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 5,
            }}
          >
            <View className="flex-row items-start justify-between">
              <View className="flex-1">
                <Text
                  className={cn(
                    'text-2xl font-bold mb-1',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {plant.commonName}
                </Text>
                <Text
                  className={cn(
                    'text-sm italic mb-3',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                >
                  {plant.scientificName}
                </Text>
              </View>
              <View
                className="px-3 py-1 rounded-full"
                style={{ backgroundColor: `${difficultyColor}20` }}
              >
                <Text
                  className="text-sm font-semibold capitalize"
                  style={{ color: difficultyColor }}
                >
                  {plant.difficulty}
                </Text>
              </View>
            </View>

            <Text
              className={cn(
                'text-sm leading-6',
                isDark ? 'text-slate-300' : 'text-slate-600'
              )}
            >
              {plant.description}
            </Text>
          </View>

          {/* Quick Stats */}
          <View className="flex-row mb-4">
            <Pressable
              className="flex-1 mr-3"
              onPress={() => handleInfoPress('lighting')}
            >
              <View
                className={cn(
                  'p-4 rounded-xl',
                  isDark ? 'bg-slate-800' : 'bg-white'
                )}
              >
                <View className="flex-row items-center justify-between">
                  <Sun size={20} color={lightingColor} />
                  <Info size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                </View>
                <Text
                  className={cn(
                    'text-xs mt-2 mb-1',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                >
                  Lighting
                </Text>
                <Text
                  className={cn(
                    'text-sm font-semibold',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {plant.lighting.charAt(0).toUpperCase() + plant.lighting.slice(1)}
                </Text>
                <Text
                  className={cn(
                    'text-xs mt-0.5',
                    isDark ? 'text-slate-500' : 'text-slate-400'
                  )}
                >
                  {lightingDefinitions[plant.lighting].parRange}
                </Text>
              </View>
            </Pressable>
            <StatCard
              icon={Layers}
              title="Placement"
              value={plant.placement.charAt(0).toUpperCase() + plant.placement.slice(1)}
              isDark={isDark}
            />
            <StatCard
              icon={TrendingUp}
              title="Growth"
              value={plant.growthRate.charAt(0).toUpperCase() + plant.growthRate.slice(1)}
              isDark={isDark}
              iconColor="#10B981"
            />
          </View>

          {/* Difficulty Explanation Card */}
          <Pressable
            onPress={() => handleInfoPress('difficulty')}
            className={cn(
              'rounded-2xl p-4 mb-4',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Award size={18} color={difficultyColor} />
                <Text
                  className={cn(
                    'text-sm font-semibold ml-2',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {plant.difficulty.charAt(0).toUpperCase() + plant.difficulty.slice(1)} Difficulty
                </Text>
              </View>
              <Info size={14} color={isDark ? '#64748B' : '#94A3B8'} />
            </View>
            <Text
              className={cn(
                'text-xs leading-5',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {difficultyDefinitions[plant.difficulty].suitableFor}
            </Text>
            <View className="flex-row flex-wrap mt-2">
              {difficultyDefinitions[plant.difficulty].requirements.slice(0, 3).map((req, index) => (
                <View
                  key={index}
                  className={cn(
                    'px-2 py-1 rounded-full mr-1 mb-1',
                    isDark ? 'bg-slate-700' : 'bg-slate-100'
                  )}
                >
                  <Text
                    className={cn(
                      'text-xs',
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    )}
                  >
                    {req}
                  </Text>
                </View>
              ))}
            </View>
          </Pressable>

          {/* Price & Find Store */}
          <View
            className={cn(
              'rounded-2xl p-5 mb-4',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View>
                <Text
                  className={cn(
                    'text-xs mb-1',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                >
                  Price Range
                </Text>
                <View className="flex-row items-center">
                  <PoundSterling size={20} color="#10B981" />
                  <Text
                    className={cn(
                      'text-2xl font-bold ml-1',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    {plant.price.min}-{plant.price.max}
                  </Text>
                </View>
              </View>
              <View className="items-end">
                <Text
                  className={cn(
                    'text-xs mb-1',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                >
                  Average
                </Text>
                <Text
                  className={cn(
                    'text-lg font-semibold',
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  )}
                >
                  £{avgPrice.toFixed(0)}
                </Text>
              </View>
            </View>

            <Pressable
              onPress={handleFindStore}
              className="flex-row items-center justify-center py-3 rounded-xl bg-emerald-500"
            >
              <MapPin size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Find Local Store</Text>
              <ExternalLink size={14} color="white" className="ml-2" />
            </Pressable>
          </View>

          {/* Water Parameters */}
          <View className="mb-4">
            <SectionHeader
              title="Water Parameters"
              infoKey="waterParameters"
              onInfoPress={handleInfoPress}
              isDark={isDark}
            />
            <View
              className={cn(
                'rounded-2xl p-4',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
            >
              <View className="flex-row mb-3">
                <View className="flex-1 flex-row items-center">
                  <Thermometer size={16} color="#EF4444" />
                  <View className="ml-2">
                    <Text
                      className={cn(
                        'text-xs',
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      )}
                    >
                      Temperature
                    </Text>
                    <Text
                      className={cn(
                        'text-sm font-semibold',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      {plant.waterParameters.temperatureMin}°-{plant.waterParameters.temperatureMax}°F
                    </Text>
                  </View>
                </View>
                <View className="flex-1 flex-row items-center">
                  <Beaker size={16} color="#8B5CF6" />
                  <View className="ml-2">
                    <Text
                      className={cn(
                        'text-xs',
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      )}
                    >
                      pH Level
                    </Text>
                    <Text
                      className={cn(
                        'text-sm font-semibold',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      {plant.waterParameters.phMin}-{plant.waterParameters.phMax}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="flex-row items-center">
                <Droplets size={16} color="#3B82F6" />
                <View className="ml-2">
                  <Text
                    className={cn(
                      'text-xs',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    Hardness (dGH)
                  </Text>
                  <Text
                    className={cn(
                      'text-sm font-semibold',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    {plant.waterParameters.hardnessMin}-{plant.waterParameters.hardnessMax}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Requirements */}
          <View className="mb-4">
            <SectionHeader
              title="Requirements"
              infoKey="lighting"
              onInfoPress={handleInfoPress}
              isDark={isDark}
            />
            <View
              className={cn(
                'rounded-2xl p-4',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
            >
              <View className="flex-row flex-wrap">
                <View className="flex-row items-center mr-4 mb-2">
                  <View
                    className={cn(
                      'w-8 h-8 rounded-full items-center justify-center',
                      plant.co2Required ? 'bg-amber-500/20' : 'bg-emerald-500/20'
                    )}
                  >
                    <Beaker size={16} color={plant.co2Required ? '#F59E0B' : '#10B981'} />
                  </View>
                  <Text
                    className={cn(
                      'text-sm ml-2',
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    )}
                  >
                    {plant.co2Required ? 'CO2 Required' : 'No CO2 Needed'}
                  </Text>
                </View>
                <View className="flex-row items-center mr-4 mb-2">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${lightingColor}20` }}
                  >
                    <Sun size={16} color={lightingColor} />
                  </View>
                  <Text
                    className={cn(
                      'text-sm ml-2 capitalize',
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    )}
                  >
                    {plant.lighting} Light
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Care Notes */}
          <View className="mb-4">
            <SectionHeader title="Care Notes" isDark={isDark} />
            <View
              className={cn(
                'rounded-2xl p-4',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
            >
              <Text
                className={cn(
                  'text-sm leading-6',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                {plant.careNotes}
              </Text>
            </View>
          </View>

          {/* Fish Compatibility */}
          <View className="mb-4">
            <SectionHeader
              title="Fish Compatibility"
              infoKey="fishCompatibility"
              onInfoPress={handleInfoPress}
              isDark={isDark}
            />

            {plant.incompatibleWithFish.length > 0 && (
              <>
                <Text
                  className={cn(
                    'text-sm font-semibold mb-2',
                    isDark ? 'text-red-400' : 'text-red-600'
                  )}
                >
                  Avoid These Fish
                </Text>
                <FishCompatibilityList
                  fishIds={plant.incompatibleWithFish}
                  status="incompatible"
                  onPress={(fishId) => router.push(`/fish/${fishId}`)}
                  isDark={isDark}
                  expandedFishId={expandedFishId}
                  onToggleExpand={(fishId) => setExpandedFishId(expandedFishId === fishId ? null : fishId)}
                />
              </>
            )}

            {plant.compatibleWithFish.length > 0 && (
              <>
                <Text
                  className={cn(
                    'text-sm font-semibold mb-2 mt-4',
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  )}
                >
                  Safe With These Fish
                </Text>
                <FishCompatibilityList
                  fishIds={plant.compatibleWithFish}
                  status="compatible"
                  onPress={(fishId) => router.push(`/fish/${fishId}`)}
                  isDark={isDark}
                  expandedFishId={expandedFishId}
                  onToggleExpand={(fishId) => setExpandedFishId(expandedFishId === fishId ? null : fishId)}
                />
              </>
            )}
          </View>

          <View className="h-8" />
        </View>
      </ScrollView>

      <InfoModal
        visible={infoModal.visible}
        onClose={() => setInfoModal({ visible: false, info: null })}
        info={infoModal.info}
        isDark={isDark}
      />
    </View>
  );
}
