import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';
import {
  Container,
  Plus,
  Trash2,
  Fish as FishIcon,
  Droplets,
  AlertTriangle,
  CheckCircle,
  X,
  ChevronRight,
  PoundSterling,
  Lightbulb,
  ArrowRight,
  Leaf,
  Star,
  Info,
  Pencil,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { useTankStore } from '@/lib/state/tank-store';
import { getFishById, fishDatabase } from '@/lib/data/fish-database';
import { getPlantById } from '@/lib/data/plant-database';
import type { Plant } from '@/lib/data/plant-database';
import { checkMultipleFishCompatibility, getSuggestedCompatibleFish } from '@/lib/utils/compatibility';
import { WaterType, Fish, TankSetup, CompatibilityResult } from '@/lib/types/fish';
import { cn } from '@/lib/cn';
import { useFishImage, usePlantImage } from '@/lib/hooks/useImageUrl';
import { getImageSource } from '@/lib/utils/image-source';

// Fish image component with auto-generation
const FishImageDisplay = ({ fish }: { fish: Fish }) => {
  const imageSource = useFishImage(fish.id, fish.imageUrl, fish.commonName, fish.scientificName);
  return (
    <Image
      source={imageSource}
      className="w-14 h-14 rounded-xl"
      resizeMode="cover"
    />
  );
};

// Plant image component with auto-generation
const PlantImageDisplay = ({ plant }: { plant: Plant }) => {
  const imageSource = usePlantImage(plant.id, plant.imageUrl, plant.commonName, plant.scientificName);
  return (
    <Image
      source={imageSource}
      className="w-14 h-14 rounded-xl"
      resizeMode="cover"
    />
  );
};

const CreateTankModal = ({
  visible,
  onClose,
  onSubmit,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, size: number, waterType: WaterType) => void;
  isDark: boolean;
}) => {
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [waterType, setWaterType] = useState<WaterType>('freshwater');

  const handleSubmit = () => {
    if (name.trim() && size) {
      onSubmit(name.trim(), parseInt(size, 10), waterType);
      setName('');
      setSize('');
      setWaterType('freshwater');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black/50">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 justify-center pb-32"
          >
            <TouchableWithoutFeedback>
              <View
                className={cn(
                  'mx-4 rounded-3xl p-6',
                  isDark ? 'bg-slate-800' : 'bg-white'
                )}
              >
                <View className="flex-row justify-between items-center mb-6">
                  <Text
                    className={cn(
                      'text-xl font-bold',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    Create New Tank
                  </Text>
                  <Pressable onPress={onClose}>
                    <X size={24} color={isDark ? '#94A3B8' : '#64748B'} />
                  </Pressable>
                </View>

                {/* Tank Name */}
                <Text
                  className={cn(
                    'text-sm font-semibold mb-2',
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  )}
                >
                  Tank Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="My Aquarium"
                  placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    fontSize: 16,
                    marginBottom: 16,
                    backgroundColor: isDark ? '#334155' : '#F1F5F9',
                    color: isDark ? '#FFFFFF' : '#0F172A',
                  }}
                />

                {/* Tank Size */}
                <Text
                  className={cn(
                    'text-sm font-semibold mb-2',
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  )}
                >
                  Tank Size (Gallons)
                </Text>
                <TextInput
                  value={size}
                  onChangeText={setSize}
                  placeholder="20"
                  placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                  keyboardType="numeric"
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    fontSize: 16,
                    marginBottom: 16,
                    backgroundColor: isDark ? '#334155' : '#F1F5F9',
                    color: isDark ? '#FFFFFF' : '#0F172A',
                  }}
                />

                {/* Water Type */}
                <Text
                  className={cn(
                    'text-sm font-semibold mb-2',
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  )}
                >
                  Water Type
                </Text>
                <View className="flex-row mb-6">
                  <Pressable
                    onPress={() => setWaterType('freshwater')}
                    className={cn(
                      'flex-1 py-3 rounded-xl mr-2 items-center',
                      waterType === 'freshwater'
                        ? 'bg-sky-500'
                        : isDark
                        ? 'bg-slate-700'
                        : 'bg-slate-100'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-semibold',
                        waterType === 'freshwater'
                          ? 'text-white'
                          : isDark
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      )}
                    >
                      Freshwater
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setWaterType('saltwater')}
                    className={cn(
                      'flex-1 py-3 rounded-xl items-center',
                      waterType === 'saltwater'
                        ? 'bg-sky-500'
                        : isDark
                        ? 'bg-slate-700'
                        : 'bg-slate-100'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-semibold',
                        waterType === 'saltwater'
                          ? 'text-white'
                          : isDark
                          ? 'text-slate-300'
                          : 'text-slate-600'
                      )}
                    >
                      Saltwater
                    </Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={handleSubmit}
                  disabled={!name.trim() || !size}
                  className={cn(
                    'py-4 rounded-xl items-center',
                    name.trim() && size ? 'bg-sky-500' : 'bg-slate-400'
                  )}
                >
                  <Text className="text-white font-bold text-base">Create Tank</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// Rename Tank Modal
