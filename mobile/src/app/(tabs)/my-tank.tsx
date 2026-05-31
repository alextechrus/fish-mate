// src/app/(tabs)/my-tank.tsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Pressable, Image, Modal,
  TextInput, TouchableWithoutFeedback, Keyboard,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Plus, Trash2, Fish as FishIcon, Leaf, AlertTriangle,
  CheckCircle, X, Star, Pencil, Droplets, RefreshCw,
  Container, Camera, Info, ChevronRight,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { useTankStore, getTankCleanliness, ExtendedTankSetup } from '@/lib/state/tank-store';
import { getFishById } from '@/lib/data/fish-database';
import { getPlantById } from '@/lib/data/plant-database';
import { WaterType, Fish } from '@/lib/types/fish';
import { cn } from '@/lib/cn';
import { generateTankImage } from '@/lib/services/image-generation';

// ─── Create Tank Modal ───────────────────────────────────────────────────────

const CreateTankModal = ({
  visible, onClose, onSubmit, isDark,
}: {
  visible: boolean; onClose: () => void;
  onSubmit: (name: string, size: number, waterType: WaterType) => void;
  isDark: boolean;
}) => {
  const [name, setName] = useState('');
  const [size, setSize] = useState('');
  const [waterType, setWaterType] = useState<WaterType>('freshwater');

  const handleSubmit = () => {
    if (name.trim() && size) {
      onSubmit(name.trim(), parseInt(size, 10), waterType);
      setName(''); setSize(''); setWaterType('freshwater');
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center', paddingBottom: 60 }}>
            <TouchableWithoutFeedback>
              <View className={cn('mx-4 rounded-3xl p-6', isDark ? 'bg-slate-800' : 'bg-white')}>
                <View className="flex-row justify-between items-center mb-5">
                  <Text className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>Create New Tank</Text>
                  <Pressable onPress={onClose}><X size={24} color={isDark ? '#94A3B8' : '#64748B'} /></Pressable>
                </View>
                <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-600')}>Tank Name</Text>
                <TextInput value={name} onChangeText={setName} placeholder="My Aquarium"
                  placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                  style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, fontSize: 16, marginBottom: 16, backgroundColor: isDark ? '#334155' : '#F1F5F9', color: isDark ? '#fff' : '#0F172A' }}
                />
                <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-600')}>Tank Size (Gallons)</Text>
                <TextInput value={size} onChangeText={setSize} placeholder="20" keyboardType="numeric"
                  placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                  style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, fontSize: 16, marginBottom: 16, backgroundColor: isDark ? '#334155' : '#F1F5F9', color: isDark ? '#fff' : '#0F172A' }}
                />
                <Text className={cn('text-sm font-semibold mb-2', isDark ? 'text-slate-300' : 'text-slate-600')}>Water Type</Text>
                <View className="flex-row mb-6">
                  {(['freshwater', 'saltwater'] as WaterType[]).map(wt => (
                    <Pressable key={wt} onPress={() => setWaterType(wt)}
                      className={cn('flex-1 py-3 rounded-xl items-center', wt === 'freshwater' ? 'mr-2' : '',
                        waterType === wt ? 'bg-sky-500' : isDark ? 'bg-slate-700' : 'bg-slate-100'
                      )}
                    >
                      <Text className={cn('font-semibold capitalize', waterType === wt ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-600')}>{wt}</Text>
                    </Pressable>
                  ))}
                </View>
                <Pressable onPress={handleSubmit} disabled={!name.trim() || !size}
                  className={cn('py-4 rounded-xl items-center', name.trim() && size ? 'bg-sky-500' : 'bg-slate-400')}
                >
                  <Text className="text-white font-bold text-base">Create Tank</Text>
                </Pressable>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ─── Rename Modal ────────────────────────────────────────────────────────────

const RenameModal = ({
  visible, onClose, onSubmit, currentName, isDark,
}: { visible: boolean; onClose: () => void; onSubmit: (n: string) => void; currentName: string; isDark: boolean }) => {
  const [name, setName] = useState(currentName);
  React.useEffect(() => { setName(currentName); }, [currentName]);
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 }}>
          <TouchableWithoutFeedback>
            <View className={cn('rounded-3xl p-6', isDark ? 'bg-slate-800' : 'bg-white')}>
              <View className="flex-row justify-between items-center mb-5">
                <Text className={cn('text-xl font-bold', isDark ? 'text-white' : 'text-slate-900')}>Rename Tank</Text>
                <Pressable onPress={onClose}><X size={24} color={isDark ? '#94A3B8' : '#64748B'} /></Pressable>
              </View>
              <TextInput value={name} onChangeText={setName} autoFocus
                placeholderTextColor={isDark ? '#94A3B8' : '#9CA3AF'}
                style={{ paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, fontSize: 16, marginBottom: 20, backgroundColor: isDark ? '#334155' : '#F1F5F9', color: isDark ? '#fff' : '#0F172A' }}
              />
              <Pressable onPress={() => { if (name.trim()) { onSubmit(name.trim()); onClose(); } }}
                disabled={!name.trim()} className={cn('py-4 rounded-xl items-center', name.trim() ? 'bg-sky-500' : 'bg-slate-400')}
              >
                <Text className="text-white font-bold">Save</Text>
              </Pressable>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

// ─── Cleanliness constants ────────────────────────────────────────────────────

const CLEAN_COLORS = { clean: '#10B981', 'due-soon': '#F59E0B', overdue: '#EF4444' } as const;
const CLEAN_LABELS = { clean: 'Clean', 'due-soon': 'Due soon', overdue: 'Needs cleaning!' } as const;

// ─── Tank Card ───────────────────────────────────────────────────────────────

const TankCard = ({
  tank, isActive, isFavorite, onSetActive, onDelete, onAddFish, onAddPlants,
  onRename, onToggleFavorite, onMarkCleaned, onRegenerateImage, onViewDetails, isDark,
}: {
  tank: ExtendedTankSetup;
  isActive: boolean;
  isFavorite: boolean;
  onSetActive: () => void;
  onDelete: () => void;
  onAddFish: () => void;
  onAddPlants: () => void;
  onRename: () => void;
  onToggleFavorite: () => void;
  onMarkCleaned: () => void;
  onRegenerateImage: () => void;
  onViewDetails: () => void;
  isDark: boolean;
}) => {
  const cleanliness = getTankCleanliness(tank);
  const cleanColor = CLEAN_COLORS[cleanliness];
  const cleanLabel = CLEAN_LABELS[cleanliness];

  const imageUri = cleanliness === 'overdue'
    ? (tank.generatedImageDirtyUrl ?? tank.generatedImageUrl)
    : tank.generatedImageUrl;

  return (
    <View
      className={cn('mb-4 rounded-2xl overflow-hidden', isDark ? 'bg-slate-800' : 'bg-white',
        isActive ? 'border-2 border-sky-500' : ''
      )}
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.1, shadowRadius: 8, elevation: 4 }}
    >
      {/* AI image or gradient placeholder */}
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ width: '100%', height: 180 }} resizeMode="cover" />
      ) : (
        <LinearGradient
          colors={tank.waterType === 'saltwater' ? ['#0A3D62', '#0C6E8A'] : ['#0A3D5C', '#0B5270']}
          style={{ height: 180, alignItems: 'center', justifyContent: 'center' }}
        >
          <FishIcon size={48} color="rgba(255,255,255,0.3)" />
          <Pressable onPress={onRegenerateImage} className="mt-3 bg-white/20 px-4 py-2 rounded-full flex-row items-center">
            <Camera size={14} color="white" />
            <Text className="text-white text-xs font-semibold ml-2">Generate Image</Text>
          </Pressable>
        </LinearGradient>
      )}

      {/* Overlay badges */}
      <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 6 }}>
        {isActive && (
          <View className="bg-sky-500 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-bold">Main Tank</Text>
          </View>
        )}
        {isFavorite && (
          <View className="bg-amber-500 rounded-full px-3 py-1">
            <Text className="text-white text-xs font-bold">Favourite</Text>
          </View>
        )}
      </View>

      {/* Regenerate button overlay */}
      {imageUri && (
        <Pressable
          onPress={onRegenerateImage}
          style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <RefreshCw size={16} color="white" />
        </Pressable>
      )}

      {/* Card body */}
      <View className="p-4">
        {/* Title row */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <Text className={cn('text-lg font-bold mr-2', isDark ? 'text-white' : 'text-slate-900')} numberOfLines={1}>
              {tank.name}
            </Text>
            <View style={{ backgroundColor: `${cleanColor}20`, borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ color: cleanColor, fontSize: 10, fontWeight: '700' }}>{cleanLabel}</Text>
            </View>
          </View>
          <View className="flex-row">
            <Pressable onPress={onRename} className="p-2" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Pencil size={16} color={isDark ? '#64748B' : '#94A3B8'} />
            </Pressable>
            <Pressable onPress={onToggleFavorite} className="p-2" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Star size={16} color={isFavorite ? '#F59E0B' : isDark ? '#64748B' : '#94A3B8'} fill={isFavorite ? '#F59E0B' : 'transparent'} />
            </Pressable>
            <Pressable onPress={onDelete} className="p-2" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Trash2 size={16} color="#EF4444" />
            </Pressable>
          </View>
        </View>

        {/* Stats row */}
        <View className="flex-row items-center mb-3">
          <Droplets size={14} color={tank.waterType === 'saltwater' ? '#06B6D4' : '#3B82F6'} />
          <Text className={cn('text-sm ml-1 capitalize', isDark ? 'text-slate-400' : 'text-slate-500')}>
            {tank.waterType} · {tank.size}gal · {tank.fishIds.length} fish · {(tank.plantIds ?? []).length} plants
          </Text>
        </View>

        {/* Cleanliness banners */}
        {cleanliness === 'overdue' && (
          <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-3 flex-row items-center">
            <AlertTriangle size={16} color="#EF4444" />
            <Text className="text-red-500 text-sm font-semibold ml-2 flex-1">Tank needs cleaning!</Text>
            <Pressable onPress={onMarkCleaned} className="bg-red-500 px-3 py-1.5 rounded-lg">
              <Text className="text-white text-xs font-bold">Mark Cleaned</Text>
            </Pressable>
          </View>
        )}
        {cleanliness === 'due-soon' && (
          <View className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-3 flex-row items-center">
            <AlertTriangle size={16} color="#F59E0B" />
            <Text className="text-amber-500 text-sm font-semibold ml-2 flex-1">Cleaning due soon</Text>
            <Pressable onPress={onMarkCleaned} className="bg-amber-500 px-3 py-1.5 rounded-lg">
              <Text className="text-white text-xs font-bold">Mark Cleaned</Text>
            </Pressable>
          </View>
        )}
        {cleanliness === 'clean' && tank.lastCleanedAt && (
          <View className="bg-emerald-500/10 rounded-xl p-3 mb-3 flex-row items-center">
            <CheckCircle size={16} color="#10B981" />
            <Text className="text-emerald-500 text-sm ml-2">Tank is clean</Text>
          </View>
        )}

        {/* Action buttons */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={onSetActive}
            className={cn('flex-1 py-2.5 rounded-xl items-center', isActive ? 'bg-sky-500/20' : isDark ? 'bg-slate-700' : 'bg-slate-100')}
          >
            <Text className={cn('text-sm font-semibold', isActive ? 'text-sky-500' : isDark ? 'text-slate-300' : 'text-slate-600')}>
              {isActive ? 'Main Tank' : 'Set as Main'}
            </Text>
          </Pressable>
          <Pressable onPress={onAddFish} className={cn('flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-1', isDark ? 'bg-slate-700' : 'bg-slate-100')}>
            <FishIcon size={14} color="#0EA5E9" />
            <Text className={cn('text-sm font-semibold', isDark ? 'text-slate-300' : 'text-slate-600')}>Fish</Text>
          </Pressable>
          <Pressable onPress={onAddPlants} className={cn('flex-1 py-2.5 rounded-xl items-center flex-row justify-center gap-1', isDark ? 'bg-slate-700' : 'bg-slate-100')}>
            <Leaf size={14} color="#10B981" />
            <Text className={cn('text-sm font-semibold', isDark ? 'text-slate-300' : 'text-slate-600')}>Plants</Text>
          </Pressable>
        </View>
        <Pressable
          onPress={onViewDetails}
          className={cn('mt-2 py-2.5 rounded-xl items-center flex-row justify-center gap-2', isDark ? 'bg-slate-700/50' : 'bg-slate-100')}
        >
          <Info size={15} color={isDark ? '#94A3B8' : '#64748B'} />
          <Text className={cn('text-sm font-semibold', isDark ? 'text-slate-300' : 'text-slate-600')}>
            View Details & Alerts
          </Text>
          <ChevronRight size={15} color={isDark ? '#64748B' : '#94A3B8'} />
        </Pressable>
      </View>
    </View>
  );
};

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function MyTankScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const tanks = useTankStore(s => s.tanks);
  const activeTankId = useTankStore(s => s.activeTankId);
  const favoriteTankId = useTankStore(s => s.favoriteTankId);
  const addTank = useTankStore(s => s.addTank);
  const removeTank = useTankStore(s => s.removeTank);
  const renameTank = useTankStore(s => s.renameTank);
  const setActiveTank = useTankStore(s => s.setActiveTank);
  const setFavoriteTank = useTankStore(s => s.setFavoriteTank);
  const getSortedTanks = useTankStore(s => s.getSortedTanks);
  const confirmCleaned = useTankStore(s => s.confirmCleaned);
  const updateTankImage = useTankStore(s => s.updateTankImage);

  const [showCreate, setShowCreate] = useState(false);
  const [renamingTankId, setRenamingTankId] = useState<string | null>(null);
  const [deletingTankId, setDeletingTankId] = useState<string | null>(null);
  const deletingTank = tanks.find(t => t.id === deletingTankId);
  const [generatingImageFor, setGeneratingImageFor] = useState<string | null>(null);

  const sortedTanks = getSortedTanks();
  const renamingTank = tanks.find(t => t.id === renamingTankId);

  const handleRegenerateImage = useCallback(async (tank: ExtendedTankSetup) => {
    if (generatingImageFor === tank.id) return;
    setGeneratingImageFor(tank.id);
    const fishObjs = tank.fishIds.map(id => getFishById(id)).filter(Boolean);
    const plantObjs = (tank.plantIds ?? []).map(id => getPlantById(id)).filter(Boolean);
    const fishNames = fishObjs.map(f => f!.commonName);
    const plantNames = plantObjs.map(p => p!.commonName);
    const cleanliness = getTankCleanliness(tank);
    const isDirty = cleanliness === 'overdue';
    const url = await generateTankImage(fishNames, plantNames, tank.waterType, isDirty);
    if (url) updateTankImage(tank.id, url, isDirty);
    setGeneratingImageFor(null);
  }, [generatingImageFor, updateTankImage]);

  // Auto-generate images for tanks that have fish but no image
  const autoGenerateRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    sortedTanks.forEach(tank => {
      if (tank.fishIds.length === 0) return;
      const key = `${tank.id}:${tank.fishIds.length}`;
      if (!autoGenerateRef.current.has(key)) {
        autoGenerateRef.current.add(key);
        handleRegenerateImage(tank);
      }
    });
  }, [sortedTanks.map(t => `${t.id}:${t.fishIds.length}`).join(',')]);

  const handleMarkCleaned = useCallback((tank: ExtendedTankSetup) => {
    confirmCleaned(tank.id);
    handleRegenerateImage({ ...tank, lastCleanedAt: new Date().toISOString() });
  }, [confirmCleaned, handleRegenerateImage]);

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <SafeAreaView edges={['top']} className="flex-1">
        {/* Header */}
        <LinearGradient
          colors={isDark ? ['#1E293B', '#0F172A'] : ['#10B981', '#059669']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Container size={24} color="white" />
              <Text className="text-white text-2xl font-bold ml-2">My Tank</Text>
            </View>
            <Pressable onPress={() => setShowCreate(true)} className="bg-white/20 rounded-full p-2">
              <Plus size={24} color="white" />
            </Pressable>
          </View>
          <Text className="text-white/70 text-sm mt-1">{tanks.length} tank{tanks.length !== 1 ? 's' : ''}</Text>
        </LinearGradient>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
          {tanks.length === 0 ? (
            <View className="items-center justify-center pt-20">
              <View className={cn('w-24 h-24 rounded-full items-center justify-center mb-6', isDark ? 'bg-slate-800' : 'bg-slate-100')}>
                <FishIcon size={40} color={isDark ? '#64748B' : '#94A3B8'} />
              </View>
              <Text className={cn('text-xl font-bold text-center mb-2', isDark ? 'text-white' : 'text-slate-900')}>No Tanks Yet</Text>
              <Text className={cn('text-center text-sm mb-6', isDark ? 'text-slate-400' : 'text-slate-500')}>
                Create your first tank to track your fish and check compatibility.
              </Text>
              <Pressable onPress={() => setShowCreate(true)} className="bg-sky-500 px-6 py-3 rounded-xl">
                <Text className="text-white font-bold">Create Tank</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {sortedTanks.map(tank => (
                <View key={tank.id}>
                  <TankCard
                    tank={tank}
                    isActive={tank.id === activeTankId}
                    isFavorite={tank.id === favoriteTankId}
                    isDark={isDark}
                    onSetActive={() => setActiveTank(tank.id === activeTankId ? null : tank.id)}
                    onDelete={() => setDeletingTankId(tank.id)}
                    onAddFish={() => router.push(`/add-to-tank?tankId=${tank.id}&mode=fish`)}
                    onAddPlants={() => router.push(`/add-to-tank?tankId=${tank.id}&mode=plants`)}
                    onRename={() => setRenamingTankId(tank.id)}
                    onToggleFavorite={() => setFavoriteTank(tank.id === favoriteTankId ? null : tank.id)}
                    onMarkCleaned={() => handleMarkCleaned(tank)}
                    onRegenerateImage={() => handleRegenerateImage(tank)}
                    onViewDetails={() => router.push(`/tank/${tank.id}`)}
                  />
                  {generatingImageFor === tank.id && (
                    <View className="items-center -mt-2 mb-4">
                      <ActivityIndicator size="small" color="#0EA5E9" />
                      <Text className={cn('text-xs mt-1', isDark ? 'text-slate-400' : 'text-slate-500')}>Generating tank image…</Text>
                    </View>
                  )}
                </View>
              ))}
            </>
          )}
          <View className="h-20" />
        </ScrollView>

        {/* FAB — only shown when tanks exist */}
        {tanks.length > 0 && (
          <Pressable
            onPress={() => setShowCreate(true)}
            style={{
              position: 'absolute', bottom: 24, right: 24,
              width: 56, height: 56, borderRadius: 28,
              backgroundColor: '#0EA5E9',
              alignItems: 'center', justifyContent: 'center',
              shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4, shadowRadius: 8, elevation: 8,
            }}
          >
            <Plus size={28} color="white" />
          </Pressable>
        )}

        <CreateTankModal
          visible={showCreate}
          onClose={() => setShowCreate(false)}
          onSubmit={(name, size, wt) => addTank(name, size, wt)}
          isDark={isDark}
        />
        <RenameModal
          visible={!!renamingTankId}
          onClose={() => setRenamingTankId(null)}
          onSubmit={(n) => { if (renamingTankId) renameTank(renamingTankId, n); }}
          currentName={renamingTank?.name ?? ''}
          isDark={isDark}
        />
        <Modal
          visible={!!deletingTankId}
          transparent
          animationType="fade"
          onRequestClose={() => setDeletingTankId(null)}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className={cn('w-full max-w-sm rounded-2xl p-6', isDark ? 'bg-slate-800' : 'bg-white')}>
              <View className="items-center mb-4">
                <View className="w-16 h-16 rounded-full bg-red-500/20 items-center justify-center mb-4">
                  <Trash2 size={32} color="#EF4444" />
                </View>
                <Text className={cn('text-xl font-bold text-center', isDark ? 'text-white' : 'text-slate-900')}>
                  Delete Tank?
                </Text>
              </View>
              <Text className={cn('text-center mb-6', isDark ? 'text-slate-400' : 'text-slate-600')}>
                Are you sure you want to delete "{deletingTank?.name}"? This action cannot be undone.
              </Text>
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setDeletingTankId(null)}
                  className={cn('flex-1 py-3 rounded-xl items-center', isDark ? 'bg-slate-700' : 'bg-slate-100')}
                >
                  <Text className={cn('font-semibold', isDark ? 'text-white' : 'text-slate-900')}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (deletingTankId) {
                      removeTank(deletingTankId);
                      setDeletingTankId(null);
                    }
                  }}
                  className="flex-1 py-3 rounded-xl items-center bg-red-500"
                >
                  <Text className="font-semibold text-white">Delete</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}
