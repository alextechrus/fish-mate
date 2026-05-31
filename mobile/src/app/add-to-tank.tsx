// src/app/add-to-tank.tsx
import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, Pressable, Image, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import {
  ChevronLeft, Fish as FishIcon, Leaf, Plus, Minus,
  CheckCircle, AlertTriangle, X, ShoppingBasket, Search,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { useTankStore, ExtendedTankSetup } from '@/lib/state/tank-store';
import { getFishById, fishDatabase, searchFish } from '@/lib/data/fish-database';
import { getPlantById, plantDatabase, searchPlants } from '@/lib/data/plant-database';
import type { Plant } from '@/lib/data/plant-database';
import { checkTwoFishCompatibility } from '@/lib/utils/compatibility';
import { Fish } from '@/lib/types/fish';
import { cn } from '@/lib/cn';
import { useFishImage, usePlantImage } from '@/lib/hooks/useImageUrl';

// ─── Image components ────────────────────────────────────────────────────────
const FishImg = ({ fish }: { fish: Fish }) => {
  const src = useFishImage(fish.id, fish.imageUrl, fish.commonName, fish.scientificName);
  return <Image source={src} style={{ width: 52, height: 52, borderRadius: 10 }} resizeMode="cover" />;
};
const PlantImg = ({ plant }: { plant: Plant }) => {
  const src = usePlantImage(plant.id, plant.imageUrl, plant.commonName, plant.scientificName);
  return <Image source={src} style={{ width: 52, height: 52, borderRadius: 10 }} resizeMode="cover" />;
};

// ─── Quantity stepper ────────────────────────────────────────────────────────
const Stepper = ({
  value, onIncrement, onDecrement, isDark,
}: { value: number; onIncrement: () => void; onDecrement: () => void; isDark: boolean }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 0 }}>
    <Pressable
      onPress={onDecrement}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={{
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: value > 0 ? '#EF444420' : isDark ? '#1E293B' : '#F1F5F9',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Minus size={14} color={value > 0 ? '#EF4444' : isDark ? '#475569' : '#CBD5E1'} />
    </Pressable>
    <Text style={{
      width: 28, textAlign: 'center', fontWeight: '700', fontSize: 15,
      color: value > 0 ? (isDark ? '#fff' : '#0F172A') : isDark ? '#475569' : '#CBD5E1',
    }}>
      {value}
    </Text>
    <Pressable
      onPress={onIncrement}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      style={{
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: '#0EA5E920',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      <Plus size={14} color="#0EA5E9" />
    </Pressable>
  </View>
);

// ─── Fish row ────────────────────────────────────────────────────────────────
const FishRow = ({
  fish, qty, compatStatus, onIncrement, onDecrement, isDark,
}: {
  fish: Fish; qty: number; compatStatus: 'compatible' | 'conditional' | 'incompatible' | 'unknown';
  onIncrement: () => void; onDecrement: () => void; isDark: boolean;
}) => {
  const statusColor = { compatible: '#10B981', conditional: '#F59E0B', incompatible: '#EF4444', unknown: '#64748B' }[compatStatus];
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, marginBottom: 8,
      backgroundColor: qty > 0 ? (isDark ? '#1E3A4F' : '#EFF6FF') : (isDark ? '#1E293B' : '#fff'),
      borderWidth: qty > 0 ? 1.5 : 1,
      borderColor: qty > 0 ? '#0EA5E9' : isDark ? '#334155' : '#E2E8F0',
    }}>
      <FishImg fish={fish} />
      <View style={{ flex: 1, marginLeft: 10 }}>
        <Text style={{ fontWeight: '700', fontSize: 14, color: isDark ? '#F8FAFC' : '#0F172A' }} numberOfLines={1}>
          {fish.commonName}
        </Text>
        <Text style={{ fontSize: 11, color: isDark ? '#64748B' : '#94A3B8', marginTop: 1 }} numberOfLines={1}>
          {fish.scientificName}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor, marginRight: 4 }} />
          <Text style={{ fontSize: 11, color: statusColor, textTransform: 'capitalize' }}>
            {compatStatus === 'unknown' ? 'First fish' : compatStatus}
          </Text>
          <Text style={{ fontSize: 11, color: isDark ? '#475569' : '#94A3B8', marginLeft: 8 }}>
            £{fish.price.min}–{fish.price.max}
          </Text>
        </View>
      </View>
      <Stepper value={qty} onIncrement={onIncrement} onDecrement={onDecrement} isDark={isDark} />
    </View>
  );
};

