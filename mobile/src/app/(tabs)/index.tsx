// src/app/(tabs)/index.tsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Grid3X3, ChevronRight, Lightbulb, Droplets,
  ThermometerSnowflake, FlaskConical, Leaf, Heart, Zap,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { useTankStore } from '@/lib/state/tank-store';
import { getFishById } from '@/lib/data/fish-database';
import { getPlantById } from '@/lib/data/plant-database';
import { Fish } from '@/lib/types/fish';
import type { Plant } from '@/lib/data/plant-database';
import { cn } from '@/lib/cn';
import { AnimatedTank } from '@/components/AnimatedTank';
import { newsItems } from '@/lib/data/articles';

const SCREEN_W = Dimensions.get('window').width;
const CARD_W = SCREEN_W - 80;

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

          {/* Animated Tank Hero */}
          <View className="mb-4">
            <AnimatedTank
              fish={tankFish}
              plants={tankPlants}
              waterType={activeTank?.waterType ?? 'freshwater'}
              tankName={activeTank?.name}
              isEmpty={isEmpty}
              onPress={() => router.push('/(tabs)/my-tank')}
              onCreateTank={() => router.push('/(tabs)/my-tank')}
              isDark={isDark}
            />
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
