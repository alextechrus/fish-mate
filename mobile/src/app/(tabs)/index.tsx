// src/app/(tabs)/index.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Grid3X3, ChevronRight, Lightbulb, Droplets, Shell, Sparkles,
  ThermometerSnowflake, FlaskConical, Leaf, Heart, Zap,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { useTankStore, getTankCleanliness } from '@/lib/state/tank-store';
import { getFishById, getFreshwaterFish, getSaltwaterFish, getBeginnerFriendlyFish } from '@/lib/data/fish-database';
import { getPlantById, getEasyPlants } from '@/lib/data/plant-database';
import { Fish } from '@/lib/types/fish';
import type { Plant } from '@/lib/data/plant-database';
import { cn } from '@/lib/cn';
import { AnimatedTank } from '@/components/AnimatedTank';
import { newsItems } from '@/lib/data/articles';

const EMPTY_TANK_IMAGE_URL =
  'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=1024&q=80';
import { useFishImage, usePlantImage } from '@/lib/hooks/useImageUrl';

const SCREEN_W = Dimensions.get('window').width;
const CARD_W = SCREEN_W - 80;

// ─── Fish card ───────────────────────────────────────────────────────────────
const FishCard = ({ fish, onPress, isDark }: { fish: Fish; onPress: () => void; isDark: boolean }) => {
  const imageUrl = useFishImage(fish.id, fish.imageUrl, fish.commonName, fish.scientificName);
  const temperamentColor = { peaceful: '#10B981', 'semi-aggressive': '#F59E0B', aggressive: '#EF4444' }[fish.temperament];
  return (
    <Pressable
      onPress={onPress}
      className={cn('mr-4 w-36 rounded-2xl overflow-hidden', isDark ? 'bg-slate-800' : 'bg-white')}
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 6, elevation: 3 }}
    >
      <Image source={imageUrl} className="w-full h-24" resizeMode="cover" />
      <View className="p-3">
        <Text className={cn('text-sm font-semibold mb-1', isDark ? 'text-white' : 'text-slate-900')} numberOfLines={1}>
          {fish.commonName}
        </Text>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: temperamentColor }} />
          <Text className={cn('text-xs capitalize', isDark ? 'text-slate-400' : 'text-slate-500')}>{fish.temperament}</Text>
        </View>
      </View>
    </Pressable>
  );
};

// ─── Plant card ──────────────────────────────────────────────────────────────
const PlantCard = ({ plant, onPress, isDark }: { plant: Plant; onPress: () => void; isDark: boolean }) => {
  const imageUrl = usePlantImage(plant.id, plant.imageUrl, plant.commonName, plant.scientificName);
  const difficultyColor = { easy: '#10B981', moderate: '#F59E0B', difficult: '#EF4444' }[plant.difficulty];
  return (
    <Pressable
      onPress={onPress}
      className={cn('mr-4 w-36 rounded-2xl overflow-hidden', isDark ? 'bg-slate-800' : 'bg-white')}
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 6, elevation: 3 }}
    >
      <Image source={imageUrl} className="w-full h-24" resizeMode="cover" />
      <View className="p-3">
        <Text className={cn('text-sm font-semibold mb-1', isDark ? 'text-white' : 'text-slate-900')} numberOfLines={1}>
          {plant.commonName}
        </Text>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: difficultyColor }} />
          <Text className={cn('text-xs capitalize', isDark ? 'text-slate-400' : 'text-slate-500')}>{plant.difficulty}</Text>
        </View>
      </View>
    </Pressable>
  );
};

const aquariumTips = [
  { icon: Droplets, iconColor: '#0EA5E9', title: 'Water Changes Matter', content: 'Regular 25% weekly water changes help remove toxins and keep your fish healthy. Use a gravel vacuum to clean the substrate.' },
  { icon: ThermometerSnowflake, iconColor: '#8B5CF6', title: 'Temperature Stability', content: 'Fish are sensitive to temperature swings. Keep your heater consistent and avoid placing tanks near windows or AC vents.' },
  { icon: FlaskConical, iconColor: '#10B981', title: 'Cycle Your Tank First', content: 'New tanks need 4–6 weeks to establish beneficial bacteria. Add fish gradually and test water parameters during cycling.' },
  { icon: Leaf, iconColor: '#22C55E', title: 'Plants Improve Water Quality', content: 'Live plants absorb nitrates, provide oxygen, and give fish natural hiding spots. Start with easy plants like Java Fern or Anubias.' },
  { icon: Heart, iconColor: '#EF4444', title: "Don't Overfeed", content: 'Feed only what fish can eat in 2–3 minutes. Uneaten food decays and pollutes water. Most fish only need feeding once or twice daily.' },
  { icon: Zap, iconColor: '#F59E0B', title: 'Lighting Schedule', content: 'Keep lights on 8–10 hours daily for planted tanks. Use a timer for consistency. Too much light causes algae.' },
];

