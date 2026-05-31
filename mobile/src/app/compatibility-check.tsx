// src/app/compatibility-check.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Image, TextInput, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Search, X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { getFishById, fishDatabase, searchFish } from '@/lib/data/fish-database';
import { Fish, CompatibilityStatus } from '@/lib/types/fish';
import { checkTwoFishCompatibility } from '@/lib/utils/compatibility';
import { cn } from '@/lib/cn';
import { useFishImage } from '@/lib/hooks/useImageUrl';

const FishImage = ({ fish }: { fish: Fish }) => {
  const src = useFishImage(fish.id, fish.imageUrl, fish.commonName, fish.scientificName);
  return <Image source={src} style={{ width: 52, height: 52, borderRadius: 12 }} resizeMode="cover" />;
};

const STATUS_CONFIG: Record<CompatibilityStatus, { color: string; icon: typeof CheckCircle; label: string }> = {
  compatible: { color: '#10B981', icon: CheckCircle, label: 'Compatible' },
  conditional: { color: '#F59E0B', icon: AlertCircle, label: 'Caution' },
  incompatible: { color: '#EF4444', icon: AlertTriangle, label: 'Incompatible' },
};

export default function CompatibilityCheckScreen() {
  const { fishId } = useLocalSearchParams<{ fishId: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const referenceFish = useMemo(() => getFishById(fishId ?? ''), [fishId]);
  const [query, setQuery] = useState('');

  const suggestions = useMemo(() => {
    if (!referenceFish) return [];
    return fishDatabase
      .filter(f => f.id !== referenceFish.id && f.waterType === referenceFish.waterType)
      .slice(0, 8);
  }, [referenceFish]);

  const searchResults = useMemo(() => {
    if (!query.trim() || !referenceFish) return [];
    return searchFish(query).filter(f => f.id !== referenceFish.id).slice(0, 10);
  }, [query, referenceFish]);

  const displayList = query.trim() ? searchResults : suggestions;

  if (!referenceFish) {
    return (
      <View className={cn('flex-1 items-center justify-center', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
        <Text className={cn('text-base', isDark ? 'text-white' : 'text-slate-900')}>Fish not found</Text>
      </View>
    );
  }

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Fixed header — search input always above results, keyboard-safe */}
        <View
          className={cn('px-5 pt-2 pb-4', isDark ? 'bg-slate-900' : 'bg-white')}
          style={{ borderBottomWidth: 1, borderBottomColor: isDark ? '#1E293B' : '#E2E8F0' }}
        >
          <View className="flex-row items-center mb-4">
            <Pressable onPress={() => router.back()} className="mr-3" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ChevronLeft size={26} color={isDark ? '#94A3B8' : '#64748B'} />
            </Pressable>
            <FishImage fish={referenceFish} />
            <View className="ml-3 flex-1">
              <Text className={cn('text-lg font-bold', isDark ? 'text-white' : 'text-slate-900')}>Compatibility Check</Text>
              <Text className={cn('text-sm', isDark ? 'text-slate-400' : 'text-slate-500')}>{referenceFish.commonName}</Text>
            </View>
          </View>
          {/* Search input fixed at top — keyboard pushes content down, not the input */}
          <View className={cn('flex-row items-center px-4 py-3 rounded-xl', isDark ? 'bg-slate-800' : 'bg-slate-100')}>
            <Search size={18} color={isDark ? '#64748B' : '#94A3B8'} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search fish to compare..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              style={{ flex: 1, marginLeft: 10, fontSize: 15, color: isDark ? '#fff' : '#0F172A' }}
              returnKeyType="search"
              onSubmitEditing={Keyboard.dismiss}
              autoFocus={false}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')}>
                <X size={18} color={isDark ? '#64748B' : '#94A3B8'} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Scrollable results — keyboard does not overlap fixed header above */}
        <ScrollView className="flex-1 px-5 pt-4" keyboardShouldPersistTaps="handled">
          <Text className={cn('text-sm font-semibold mb-3', isDark ? 'text-slate-400' : 'text-slate-500')}>
            {query.trim() ? `${displayList.length} results` : 'Suggested fish to compare'}
          </Text>
          {displayList.map(fish => {
            const result = checkTwoFishCompatibility(referenceFish, fish);
            const cfg = STATUS_CONFIG[result.status];
            const StatusIcon = cfg.icon;
            return (
              <Pressable
                key={fish.id}
                onPress={() => router.push(`/fish/${fish.id}`)}
                className={cn('flex-row items-center p-3 rounded-xl mb-2', isDark ? 'bg-slate-800' : 'bg-white')}
              >
                <FishImage fish={fish} />
                <View className="flex-1 ml-3">
                  <Text className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-slate-900')}>{fish.commonName}</Text>
                  <Text className={cn('text-xs capitalize mt-0.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
                    {fish.temperament} · {fish.waterType}
                  </Text>
                  {result.reasons.length > 0 && (
                    <Text className="text-xs mt-1" style={{ color: cfg.color }} numberOfLines={1}>
                      {result.reasons[0]}
                    </Text>
                  )}
                </View>
                <View className="items-center ml-2">
                  <StatusIcon size={22} color={cfg.color} />
                  <Text className="text-xs font-semibold mt-0.5" style={{ color: cfg.color }}>{cfg.label}</Text>
                </View>
              </Pressable>
            );
          })}
          {displayList.length === 0 && query.trim() && (
            <Text className={cn('text-center py-8', isDark ? 'text-slate-400' : 'text-slate-500')}>No fish found</Text>
          )}
          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
