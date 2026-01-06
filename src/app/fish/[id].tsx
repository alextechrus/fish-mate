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
  Ruler,
  Fish as FishIcon,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Heart,
  Layers,
  Utensils,
  Home,
  Plus,
  Info,
  X,
  DollarSign,
  MapPin,
  ExternalLink,
  Beaker,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { getFishById, fishDatabase } from '@/lib/data/fish-database';
import { Fish } from '@/lib/types/fish';
import { cn } from '@/lib/cn';
import { useTankStore } from '@/lib/state/tank-store';

// Info tooltips content
const sectionInfo: Record<string, { title: string; content: string }> = {
  waterParameters: {
    title: 'Why Water Parameters Matter',
    content: 'Water parameters are critical for fish health. Temperature, pH, and hardness must match your fish\'s natural habitat. Incorrect parameters can cause stress, disease, weakened immunity, and death. Always cycle your tank and test water regularly. Sudden changes in parameters can be fatal - make gradual adjustments only.',
  },
  dietFeeding: {
    title: 'Why Diet & Feeding Matters',
    content: 'Proper nutrition keeps fish healthy and vibrant. Overfeeding pollutes water and causes disease. Underfeeding leads to malnutrition and aggression. Feed small amounts 1-2 times daily - only what can be eaten in 2-3 minutes. Vary the diet with flakes, pellets, and frozen foods for optimal health.',
  },
  tankRequirements: {
    title: 'Why Tank Requirements Matter',
    content: 'Meeting tank requirements prevents stress and territorial aggression. Plants provide oxygen and hiding spots. Schooling fish need companions to feel secure - keeping them alone causes chronic stress. Hiding spaces reduce aggression and allow fish to establish territories. Always research before buying.',
  },
  compatibility: {
    title: 'Why Compatibility Matters',
    content: 'Incompatible fish leads to aggression, stress, injury, and death. Consider temperament, size, water parameters, and territory needs. Peaceful fish may be bullied or eaten by aggressive species. Always research compatibility before adding new fish to avoid costly and heartbreaking mistakes.',
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
              <Info size={20} color="#0EA5E9" />
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
  icon: Icon,
  title,
  infoKey,
  onInfoPress,
  isDark,
  iconColor,
}: {
  icon: React.ElementType;
  title: string;
  infoKey?: string;
  onInfoPress?: (key: string) => void;
  isDark: boolean;
  iconColor?: string;
}) => (
  <View className="flex-row items-center justify-between mb-4">
    <View className="flex-row items-center">
      <Icon size={20} color={iconColor || (isDark ? '#94A3B8' : '#64748B')} />
      <Text
        className={cn(
          'text-lg font-bold ml-2',
          isDark ? 'text-white' : 'text-slate-900'
        )}
      >
        {title}
      </Text>
    </View>
    {infoKey && onInfoPress && (
      <Pressable
        onPress={() => onInfoPress(infoKey)}
        className="p-1"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Info size={18} color="#0EA5E9" />
      </Pressable>
    )}
  </View>
);

