import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Fish as FishIcon, Droplets, Sparkles, ChevronRight, Waves, Leaf, Search, Lightbulb, ThermometerSnowflake, FlaskConical, Heart, Zap } from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { fishDatabase, getBeginnerFriendlyFish, getFreshwaterFish, getSaltwaterFish } from '@/lib/data/fish-database';
import { plantDatabase, getEasyPlants } from '@/lib/data/plant-database';
import { Fish } from '@/lib/types/fish';
import { cn } from '@/lib/cn';
import type { Plant } from '@/lib/data/plant-database';
import { useFishImage, usePlantImage } from '@/lib/hooks/useImageUrl';

// Tips data for the rotating carousel
const aquariumTips = [
  {
    icon: Droplets,
    iconColor: '#0EA5E9',
    title: 'Water Changes Matter',
    content: 'Regular 25% weekly water changes help remove toxins and keep your fish healthy. Use a gravel vacuum to clean the substrate while changing water.',
  },
  {
    icon: ThermometerSnowflake,
    iconColor: '#8B5CF6',
    title: 'Temperature Stability',
    content: 'Fish are sensitive to temperature swings. Keep your heater consistent and avoid placing tanks near windows or AC vents.',
  },
  {
    icon: FlaskConical,
    iconColor: '#10B981',
    title: 'Cycle Your Tank First',
    content: 'New tanks need 4-6 weeks to establish beneficial bacteria. Add fish gradually and test water parameters regularly during cycling.',
  },
  {
    icon: Leaf,
    iconColor: '#22C55E',
    title: 'Plants Improve Water Quality',
    content: 'Live plants absorb nitrates, provide oxygen, and give fish natural hiding spots. Start with easy plants like Java Fern or Anubias!',
  },
  {
    icon: Heart,
    iconColor: '#EF4444',
    title: 'Don\'t Overfeed',
    content: 'Feed only what fish can eat in 2-3 minutes. Uneaten food decays and pollutes water. Most fish only need feeding once or twice daily.',
  },
  {
    icon: Zap,
    iconColor: '#F59E0B',
    title: 'Lighting Schedule',
    content: 'Keep lights on 8-10 hours daily for planted tanks. Use a timer for consistency. Too much light causes algae, too little harms plants.',
  },
];

const FishCard = ({ fish, onPress }: { fish: Fish; onPress: () => void }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const imageUrl = useFishImage(fish.id, fish.imageUrl, fish.commonName, fish.scientificName);

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
        source={{ uri: imageUrl }}
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

const PlantCard = ({ plant, onPress }: { plant: Plant; onPress: () => void }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const imageUrl = usePlantImage(plant.id, plant.imageUrl, plant.commonName, plant.scientificName);

  const difficultyColor = {
    easy: '#10B981',
    moderate: '#F59E0B',
    difficult: '#EF4444',
  }[plant.difficulty];

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
        source={{ uri: imageUrl }}
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
          {plant.commonName}
        </Text>
        <View className="flex-row items-center">
          <View
            className="w-2 h-2 rounded-full mr-1.5"
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
  icon: Icon,
  iconColor,
  onSeeAll,
  isDark,
}: {
  title: string;
  icon?: React.ElementType;
  iconColor?: string;
  onSeeAll?: () => void;
  isDark: boolean;
}) => (
  <View className="flex-row justify-between items-center px-5 mb-3">
    <View className="flex-row items-center">
      {Icon && <Icon size={18} color={iconColor || (isDark ? '#94A3B8' : '#64748B')} />}
      <Text
        className={cn(
          'text-lg font-bold',
          isDark ? 'text-white' : 'text-slate-900',
          Icon ? 'ml-2' : ''
        )}
      >
        {title}
      </Text>
    </View>
    {onSeeAll && (
      <Pressable onPress={onSeeAll} className="flex-row items-center">
        <Text className="text-sky-500 text-sm font-medium mr-1">See All</Text>
        <ChevronRight size={16} color="#0EA5E9" />
      </Pressable>
    )}
  </View>
);

