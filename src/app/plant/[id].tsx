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
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
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
  Award,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { getPlantById, PlantPlacement } from '@/lib/data/plant-database';
import { getFishById } from '@/lib/data/fish-database';
import { Fish } from '@/lib/types/fish';
import { cn } from '@/lib/cn';
import { useTankStore } from '@/lib/state/tank-store';
import { useSettingsStore, formatTemperatureRange } from '@/lib/state/settings-store';
import { usePlantImage, useFishImage } from '@/lib/hooks/useImageUrl';
import {
  getCompatibilityExplanation,
  lightingDefinitions,
  difficultyDefinitions,
} from '@/lib/utils/plant-compatibility';

// Growth rate explanations
const growthRateExplanations: Record<string, { title: string; description: string; care: string }> = {
  slow: {
    title: 'Slow Growth',
    description: 'This plant grows at a leisurely pace, typically adding only a few centimeters per month.',
    care: 'Requires less frequent trimming and maintenance. Great for low-tech tanks as it doesn\'t demand high nutrients or CO2. May take several months to fill in an area.',
  },
  moderate: {
    title: 'Moderate Growth',
    description: 'This plant grows at a balanced pace, adding noticeable new growth each week.',
    care: 'Needs regular but not excessive trimming. Benefits from balanced fertilization. Good choice for most aquariums as it fills in steadily without becoming overwhelming.',
  },
  fast: {
    title: 'Fast Growth',
    description: 'This plant grows rapidly, often adding several centimeters per week under good conditions.',
    care: 'Requires frequent trimming to prevent overgrowth. High nutrient demands - needs regular fertilization. Excellent for outcompeting algae and quickly establishing a planted look.',
  },
};

// Placement explanations
const placementExplanations: Record<string, { title: string; description: string; tips: string }> = {
  foreground: {
    title: 'Foreground Placement',
    description: 'These are short, carpet-like plants that stay under 5cm tall. They\'re placed at the front of your aquarium.',
    tips: 'Plant in the front section of your tank where they won\'t block the view. Great for creating lush carpet effects. Typically need higher light as they\'re furthest from the light source.',
  },
  midground: {
    title: 'Midground Placement',
    description: 'Medium-height plants (5-20cm) that create visual transitions between front and back of the tank.',
    tips: 'Place in the middle section of your aquarium. Use to add depth and dimension. Can be used around hardscape (rocks/wood) to soften edges.',
  },
  background: {
    title: 'Background Placement',
    description: 'Tall plants (20cm+) that create a backdrop and hide equipment like heaters and filters.',
    tips: 'Plant at the rear of your tank. These grow tall and create a natural backdrop. Trim regularly to prevent them from blocking light to other plants.',
  },
  floating: {
    title: 'Floating Placement',
    description: 'These plants float freely on the water surface, with roots dangling below.',
    tips: 'Simply place on the water surface - no planting needed. Provides shade for fish that prefer dimmer conditions. Can help reduce algae by competing for nutrients. May need thinning to prevent blocking too much light.',
  },
};

