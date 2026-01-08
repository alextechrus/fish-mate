import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import {
  ChevronLeft,
  Droplets,
  Fish as FishIcon,
  Leaf,
  Clock,
  Bell,
  BellOff,
  X,
  CheckCircle,
  AlertTriangle,
  Trash2,
  Plus,
  Calendar,
  History,
  Droplet,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { useTankStore, TankActivity, WaterChangeReminder, ExtendedTankSetup } from '@/lib/state/tank-store';
import { getFishById } from '@/lib/data/fish-database';
import { getPlantById } from '@/lib/data/plant-database';
import type { Plant } from '@/lib/data/plant-database';
import { Fish } from '@/lib/types/fish';
import { checkMultipleFishCompatibility } from '@/lib/utils/compatibility';
import { cn } from '@/lib/cn';
import { useFishImage, usePlantImage } from '@/lib/hooks/useImageUrl';
import { useSettingsStore, formatVolume } from '@/lib/state/settings-store';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Fish image component
const FishImageDisplay = ({ fish }: { fish: Fish }) => {
  const imageUrl = useFishImage(fish.id, fish.imageUrl, fish.commonName, fish.scientificName);
  return (
    <Image
      source={{ uri: imageUrl }}
      className="w-14 h-14 rounded-xl"
      resizeMode="cover"
    />
  );
};

// Plant image component
const PlantImageDisplay = ({ plant }: { plant: Plant }) => {
  const imageUrl = usePlantImage(plant.id, plant.imageUrl, plant.commonName, plant.scientificName);
  return (
    <Image
      source={{ uri: imageUrl }}
      className="w-14 h-14 rounded-xl"
      resizeMode="cover"
    />
  );
};

// Activity log item
const ActivityItem = ({ activity, isDark }: { activity: TankActivity; isDark: boolean }) => {
  const getIcon = () => {
    switch (activity.type) {
      case 'created': return Calendar;
      case 'fish_added': return FishIcon;
      case 'fish_removed': return FishIcon;
      case 'plant_added': return Leaf;
      case 'plant_removed': return Leaf;
      case 'water_change': return Droplet;
      case 'reminder_set': return Bell;
      default: return Clock;
    }
  };

  const getColor = () => {
    switch (activity.type) {
      case 'created': return '#8B5CF6';
      case 'fish_added': return '#10B981';
      case 'fish_removed': return '#EF4444';
      case 'plant_added': return '#10B981';
      case 'plant_removed': return '#EF4444';
      case 'water_change': return '#3B82F6';
      case 'reminder_set': return '#F59E0B';
      default: return '#64748B';
    }
  };

  const Icon = getIcon();
  const color = getColor();
  const timestamp = new Date(activity.timestamp);
  const timeString = timestamp.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <View className="flex-row items-start mb-4">
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: `${color}20` }}
      >
        <Icon size={18} color={color} />
      </View>
      <View className="flex-1">
        <Text
          className={cn(
            'text-sm font-medium',
            isDark ? 'text-white' : 'text-slate-900'
          )}
        >
          {activity.description}
        </Text>
        <Text
          className={cn(
            'text-xs mt-1',
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          {timeString}
        </Text>
      </View>
    </View>
  );
};