const RenameTankModal = ({
  visible,
  onClose,
  onSubmit,
  currentName,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (newName: string) => void;
  currentName: string;
  isDark: boolean;
}) => {
  const [name, setName] = useState(currentName);

  // Reset name when currentName changes (modal opens with new tank)
  React.useEffect(() => {
    setName(currentName);
  }, [currentName]);

  const handleSubmit = () => {
    if (name.trim()) {
      onSubmit(name.trim());
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black/50">
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 justify-center pb-32"
          >
            <TouchableWithoutFeedback>
              <View
                className={cn(
                  'mx-4 rounded-3xl p-6',
                  isDark ? 'bg-slate-800' : 'bg-white'
                )}
              >
                <View className="flex-row justify-between items-center mb-6">
                  <Text
                    className={cn(
                      'text-xl font-bold',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    Rename Tank
                  </Text>
                  <Pressable onPress={onClose}>
                    <X size={24} color={isDark ? '#94A3B8' : '#64748B'} />
                  </Pressable>
                </View>

                <Text
                  className={cn(
                    'text-sm font-semibold mb-2',
                    isDark ? 'text-slate-300' : 'text-slate-600'
                  )}
                >
                  Tank Name
                </Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="My Aquarium"
                  placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                  autoFocus
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 12,
                    fontSize: 16,
                    marginBottom: 24,
                    backgroundColor: isDark ? '#334155' : '#F1F5F9',
                    color: isDark ? '#FFFFFF' : '#0F172A',
                  }}
                />

                <Pressable
                  onPress={handleSubmit}
                  disabled={!name.trim()}
                  className={cn(
                    'py-4 rounded-xl items-center',
                    name.trim() ? 'bg-sky-500' : 'bg-slate-400'
                  )}
                >
                  <Text className="text-white font-bold text-base">Save</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const TankCard = ({
  tank,
  isActive,
  isSelected,
  isFavorite,
  onSelect,
  onDelete,
  onViewDetails,
  onToggleFavorite,
  onRename,
  isDark,
}: {
  tank: TankSetup;
  isActive: boolean;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  onToggleFavorite: () => void;
  onRename: () => void;
  isDark: boolean;
}) => {
  const fish = tank.fishIds.map((id) => getFishById(id)).filter((f): f is Fish => f !== undefined);
  const plants = (tank.plantIds || []).map((id) => getPlantById(id)).filter((p): p is Plant => p !== undefined);
  const compatibility = fish.length >= 2
    ? checkMultipleFishCompatibility(tank.fishIds, tank.size)
    : null;

  const statusColor = compatibility?.overallStatus === 'compatible'
    ? '#10B981'
    : compatibility?.overallStatus === 'conditional'
    ? '#F59E0B'
    : compatibility?.overallStatus === 'incompatible'
    ? '#EF4444'
    : '#64748B';

  return (
    <Pressable
      onPress={onSelect}
      className={cn(
        'rounded-2xl p-4 mb-3',
        isSelected
          ? 'border-2 border-sky-500'
          : isActive
          ? 'border-2 border-emerald-500/50'
          : '',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center">
            {isFavorite && (
              <Star size={14} color="#F59E0B" fill="#F59E0B" style={{ marginRight: 4 }} />
            )}
            <Text
              className={cn(
                'text-lg font-bold',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              {tank.name}
            </Text>
            {isActive && (
              <View className="ml-2 px-2 py-0.5 rounded bg-emerald-500">
                <Text className="text-white text-xs font-medium">Active</Text>
              </View>
            )}
          </View>
          <View className="flex-row items-center mt-1">
            <Droplets
              size={14}
              color={tank.waterType === 'freshwater' ? '#3B82F6' : '#0EA5E9'}
            />
            <Text
              className={cn(
                'text-sm ml-1 capitalize',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              {tank.waterType} • {tank.size} gal
            </Text>
          </View>
        </View>

        {/* Action buttons */}
        <View className="flex-row items-center">
          <Pressable
            onPress={onRename}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Pencil size={16} color={isDark ? '#64748B' : '#94A3B8'} />
          </Pressable>
          <Pressable
            onPress={onToggleFavorite}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Star
              size={18}
              color={isFavorite ? '#F59E0B' : isDark ? '#64748B' : '#94A3B8'}
              fill={isFavorite ? '#F59E0B' : 'transparent'}
            />
          </Pressable>
          <Pressable
            onPress={onViewDetails}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Info size={18} color="#0EA5E9" />
          </Pressable>
          <Pressable
            onPress={onDelete}
            className="p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Trash2 size={18} color="#EF4444" />
          </Pressable>
        </View>
      </View>

      {/* Selected Tank Preview - Shows fish/plant snapshot when selected */}
      {isSelected && (fish.length > 0 || plants.length > 0) && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          className={cn(
            'rounded-xl p-3 mb-3',
            isDark ? 'bg-slate-700/50' : 'bg-slate-50'
          )}
        >
          {fish.length > 0 && (
            <View className="mb-2">
              <Text className={cn('text-xs font-medium mb-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Fish ({fish.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {fish.slice(0, 6).map((f) => (
                    <View key={f.id} className="mr-2 items-center">
                      <Image
                        source={getImageSource(f.imageUrl)}
                        className="w-12 h-12 rounded-lg"
                        resizeMode="cover"
                      />
                      <Text
                        className={cn('text-xs mt-1 w-14 text-center', isDark ? 'text-slate-300' : 'text-slate-600')}
                        numberOfLines={1}
                      >
                        {f.commonName.split(' ')[0]}
                      </Text>
                    </View>
                  ))}
                  {fish.length > 6 && (
                    <View className="w-12 h-12 rounded-lg items-center justify-center bg-slate-200 dark:bg-slate-600">
                      <Text className={cn('text-xs font-medium', isDark ? 'text-slate-300' : 'text-slate-600')}>
                        +{fish.length - 6}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          )}
          {plants.length > 0 && (
            <View>
              <Text className={cn('text-xs font-medium mb-2', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Plants ({plants.length})
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {plants.slice(0, 6).map((p) => (
                    <View key={p.id} className="mr-2 items-center">
                      <Image
                        source={getImageSource(p.imageUrl)}
                        className="w-12 h-12 rounded-lg"
                        resizeMode="cover"
                      />
                      <Text
                        className={cn('text-xs mt-1 w-14 text-center', isDark ? 'text-slate-300' : 'text-slate-600')}
                        numberOfLines={1}
                      >
                        {p.commonName.split(' ')[0]}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </Animated.View>
      )}

      {/* Fish Preview (when not selected) */}
      {!isSelected && (
        <View className="flex-row items-center">
          {fish.slice(0, 4).map((f, i) => (
            <Image
              key={f.id}
              source={getImageSource(f.imageUrl)}
              className="w-10 h-10 rounded-full border-2"
              style={{
                marginLeft: i > 0 ? -8 : 0,
                borderColor: isDark ? '#1E293B' : '#FFFFFF',
              }}
              resizeMode="cover"
            />
          ))}
          {fish.length > 4 && (
            <View
              className={cn(
                'w-10 h-10 rounded-full items-center justify-center -ml-2 border-2',
                isDark ? 'bg-slate-700 border-slate-900' : 'bg-slate-100 border-white'
              )}
            >
              <Text
                className={cn(
                  'text-xs font-semibold',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                +{fish.length - 4}
              </Text>
            </View>
          )}
          {fish.length === 0 && (
            <Text
              className={cn(
                'text-sm',
                isDark ? 'text-slate-400' : 'text-slate-500'
              )}
            >
              No fish added yet
            </Text>
          )}

          <View className="flex-1" />

          {/* Status indicator */}
          {compatibility && (
            <View
              className="flex-row items-center px-2 py-1 rounded-full"
              style={{ backgroundColor: `${statusColor}20` }}
            >
              {compatibility.overallStatus === 'compatible' ? (
                <CheckCircle size={14} color={statusColor} />
              ) : (
                <AlertTriangle size={14} color={statusColor} />
              )}
              <Text
                className="text-xs font-medium ml-1 capitalize"
                style={{ color: statusColor }}
              >
                {compatibility.overallStatus}
              </Text>
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
};

const FishInTank = ({
  fish,
  onRemove,
  onPress,
  isDark,
}: {
  fish: Fish;
  onRemove: () => void;
  onPress: () => void;
  isDark: boolean;
}) => {
  const temperamentColor = {
    peaceful: '#10B981',
    'semi-aggressive': '#F59E0B',
    aggressive: '#EF4444',
  }[fish.temperament];

  const avgPrice = (fish.price.min + fish.price.max) / 2;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center p-3 rounded-xl mb-2',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}
    >
      <FishImageDisplay fish={fish} />
      <View className="flex-1 ml-3">
        <Text
          className={cn(
            'text-base font-semibold',
            isDark ? 'text-white' : 'text-slate-900'
          )}
        >
          {fish.commonName}
        </Text>
        <View className="flex-row items-center mt-1">
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
          <Text
            className={cn(
              'text-xs ml-2',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}
          >
            ~£{avgPrice.toFixed(0)}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onRemove}
        className="p-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Trash2 size={18} color="#EF4444" />
      </Pressable>
    </Pressable>
  );
};

const PlantInTank = ({
  plant,
  onRemove,
  onPress,
  isDark,
}: {
  plant: Plant;
  onRemove: () => void;
  onPress: () => void;
  isDark: boolean;
}) => {
  const difficultyColor = {
    easy: '#10B981',
    moderate: '#F59E0B',
    difficult: '#EF4444',
  }[plant.difficulty];

  const avgPrice = (plant.price.min + plant.price.max) / 2;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'flex-row items-center p-3 rounded-xl mb-2',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}
    >
      <PlantImageDisplay plant={plant} />
      <View className="flex-1 ml-3">
        <Text
          className={cn(
            'text-base font-semibold',
            isDark ? 'text-white' : 'text-slate-900'
          )}
        >
          {plant.commonName}
        </Text>
        <View className="flex-row items-center mt-1">
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
          <Text
            className={cn(
              'text-xs ml-2',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}
          >
            ~£{avgPrice.toFixed(0)}
          </Text>
        </View>
      </View>
      <Pressable
        onPress={onRemove}
        className="p-2"
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Trash2 size={18} color="#EF4444" />
      </Pressable>
    </Pressable>
  );
};

const CompatibilityFixSuggestion = ({
  result,
  onRemoveFish,
  isDark,
}: {
  result: CompatibilityResult;
  onRemoveFish: (fishId: string) => void;
  isDark: boolean;
}) => {
  const statusColor = result.status === 'conditional' ? '#F59E0B' : '#EF4444';

  return (
    <View
      className={cn(
        'rounded-xl p-4 mb-3',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}
    >
      <View className="flex-row items-center mb-2">
        <Image
          source={getImageSource(result.fish1.imageUrl)}
          className="w-8 h-8 rounded-full"
          resizeMode="cover"
        />
        <AlertTriangle size={16} color={statusColor} className="mx-2" />
        <Image
          source={getImageSource(result.fish2.imageUrl)}
          className="w-8 h-8 rounded-full"
          resizeMode="cover"
        />
        <Text
          className={cn(
            'text-sm font-semibold ml-2 flex-1',
            isDark ? 'text-white' : 'text-slate-900'
          )}
          numberOfLines={1}
        >
          {result.fish1.commonName} + {result.fish2.commonName}
        </Text>
      </View>

      {result.reasons.slice(0, 1).map((reason, i) => (
        <Text
          key={i}
          className={cn(
            'text-xs mb-2',
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          {reason}
        </Text>
      ))}

      <View className="flex-row items-center mt-2">
        <Lightbulb size={14} color="#10B981" />
        <Text
          className={cn(
            'text-xs font-medium ml-1',
            isDark ? 'text-slate-300' : 'text-slate-600'
          )}
        >
          Fix suggestion:
        </Text>
      </View>

      <View className="flex-row mt-2 gap-2">
        <Pressable
          onPress={() => onRemoveFish(result.fish1.id)}
          className="flex-1 flex-row items-center justify-center py-2 px-3 rounded-lg bg-red-500/10"
        >
          <Trash2 size={14} color="#EF4444" />
          <Text className="text-red-500 text-xs font-medium ml-1" numberOfLines={1}>
            Remove {result.fish1.commonName}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onRemoveFish(result.fish2.id)}
          className="flex-1 flex-row items-center justify-center py-2 px-3 rounded-lg bg-red-500/10"
        >
          <Trash2 size={14} color="#EF4444" />
          <Text className="text-red-500 text-xs font-medium ml-1" numberOfLines={1}>
            Remove {result.fish2.commonName}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const TankBreakdown = ({
  fish,
  isDark,
}: {
  fish: Fish[];
  isDark: boolean;
}) => {
  const totalMinCost = fish.reduce((sum, f) => sum + f.price.min, 0);
  const totalMaxCost = fish.reduce((sum, f) => sum + f.price.max, 0);
  const avgCost = (totalMinCost + totalMaxCost) / 2;

  return (
    <View
      className={cn(
        'rounded-xl p-4 mb-4',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}
    >
      <View className="flex-row items-center mb-3">
        <PoundSterling size={18} color="#10B981" />
        <Text
          className={cn(
            'text-base font-bold ml-2',
            isDark ? 'text-white' : 'text-slate-900'
          )}
        >
          Tank Breakdown
        </Text>
      </View>

      <View className="flex-row justify-between items-center mb-2">
        <Text
          className={cn(
            'text-sm',
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          Total Fish
        </Text>
        <Text
          className={cn(
            'text-sm font-semibold',
            isDark ? 'text-white' : 'text-slate-900'
          )}
        >
          {fish.length}
        </Text>
      </View>

      <View className="flex-row justify-between items-center mb-2">
        <Text
          className={cn(
            'text-sm',
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          Est. Cost Range
        </Text>
        <Text
          className={cn(
            'text-sm font-semibold',
            isDark ? 'text-white' : 'text-slate-900'
          )}
        >
          £{totalMinCost} - £{totalMaxCost}
        </Text>
      </View>

      <View
        className={cn(
          'mt-2 pt-2 border-t flex-row justify-between items-center',
          isDark ? 'border-slate-700' : 'border-slate-200'
        )}
      >
        <Text
          className={cn(
            'text-sm font-semibold',
            isDark ? 'text-slate-300' : 'text-slate-600'
          )}
        >
          Est. Total
        </Text>
        <Text className="text-lg font-bold text-emerald-500">
          ~£{avgCost.toFixed(0)}
        </Text>
      </View>
    </View>
  );
};

export default function MyTankScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteFishModal, setShowDeleteFishModal] = useState(false);
  const [showDeletePlantModal, setShowDeletePlantModal] = useState(false);
  const [deletingTankId, setDeletingTankId] = useState<string | null>(null);
  const [deletingFish, setDeletingFish] = useState<Fish | null>(null);
  const [deletingPlant, setDeletingPlant] = useState<Plant | null>(null);
  const [selectedTankId, setSelectedTankId] = useState<string | null>(null);
  const [renamingTankId, setRenamingTankId] = useState<string | null>(null);

  const tanks = useTankStore((s) => s.tanks);
  const activeTankId = useTankStore((s) => s.activeTankId);
  const favoriteTankId = useTankStore((s) => s.favoriteTankId);
  const addTank = useTankStore((s) => s.addTank);
  const removeTank = useTankStore((s) => s.removeTank);
  const renameTank = useTankStore((s) => s.renameTank);
  const setActiveTank = useTankStore((s) => s.setActiveTank);
  const setFavoriteTank = useTankStore((s) => s.setFavoriteTank);
  const getSortedTanks = useTankStore((s) => s.getSortedTanks);
  const removeFishFromTank = useTankStore((s) => s.removeFishFromTank);
  const removePlantFromTank = useTankStore((s) => s.removePlantFromTank);

  // Get sorted tanks (favorite first)
  const sortedTanks = getSortedTanks();

  const activeTank = tanks.find((t) => t.id === activeTankId);
  const selectedTank = tanks.find((t) => t.id === selectedTankId);
  const renamingTank = tanks.find((t) => t.id === renamingTankId);
  const deletingTank = tanks.find((t) => t.id === deletingTankId);

  const handleDeleteTank = (tankId: string) => {
    setDeletingTankId(tankId);
    setShowDeleteModal(true);
  };

  const confirmDeleteTank = () => {
    if (deletingTankId) {
      removeTank(deletingTankId);
      setShowDeleteModal(false);
      setDeletingTankId(null);
    }
  };

  const handleDeleteFish = (fish: Fish) => {
    setDeletingFish(fish);
    setShowDeleteFishModal(true);
  };

  const confirmDeleteFish = () => {
    if (deletingFish && activeTank) {
      removeFishFromTank(activeTank.id, deletingFish.id);
      setShowDeleteFishModal(false);
      setDeletingFish(null);
    }
  };

  const handleDeletePlant = (plant: Plant) => {
    setDeletingPlant(plant);
    setShowDeletePlantModal(true);
  };

  const confirmDeletePlant = () => {
    if (deletingPlant && activeTank) {
      removePlantFromTank(activeTank.id, deletingPlant.id);
      setShowDeletePlantModal(false);
      setDeletingPlant(null);
    }
  };

  const activeTankFish = useMemo(() => {
    return activeTank?.fishIds
      .map((id) => getFishById(id))
      .filter((f): f is Fish => f !== undefined) || [];
  }, [activeTank?.fishIds]);

  const activeTankPlants = useMemo(() => {
    return (activeTank?.plantIds || [])
      .map((id) => getPlantById(id))
      .filter((p): p is Plant => p !== undefined);
  }, [activeTank?.plantIds]);

  const compatibility = useMemo(() => {
    return activeTankFish.length >= 2
      ? checkMultipleFishCompatibility(activeTank?.fishIds || [], activeTank?.size)
      : null;
  }, [activeTankFish, activeTank?.fishIds, activeTank?.size]);

  const incompatibleResults = useMemo(() => {
    if (!compatibility) return [];
    return compatibility.results.filter(r => r.status !== 'compatible');
  }, [compatibility]);

  const handleCreateTank = (name: string, size: number, waterType: WaterType) => {
    addTank(name, size, waterType);
  };

  const handleRemoveFishForFix = (fishId: string) => {
    if (activeTank) {
      removeFishFromTank(activeTank.id, fishId);
    }
  };

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 20,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Container size={24} color="white" />
              <Text className="text-white text-2xl font-bold ml-2">My Tank</Text>
            </View>
            <Pressable
              onPress={() => setShowCreateModal(true)}
              className="bg-white/20 rounded-full p-2"
            >
              <Plus size={24} color="white" />
            </Pressable>
          </View>
          {activeTank && (
            <Text className="text-white/80 text-sm mt-2">
              {activeTank.name} • {activeTankFish.length} fish, {activeTankPlants.length} plants
            </Text>
          )}
        </LinearGradient>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {tanks.length === 0 ? (
            /* Empty State */
            <View className="flex-1 items-center justify-center px-8 pt-20">
              <View
                className={cn(
                  'w-24 h-24 rounded-full items-center justify-center mb-6',
                  isDark ? 'bg-slate-800' : 'bg-slate-100'
                )}
              >
                <FishIcon size={40} color={isDark ? '#64748B' : '#94A3B8'} />
              </View>
              <Text
                className={cn(
                  'text-xl font-bold text-center mb-2',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                No Tanks Yet
              </Text>
              <Text
                className={cn(
                  'text-center text-sm mb-6',
                  isDark ? 'text-slate-400' : 'text-slate-500'
                )}
              >
                Create your first tank to start tracking your fish and checking
                compatibility.
              </Text>
              <Pressable
                onPress={() => setShowCreateModal(true)}
                className="bg-sky-500 px-6 py-3 rounded-xl"
              >
                <Text className="text-white font-bold">Create Tank</Text>
              </Pressable>
            </View>
          ) : (
            <View className="px-5 pt-4">
              {/* Tank List */}
              <Text
                className={cn(
                  'text-sm font-semibold mb-3',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                Your Tanks ({tanks.length})
              </Text>

              {sortedTanks.map((tank) => (
                <TankCard
                  key={tank.id}
                  tank={tank}
                  isActive={tank.id === activeTankId}
                  isSelected={tank.id === selectedTankId}
                  isFavorite={tank.id === favoriteTankId}
                  onSelect={() => {
                    if (selectedTankId === tank.id) {
                      // Deselect if already selected
                      setSelectedTankId(null);
                    } else {
                      // Select this tank and make it active
                      setSelectedTankId(tank.id);
                      setActiveTank(tank.id);
                    }
                  }}
                  onDelete={() => handleDeleteTank(tank.id)}
                  onViewDetails={() => router.push(`/tank/${tank.id}`)}
                  onToggleFavorite={() => {
                    if (favoriteTankId === tank.id) {
                      setFavoriteTank(null);
                    } else {
                      setFavoriteTank(tank.id);
                    }
                  }}
                  onRename={() => {
                    setRenamingTankId(tank.id);
                    setShowRenameModal(true);
                  }}
                  isDark={isDark}
                />
              ))}

              {/* Active Tank Details */}
              {activeTank && (
                <View className="mt-6">
                  {/* Tank Breakdown */}
                  {activeTankFish.length > 0 && (
                    <TankBreakdown fish={activeTankFish} isDark={isDark} />
                  )}

                  {/* Compatibility Issues with Fix Suggestions */}
                  {incompatibleResults.length > 0 && (
                    <View className="mb-4">
                      <Text
                        className={cn(
                          'text-sm font-semibold mb-3',
                          isDark ? 'text-slate-300' : 'text-slate-600'
                        )}
                      >
                        Compatibility Issues ({incompatibleResults.length})
                      </Text>
                      {incompatibleResults.map((result, i) => (
                        <CompatibilityFixSuggestion
                          key={`${result.fish1.id}-${result.fish2.id}`}
                          result={result}
                          onRemoveFish={handleRemoveFishForFix}
                          isDark={isDark}
                        />
                      ))}
                    </View>
                  )}

                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <FishIcon size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                      <Text
                        className={cn(
                          'text-lg font-bold ml-2',
                          isDark ? 'text-white' : 'text-slate-900'
                        )}
                      >
                        Fish
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => activeTank && router.push(`/add-to-tank?tankId=${activeTank.id}&mode=fish`)}
                      className="flex-row items-center"
                    >
                      <Text className="text-sky-500 text-sm font-medium mr-1">
                        Add
                      </Text>
                      <ChevronRight size={16} color="#0EA5E9" />
                    </Pressable>
                  </View>

                  {activeTankFish.length === 0 ? (
                    <View
                      className={cn(
                        'p-6 rounded-xl items-center mb-6',
                        isDark ? 'bg-slate-800' : 'bg-white'
                      )}
                    >
                      <FishIcon
                        size={32}
                        color={isDark ? '#64748B' : '#94A3B8'}
                      />
                      <Text
                        className={cn(
                          'text-sm mt-3 text-center',
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        )}
                      >
                        No fish yet. Search and add fish to get started!
                      </Text>
                    </View>
                  ) : (
                    <View className="mb-6">
                      {activeTankFish.map((fish) => (
                        <FishInTank
                          key={fish.id}
                          fish={fish}
                          onRemove={() => handleDeleteFish(fish)}
                          onPress={() => router.push(`/fish/${fish.id}`)}
                          isDark={isDark}
                        />
                      ))}
                    </View>
                  )}

                  {/* Plants Section */}
                  <View className="flex-row justify-between items-center mb-3">
                    <View className="flex-row items-center">
                      <Leaf size={18} color="#10B981" />
                      <Text
                        className={cn(
                          'text-lg font-bold ml-2',
                          isDark ? 'text-white' : 'text-slate-900'
                        )}
                      >
                        Plants
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => activeTank && router.push(`/add-to-tank?tankId=${activeTank.id}&mode=plants`)}
                      className="flex-row items-center"
                    >
                      <Text className="text-emerald-500 text-sm font-medium mr-1">
                        Add
                      </Text>
                      <ChevronRight size={16} color="#10B981" />
                    </Pressable>
                  </View>

                  {activeTankPlants.length === 0 ? (
                    <View
                      className={cn(
                        'p-6 rounded-xl items-center',
                        isDark ? 'bg-slate-800' : 'bg-white'
                      )}
                    >
                      <Leaf
                        size={32}
                        color={isDark ? '#64748B' : '#94A3B8'}
                      />
                      <Text
                        className={cn(
                          'text-sm mt-3 text-center',
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        )}
                      >
                        No plants yet. Add plants for a healthy ecosystem!
                      </Text>
                    </View>
                  ) : (
                    activeTankPlants.map((plant) => (
                      <PlantInTank
                        key={plant.id}
                        plant={plant}
                        onRemove={() => handleDeletePlant(plant)}
                        onPress={() => router.push(`/plant/${plant.id}`)}
                        isDark={isDark}
                      />
                    ))
                  )}
                </View>
              )}
            </View>
          )}

          <View className="h-8" />
        </ScrollView>

        <CreateTankModal
          visible={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTank}
          isDark={isDark}
        />

        <RenameTankModal
          visible={showRenameModal}
          onClose={() => {
            setShowRenameModal(false);
            setRenamingTankId(null);
          }}
          onSubmit={(newName) => {
            if (renamingTankId) {
              renameTank(renamingTankId, newName);
            }
          }}
          currentName={renamingTank?.name || ''}
          isDark={isDark}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowDeleteModal(false);
            setDeletingTankId(null);
          }}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View
              className={cn(
                'w-full max-w-sm rounded-2xl p-6',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
            >
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-red-500/20 items-center justify-center mb-4">
                  <Trash2 size={32} color="#EF4444" />
                </View>
                <Text
                  className={cn(
                    'text-xl font-bold text-center',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Delete Tank?
                </Text>
              </View>
              <Text
                className={cn(
                  'text-center mb-6',
                  isDark ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                Are you sure you want to delete "{deletingTank?.name}"? This action cannot be undone.
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => {
                    setShowDeleteModal(false);
                    setDeletingTankId(null);
                  }}
                  className={cn(
                    'flex-1 py-3 rounded-xl',
                    isDark ? 'bg-slate-700' : 'bg-slate-100'
                  )}
                >
                  <Text
                    className={cn(
                      'text-center font-semibold',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={confirmDeleteTank}
                  className="flex-1 py-3 rounded-xl bg-red-500"
                >
                  <Text className="text-center font-semibold text-white">
                    Delete
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Fish Confirmation Modal */}
        <Modal
          visible={showDeleteFishModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowDeleteFishModal(false);
            setDeletingFish(null);
          }}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View
              className={cn(
                'w-full max-w-sm rounded-2xl p-6',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
            >
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-red-500/20 items-center justify-center mb-4">
                  <Trash2 size={32} color="#EF4444" />
                </View>
                <Text
                  className={cn(
                    'text-xl font-bold text-center',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Remove Fish?
                </Text>
              </View>
              <Text
                className={cn(
                  'text-center mb-6',
                  isDark ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                Are you sure you want to remove {deletingFish?.commonName} from your tank?
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => {
                    setShowDeleteFishModal(false);
                    setDeletingFish(null);
                  }}
                  className={cn(
                    'flex-1 py-3 rounded-xl',
                    isDark ? 'bg-slate-700' : 'bg-slate-100'
                  )}
                >
                  <Text
                    className={cn(
                      'text-center font-semibold',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={confirmDeleteFish}
                  className="flex-1 py-3 rounded-xl bg-red-500"
                >
                  <Text className="text-center font-semibold text-white">
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {/* Delete Plant Confirmation Modal */}
        <Modal
          visible={showDeletePlantModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowDeletePlantModal(false);
            setDeletingPlant(null);
          }}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View
              className={cn(
                'w-full max-w-sm rounded-2xl p-6',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
            >
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-red-500/20 items-center justify-center mb-4">
                  <Trash2 size={32} color="#EF4444" />
                </View>
                <Text
                  className={cn(
                    'text-xl font-bold text-center',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Remove Plant?
                </Text>
              </View>
              <Text
                className={cn(
                  'text-center mb-6',
                  isDark ? 'text-slate-400' : 'text-slate-600'
                )}
              >
                Are you sure you want to remove {deletingPlant?.commonName} from your tank?
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => {
                    setShowDeletePlantModal(false);
                    setDeletingPlant(null);
                  }}
                  className={cn(
                    'flex-1 py-3 rounded-xl',
                    isDark ? 'bg-slate-700' : 'bg-slate-100'
                  )}
                >
                  <Text
                    className={cn(
                      'text-center font-semibold',
                      isDark ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={confirmDeletePlant}
                  className="flex-1 py-3 rounded-xl bg-red-500"
                >
                  <Text className="text-center font-semibold text-white">
                    Remove
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
