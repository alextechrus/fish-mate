import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  User,
  LogIn,
  LogOut,
  Share2,
  Fish as FishIcon,
  X,
  Send,
  Waves,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Settings,
  ChevronRight,
  Droplets,
  Thermometer,
  Star,
  Bug,
  MessageSquare,
  Shield,
  FileText,
  Info,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { useAuthStore, SharedTank } from '@/lib/state/auth-store';
import { useTankStore } from '@/lib/state/tank-store';
import { useSettingsStore, VolumeUnit, TemperatureUnit } from '@/lib/state/settings-store';
import { checkMultipleFishCompatibility } from '@/lib/utils/compatibility';
import { getFishById } from '@/lib/data/fish-database';
import { TankSetup } from '@/lib/types/fish';
import { cn } from '@/lib/cn';

const APP_VERSION = '1.0.0';

const ShareTankModal = ({
  visible,
  onClose,
  tank,
  isDark,
}: {
  visible: boolean;
  onClose: () => void;
  tank: TankSetup | null;
  isDark: boolean;
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const shareTank = useAuthStore(s => s.shareTank);

  const handleShare = async () => {
    if (!tank) return;
    setError('');

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    const result = await shareTank(tank, email);

    if (result) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setEmail('');
        onClose();
      }, 1500);
    } else {
      setError('User not found. They need to create an account first.');
    }
  };

  const handleClose = () => {
    setEmail('');
    setError('');
    setSuccess(false);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        className="flex-1 justify-center items-center bg-black/50 px-6"
        onPress={handleClose}
      >
        <Pressable
          className={cn(
            'w-full max-w-sm rounded-2xl p-6',
            isDark ? 'bg-slate-800' : 'bg-white'
          )}
          onPress={e => e.stopPropagation()}
        >
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Share2 size={24} color="#0EA5E9" />
              <Text
                className={cn(
                  'text-lg font-bold ml-2',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                Share Tank
              </Text>
            </View>
            <Pressable onPress={handleClose}>
              <X size={24} color={isDark ? '#94A3B8' : '#64748B'} />
            </Pressable>
          </View>

          {success ? (
            <View className="items-center py-8">
              <View className="bg-emerald-500/20 rounded-full p-4 mb-4">
                <CheckCircle size={48} color="#10B981" />
              </View>
              <Text
                className={cn(
                  'text-lg font-semibold',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                Tank Shared Successfully!
              </Text>
            </View>
          ) : (
            <>
              <Text
                className={cn(
                  'text-sm mb-4',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                Share "{tank?.name}" with another FishMate user
              </Text>

              {error ? (
                <View className="bg-red-500/10 rounded-xl p-3 mb-4">
                  <Text className="text-red-500 text-sm text-center">{error}</Text>
                </View>
              ) : null}

              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter recipient's email"
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 12,
                  fontSize: 16,
                  marginBottom: 16,
                  backgroundColor: isDark ? '#334155' : '#F1F5F9',
                  color: isDark ? '#FFFFFF' : '#0F172A',
                }}
              />

              <Pressable
                onPress={handleShare}
                className="flex-row items-center justify-center py-4 rounded-xl bg-sky-500"
              >
                <Send size={18} color="white" />
                <Text className="text-white font-semibold ml-2">Share Tank</Text>
              </Pressable>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const SharedTankCard = ({
  sharedTank,
  onRemove,
  isDark,
}: {
  sharedTank: SharedTank;
  onRemove: () => void;
  isDark: boolean;
}) => {
  const fish = sharedTank.tankData.fishIds
    .map(id => getFishById(id))
    .filter(Boolean);

  return (
    <View
      className={cn(
        'rounded-xl p-4 mb-3',
        isDark ? 'bg-slate-800' : 'bg-white'
      )}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text
            className={cn(
              'text-base font-bold',
              isDark ? 'text-white' : 'text-slate-900'
            )}
          >
            {sharedTank.tankName}
          </Text>
          <Text
            className={cn(
              'text-xs',
              isDark ? 'text-slate-400' : 'text-slate-500'
            )}
          >
            Shared by {sharedTank.sharedByName}
          </Text>
        </View>
        <Pressable
          onPress={onRemove}
          className="p-2"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Trash2 size={18} color="#EF4444" />
        </Pressable>
      </View>

      <View className="flex-row items-center mb-2">
        <Waves size={14} color={isDark ? '#94A3B8' : '#64748B'} />
        <Text
          className={cn(
            'text-xs ml-1.5',
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          {sharedTank.tankData.size}g {sharedTank.tankData.waterType}
        </Text>
      </View>

      <View className="flex-row flex-wrap">
        {fish.slice(0, 4).map((f, i) => (
          <Image
            key={i}
            source={{ uri: f?.imageUrl }}
            className="w-8 h-8 rounded-full -mr-2 border-2"
            style={{ borderColor: isDark ? '#1E293B' : '#FFFFFF' }}
          />
        ))}
        {fish.length > 4 && (
          <View
            className={cn(
              'w-8 h-8 rounded-full items-center justify-center',
              isDark ? 'bg-slate-700' : 'bg-slate-200'
            )}
          >
            <Text
              className={cn(
                'text-xs font-medium',
                isDark ? 'text-slate-300' : 'text-slate-600'
              )}
            >
              +{fish.length - 4}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Settings Option Row Component
const SettingsRow = ({
  icon: Icon,
  title,
  subtitle,
  onPress,
  isDark,
  iconColor = '#0EA5E9',
  rightElement,
  showChevron = true,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  isDark: boolean;
  iconColor?: string;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    className={cn(
      'flex-row items-center py-4 px-4',
      isDark ? 'active:bg-slate-700' : 'active:bg-slate-100'
    )}
  >
    <View
      className="w-10 h-10 rounded-xl items-center justify-center mr-3"
      style={{ backgroundColor: `${iconColor}20` }}
    >
      <Icon size={20} color={iconColor} />
    </View>
    <View className="flex-1">
      <Text
        className={cn(
          'text-base font-medium',
          isDark ? 'text-white' : 'text-slate-900'
        )}
      >
        {title}
      </Text>
      {subtitle && (
        <Text
          className={cn(
            'text-xs',
            isDark ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          {subtitle}
        </Text>
      )}
    </View>
    {rightElement}
    {showChevron && !rightElement && (
      <ChevronRight size={20} color={isDark ? '#64748B' : '#94A3B8'} />
    )}
  </Pressable>
);

// Toggle Button for settings
const ToggleButton = ({
  options,
  selected,
  onSelect,
  isDark,
}: {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
  isDark: boolean;
}) => (
  <View
    className={cn(
      'flex-row rounded-lg p-1',
      isDark ? 'bg-slate-700' : 'bg-slate-200'
    )}
  >
    {options.map((option) => (
      <Pressable
        key={option.value}
        onPress={() => onSelect(option.value)}
        className={cn(
          'px-3 py-1.5 rounded-md',
          selected === option.value && (isDark ? 'bg-slate-600' : 'bg-white')
        )}
      >
        <Text
          className={cn(
            'text-sm font-medium',
            selected === option.value
              ? isDark ? 'text-white' : 'text-slate-900'
              : isDark ? 'text-slate-400' : 'text-slate-500'
          )}
        >
          {option.label}
        </Text>
      </Pressable>
    ))}
  </View>
);

// Inner component that uses stores - only rendered after hydration
function SettingsContent({ isDark }: { isDark: boolean }) {
  const router = useRouter();

  // Get auth state using individual selectors
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const removeSharedTank = useAuthStore((s) => s.removeSharedTank);

  // Derive sharedTanks from user
  const sharedTanks = user?.sharedTanks ?? [];

  // Get tanks from tank store using selector
  const tanks = useTankStore((s) => s.tanks);

  // Settings store
  const volumeUnit = useSettingsStore((s) => s.volumeUnit);
  const temperatureUnit = useSettingsStore((s) => s.temperatureUnit);
  const setVolumeUnit = useSettingsStore((s) => s.setVolumeUnit);
  const setTemperatureUnit = useSettingsStore((s) => s.setTemperatureUnit);

  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [selectedTank, setSelectedTank] = useState<TankSetup | null>(null);

  const handleLogout = () => {
    logout();
  };

  const handleShareTank = (tank: TankSetup) => {
    // Check if tank is compatible before sharing
    const fishInTank = tank.fishIds.map(id => getFishById(id)).filter(Boolean);

    if (fishInTank.length < 2) {
      setSelectedTank(tank);
      setShareModalVisible(true);
      return;
    }

    const compatibilityCheck = checkMultipleFishCompatibility(tank.fishIds);

    if (compatibilityCheck.overallStatus === 'incompatible') {
      Alert.alert(
        'Incompatible Tank',
        'This tank has compatibility issues. Please fix them before sharing.',
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedTank(tank);
    setShareModalVisible(true);
  };

  const handleRateApp = () => {
    // This would normally open the app store
    Alert.alert(
      'Rate FishMate',
      'Thank you for using FishMate! Rating will be available once the app is published to the App Store.',
      [{ text: 'OK' }]
    );
  };

  const handleReportBug = () => {
    Linking.openURL('mailto:support@fishmate.app?subject=Bug Report - FishMate');
  };

  const handleSendFeedback = () => {
    Linking.openURL('mailto:feedback@fishmate.app?subject=Feedback - FishMate');
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://fishmate.app/privacy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://fishmate.app/terms');
  };

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Header */}
          <LinearGradient
            colors={isDark ? ['#0F172A', '#1E3A5F'] : ['#0EA5E9', '#0284C7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: 80,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
            }}
          >
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center">
                <View className="bg-white/20 rounded-full p-2 mr-3">
                  <Settings size={24} color="white" />
                </View>
                <Text className="text-white text-2xl font-bold">Settings</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Account Card */}
          <View className="px-5 -mt-16">
            <View
              className={cn(
                'rounded-2xl p-6',
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
              {isAuthenticated && user ? (
                <>
                  <View className="items-center mb-6">
                    <View
                      className="w-20 h-20 rounded-full items-center justify-center mb-3"
                      style={{ backgroundColor: '#0EA5E920' }}
                    >
                      <Text className="text-3xl font-bold text-sky-500">
                        {user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text
                      className={cn(
                        'text-xl font-bold',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      {user.name}
                    </Text>
                    <Text
                      className={cn(
                        'text-sm',
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      )}
                    >
                      {user.email}
                    </Text>
                  </View>

                  <View className="flex-row justify-around mb-6">
                    <View className="items-center">
                      <Text
                        className={cn(
                          'text-2xl font-bold',
                          isDark ? 'text-white' : 'text-slate-900'
                        )}
                      >
                        {tanks.length}
                      </Text>
                      <Text
                        className={cn(
                          'text-xs',
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        )}
                      >
                        My Tanks
                      </Text>
                    </View>
                    <View
                      className={cn(
                        'w-px',
                        isDark ? 'bg-slate-700' : 'bg-slate-200'
                      )}
                    />
                    <View className="items-center">
                      <Text
                        className={cn(
                          'text-2xl font-bold',
                          isDark ? 'text-white' : 'text-slate-900'
                        )}
                      >
                        {sharedTanks.length}
                      </Text>
                      <Text
                        className={cn(
                          'text-xs',
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        )}
                      >
                        Shared With Me
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={handleLogout}
                    className="flex-row items-center justify-center py-3 rounded-xl border border-red-500"
                  >
                    <LogOut size={18} color="#EF4444" />
                    <Text className="text-red-500 font-semibold ml-2">Sign Out</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <View className="items-center mb-6">
                    <View
                      className={cn(
                        'w-20 h-20 rounded-full items-center justify-center mb-3',
                        isDark ? 'bg-slate-700' : 'bg-slate-100'
                      )}
                    >
                      <User size={40} color={isDark ? '#64748B' : '#94A3B8'} />
                    </View>
                    <Text
                      className={cn(
                        'text-lg font-bold mb-1',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      Welcome to FishMate
                    </Text>
                    <Text
                      className={cn(
                        'text-sm text-center px-4',
                        isDark ? 'text-slate-400' : 'text-slate-500'
                      )}
                    >
                      Create an account to save your tanks and share them with friends
                    </Text>
                  </View>

                  <Pressable
                    onPress={() => router.push('/auth/login')}
                    className="flex-row items-center justify-center py-4 rounded-xl bg-sky-500 mb-3"
                  >
                    <LogIn size={18} color="white" />
                    <Text className="text-white font-semibold ml-2">Sign In</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => router.push('/auth/register')}
                    className={cn(
                      'flex-row items-center justify-center py-4 rounded-xl border',
                      isDark ? 'border-slate-600' : 'border-slate-300'
                    )}
                  >
                    <Text
                      className={cn(
                        'font-semibold',
                        isDark ? 'text-white' : 'text-slate-900'
                      )}
                    >
                      Create Account
                    </Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>

          {/* App Preferences Section */}
          <View className="px-5 mt-6">
            <Text
              className={cn(
                'text-lg font-bold mb-3',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              Preferences
            </Text>

            <View
              className={cn(
                'rounded-2xl overflow-hidden',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <SettingsRow
                icon={Droplets}
                title="Volume Unit"
                subtitle={volumeUnit === 'litres' ? 'Using Litres' : 'Using Gallons'}
                isDark={isDark}
                iconColor="#3B82F6"
                showChevron={false}
                rightElement={
                  <ToggleButton
                    options={[
                      { value: 'litres', label: 'L' },
                      { value: 'gallons', label: 'Gal' },
                    ]}
                    selected={volumeUnit}
                    onSelect={(v) => setVolumeUnit(v as VolumeUnit)}
                    isDark={isDark}
                  />
                }
              />
              <View className={cn('h-px mx-4', isDark ? 'bg-slate-700' : 'bg-slate-100')} />
              <SettingsRow
                icon={Thermometer}
                title="Temperature"
                subtitle={temperatureUnit === 'celsius' ? 'Using Celsius' : 'Using Fahrenheit'}
                isDark={isDark}
                iconColor="#EF4444"
                showChevron={false}
                rightElement={
                  <ToggleButton
                    options={[
                      { value: 'celsius', label: '°C' },
                      { value: 'fahrenheit', label: '°F' },
                    ]}
                    selected={temperatureUnit}
                    onSelect={(v) => setTemperatureUnit(v as TemperatureUnit)}
                    isDark={isDark}
                  />
                }
              />
            </View>
          </View>

          {/* Share Tanks Section */}
          {isAuthenticated && tanks.length > 0 && (
            <View className="px-5 mt-6">
              <Text
                className={cn(
                  'text-lg font-bold mb-3',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                Share Your Tanks
              </Text>

              {tanks.map(tank => {
                const fishInTank = tank.fishIds.map(id => getFishById(id)).filter(Boolean);
                const compatCheck = tank.fishIds.length >= 2
                  ? checkMultipleFishCompatibility(tank.fishIds)
                  : null;
                const isCompatible = !compatCheck || compatCheck.overallStatus !== 'incompatible';

                return (
                  <Pressable
                    key={tank.id}
                    onPress={() => handleShareTank(tank)}
                    className={cn(
                      'flex-row items-center p-4 rounded-xl mb-3',
                      isDark ? 'bg-slate-800' : 'bg-white'
                    )}
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: isDark ? 0.3 : 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                    }}
                  >
                    <View
                      className={cn(
                        'w-12 h-12 rounded-xl items-center justify-center mr-3',
                        isCompatible ? 'bg-sky-500/20' : 'bg-amber-500/20'
                      )}
                    >
                      <FishIcon size={24} color={isCompatible ? '#0EA5E9' : '#F59E0B'} />
                    </View>
                    <View className="flex-1">
                      <Text
                        className={cn(
                          'text-base font-semibold',
                          isDark ? 'text-white' : 'text-slate-900'
                        )}
                      >
                        {tank.name}
                      </Text>
                      <View className="flex-row items-center">
                        <Text
                          className={cn(
                            'text-xs',
                            isDark ? 'text-slate-400' : 'text-slate-500'
                          )}
                        >
                          {fishInTank.length} fish
                        </Text>
                        {!isCompatible && (
                          <View className="flex-row items-center ml-2">
                            <AlertTriangle size={12} color="#F59E0B" />
                            <Text className="text-xs text-amber-500 ml-1">
                              Issues
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Share2 size={20} color={isDark ? '#64748B' : '#94A3B8'} />
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Shared With Me Section */}
          {isAuthenticated && sharedTanks.length > 0 && (
            <View className="px-5 mt-6">
              <Text
                className={cn(
                  'text-lg font-bold mb-3',
                  isDark ? 'text-white' : 'text-slate-900'
                )}
              >
                Shared With Me
              </Text>

              {sharedTanks.map(sharedTank => (
                <SharedTankCard
                  key={sharedTank.id}
                  sharedTank={sharedTank}
                  onRemove={() => removeSharedTank(sharedTank.id)}
                  isDark={isDark}
                />
              ))}
            </View>
          )}

          {/* Feedback & Support Section */}
          <View className="px-5 mt-6">
            <Text
              className={cn(
                'text-lg font-bold mb-3',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              Feedback & Support
            </Text>

            <View
              className={cn(
                'rounded-2xl overflow-hidden',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <SettingsRow
                icon={Star}
                title="Rate FishMate"
                subtitle="Love the app? Leave a review!"
                onPress={handleRateApp}
                isDark={isDark}
                iconColor="#F59E0B"
              />
              <View className={cn('h-px mx-4', isDark ? 'bg-slate-700' : 'bg-slate-100')} />
              <SettingsRow
                icon={Bug}
                title="Report a Bug"
                subtitle="Help us improve the app"
                onPress={handleReportBug}
                isDark={isDark}
                iconColor="#EF4444"
              />
              <View className={cn('h-px mx-4', isDark ? 'bg-slate-700' : 'bg-slate-100')} />
              <SettingsRow
                icon={MessageSquare}
                title="Send Feedback"
                subtitle="Share your thoughts with us"
                onPress={handleSendFeedback}
                isDark={isDark}
                iconColor="#10B981"
              />
            </View>
          </View>

          {/* Legal Section */}
          <View className="px-5 mt-6">
            <Text
              className={cn(
                'text-lg font-bold mb-3',
                isDark ? 'text-white' : 'text-slate-900'
              )}
            >
              Legal
            </Text>

            <View
              className={cn(
                'rounded-2xl overflow-hidden',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <SettingsRow
                icon={Shield}
                title="Privacy Policy"
                onPress={handlePrivacyPolicy}
                isDark={isDark}
                iconColor="#8B5CF6"
              />
              <View className={cn('h-px mx-4', isDark ? 'bg-slate-700' : 'bg-slate-100')} />
              <SettingsRow
                icon={FileText}
                title="Terms of Service"
                onPress={handleTermsOfService}
                isDark={isDark}
                iconColor="#6366F1"
              />
            </View>
          </View>

          {/* Version Info */}
          <View className="px-5 mt-6 mb-8">
            <View
              className={cn(
                'rounded-2xl p-4 items-center',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.3 : 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              <View className="flex-row items-center mb-1">
                <Info size={16} color={isDark ? '#64748B' : '#94A3B8'} />
                <Text
                  className={cn(
                    'text-sm font-medium ml-2',
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  )}
                >
                  FishMate
                </Text>
              </View>
              <Text
                className={cn(
                  'text-xs',
                  isDark ? 'text-slate-500' : 'text-slate-400'
                )}
              >
                Version {APP_VERSION}
              </Text>
            </View>
          </View>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>

      <ShareTankModal
        visible={shareModalVisible}
        onClose={() => {
          setShareModalVisible(false);
          setSelectedTank(null);
        }}
        tank={selectedTank}
        isDark={isDark}
      />
    </View>
  );
}

// Wrapper component that handles hydration
export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Track hydration state to avoid infinite loop with zustand persist
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <View className={cn('flex-1 items-center justify-center', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  return <SettingsContent isDark={isDark} />;
}
