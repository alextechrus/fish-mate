import React from 'react';
import { View, Text, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Fish as FishIcon, Droplets, Sparkles, ChevronRight, Waves } from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { fishDatabase, getBeginnerFriendlyFish, getFreshwaterFish, getSaltwaterFish } from '@/lib/data/fish-database';
import { Fish } from '@/lib/types/fish';
import { cn } from '@/lib/cn';

const FishCard = ({ fish, onPress }: { fish: Fish; onPress: () => void }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const temperamentColor = {
    peaceful: '#10B981',
    'semi-aggressive': '#F59E0B',
    aggressive: '#EF4444',
  }[fish.temperament];

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'mr-4 w-40 rounded-2xl overflow-hidden',
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
      <Image
        source={{ uri: fish.imageUrl }}
        className="w-full h-24"
        resizeMode="cover"
      />
      <View className="p-3">
        <Text
          className={cn(
            'text-sm font-semibold mb-1',
            isDark ? 'text-white' : 'text-slate-900'
          )}
          numberOfLines={1}
        >
          {fish.commonName}
        </Text>
        <View className="flex-row items-center">
          <View
            className="w-2 h-2 rounded-full mr-1.5"
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
        </View>
      </View>
    </Pressable>
  );
};

const QuickActionCard = ({
  icon: Icon,
  title,
  subtitle,
  colors,
  onPress,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  colors: [string, string];
  onPress: () => void;
}) => {
  return (
    <Pressable onPress={onPress} className="flex-1">
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 16,
          padding: 16,
          minHeight: 100,
        }}
      >
        <Icon size={24} color="white" />
        <Text className="text-white font-bold text-base mt-2">{title}</Text>
        <Text className="text-white/80 text-xs mt-0.5">{subtitle}</Text>
      </LinearGradient>
    </Pressable>
  );
};

const SectionHeader = ({
  title,
  onSeeAll,
  isDark,
}: {
  title: string;
  onSeeAll?: () => void;
  isDark: boolean;
}) => (
  <View className="flex-row justify-between items-center px-5 mb-3">
    <Text
      className={cn(
        'text-lg font-bold',
        isDark ? 'text-white' : 'text-slate-900'
      )}
    >
      {title}
    </Text>
    {onSeeAll && (
      <Pressable onPress={onSeeAll} className="flex-row items-center">
        <Text className="text-sky-500 text-sm font-medium mr-1">See All</Text>
        <ChevronRight size={16} color="#0EA5E9" />
      </Pressable>
    )}
  </View>
);

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const beginnerFish = getBeginnerFriendlyFish().slice(0, 6);
  const freshwaterFish = getFreshwaterFish().slice(0, 6);
  const saltwaterFish = getSaltwaterFish().slice(0, 6);

  const handleFishPress = (fish: Fish) => {
    router.push(`/fish/${fish.id}`);
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
              paddingBottom: 32,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
            }}
          >
            <View className="flex-row items-center mb-6">
              <View className="bg-white/20 rounded-full p-2 mr-3">
                <FishIcon size={24} color="white" />
              </View>
              <View>
                <Text className="text-white/80 text-sm">Welcome to</Text>
                <Text className="text-white text-2xl font-bold">FishMate</Text>
              </View>
            </View>

            <Text className="text-white/90 text-base leading-6">
              Find compatible fish for your aquarium and learn essential care
              requirements for each species.
            </Text>
          </LinearGradient>

          {/* Quick Actions */}
          <View className="px-5 -mt-6 mb-6">
            <View className="flex-row gap-3">
              <QuickActionCard
                icon={Sparkles}
                title="Check Compatibility"
                subtitle="Mix & match fish"
                colors={['#8B5CF6', '#6366F1']}
                onPress={() => router.push('/(tabs)/compatibility')}
              />
              <QuickActionCard
                icon={Waves}
                title="My Tank"
                subtitle="Manage your fish"
                colors={['#10B981', '#059669']}
                onPress={() => router.push('/(tabs)/my-tank')}
              />
            </View>
          </View>

          {/* Beginner Friendly */}
          <View className="mb-6">
            <SectionHeader
              title="Beginner Friendly"
              onSeeAll={() => router.push('/(tabs)/browse')}
              isDark={isDark}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              style={{ flexGrow: 0 }}
            >
              {beginnerFish.map((fish) => (
                <FishCard
                  key={fish.id}
                  fish={fish}
                  onPress={() => handleFishPress(fish)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Freshwater */}
          <View className="mb-6">
            <SectionHeader
              title="Freshwater Fish"
              onSeeAll={() => router.push('/(tabs)/browse')}
              isDark={isDark}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              style={{ flexGrow: 0 }}
            >
              {freshwaterFish.map((fish) => (
                <FishCard
                  key={fish.id}
                  fish={fish}
                  onPress={() => handleFishPress(fish)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Saltwater */}
          <View className="mb-6">
            <SectionHeader
              title="Saltwater Fish"
              onSeeAll={() => router.push('/(tabs)/browse')}
              isDark={isDark}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              style={{ flexGrow: 0 }}
            >
              {saltwaterFish.map((fish) => (
                <FishCard
                  key={fish.id}
                  fish={fish}
                  onPress={() => handleFishPress(fish)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Tips Card */}
          <View className="px-5 mb-8">
            <View
              className={cn(
                'rounded-2xl p-5',
                isDark ? 'bg-slate-800' : 'bg-sky-50'
              )}
            >
              <View className="flex-row items-center mb-3">
                <Droplets
                  size={20}
                  color={isDark ? '#38BDF8' : '#0284C7'}
                />
                <Text
                  className={cn(
                    'text-base font-bold ml-2',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  Quick Tip
                </Text>
              </View>
              <Text
                className={cn(
                  'text-sm leading-5',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                Always research fish compatibility before adding new species to
                your tank. Consider factors like temperament, water parameters,
                and tank size requirements.
              </Text>
            </View>
          </View>

          <View className="h-4" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