const InfoCard = ({
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

const CompatibilityItem = ({
  fish,
  status,
  onPress,
  isDark,
}: {
  fish: Fish;
  status: 'compatible' | 'conditional' | 'incompatible';
  onPress: () => void;
  isDark: boolean;
}) => {
  const statusConfig = {
    compatible: { color: '#10B981', icon: CheckCircle, label: 'Compatible' },
    conditional: { color: '#F59E0B', icon: AlertCircle, label: 'Caution' },
    incompatible: { color: '#EF4444', icon: AlertTriangle, label: 'Avoid' },
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center p-3 rounded-xl mb-2',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}
    >
      <Image
        source={{ uri: fish.imageUrl }}
        className="w-12 h-12 rounded-lg"
        resizeMode="cover"
      />
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
          {fish.temperament}
        </Text>
      </View>
      <View className="flex-row items-center">
        <StatusIcon size={16} color={statusConfig.color} />
        <Text
          className="text-xs font-medium ml-1"
          style={{ color: statusConfig.color }}
        >
          {statusConfig.label}
        </Text>
      </View>
    </Pressable>
  );
};

export default function FishProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [infoModal, setInfoModal] = useState<string | null>(null);

  const tanks = useTankStore((s) => s.tanks);
  const addFishToTank = useTankStore((s) => s.addFishToTank);
  const activeTankId = useTankStore((s) => s.activeTankId);

  const fish = getFishById(id || '');

  if (!fish) {
    return (
      <View
        className={cn(
          'flex-1 items-center justify-center',
          isDark ? 'bg-slate-900' : 'bg-slate-50'
        )}
      >
        <Text className={isDark ? 'text-white' : 'text-slate-900'}>
          Fish not found
        </Text>
      </View>
    );
  }

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

  // Get compatible fish from database
  const compatibleFish = fish.compatibleWith
    .map((id) => getFishById(id))
    .filter((f): f is Fish => f !== undefined)
    .slice(0, 5);

  const conditionalFish = fish.conditionalWith
    .map((id) => getFishById(id))
    .filter((f): f is Fish => f !== undefined)
    .slice(0, 5);

  const incompatibleFish = fish.incompatibleWith
    .map((id) => getFishById(id))
    .filter((f): f is Fish => f !== undefined)
    .slice(0, 5);

  const handleAddToTank = () => {
    if (activeTankId) {
      addFishToTank(activeTankId, fish.id);
      router.push('/(tabs)/my-tank');
    } else {
      router.push('/(tabs)/my-tank');
    }
  };

  const handleFindStore = () => {
    const query = encodeURIComponent(`aquarium fish store near me ${fish.commonName}`);
    Linking.openURL(`https://www.google.com/search?q=${query}`);
  };

  const avgPrice = (fish.price.min + fish.price.max) / 2;

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View className="relative">
          <Image
            source={{ uri: fish.imageUrl }}
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
                className="flex-row items-center px-4 py-2 rounded-full bg-sky-500"
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
              'rounded-2xl p-5 mb-6',
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
            <Text
              className={cn(
                'text-2xl font-bold mb-1',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              {fish.commonName}
            </Text>
            <Text
              className={cn(
                'text-sm italic mb-3',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {fish.scientificName}
            </Text>

            <View className="flex-row flex-wrap">
              <View
                className="flex-row items-center px-3 py-1.5 rounded-full mr-2 mb-2"
                style={{ backgroundColor: `${temperamentColor}20` }}
              >
                <View
                  className="w-2 h-2 rounded-full mr-1.5"
                  style={{ backgroundColor: temperamentColor }}
                />
                <Text
                  className="text-xs font-medium capitalize"
                  style={{ color: temperamentColor }}
                >
                  {fish.temperament}
                </Text>
              </View>

              <View
                className={cn(
                  'flex-row items-center px-3 py-1.5 rounded-full mr-2 mb-2',
                  fish.waterType === 'freshwater'
                    ? 'bg-blue-500/20'
                    : 'bg-sky-500/20'
                )}
              >
                <Droplets
                  size={12}
                  color={fish.waterType === 'freshwater' ? '#3B82F6' : '#0EA5E9'}
                />
                <Text
                  className={cn(
                    'text-xs font-medium ml-1 capitalize',
                    fish.waterType === 'freshwater'
                      ? 'text-blue-500'
                      : 'text-sky-500'
                  )}
                >
                  {fish.waterType}
                </Text>
              </View>

              <View
                className="flex-row items-center px-3 py-1.5 rounded-full mb-2"
                style={{ backgroundColor: `${careLevelColor}20` }}
              >
                <Heart size={12} color={careLevelColor} />
                <Text
                  className="text-xs font-medium ml-1 capitalize"
                  style={{ color: careLevelColor }}
                >
                  {fish.careLevel}
                </Text>
              </View>
            </View>
          </View>

          {/* Description */}
          <View className="mb-6">
            <Text
              className={cn(
                'text-base leading-6',
                isDark ? 'text-slate-300' : 'text-slate-600'
              )}
            >
              {fish.description}
            </Text>
          </View>

          {/* Pricing & Store */}
          <View
            className={cn(
              'rounded-2xl p-4 mb-6',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
          >
            <SectionHeader
              icon={DollarSign}
              title="Pricing"
              isDark={isDark}
              iconColor="#10B981"
            />

            <View className="flex-row justify-between items-center mb-3">
              <Text
                className={cn(
                  'text-sm',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}
              >
                Price Range
              </Text>
              <Text
                className={cn(
                  'text-lg font-bold',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                ${fish.price.min} - ${fish.price.max}
              </Text>
            </View>

            <View className="flex-row justify-between items-center mb-4">
              <Text
                className={cn(
                  'text-sm',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}
              >
                Average Price
              </Text>
              <Text className="text-lg font-bold text-emerald-500">
                ~${avgPrice.toFixed(0)}
              </Text>
            </View>

            <Pressable
              onPress={handleFindStore}
              className="flex-row items-center justify-center py-3 rounded-xl bg-sky-500"
            >
              <MapPin size={18} color="white" />
              <Text className="text-white font-semibold ml-2">
                Find Stores Near Me
              </Text>
              <ExternalLink size={14} color="white" className="ml-1" />
            </Pressable>

            <Text
              className={cn(
                'text-xs text-center mt-2',
                isDark ? 'text-slate-500' : 'text-slate-400'
              )}
            >
              Prices updated weekly. Actual prices may vary by location.
            </Text>
          </View>

          {/* Quick Stats */}
          <View className="flex-row mb-6">
            <InfoCard
              icon={Ruler}
              title="Max Size"
              value={`${fish.maxSize}"`}
              isDark={isDark}
            />
            <InfoCard
              icon={Home}
              title="Min Tank"
              value={`${fish.minTankSize}g`}
              isDark={isDark}
            />
            <InfoCard
              icon={Layers}
              title="Zone"
              value={fish.tankZone.charAt(0).toUpperCase() + fish.tankZone.slice(1)}
              isDark={isDark}
            />
          </View>

          {/* Water Parameters */}
          <View
            className={cn(
              'rounded-2xl p-4 mb-6',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
          >
            <SectionHeader
              icon={Beaker}
              title="Water Parameters"
              infoKey="waterParameters"
              onInfoPress={setInfoModal}
              isDark={isDark}
              iconColor="#3B82F6"
            />

            <View className="flex-row mb-3">
              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Thermometer size={16} color="#EF4444" />
                  <Text
                    className={cn(
                      'text-sm ml-2',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    Temperature
                  </Text>
                </View>
                <Text
                  className={cn(
                    'text-base font-semibold',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {fish.waterParameters.temperatureMin}°F -{' '}
                  {fish.waterParameters.temperatureMax}°F
                </Text>
              </View>

              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <Droplets size={16} color="#3B82F6" />
                  <Text
                    className={cn(
                      'text-sm ml-2',
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    )}
                  >
                    pH Level
                  </Text>
                </View>
                <Text
                  className={cn(
                    'text-base font-semibold',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {fish.waterParameters.phMin} - {fish.waterParameters.phMax}
                </Text>
              </View>
            </View>

            <View>
              <Text
                className={cn(
                  'text-sm mb-1',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}
              >
                Water Hardness (dGH)
              </Text>
              <Text
                className={cn(
                  'text-base font-semibold',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                {fish.waterParameters.hardnessMin} - {fish.waterParameters.hardnessMax}
              </Text>
            </View>
          </View>

          {/* Diet & Feeding */}
          <View
            className={cn(
              'rounded-2xl p-4 mb-6',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
          >
            <SectionHeader
              icon={Utensils}
              title="Diet & Feeding"
              infoKey="dietFeeding"
              onInfoPress={setInfoModal}
              isDark={isDark}
              iconColor="#F59E0B"
            />

            <View
              className={cn(
                'px-3 py-1.5 rounded-full self-start mb-3',
                isDark ? 'bg-slate-700' : 'bg-slate-100'
              )}
            >
              <Text
                className={cn(
                  'text-sm font-medium capitalize',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                {fish.diet}
              </Text>
            </View>

            <Text
              className={cn(
                'text-sm leading-5',
                isDark ? 'text-slate-300' : 'text-slate-600'
              )}
            >
              {fish.feedingNotes}
            </Text>
          </View>

          {/* Tank Requirements */}
          <View
            className={cn(
              'rounded-2xl p-4 mb-6',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
          >
            <SectionHeader
              icon={Home}
              title="Tank Requirements"
              infoKey="tankRequirements"
              onInfoPress={setInfoModal}
              isDark={isDark}
              iconColor="#8B5CF6"
            />

            <View className="flex-row flex-wrap">
              {fish.needsPlants && (
                <View
                  className={cn(
                    'flex-row items-center px-3 py-2 rounded-lg mr-2 mb-2',
                    isDark ? 'bg-slate-700' : 'bg-green-50'
                  )}
                >
                  <CheckCircle size={16} color="#10B981" />
                  <Text
                    className={cn(
                      'text-sm ml-2',
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    )}
                  >
                    Needs Plants
                  </Text>
                </View>
              )}

              {fish.needsHidingSpaces && (
                <View
                  className={cn(
                    'flex-row items-center px-3 py-2 rounded-lg mr-2 mb-2',
                    isDark ? 'bg-slate-700' : 'bg-amber-50'
                  )}
                >
                  <CheckCircle size={16} color="#F59E0B" />
                  <Text
                    className={cn(
                      'text-sm ml-2',
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    )}
                  >
                    Hiding Spaces
                  </Text>
                </View>
              )}

              {fish.schoolingFish && (
                <View
                  className={cn(
                    'flex-row items-center px-3 py-2 rounded-lg mr-2 mb-2',
                    isDark ? 'bg-slate-700' : 'bg-blue-50'
                  )}
                >
                  <FishIcon size={16} color="#3B82F6" />
                  <Text
                    className={cn(
                      'text-sm ml-2',
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    )}
                  >
                    Schooling ({fish.minSchoolSize}+ fish)
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Compatibility Section */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <FishIcon size={20} color={isDark ? '#94A3B8' : '#64748B'} />
                <Text
                  className={cn(
                    'text-lg font-bold ml-2',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Compatibility
                </Text>
              </View>
              <Pressable
                onPress={() => setInfoModal('compatibility')}
                className="p-1"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Info size={18} color="#0EA5E9" />
              </Pressable>
            </View>

            {compatibleFish.length > 0 && (
              <View className="mb-4">
                <Text
                  className={cn(
                    'text-sm font-semibold mb-2',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                >
                  Compatible With
                </Text>
                {compatibleFish.map((f) => (
                  <CompatibilityItem
                    key={f.id}
                    fish={f}
                    status="compatible"
                    onPress={() => router.push(`/fish/${f.id}`)}
                    isDark={isDark}
                  />
                ))}
              </View>
            )}

            {conditionalFish.length > 0 && (
              <View className="mb-4">
                <Text
                  className={cn(
                    'text-sm font-semibold mb-2',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                >
                  Use Caution
                </Text>
                {conditionalFish.map((f) => (
                  <CompatibilityItem
                    key={f.id}
                    fish={f}
                    status="conditional"
                    onPress={() => router.push(`/fish/${f.id}`)}
                    isDark={isDark}
                  />
                ))}
              </View>
            )}

            {incompatibleFish.length > 0 && (
              <View className="mb-4">
                <Text
                  className={cn(
                    'text-sm font-semibold mb-2',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                >
                  Avoid
                </Text>
                {incompatibleFish.map((f) => (
                  <CompatibilityItem
                    key={f.id}
                    fish={f}
                    status="incompatible"
                    onPress={() => router.push(`/fish/${f.id}`)}
                    isDark={isDark}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <InfoModal
        visible={!!infoModal}
        onClose={() => setInfoModal(null)}
        info={infoModal ? sectionInfo[infoModal] : null}
        isDark={isDark}
      />
    </View>
  );
}
