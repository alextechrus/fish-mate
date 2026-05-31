// src/components/AnimatedTank.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Dimensions, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Fish as FishIcon } from 'lucide-react-native';
import type { Fish } from '@/lib/types/fish';
import type { Plant } from '@/lib/data/plant-database';

const SCREEN_W = Dimensions.get('window').width;
const TANK_W = SCREEN_W - 40;
const TANK_H = 190;

const FISH_PALETTE = [
  '#FF6B35', '#4FC3F7', '#FFD700', '#81C784',
  '#FF8A80', '#CE93D8', '#80DEEA', '#FFCC02',
  '#F48FB1', '#A5D6A7',
];

const PLANT_GREENS = ['#2E7D32', '#388E3C', '#43A047', '#1B5E20', '#33691E'];

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

const ZONE_Y: Record<string, number> = { top: 0.15, middle: 0.42, bottom: 0.68, all: 0.35 };

interface SwimmingFishProps {
  fish: Fish;
  tankWidth: number;
  tankHeight: number;
  index: number;
}

const SwimmingFish: React.FC<SwimmingFishProps> = ({ fish, tankWidth, tankHeight, index }) => {
  const h = hashId(fish.id);
  const color = FISH_PALETTE[h % FISH_PALETTE.length];
  const yRatio = ZONE_Y[fish.tankZone ?? 'middle'] ?? 0.42;
  const yPx = yRatio * (tankHeight - 30);
  const speedMs = 4500 + (h % 5) * 800;
  const fishW = 28 + (h % 4) * 4;
  const fishH = Math.round(fishW * 0.45);
  const startDelay = (index * 900) % speedMs;

  const xAnim = useRef(new Animated.Value(-fishW - 10)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    let mounted = true;

    const swim = () => {
      if (!mounted) return;
      xAnim.setValue(-fishW - 10);
      animation = Animated.timing(xAnim, {
        toValue: tankWidth + fishW + 10,
        duration: speedMs,
        easing: Easing.linear,
        useNativeDriver: true,
      });
      animation.start(({ finished }) => { if (finished && mounted) swim(); });
    };

    const timer = setTimeout(swim, startDelay);
    return () => {
      mounted = false;
      clearTimeout(timer);
      animation?.stop();
    };
  }, [tankWidth]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, { toValue: -3, duration: 900 + index * 100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(bobAnim, { toValue: 3, duration: 900 + index * 100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: yPx,
        left: 0,
        transform: [{ translateX: xAnim }, { translateY: bobAnim }],
      }}
    >
      <View style={{ width: fishW, height: fishH, borderRadius: fishH / 2, backgroundColor: color, opacity: 0.92 }} />
      <View style={{
        position: 'absolute',
        left: -fishH * 0.55,
        top: fishH * 0.15,
        width: 0, height: 0,
        borderTopWidth: fishH * 0.35,
        borderBottomWidth: fishH * 0.35,
        borderRightWidth: fishH * 0.55,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        borderRightColor: color,
        opacity: 0.7,
      }} />
    </Animated.View>
  );
};

interface SwayingPlantProps {
  plant: Plant;
  xPx: number;
  index: number;
}

const SwayingPlant: React.FC<SwayingPlantProps> = ({ plant, xPx, index }) => {
  const h = hashId(plant.id);
  const color = PLANT_GREENS[h % PLANT_GREENS.length];
  const heightPx = 30 + (h % 5) * 10;
  const width = 6 + (h % 3) * 2;
  const rotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const dur = 2200 + index * 300;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(rotAnim, { toValue: -8, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(rotAnim, { toValue: 8, duration: dur, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const rotate = rotAnim.interpolate({ inputRange: [-8, 8], outputRange: ['-8deg', '8deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 4,
        left: xPx,
        transform: [{ rotate }],
      }}
    >
      <View style={{ width, height: heightPx, backgroundColor: color, borderTopLeftRadius: width / 2, borderTopRightRadius: width / 2 }} />
    </Animated.View>
  );
};

interface AnimatedTankProps {
  fish: Fish[];
  plants: Plant[];
  waterType: 'freshwater' | 'saltwater';
  tankName?: string;
  isEmpty?: boolean;
  onPress?: () => void;
  onCreateTank?: () => void;
  isDark: boolean;
}

export const AnimatedTank: React.FC<AnimatedTankProps> = ({
  fish,
  plants,
  waterType,
  tankName,
  isEmpty,
  onPress,
  onCreateTank,
  isDark,
}) => {
  const waterColors: [string, string, string] = waterType === 'saltwater'
    ? ['#0A4D68', '#0C6E8A', '#0A3D62']
    : ['#0A3D5C', '#0B5270', '#083548'];

  const plantPositions = plants.slice(0, 8).map((p, i) => {
    const h = hashId(p.id);
    const base = (i / Math.max(plants.length, 1)) * (TANK_W - 40);
    return base + (h % 20) - 10;
  });

  return (
    <Pressable onPress={onPress} style={{ marginHorizontal: 20 }}>
      <View style={{
        width: TANK_W,
        height: TANK_H,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 2,
        borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
      }}>
        <LinearGradient
          colors={waterColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        >
          {isEmpty ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 40, padding: 16, marginBottom: 12 }}>
                <FishIcon size={36} color="rgba(255,255,255,0.5)" />
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '600', marginBottom: 4 }}>
                Your tank is empty
              </Text>
              <Pressable
                onPress={onCreateTank}
                style={{ backgroundColor: 'rgba(14,165,233,0.8)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginTop: 4 }}
              >
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 13 }}>Set Up Tank</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ flex: 1, position: 'relative' }}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, backgroundColor: 'rgba(255,255,255,0.15)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' }} />
              <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 14, backgroundColor: 'rgba(101,63,20,0.5)', borderTopWidth: 1, borderTopColor: 'rgba(101,63,20,0.3)' }} />
              {plants.slice(0, 8).map((plant, i) => (
                <SwayingPlant key={plant.id} plant={plant} xPx={plantPositions[i]} tankHeight={TANK_H} index={i} />
              ))}
              {fish.slice(0, 6).map((f, i) => (
                <SwimmingFish key={f.id} fish={f} tankWidth={TANK_W} tankHeight={TANK_H} index={i} />
              ))}
            </View>
          )}
        </LinearGradient>
        <View style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, backgroundColor: 'rgba(255,255,255,0.08)' }} />
      </View>

      {!isEmpty && tankName && (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 4 }}>
          <Text style={{ color: isDark ? '#E2E8F0' : '#1E293B', fontWeight: '700', fontSize: 16, flex: 1 }}>{tankName}</Text>
          <View style={{ backgroundColor: waterType === 'saltwater' ? '#0891B220' : '#0EA5E920', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: waterType === 'saltwater' ? '#06B6D4' : '#0EA5E9', fontSize: 11, fontWeight: '600', textTransform: 'capitalize' }}>{waterType}</Text>
          </View>
        </View>
      )}
      {!isEmpty && (
        <View style={{ flexDirection: 'row', marginTop: 4, paddingHorizontal: 4 }}>
          <Text style={{ color: isDark ? '#94A3B8' : '#64748B', fontSize: 12 }}>
            {fish.length} fish · {plants.length} plants
          </Text>
        </View>
      )}
    </Pressable>
  );
};
