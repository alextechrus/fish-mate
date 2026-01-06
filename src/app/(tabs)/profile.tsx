import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  User,
  LogIn,
  LogOut,
  Share2,
  ChevronRight,
  Fish as FishIcon,
  X,
  Send,
  Waves,
  Calendar,
  Trash2,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { useAuthStore, SharedTank } from '@/lib/state/auth-store';
import { useTankStore } from '@/lib/state/tank-store';
import { checkMultipleFishCompatibility } from '@/lib/utils/compatibility';
import { getFishById } from '@/lib/data/fish-database';
import { TankSetup } from '@/lib/types/fish';
import { cn } from '@/lib/cn';

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

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const user = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const logout = useAuthStore(s => s.logout);
  const sharedTanks = useAuthStore(s => s.user?.sharedTanks || []);
  const removeSharedTank = useAuthStore(s => s.removeSharedTank);

  const tanks = useTankStore(s => s.tanks);

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
                  <User size={24} color="white" />
                </View>
                <Text className="text-white text-2xl font-bold">Profile</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Profile Card */}
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