// Tips Carousel Component with auto-rotation
const TipsCarousel = ({ isDark }: { isDark: boolean }) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const cardWidth = Dimensions.get('window').width - 80; // Card width with space for peek
  const cardSpacing = 12; // Gap between cards
  const scrollOffset = cardWidth + cardSpacing; // Total scroll per card

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => {
        const nextIndex = (prev + 1) % aquariumTips.length;
        scrollRef.current?.scrollTo({
          x: nextIndex * scrollOffset,
          animated: true,
        });
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [scrollOffset]);

  const handleScroll = (event: { nativeEvent: { contentOffset: { x: number } } }) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / scrollOffset);
    if (index !== currentTipIndex && index >= 0 && index < aquariumTips.length) {
      setCurrentTipIndex(index);
    }
  };

  return (
    <View className="mb-6">
      <View className="flex-row items-center mb-3 px-5">
        <Lightbulb size={18} color={isDark ? '#F59E0B' : '#D97706'} />
        <Text
          className={cn(
            'text-lg font-bold ml-2',
            isDark ? 'text-white' : 'text-slate-900'
          )}
        >
          Quick Tips
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        snapToInterval={scrollOffset}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        style={{ flexGrow: 0 }}
      >
        {aquariumTips.map((tip, index) => {
          const TipIcon = tip.icon;
          return (
            <View
              key={index}
              style={{
                width: cardWidth,
                marginRight: index < aquariumTips.length - 1 ? cardSpacing : 0,
              }}
              className={cn(
                'rounded-2xl p-5',
                isDark ? 'bg-slate-800' : 'bg-white'
              )}
            >
              <View className="flex-row items-center mb-3">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                  style={{ backgroundColor: `${tip.iconColor}20` }}
                >
                  <TipIcon size={18} color={tip.iconColor} />
                </View>
                <Text
                  className={cn(
                    'text-base font-bold flex-1',
                    isDark ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {tip.title}
                </Text>
              </View>
              <Text
                className={cn(
                  'text-sm leading-5',
                  isDark ? 'text-slate-300' : 'text-slate-600'
                )}
              >
                {tip.content}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      {/* Pagination dots */}
      <View className="flex-row justify-center mt-4">
        {aquariumTips.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => {
              setCurrentTipIndex(index);
              scrollRef.current?.scrollTo({
                x: index * scrollOffset,
                animated: true,
              });
            }}
          >
            <View
              className={cn(
                'w-2 h-2 rounded-full mx-1',
                index === currentTipIndex
                  ? 'bg-sky-500'
                  : isDark
                  ? 'bg-slate-600'
                  : 'bg-slate-300'
              )}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const beginnerFish = getBeginnerFriendlyFish().slice(0, 6);
  const freshwaterFish = getFreshwaterFish().slice(0, 6);
  const saltwaterFish = getSaltwaterFish().slice(0, 6);
  const easyPlants = getEasyPlants().slice(0, 6);

  const handleFishPress = (fish: Fish) => {
    router.push(`/fish/${fish.id}`);
  };

  const handlePlantPress = (plant: Plant) => {
    router.push(`/plant/${plant.id}`);
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
              Find compatible fish and plants for your aquarium. Plan your
              perfect underwater ecosystem.
            </Text>
          </LinearGradient>

          {/* Quick Actions */}
          <View className="px-5 -mt-6 mb-6">
            <View className="flex-row gap-3">
              <QuickActionCard
                icon={Search}
                title="Browse & Search"
                subtitle="Fish & plants"
                colors={['#8B5CF6', '#6366F1']}
                onPress={() => router.push('/(tabs)/search')}
              />
              <QuickActionCard
                icon={Waves}
                title="My Tank"
                subtitle="Manage your tank"
                colors={['#10B981', '#059669']}
                onPress={() => router.push('/(tabs)/my-tank')}
              />
            </View>
          </View>

          {/* Easy Plants */}
          <View className="mb-6">
            <SectionHeader
              title="Easy Plants"
              icon={Leaf}
              iconColor="#10B981"
              onSeeAll={() => router.push('/(tabs)/search')}
              isDark={isDark}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              style={{ flexGrow: 0 }}
            >
              {easyPlants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  onPress={() => handlePlantPress(plant)}
                />
              ))}
            </ScrollView>
          </View>

          {/* Beginner Friendly */}
          <View className="mb-6">
            <SectionHeader
              title="Beginner Friendly"
              onSeeAll={() => router.push('/(tabs)/search')}
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
              onSeeAll={() => router.push('/(tabs)/search')}
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
              onSeeAll={() => router.push('/(tabs)/search')}
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

          {/* Tips Carousel */}
          <TipsCarousel isDark={isDark} />

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