const NewsCarousel = ({ isDark }: { isDark: boolean }) => {
  const [idx, setIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const cardW = CARD_W + 12;

  useEffect(() => {
    const t = setInterval(() => {
      setIdx(prev => {
        const next = (prev + 1) % newsItems.length;
        scrollRef.current?.scrollTo({ x: next * cardW, animated: true });
        return next;
      });
    }, 6000);
    return () => clearInterval(t);
  }, [cardW]);

  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between px-5 mb-3">
        <Text className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-slate-900')}>
          Aquarium News
        </Text>
        <ChevronRight size={18} color={isDark ? '#64748B' : '#94A3B8'} />
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardW}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        style={{ flexGrow: 0 }}
        onMomentumScrollEnd={e => {
          const newIdx = Math.round(e.nativeEvent.contentOffset.x / cardW);
          setIdx(Math.max(0, Math.min(newIdx, newsItems.length - 1)));
        }}
      >
        {newsItems.map((item) => (
          <View
            key={item.id}
            style={{ width: CARD_W, marginRight: 12 }}
            className={cn('rounded-2xl overflow-hidden', isDark ? 'bg-slate-800' : 'bg-white')}
          >
            <Image source={{ uri: item.imageUrl }} style={{ width: CARD_W, height: 120 }} resizeMode="cover" />
            <View className="p-3">
              <View className="flex-row items-center mb-1">
                <View className="bg-sky-500/10 rounded px-2 py-0.5 mr-2">
                  <Text className="text-sky-500 text-xs font-semibold">{item.category}</Text>
                </View>
                <Text className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>{item.date}</Text>
              </View>
              <Text className={cn('text-sm font-semibold leading-5', isDark ? 'text-white' : 'text-slate-900')} numberOfLines={2}>
                {item.title}
              </Text>
              <Text className={cn('text-xs mt-1', isDark ? 'text-slate-500' : 'text-slate-400')}>{item.source}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
      <View className="flex-row justify-center mt-3">
        {newsItems.map((_, i) => (
          <View key={i} className={cn('w-1.5 h-1.5 rounded-full mx-1', i === idx ? 'bg-sky-500' : isDark ? 'bg-slate-600' : 'bg-slate-300')} />
        ))}
      </View>
    </View>
  );
};

const TipsCarousel = ({ isDark }: { isDark: boolean }) => {
  const [idx, setIdx] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const cardW = CARD_W + 12;

  useEffect(() => {
    const t = setInterval(() => {
      setIdx(prev => {
        const next = (prev + 1) % aquariumTips.length;
        scrollRef.current?.scrollTo({ x: next * cardW, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(t);
  }, [cardW]);

  return (
    <View className="mb-6">
      <View className="flex-row items-center px-5 mb-3">
        <Lightbulb size={18} color={isDark ? '#F59E0B' : '#D97706'} />
        <Text className={cn('text-lg font-bold ml-2', isDark ? 'text-white' : 'text-slate-900')}>Quick Tips</Text>
      </View>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={cardW}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: 20 }}
        style={{ flexGrow: 0, height: 150 }}
        onMomentumScrollEnd={e => {
          const newIdx = Math.round(e.nativeEvent.contentOffset.x / cardW);
          setIdx(Math.max(0, Math.min(newIdx, aquariumTips.length - 1)));
        }}
      >
        {aquariumTips.map((tip, i) => {
          const Icon = tip.icon;
          return (
            <View
              key={i}
              style={{ width: CARD_W, height: 150, marginRight: 12 }}
              className={cn('rounded-2xl p-4', isDark ? 'bg-slate-800' : 'bg-white')}
            >
              <View className="flex-row items-center mb-2">
                <View className="w-8 h-8 rounded-lg items-center justify-center mr-2" style={{ backgroundColor: `${tip.iconColor}20` }}>
                  <Icon size={18} color={tip.iconColor} />
                </View>
                <Text className={cn('text-sm font-bold flex-1', isDark ? 'text-white' : 'text-slate-900')}>{tip.title}</Text>
              </View>
              <Text numberOfLines={4} className={cn('text-xs leading-5', isDark ? 'text-slate-300' : 'text-slate-600')}>{tip.content}</Text>
            </View>
          );
        })}
      </ScrollView>
      <View className="flex-row justify-center mt-3">
        {aquariumTips.map((_, i) => (
          <View key={i} className={cn('w-1.5 h-1.5 rounded-full mx-1', i === idx ? 'bg-sky-500' : isDark ? 'bg-slate-600' : 'bg-slate-300')} />
        ))}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tanks = useTankStore(s => s.tanks);
  const activeTankId = useTankStore(s => s.activeTankId);
  const [viewingTankId, setViewingTankId] = useState<string | null>(activeTankId);

  // Keep in sync if activeTank changes from outside
  useEffect(() => {
    setViewingTankId(activeTankId);
  }, [activeTankId]);

  const activeTank = useMemo(() => tanks.find(t => t.id === viewingTankId), [tanks, viewingTankId]);

  const tankFish: Fish[] = useMemo(() =>
    (activeTank?.fishIds ?? []).map(id => getFishById(id)).filter((f): f is Fish => !!f),
    [activeTank?.fishIds]
  );
  const tankPlants: Plant[] = useMemo(() =>
    (activeTank?.plantIds ?? []).map(id => getPlantById(id)).filter((p): p is Plant => !!p),
    [activeTank?.plantIds]
  );

  const isEmpty = !activeTank || (tankFish.length === 0 && tankPlants.length === 0);

  const freshwaterFish = getFreshwaterFish().slice(0, 8);
  const saltwaterFish = getSaltwaterFish().slice(0, 8);
  const beginnerFish = getBeginnerFriendlyFish().slice(0, 8);
  const easyPlants = getEasyPlants().slice(0, 8);

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {/* Header */}
          <View className="px-5 pt-4 pb-5">
            <Text className={cn('text-2xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>FishMate</Text>
            <Text className={cn('text-sm mt-0.5', isDark ? 'text-slate-400' : 'text-slate-500')}>Your aquarium companion</Text>
          </View>

          {/* Tank Switcher */}
          {tanks.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}
              style={{ flexGrow: 0 }}
            >
              {tanks.map(tank => (
                <Pressable
                  key={tank.id}
                  onPress={() => setViewingTankId(tank.id)}
                  style={{
                    marginRight: 8,
                    paddingHorizontal: 14,
                    paddingVertical: 7,
                    borderRadius: 20,
                    backgroundColor: viewingTankId === tank.id
                      ? (isDark ? '#0EA5E9' : '#0EA5E9')
                      : (isDark ? '#1E293B' : '#E2E8F0'),
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{
                    color: viewingTankId === tank.id ? 'white' : isDark ? '#94A3B8' : '#64748B',
                    fontWeight: '600',
                    fontSize: 13,
                  }}>
                    {tank.name}
                  </Text>
                  <Text style={{
                    color: viewingTankId === tank.id ? 'rgba(255,255,255,0.7)' : isDark ? '#64748B' : '#94A3B8',
                    fontSize: 11,
                    marginLeft: 5,
                  }}>
                    {tank.fishIds.length} fish
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          {/* Tank Hero — AI photo if generated, default empty tank image otherwise */}
          <View className="mb-4">
            <Pressable onPress={() => router.push('/(tabs)/my-tank')} style={{ marginHorizontal: 20 }}>
              <View style={{
                width: SCREEN_W - 40, height: 210, borderRadius: 20,
                overflow: 'hidden', borderWidth: 1.5,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              }}>
                <Image
                  source={{ uri: activeTank?.generatedImageUrl ?? EMPTY_TANK_IMAGE_URL }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.7)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, justifyContent: 'flex-end', padding: 14 }}
                >
                  {activeTank ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View>
                        <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>{activeTank.name}</Text>
                        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2, textTransform: 'capitalize' }}>
                          {activeTank.waterType} · {tankFish.length} fish · {tankPlants.length} plants
                        </Text>
                      </View>
                      {activeTank && (
                        <View style={{
                          backgroundColor: getTankCleanliness(activeTank) === 'overdue' ? '#EF444490' : getTankCleanliness(activeTank) === 'due-soon' ? '#F59E0B90' : '#10B98190',
                          borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4,
                        }}>
                          <Text style={{ color: 'white', fontSize: 11, fontWeight: '700' }}>
                            {getTankCleanliness(activeTank) === 'clean' ? 'Clean' : getTankCleanliness(activeTank) === 'due-soon' ? 'Due soon' : 'Needs cleaning'}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '700', fontSize: 15 }}>
                      Tap to set up your tank
                    </Text>
                  )}
                </LinearGradient>
              </View>
            </Pressable>
          </View>

          {/* Compatibility Quick-Access */}
          <Pressable
            onPress={() => router.push('/compatibility-chart')}
            className="mx-5 mb-6 overflow-hidden rounded-2xl"
          >
            <LinearGradient
              colors={isDark ? ['#1E3A5F', '#0F2744'] : ['#0EA5E9', '#0284C7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}
            >
              <View className="bg-white/20 rounded-xl p-2.5 mr-3">
                <Grid3X3 size={22} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">Compatibility Chart</Text>
                <Text className="text-white/70 text-xs mt-0.5">Compare up to 5 fish at once</Text>
              </View>
              <ChevronRight size={20} color="rgba(255,255,255,0.6)" />
            </LinearGradient>
          </Pressable>

          {/* Freshwater Fish */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center px-5 mb-3">
              <View className="flex-row items-center">
                <Droplets size={18} color="#0EA5E9" />
                <Text className={cn('text-lg font-bold ml-2', isDark ? 'text-white' : 'text-slate-900')}>Freshwater Fish</Text>
              </View>
              <Pressable onPress={() => router.push('/(tabs)/search')} className="flex-row items-center">
                <Text className="text-sky-500 text-sm font-medium mr-1">See All</Text>
                <ChevronRight size={16} color="#0EA5E9" />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }} style={{ flexGrow: 0 }}>
              {freshwaterFish.map(fish => <FishCard key={fish.id} fish={fish} onPress={() => router.push(`/fish/${fish.id}`)} isDark={isDark} />)}
            </ScrollView>
          </View>

          {/* Saltwater Fish */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center px-5 mb-3">
              <View className="flex-row items-center">
                <Shell size={18} color="#06B6D4" />
                <Text className={cn('text-lg font-bold ml-2', isDark ? 'text-white' : 'text-slate-900')}>Saltwater Fish</Text>
              </View>
              <Pressable onPress={() => router.push('/(tabs)/search')} className="flex-row items-center">
                <Text className="text-sky-500 text-sm font-medium mr-1">See All</Text>
                <ChevronRight size={16} color="#0EA5E9" />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }} style={{ flexGrow: 0 }}>
              {saltwaterFish.map(fish => <FishCard key={fish.id} fish={fish} onPress={() => router.push(`/fish/${fish.id}`)} isDark={isDark} />)}
            </ScrollView>
          </View>

          {/* Easy Plants */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center px-5 mb-3">
              <View className="flex-row items-center">
                <Leaf size={18} color="#10B981" />
                <Text className={cn('text-lg font-bold ml-2', isDark ? 'text-white' : 'text-slate-900')}>Easy Plants</Text>
              </View>
              <Pressable onPress={() => router.push('/(tabs)/search')} className="flex-row items-center">
                <Text className="text-sky-500 text-sm font-medium mr-1">See All</Text>
                <ChevronRight size={16} color="#0EA5E9" />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }} style={{ flexGrow: 0 }}>
              {easyPlants.map(plant => <PlantCard key={plant.id} plant={plant} onPress={() => router.push(`/plant/${plant.id}`)} isDark={isDark} />)}
            </ScrollView>
          </View>

          {/* Beginner Friendly */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center px-5 mb-3">
              <View className="flex-row items-center">
                <Sparkles size={18} color="#F59E0B" />
                <Text className={cn('text-lg font-bold ml-2', isDark ? 'text-white' : 'text-slate-900')}>Beginner Friendly</Text>
              </View>
              <Pressable onPress={() => router.push('/(tabs)/search')} className="flex-row items-center">
                <Text className="text-sky-500 text-sm font-medium mr-1">See All</Text>
                <ChevronRight size={16} color="#0EA5E9" />
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }} style={{ flexGrow: 0 }}>
              {beginnerFish.map(fish => <FishCard key={fish.id} fish={fish} onPress={() => router.push(`/fish/${fish.id}`)} isDark={isDark} />)}
            </ScrollView>
          </View>

          {/* News Carousel */}
          <NewsCarousel isDark={isDark} />

          {/* Tips Carousel */}
          <TipsCarousel isDark={isDark} />

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