// Dynamic Placement Icon - highlights the relevant placement zone
const PlacementIcon = ({ placement, size = 24, color = '#64748B' }: { placement: PlantPlacement; size?: number; color?: string }) => {
  const layerHeight = size / 5;
  const activeColor = color;
  const inactiveColor = `${color}40`;

  // For floating, show wavy lines at top
  if (placement === 'floating') {
    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        {/* Floating wavy lines */}
        <View
          style={{
            width: size * 0.8,
            height: layerHeight * 1.2,
            backgroundColor: activeColor,
            borderRadius: 4,
            marginBottom: 3,
          }}
        />
        <View
          style={{
            width: size * 0.6,
            height: layerHeight,
            backgroundColor: inactiveColor,
            marginBottom: 2,
          }}
        />
        <View
          style={{
            width: size * 0.7,
            height: layerHeight,
            backgroundColor: inactiveColor,
            marginBottom: 2,
          }}
        />
        <View
          style={{
            width: size * 0.8,
            height: layerHeight,
            backgroundColor: inactiveColor,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Background layer (top) */}
      <View
        style={{
          width: size * 0.8,
          height: placement === 'background' ? layerHeight * 1.5 : layerHeight,
          backgroundColor: placement === 'background' ? activeColor : inactiveColor,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          marginBottom: 2,
        }}
      />
      {/* Midground layer (middle) */}
      <View
        style={{
          width: size * 0.8,
          height: placement === 'midground' ? layerHeight * 1.5 : layerHeight,
          backgroundColor: placement === 'midground' ? activeColor : inactiveColor,
          marginBottom: 2,
        }}
      />
      {/* Foreground layer (bottom) */}
      <View
        style={{
          width: size * 0.8,
          height: placement === 'foreground' ? layerHeight * 1.5 : layerHeight,
          backgroundColor: placement === 'foreground' ? activeColor : inactiveColor,
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
        }}
      />
    </View>
  );
};

// Info tooltips content
const sectionInfo: Record<string, { title: string; content: string }> = {
  waterParameters: {
    title: 'Why Water Parameters Matter',
    content: 'Water parameters are critical for plant health. Temperature, pH, and hardness must match your plant\'s requirements. Incorrect parameters can cause melting, stunted growth, or death. Always cycle your tank and test water regularly.',
  },
  fishCompatibility: {
    title: 'Why Fish Compatibility Matters',
    content: 'Some fish will eat, uproot, or damage plants. Herbivorous fish like goldfish and silver dollars destroy most plants. Cichlids dig and uproot. Choose fish that complement your planted tank goals.',
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

// Collapsible info row component
const CollapsibleInfoRow = ({
  icon: Icon,
  customIcon,
  title,
  value,
  expandedContent,
  isExpanded,
  onToggle,
  isDark,
  iconColor,
  isLast = false,
}: {
  icon?: React.ElementType;
  customIcon?: React.ReactNode;
  title: string;
  value: string;
  expandedContent: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  isDark: boolean;
  iconColor?: string;
  isLast?: boolean;
}) => {
  const rotation = useSharedValue(isExpanded ? 1 : 0);

  React.useEffect(() => {
    rotation.value = withTiming(isExpanded ? 1 : 0, { duration: 200 });
  }, [isExpanded, rotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rotation.value, [0, 1], [0, 180])}deg` }],
  }));

  return (
    <View
      className={cn(
        !isLast && 'border-b',
        isDark ? 'border-slate-700' : 'border-slate-100'
      )}
    >
      <Pressable
        onPress={onToggle}
        className="flex-row items-center py-4"
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-3"
          style={{ backgroundColor: `${iconColor || '#64748B'}20` }}
        >
          {customIcon ? customIcon : Icon && <Icon size={20} color={iconColor || (isDark ? '#94A3B8' : '#64748B')} />}
        </View>
        <View className="flex-1">
          <Text
            className={cn(
              'text-xs',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}
          >
            {title}
          </Text>
          <Text
            className={cn(
              'text-base font-semibold',
              isDark ? 'text-white' : 'text-slate-900'
            )}
          >
            {value}
          </Text>
        </View>
        <Animated.View style={chevronStyle}>
          <ChevronDown size={20} color={isDark ? '#64748B' : '#94A3B8'} />
        </Animated.View>
      </Pressable>

      {isExpanded && (
        <View
          className={cn(
            'pb-4 px-2',
            isDark ? 'bg-slate-800/50' : 'bg-slate-50'
          )}
          style={{ marginLeft: 52, marginRight: 8, borderRadius: 12, marginBottom: 8 }}
        >
          <View className="p-3">
            {expandedContent}
          </View>
        </View>
      )}
    </View>
  );
};

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

  const rotation = useSharedValue(expanded ? 1 : 0);

  React.useEffect(() => {
    rotation.value = withTiming(expanded ? 1 : 0, { duration: 200 });
  }, [expanded, rotation]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(rotation.value, [0, 1], [0, 180])}deg` }],
  }));

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
          <Animated.View style={chevronStyle}>
            <ChevronDown size={16} color={isDark ? '#94A3B8' : '#64748B'} />
          </Animated.View>
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
  const temperatureUnit = useSettingsStore((s) => s.temperatureUnit);

  const [infoModal, setInfoModal] = useState<{
    visible: boolean;
    info: { title: string; content: string } | null;
  }>({ visible: false, info: null });

  const [expandedFishId, setExpandedFishId] = useState<string | null>(null);
  const [expandedInfoSection, setExpandedInfoSection] = useState<string | null>(null);

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

  const toggleInfoSection = (section: string) => {
    setExpandedInfoSection(expandedInfoSection === section ? null : section);
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

  const growthColor = {
    slow: '#3B82F6',
    moderate: '#F59E0B',
    fast: '#10B981',
  }[plant.growthRate];

  const placementColor = {
    foreground: '#EC4899',
    midground: '#8B5CF6',
    background: '#06B6D4',
    floating: '#10B981',
  }[plant.placement];

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

          {/* Collapsible Plant Info Card */}
          <View
            className={cn(
              'rounded-2xl mb-4 overflow-hidden',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 3,
            }}
          >
            <View className="px-4">
              {/* Difficulty */}
              <CollapsibleInfoRow
                icon={Award}
                title="Difficulty"
                value={plant.difficulty.charAt(0).toUpperCase() + plant.difficulty.slice(1)}
                iconColor={difficultyColor}
                isExpanded={expandedInfoSection === 'difficulty'}
                onToggle={() => toggleInfoSection('difficulty')}
                isDark={isDark}
                expandedContent={
                  <View>
                    <Text
                      className={cn(
                        'text-sm font-semibold mb-2',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      {plant.difficulty.charAt(0).toUpperCase() + plant.difficulty.slice(1)} Difficulty
                    </Text>
                    <Text
                      className={cn(
                        'text-xs leading-5 mb-3',
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      )}
                    >
                      {difficultyDefinitions[plant.difficulty].description}
                    </Text>
                    <Text
                      className={cn(
                        'text-xs font-medium mb-1',
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      )}
                    >
                      Requirements:
                    </Text>
                    {difficultyDefinitions[plant.difficulty].requirements.map((req, i) => (
                      <Text
                        key={i}
                        className={cn(
                          'text-xs leading-5 ml-2',
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        )}
                      >
                        • {req}
                      </Text>
                    ))}
                    <Text
                      className={cn(
                        'text-xs mt-2 italic',
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      )}
                    >
                      {difficultyDefinitions[plant.difficulty].suitableFor}
                    </Text>
                  </View>
                }
              />

              {/* Lighting */}
              <CollapsibleInfoRow
                icon={Sun}
                title="Lighting"
                value={`${plant.lighting.charAt(0).toUpperCase() + plant.lighting.slice(1)} (${lightingDefinitions[plant.lighting].parRange})`}
                iconColor={lightingColor}
                isExpanded={expandedInfoSection === 'lighting'}
                onToggle={() => toggleInfoSection('lighting')}
                isDark={isDark}
                expandedContent={
                  <View>
                    <Text
                      className={cn(
                        'text-sm font-semibold mb-2',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      {plant.lighting.charAt(0).toUpperCase() + plant.lighting.slice(1)} Light
                    </Text>
                    <Text
                      className={cn(
                        'text-xs leading-5 mb-2',
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      )}
                    >
                      {lightingDefinitions[plant.lighting].description}
                    </Text>
                    <View
                      className={cn(
                        'p-2 rounded-lg mt-1',
                        isDark ? 'bg-slate-700' : 'bg-slate-100'
                      )}
                    >
                      <Text
                        className={cn(
                          'text-xs font-medium',
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        )}
                      >
                        PAR Range: {lightingDefinitions[plant.lighting].parRange}
                      </Text>
                    </View>
                  </View>
                }
              />

              {/* Growth */}
              <CollapsibleInfoRow
                icon={TrendingUp}
                title="Growth Rate"
                value={plant.growthRate.charAt(0).toUpperCase() + plant.growthRate.slice(1)}
                iconColor={growthColor}
                isExpanded={expandedInfoSection === 'growth'}
                onToggle={() => toggleInfoSection('growth')}
                isDark={isDark}
                expandedContent={
                  <View>
                    <Text
                      className={cn(
                        'text-sm font-semibold mb-2',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      {growthRateExplanations[plant.growthRate].title}
                    </Text>
                    <Text
                      className={cn(
                        'text-xs leading-5 mb-2',
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      )}
                    >
                      {growthRateExplanations[plant.growthRate].description}
                    </Text>
                    <Text
                      className={cn(
                        'text-xs font-medium mb-1',
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      )}
                    >
                      What this means for you:
                    </Text>
                    <Text
                      className={cn(
                        'text-xs leading-5',
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      )}
                    >
                      {growthRateExplanations[plant.growthRate].care}
                    </Text>
                  </View>
                }
              />

              {/* Placement */}
              <CollapsibleInfoRow
                customIcon={<PlacementIcon placement={plant.placement} size={20} color={placementColor} />}
                title="Placement"
                value={plant.placement.charAt(0).toUpperCase() + plant.placement.slice(1)}
                iconColor={placementColor}
                isExpanded={expandedInfoSection === 'placement'}
                onToggle={() => toggleInfoSection('placement')}
                isDark={isDark}
                isLast
                expandedContent={
                  <View>
                    <Text
                      className={cn(
                        'text-sm font-semibold mb-2',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      {placementExplanations[plant.placement].title}
                    </Text>
                    <Text
                      className={cn(
                        'text-xs leading-5 mb-2',
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      )}
                    >
                      {placementExplanations[plant.placement].description}
                    </Text>
                    <Text
                      className={cn(
                        'text-xs font-medium mb-1',
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      )}
                    >
                      Placement Tips:
                    </Text>
                    <Text
                      className={cn(
                        'text-xs leading-5',
                        isDark ? 'text-slate-300' : 'text-slate-600'
                      )}
                    >
                      {placementExplanations[plant.placement].tips}
                    </Text>
                  </View>
                }
              />
            </View>
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
                      {formatTemperatureRange(
                        plant.waterParameters.temperatureMin,
                        plant.waterParameters.temperatureMax,
                        temperatureUnit
                      )}
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
            <SectionHeader title="Requirements" isDark={isDark} />
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

          {/* Price & Find Store - Moved below Requirements */}
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
