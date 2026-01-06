import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
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
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { getFishById, fishDatabase } from '@/lib/data/fish-database';
import { Fish } from '@/lib/types/fish';
import { cn } from '@/lib/cn';
import { useTankStore } from '@/lib/state/tank-store';

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
          <View className="mb-4">
            <Text
              className={cn(
                'text-base leading-6',
                isDark ? 'text-slate-300' : 'text-slate-600'
              )}
            >
              {fish.description}
            </Text>
          </View>

          {/* Quick Stats */}
          <View className="flex-row mb-4">
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
              'rounded-2xl p-4 mb-4',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
          >
            <Text
              className={cn(
                'text-lg font-bold mb-4',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              Water Parameters
            </Text>

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
              'rounded-2xl p-4 mb-4',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
          >
            <View className="flex-row items-center mb-3">
              <Utensils size={20} color={isDark ? '#94A3B8' : '#64748B'} />
              <Text
                className={cn(
                  'text-lg font-bold ml-2',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                Diet & Feeding
              </Text>
            </View>

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
              'rounded-2xl p-4 mb-4',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
          >
            <Text
              className={cn(
                'text-lg font-bold mb-3',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              Tank Requirements
            </Text>

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
            <Text
              className={cn(
                'text-lg font-bold mb-4',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              Compatibility
            </Text>

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
    </View>
  );
}