// Water change reminder modal
const WaterChangeReminderModal = ({
  visible,
  onClose,
  currentReminder,
  onSave,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  currentReminder?: WaterChangeReminder;
  onSave: (reminder: WaterChangeReminder) => void;
  isDark: boolean;
}) => {
  const [enabled, setEnabled] = useState(currentReminder?.enabled ?? true);
  const [frequency, setFrequency] = useState<WaterChangeReminder['frequency']>(currentReminder?.frequency ?? 'weekly');
  const [dayOfWeek, setDayOfWeek] = useState(currentReminder?.dayOfWeek ?? 0);
  const [hour, setHour] = useState(currentReminder?.hour ?? 10);

  const handleSave = () => {
    onSave({
      enabled,
      frequency,
      dayOfWeek,
      hour,
      minute: 0,
    });
    onClose();
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
              Water Change Reminder
            </Text>
            <Pressable onPress={onClose}>
              <X size={24} color={isDark ? '#94A3B8' : '#64748B'} />
            </Pressable>
          </View>

          {/* Enable Toggle */}
          <View className="flex-row justify-between items-center mb-6">
            <Text className={cn('text-base font-medium', isDark ? 'text-white' : 'text-slate-900')}>
              Enable Reminder
            </Text>
            <Pressable
              onPress={() => setEnabled(!enabled)}
              className={cn(
                'w-14 h-8 rounded-full justify-center px-1',
                enabled ? 'bg-sky-500' : isDark ? 'bg-slate-600' : 'bg-slate-300'
              )}
            >
              <View
                className={cn(
                  'w-6 h-6 rounded-full bg-white',
                  enabled ? 'self-end' : 'self-start'
                )}
              />
            </Pressable>
          </View>

          {enabled && (
            <>
              {/* Frequency */}
              <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-600')}>
                Frequency
              </Text>
              <View className="flex-row flex-wrap mb-4">
                {(['daily', 'weekly', 'biweekly', 'monthly'] as const).map((freq) => (
                  <Pressable
                    key={freq}
                    onPress={() => setFrequency(freq)}
                    className={cn(
                      'px-4 py-2 rounded-full mr-2 mb-2',
                      frequency === freq
                        ? 'bg-sky-500'
                        : isDark ? 'bg-slate-700' : 'bg-slate-100'
                    )}
                  >
                    <Text
                      className={cn(
                        'text-sm font-medium capitalize',
                        frequency === freq ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-600'
                      )}
                    >
                      {freq}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Day of Week (for weekly/biweekly) */}
              {(frequency === 'weekly' || frequency === 'biweekly') && (
                <>
                  <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-600')}>
                    Day of Week
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                    <View className="flex-row">
                      {DAYS_OF_WEEK.map((day, index) => (
                        <Pressable
                          key={day}
                          onPress={() => setDayOfWeek(index)}
                          className={cn(
                            'px-3 py-2 rounded-full mr-2',
                            dayOfWeek === index
                              ? 'bg-sky-500'
                              : isDark ? 'bg-slate-700' : 'bg-slate-100'
                          )}
                        >
                          <Text
                            className={cn(
                              'text-sm font-medium',
                              dayOfWeek === index ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-600'
                            )}
                          >
                            {day.slice(0, 3)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </ScrollView>
                </>
              )}

              {/* Time */}
              <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-600')}>
                Time
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                <View className="flex-row">
                  {[6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((h) => (
                    <Pressable
                      key={h}
                      onPress={() => setHour(h)}
                      className={cn(
                        'px-3 py-2 rounded-full mr-2',
                        hour === h
                          ? 'bg-sky-500'
                          : isDark ? 'bg-slate-700' : 'bg-slate-100'
                      )}
                    >
                      <Text
                        className={cn(
                          'text-sm font-medium',
                          hour === h ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-600'
                        )}
                      >
                        {h.toString().padStart(2, '0')}:00
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </>
          )}

          <Pressable
            onPress={handleSave}
            className="py-4 rounded-xl items-center bg-sky-500"
          >
            <Text className="text-white font-bold text-base">Save Reminder</Text>
          </Pressable>

          <View className="h-8" />
        </View>
      </View>
    </Modal>
  );
};

export default function TankDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const volumeUnit = useSettingsStore((s) => s.volumeUnit);

  const [showReminderModal, setShowReminderModal] = useState(false);

  const tanks = useTankStore((s) => s.tanks);
  const removeFishFromTank = useTankStore((s) => s.removeFishFromTank);
  const removePlantFromTank = useTankStore((s) => s.removePlantFromTank);
  const setWaterChangeReminder = useTankStore((s) => s.setWaterChangeReminder);
  const logWaterChange = useTankStore((s) => s.logWaterChange);

  const tank = tanks.find(t => t.id === id) as ExtendedTankSetup | undefined;

  const fish = useMemo(() => {
    return tank?.fishIds
      .map((fishId) => getFishById(fishId))
      .filter((f): f is Fish => f !== undefined) || [];
  }, [tank?.fishIds]);

  const plants = useMemo(() => {
    return (tank?.plantIds || [])
      .map((plantId) => getPlantById(plantId))
      .filter((p): p is Plant => p !== undefined);
  }, [tank?.plantIds]);

  const compatibility = useMemo(() => {
    return fish.length >= 2
      ? checkMultipleFishCompatibility(tank?.fishIds || [], tank?.size)
      : null;
  }, [fish, tank?.fishIds, tank?.size]);

  const activities = useMemo(() => {
    return (tank?.activities || []).slice().reverse().slice(0, 20);
  }, [tank?.activities]);

  // Request notification permissions
  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.log('Notification permissions not granted');
      }
    };
    requestPermissions();
  }, []);

  const handleSaveReminder = async (reminder: WaterChangeReminder) => {
    if (!tank) return;

    setWaterChangeReminder(tank.id, reminder);

    if (reminder.enabled) {
      // Cancel existing notifications for this tank
      await Notifications.cancelAllScheduledNotificationsAsync();

      // Schedule new notification
      const trigger: Notifications.NotificationTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: reminder.dayOfWeek + 1, // expo uses 1-7
        hour: reminder.hour,
        minute: reminder.minute,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Water Change Reminder`,
          body: `Time to change the water in ${tank.name}!`,
          sound: true,
        },
        trigger,
      });

      Alert.alert(
        'Reminder Set',
        `You'll be reminded ${reminder.frequency} to change water in ${tank.name}.`
      );
    }
  };

  const handleLogWaterChange = () => {
    if (!tank) return;
    logWaterChange(tank.id);
    Alert.alert('Water Change Logged', 'Great job keeping your tank healthy!');
  };

  if (!tank) {
    return (
      <View className={cn('flex-1 items-center justify-center', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <Text className={isDark ? 'text-white' : 'text-slate-900'}>Tank not found</Text>
      </View>
    );
  }

  const statusColor = compatibility?.overallStatus === 'compatible'
    ? '#10B981'
    : compatibility?.overallStatus === 'conditional'
    ? '#F59E0B'
    : compatibility?.overallStatus === 'incompatible'
    ? '#EF4444'
    : '#10B981';

  const tankAge = Math.floor((Date.now() - new Date(tank.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Header */}
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#10B981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingBottom: 40 }}
        >
          <SafeAreaView edges={['top']}>
            <View className="px-5 pt-2">
              {/* Back button */}
              <Pressable
                onPress={() => router.back()}
                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mb-4"
              >
                <ChevronLeft size={24} color="white" />
              </Pressable>

              {/* Tank Info */}
              <Text className="text-white text-3xl font-bold mb-2">{tank.name}</Text>
              <View className="flex-row items-center mb-4">
                <Droplets size={16} color="white" />
                <Text className="text-white/80 text-base ml-2 capitalize">
                  {tank.waterType} • {formatVolume(tank.size, volumeUnit)}
                </Text>
              </View>

              {/* Stats Row */}
              <View className="flex-row">
                <View className="bg-white/20 rounded-xl px-4 py-3 mr-3">
                  <Text className="text-white/70 text-xs">Fish</Text>
                  <Text className="text-white text-xl font-bold">{fish.length}</Text>
                </View>
                <View className="bg-white/20 rounded-xl px-4 py-3 mr-3">
                  <Text className="text-white/70 text-xs">Plants</Text>
                  <Text className="text-white text-xl font-bold">{plants.length}</Text>
                </View>
                <View className="bg-white/20 rounded-xl px-4 py-3 mr-3">
                  <Text className="text-white/70 text-xs">Age</Text>
                  <Text className="text-white text-xl font-bold">{tankAge}d</Text>
                </View>
                {compatibility && (
                  <View className="bg-white/20 rounded-xl px-4 py-3 flex-row items-center">
                    {compatibility.overallStatus === 'compatible' ? (
                      <CheckCircle size={20} color="#10B981" />
                    ) : (
                      <AlertTriangle size={20} color={statusColor} />
                    )}
                  </View>
                )}
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>

        <View className="px-5 -mt-6">
          {/* Water Change Section */}
          <View
            className={cn(
              'rounded-2xl p-4 mb-4',
              isDark ? 'bg-slate-800' : 'bg-white'
            )}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <Droplet size={20} color="#3B82F6" />
                <Text
                  className={cn(
                    'text-lg font-bold ml-2',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Water Change
                </Text>
              </View>
              <Pressable
                onPress={() => setShowReminderModal(true)}
                className="flex-row items-center"
              >
                {tank.waterChangeReminder?.enabled ? (
                  <Bell size={18} color="#F59E0B" />
                ) : (
                  <BellOff size={18} color={isDark ? '#64748B' : '#94A3B8'} />
                )}
                <Text className="text-sky-500 text-sm font-medium ml-1">
                  {tank.waterChangeReminder?.enabled ? 'Edit' : 'Set Reminder'}
                </Text>
              </Pressable>
            </View>

            {tank.waterChangeReminder?.enabled && (
              <View
                className={cn(
                  'rounded-xl p-3 mb-3',
                  isDark ? 'bg-slate-700' : 'bg-slate-50'
                )}
              >
                <Text className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')}>
                  Reminder: {tank.waterChangeReminder.frequency} on{' '}
                  {DAYS_OF_WEEK[tank.waterChangeReminder.dayOfWeek]} at{' '}
                  {tank.waterChangeReminder.hour.toString().padStart(2, '0')}:00
                </Text>
              </View>
            )}

            <Pressable
              onPress={handleLogWaterChange}
              className="flex-row items-center justify-center py-3 rounded-xl bg-blue-500"
            >
              <CheckCircle size={18} color="white" />
              <Text className="text-white font-semibold ml-2">Log Water Change</Text>
            </Pressable>
          </View>

          {/* Fish Section */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <FishIcon size={18} color={isDark ? '#94A3B8' : '#64748B'} />
                <Text
                  className={cn(
                    'text-lg font-bold ml-2',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Fish ({fish.length})
                </Text>
              </View>
              <Pressable
                onPress={() => router.push(`/add-to-tank?tankId=${tank.id}&mode=fish`)}
                className="flex-row items-center bg-sky-500 px-3 py-1.5 rounded-full"
              >
                <Plus size={14} color="white" />
                <Text className="text-white text-sm font-medium ml-1">Add</Text>
              </Pressable>
            </View>

            {fish.length === 0 ? (
              <View
                className={cn(
                  'p-6 rounded-xl items-center',
                  isDark ? 'bg-slate-800' : 'bg-white'
                )}
              >
                <FishIcon size={32} color={isDark ? '#64748B' : '#94A3B8'} />
                <Text className={cn('text-sm mt-3', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  No fish yet
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {fish.map((f) => (
                    <Pressable
                      key={f.id}
                      onPress={() => router.push(`/fish/${f.id}`)}
                      className={cn(
                        'mr-3 p-3 rounded-xl w-32',
                        isDark ? 'bg-slate-800' : 'bg-white'
                      )}
                    >
                      <FishImageDisplay fish={f} />
                      <Text
                        className={cn(
                          'text-sm font-semibold mt-2',
                          isDark ? 'text-white' : 'text-slate-900'
                        )}
                        numberOfLines={1}
                      >
                        {f.commonName}
                      </Text>
                      <Pressable
                        onPress={() => removeFishFromTank(tank.id, f.id, f.commonName)}
                        className="absolute top-2 right-2 bg-red-500/20 rounded-full p-1"
                      >
                        <Trash2 size={12} color="#EF4444" />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {/* Plants Section */}
          <View className="mb-4">
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center">
                <Leaf size={18} color="#10B981" />
                <Text
                  className={cn(
                    'text-lg font-bold ml-2',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Plants ({plants.length})
                </Text>
              </View>
              <Pressable
                onPress={() => router.push(`/add-to-tank?tankId=${tank.id}&mode=plants`)}
                className="flex-row items-center bg-emerald-500 px-3 py-1.5 rounded-full"
              >
                <Plus size={14} color="white" />
                <Text className="text-white text-sm font-medium ml-1">Add</Text>
              </Pressable>
            </View>

            {plants.length === 0 ? (
              <View
                className={cn(
                  'p-6 rounded-xl items-center',
                  isDark ? 'bg-slate-800' : 'bg-white'
                )}
              >
                <Leaf size={32} color={isDark ? '#64748B' : '#94A3B8'} />
                <Text className={cn('text-sm mt-3', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  No plants yet
                </Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {plants.map((p) => (
                    <Pressable
                      key={p.id}
                      onPress={() => router.push(`/plant/${p.id}`)}
                      className={cn(
                        'mr-3 p-3 rounded-xl w-32',
                        isDark ? 'bg-slate-800' : 'bg-white'
                      )}
                    >
                      <PlantImageDisplay plant={p} />
                      <Text
                        className={cn(
                          'text-sm font-semibold mt-2',
                          isDark ? 'text-white' : 'text-slate-900'
                        )}
                        numberOfLines={1}
                      >
                        {p.commonName}
                      </Text>
                      <Pressable
                        onPress={() => removePlantFromTank(tank.id, p.id, p.commonName)}
                        className="absolute top-2 right-2 bg-red-500/20 rounded-full p-1"
                      >
                        <Trash2 size={12} color="#EF4444" />
                      </Pressable>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            )}
          </View>

          {/* Activity Log */}
          <View className="mb-4">
            <View className="flex-row items-center mb-4">
              <History size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              <Text
                className={cn(
                  'text-lg font-bold ml-2',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                Tank Journey
              </Text>
            </View>

            <View
              className={cn(
                'rounded-2xl p-4',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
            >
              {activities.length === 0 ? (
                <Text className={cn('text-sm text-center', isDark ? 'text-slate-400' : 'text-slate-500')}>
                  No activity yet
                </Text>
              ) : (
                activities.map((activity) => (
                  <ActivityItem key={activity.id} activity={activity} isDark={isDark} />
                ))
              )}
            </View>
          </View>

          <View className="h-8" />
        </View>
      </ScrollView>

      <WaterChangeReminderModal
        visible={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        currentReminder={tank.waterChangeReminder}
        onSave={handleSaveReminder}
        isDark={isDark}
      />
    </View>
  );
}