// ─── Plant row ───────────────────────────────────────────────────────────────
const PlantRow = ({
  plant, qty, onIncrement, onDecrement, isDark,
}: {
  plant: Plant; qty: number; onIncrement: () => void; onDecrement: () => void; isDark: boolean;
}) => (
  <View style={{
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 14, marginBottom: 8,
    backgroundColor: qty > 0 ? (isDark ? '#1A3A2A' : '#F0FDF4') : (isDark ? '#1E293B' : '#fff'),
    borderWidth: qty > 0 ? 1.5 : 1,
    borderColor: qty > 0 ? '#10B981' : isDark ? '#334155' : '#E2E8F0',
  }}>
    <PlantImg plant={plant} />
    <View style={{ flex: 1, marginLeft: 10 }}>
      <Text style={{ fontWeight: '700', fontSize: 14, color: isDark ? '#F8FAFC' : '#0F172A' }} numberOfLines={1}>
        {plant.commonName}
      </Text>
      <Text style={{ fontSize: 11, color: isDark ? '#64748B' : '#94A3B8', marginTop: 1 }} numberOfLines={1}>
        {plant.scientificName}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
        <Text style={{ fontSize: 11, color: isDark ? '#475569' : '#94A3B8', textTransform: 'capitalize' }}>
          {plant.difficulty} · {plant.lighting} light · £{plant.price.min}–{plant.price.max}
        </Text>
      </View>
    </View>
    <Stepper value={qty} onIncrement={onIncrement} onDecrement={onDecrement} isDark={isDark} />
  </View>
);

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function AddToTankScreen() {
  const { tankId } = useLocalSearchParams<{ tankId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [tab, setTab] = useState<'fish' | 'plants'>('fish');
  const [query, setQuery] = useState('');
  // Quantities: fishId/plantId → count
  const [fishQty, setFishQty] = useState<Record<string, number>>({});
  const [plantQty, setPlantQty] = useState<Record<string, number>>({});

  const tanks = useTankStore(s => s.tanks);
  const addFishToTank = useTankStore(s => s.addFishToTank);
  const addPlantToTank = useTankStore(s => s.addPlantToTank);

  const tank = tanks.find(t => t.id === tankId) as ExtendedTankSetup | undefined;

  const currentFish = useMemo(() =>
    (tank?.fishIds ?? []).map(id => getFishById(id)).filter((f): f is Fish => !!f),
    [tank?.fishIds]
  );

  // Compatibility tiers
  const { compatible, conditional, incompatible } = useMemo(() => {
    const waterFiltered = fishDatabase.filter(f =>
      (!tank || f.waterType === tank.waterType) && !tank?.fishIds.includes(f.id)
    );
    if (currentFish.length === 0) {
      return { compatible: waterFiltered, conditional: [], incompatible: [] };
    }
    const compat: Fish[] = [], cond: Fish[] = [], incompat: Fish[] = [];
    for (const fish of waterFiltered) {
      let worst: 'compatible' | 'conditional' | 'incompatible' = 'compatible';
      for (const existing of currentFish) {
        const r = checkTwoFishCompatibility(fish, existing);
        if (r.status === 'incompatible') { worst = 'incompatible'; break; }
        if (r.status === 'conditional') worst = 'conditional';
      }
      (worst === 'compatible' ? compat : worst === 'conditional' ? cond : incompat).push(fish);
    }
    return { compatible: compat, conditional: cond, incompatible: incompat };
  }, [currentFish, tank]);

  const getCompatStatus = (fish: Fish): 'compatible' | 'conditional' | 'incompatible' | 'unknown' => {
    if (currentFish.length === 0) return 'unknown';
    if (compatible.find(f => f.id === fish.id)) return 'compatible';
    if (conditional.find(f => f.id === fish.id)) return 'conditional';
    return 'incompatible';
  };

  // Filtered fish/plants for search
  const allFish = [...compatible, ...conditional, ...incompatible];
  const filteredFish = useMemo(() =>
    query.trim() ? searchFish(query).filter(f => !tank?.fishIds.includes(f.id)) : allFish,
    [query, allFish, tank?.fishIds]
  );
  const availablePlants = useMemo(() =>
    plantDatabase.filter(p => !tank?.plantIds?.includes(p.id)),
    [tank?.plantIds]
  );
  const filteredPlants = useMemo(() =>
    query.trim() ? searchPlants(query).filter(p => !tank?.plantIds?.includes(p.id)) : availablePlants,
    [query, availablePlants, tank?.plantIds]
  );

  // Basket totals
  const totalFishCount = Object.values(fishQty).reduce((s, q) => s + q, 0);
  const totalPlantCount = Object.values(plantQty).reduce((s, q) => s + q, 0);
  const totalItems = totalFishCount + totalPlantCount;

  const basketFishEntries = Object.entries(fishQty).filter(([, q]) => q > 0);
  const basketPlantEntries = Object.entries(plantQty).filter(([, q]) => q > 0);

  const handleConfirm = () => {
    if (!tank) return;
    // Add each fish the specified number of times
    for (const [fishId, qty] of basketFishEntries) {
      const fish = getFishById(fishId);
      for (let i = 0; i < qty; i++) {
        addFishToTank(tank.id, fishId, fish?.commonName);
      }
    }
    // Add each plant the specified number of times
    for (const [plantId, qty] of basketPlantEntries) {
      const plant = getPlantById(plantId);
      for (let i = 0; i < qty; i++) {
        addPlantToTank(tank.id, plantId, plant?.commonName);
      }
    }
    router.back();
  };

  const incrementFish = (id: string) => setFishQty(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const decrementFish = (id: string) => setFishQty(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) - 1) }));
  const incrementPlant = (id: string) => setPlantQty(prev => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const decrementPlant = (id: string) => setPlantQty(prev => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) - 1) }));

  if (!tank) {
    return (
      <View className={cn('flex-1 items-center justify-center', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <Text className={isDark ? 'text-white' : 'text-slate-900'}>Tank not found</Text>
      </View>
    );
  }

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <LinearGradient
        colors={isDark ? ['#1E293B', '#0F172A'] : ['#0EA5E9', '#0369A1']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <SafeAreaView edges={['top']}>
          <View style={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 }}>
            {/* Top row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
              <Pressable onPress={() => router.back()} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <ChevronLeft size={22} color="white" />
              </Pressable>
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '700', flex: 1 }}>Add to {tank.name}</Text>
              {totalItems > 0 && (
                <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 4, flexDirection: 'row', alignItems: 'center' }}>
                  <ShoppingBasket size={14} color="white" />
                  <Text style={{ color: 'white', fontWeight: '700', fontSize: 13, marginLeft: 5 }}>{totalItems}</Text>
                </View>
              )}
            </View>

            {/* Tab switcher */}
            <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 4, marginBottom: 12 }}>
              <Pressable
                onPress={() => { setTab('fish'); setQuery(''); }}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 9, backgroundColor: tab === 'fish' ? 'white' : 'transparent' }}
              >
                <FishIcon size={16} color={tab === 'fish' ? '#0EA5E9' : 'white'} />
                <Text style={{ marginLeft: 6, fontWeight: '700', color: tab === 'fish' ? '#0EA5E9' : 'white', fontSize: 14 }}>
                  Fish {totalFishCount > 0 ? `(${totalFishCount})` : ''}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => { setTab('plants'); setQuery(''); }}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 9, backgroundColor: tab === 'plants' ? 'white' : 'transparent' }}
              >
                <Leaf size={16} color={tab === 'plants' ? '#10B981' : 'white'} />
                <Text style={{ marginLeft: 6, fontWeight: '700', color: tab === 'plants' ? '#10B981' : 'white', fontSize: 14 }}>
                  Plants {totalPlantCount > 0 ? `(${totalPlantCount})` : ''}
                </Text>
              </Pressable>
            </View>

            {/* Search */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 }}>
              <Search size={16} color="rgba(255,255,255,0.7)" />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={`Search ${tab}...`}
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={{ flex: 1, marginLeft: 10, color: 'white', fontSize: 14 }}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <Pressable onPress={() => setQuery('')}>
                  <X size={16} color="rgba(255,255,255,0.7)" />
                </Pressable>
              )}
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* List */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {tab === 'fish' ? (
          <>
            {/* Group by compatibility when no search */}
            {!query.trim() ? (
              <>
                {compatible.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <CheckCircle size={14} color="#10B981" />
                      <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: '700', color: isDark ? '#94A3B8' : '#64748B' }}>
                        COMPATIBLE ({compatible.length})
                      </Text>
                    </View>
                    {compatible.map(fish => (
                      <FishRow key={fish.id} fish={fish} qty={fishQty[fish.id] ?? 0} compatStatus="compatible"
                        onIncrement={() => incrementFish(fish.id)} onDecrement={() => decrementFish(fish.id)} isDark={isDark} />
                    ))}
                  </View>
                )}
                {conditional.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <AlertTriangle size={14} color="#F59E0B" />
                      <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: '700', color: isDark ? '#94A3B8' : '#64748B' }}>
                        USE CAUTION ({conditional.length})
                      </Text>
                    </View>
                    {conditional.map(fish => (
                      <FishRow key={fish.id} fish={fish} qty={fishQty[fish.id] ?? 0} compatStatus="conditional"
                        onIncrement={() => incrementFish(fish.id)} onDecrement={() => decrementFish(fish.id)} isDark={isDark} />
                    ))}
                  </View>
                )}
                {incompatible.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                      <X size={14} color="#EF4444" />
                      <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: '700', color: isDark ? '#94A3B8' : '#64748B' }}>
                        NOT RECOMMENDED ({incompatible.length})
                      </Text>
                    </View>
                    {incompatible.map(fish => (
                      <FishRow key={fish.id} fish={fish} qty={fishQty[fish.id] ?? 0} compatStatus="incompatible"
                        onIncrement={() => incrementFish(fish.id)} onDecrement={() => decrementFish(fish.id)} isDark={isDark} />
                    ))}
                  </View>
                )}
              </>
            ) : (
              // Search results
              filteredFish.map(fish => (
                <FishRow key={fish.id} fish={fish} qty={fishQty[fish.id] ?? 0} compatStatus={getCompatStatus(fish)}
                  onIncrement={() => incrementFish(fish.id)} onDecrement={() => decrementFish(fish.id)} isDark={isDark} />
              ))
            )}
          </>
        ) : (
          // Plants
          filteredPlants.map(plant => (
            <PlantRow key={plant.id} plant={plant} qty={plantQty[plant.id] ?? 0}
              onIncrement={() => incrementPlant(plant.id)} onDecrement={() => decrementPlant(plant.id)} isDark={isDark} />
          ))
        )}
        <View style={{ height: totalItems > 0 ? 180 : 40 }} />
      </ScrollView>

      {/* Basket / Confirm panel */}
      {totalItems > 0 && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: isDark ? '#0F172A' : '#fff',
          borderTopWidth: 1, borderTopColor: isDark ? '#1E293B' : '#E2E8F0',
          paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28,
        }}>
          {/* Basket summary */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12, gap: 6 }}>
            {basketFishEntries.map(([fishId, qty]) => {
              const fish = getFishById(fishId);
              if (!fish) return null;
              return (
                <View key={fishId} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#0EA5E915', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: '#0EA5E9', fontWeight: '600', fontSize: 12 }}>×{qty} {fish.commonName}</Text>
                  <Pressable onPress={() => setFishQty(prev => ({ ...prev, [fishId]: 0 }))} style={{ marginLeft: 6 }}>
                    <X size={12} color="#0EA5E9" />
                  </Pressable>
                </View>
              );
            })}
            {basketPlantEntries.map(([plantId, qty]) => {
              const plant = getPlantById(plantId);
              if (!plant) return null;
              return (
                <View key={plantId} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#10B98115', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: '#10B981', fontWeight: '600', fontSize: 12 }}>×{qty} {plant.commonName}</Text>
                  <Pressable onPress={() => setPlantQty(prev => ({ ...prev, [plantId]: 0 }))} style={{ marginLeft: 6 }}>
                    <X size={12} color="#10B981" />
                  </Pressable>
                </View>
              );
            })}
          </View>
          {/* Confirm button */}
          <Pressable
            onPress={handleConfirm}
            style={{ backgroundColor: '#0EA5E9', borderRadius: 14, paddingVertical: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
          >
            <ShoppingBasket size={18} color="white" />
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 16, marginLeft: 8 }}>
              Add {totalItems} item{totalItems !== 1 ? 's' : ''} to tank
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
