import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Anchor,
  Plus,
  Trash2,
  Settings,
  Fish as FishIcon,
  Droplets,
  AlertTriangle,
  CheckCircle,
  X,
  Edit3,
  ChevronRight,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { useTankStore } from '@/lib/state/tank-store';
import { getFishById } from '@/lib/data/fish-database';
import { checkMultipleFishCompatibility } from '@/lib/utils/compatibility';
import { WaterType, Fish, TankSetup } from '@/lib/types/fish';
import { cn } from '@/lib/cn';

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
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View
          className={cn(
            'rounded-t-3xl p-6',
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
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            className={cn(
              'px-4 py-3 rounded-xl text-base mb-4',
              isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
            )}
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
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            keyboardType="numeric"
            className={cn(
              'px-4 py-3 rounded-xl text-base mb-4',
              isDark ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-900'
            )}
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

          <View className="h-8" />
        </View>
      </View>
    </Modal>
  );
};

const TankCard = ({
  tank,
  isActive,
  onSelect,
  onDelete,
  isDark,
}: {
  tank: TankSetup;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  isDark: boolean;
}) => {
  const fish = tank.fishIds.map((id) => getFishById(id)).filter((f): f is Fish => f !== undefined);
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
        isActive
          ? 'border-2 border-sky-500'
          : '',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text
              className={cn(
                'text-lg font-bold',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              {tank.name}
            </Text>
            {isActive && (
              <View className="ml-2 px-2 py-0.5 rounded bg-sky-500">
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
              {tank.waterType} • {tank.size} gallons
            </Text>
          </View>
        </View>
        <Pressable
          onPress={onDelete}
          className="p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={18} color="#EF4444" />
        </Pressable>
      </View>

      {/* Fish Preview */}
      <View className="flex-row items-center">
        {fish.slice(0, 4).map((f, i) => (
          <Image
            key={f.id}
            source={{ uri: f.imageUrl }}
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
        className="w-14 h-14 rounded-xl"
        resizeMode="cover"
      />
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
            {fish.temperament} • {fish.maxSize}" max
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

export default function MyTankScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [showCreateModal, setShowCreateModal] = useState(false);

  const tanks = useTankStore((s) => s.tanks);
  const activeTankId = useTankStore((s) => s.activeTankId);
  const addTank = useTankStore((s) => s.addTank);
  const removeTank = useTankStore((s) => s.removeTank);
  const setActiveTank = useTankStore((s) => s.setActiveTank);
  const removeFishFromTank = useTankStore((s) => s.removeFishFromTank);

  const activeTank = tanks.find((t) => t.id === activeTankId);
  const activeTankFish = activeTank?.fishIds
    .map((id) => getFishById(id))
    .filter((f): f is Fish => f !== undefined) || [];

  const compatibility = activeTankFish.length >= 2
    ? checkMultipleFishCompatibility(activeTank?.fishIds || [], activeTank?.size)
    : null;

  const handleCreateTank = (name: string, size: number, waterType: WaterType) => {
    addTank(name, size, waterType);
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
              <Anchor size={24} color="white" />
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
              {activeTank.name} • {activeTankFish.length} fish
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

              {tanks.map((tank) => (
                <TankCard
                  key={tank.id}
                  tank={tank}
                  isActive={tank.id === activeTankId}
                  onSelect={() => setActiveTank(tank.id)}
                  onDelete={() => removeTank(tank.id)}
                  isDark={isDark}
                />
              ))}

              {/* Active Tank Details */}
              {activeTank && (
                <View className="mt-6">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text
                      className={cn(
                        'text-lg font-bold',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      Fish in {activeTank.name}
                    </Text>
                    <Pressable
                      onPress={() => router.push('/(tabs)/browse')}
                      className="flex-row items-center"
                    >
                      <Text className="text-sky-500 text-sm font-medium mr-1">
                        Add Fish
                      </Text>
                      <ChevronRight size={16} color="#0EA5E9" />
                    </Pressable>
                  </View>

                  {/* Compatibility Warning */}
                  {compatibility && compatibility.overallStatus !== 'compatible' && (
                    <View
                      className={cn(
                        'rounded-xl p-4 mb-4',
                        compatibility.overallStatus === 'conditional'
                          ? 'bg-amber-500/10'
                          : 'bg-red-500/10'
                      )}
                    >
                      <View className="flex-row items-center mb-2">
                        <AlertTriangle
                          size={18}
                          color={
                            compatibility.overallStatus === 'conditional'
                              ? '#F59E0B'
                              : '#EF4444'
                          }
                        />
                        <Text
                          className={cn(
                            'font-semibold ml-2',
                            compatibility.overallStatus === 'conditional'
                              ? 'text-amber-600'
                              : 'text-red-600'
                          )}
                        >
                          {compatibility.overallStatus === 'conditional'
                            ? 'Compatibility Warning'
                            : 'Compatibility Issue'}
                        </Text>
                      </View>
                      {compatibility.tankSizeWarning && (
                        <Text
                          className={cn(
                            'text-sm mb-1',
                            isDark ? 'text-slate-300' : 'text-slate-600'
                          )}
                        >
                          {compatibility.tankSizeWarning}
                        </Text>
                      )}
                      <Pressable
                        onPress={() => router.push('/(tabs)/compatibility')}
                        className="mt-2"
                      >
                        <Text className="text-sky-500 text-sm font-medium">
                          View Details
                        </Text>
                      </Pressable>
                    </View>
                  )}

                  {activeTankFish.length === 0 ? (
                    <View
                      className={cn(
                        'p-6 rounded-xl items-center',
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
                        No fish in this tank yet.{'\n'}Browse and add fish to get
                        started!
                      </Text>
                    </View>
                  ) : (
                    activeTankFish.map((fish) => (
                      <FishInTank
                        key={fish.id}
                        fish={fish}
                        onRemove={() => removeFishFromTank(activeTank.id, fish.id)}
                        onPress={() => router.push(`/fish/${fish.id}`)}
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
      </SafeAreaView>
    </View>
  );
}
