// src/app/(tabs)/explore.tsx
import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Image, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bookmark, BookmarkCheck, Heart, ChevronDown, ChevronUp,
  Compass, Newspaper, HelpCircle, BookOpen, Globe, Lock,
  X, RefreshCw, Fish as FishIconDetail, Clock,
} from 'lucide-react-native';
import { useColorScheme } from '@/lib/useColorScheme';
import { useExploreStore } from '@/lib/state/explore-store';
import { useTankStore } from '@/lib/state/tank-store';
import { communityTanks, CommunityTank, TankTag } from '@/lib/data/community-tanks';
import { articles, faqs } from '@/lib/data/articles';
import { cn } from '@/lib/cn';
import { generateTankImage } from '@/lib/services/image-generation';

const TAG_COLORS: Record<TankTag, string> = {
  freshwater: '#0EA5E9',
  saltwater: '#06B6D4',
  planted: '#10B981',
  reef: '#F59E0B',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'Care Tips': Heart,
  'Tank Builds': Compass,
  'Species Spotlight': Globe,
  'Equipment': BookOpen,
};

const ALL_FILTERS: Array<TankTag | 'all'> = ['all', 'freshwater', 'saltwater', 'planted', 'reef'];

const CommunityTankCard = ({
  tank, isDark, onPress, generatedImageUrl, isGenerating, onGenerateImage,
}: {
  tank: CommunityTank;
  isDark: boolean;
  onPress: () => void;
  generatedImageUrl?: string;
  isGenerating: boolean;
  onGenerateImage: () => void;
}) => {
  const toggleSaved = useExploreStore(s => s.toggleSaved);
  const isSaved = useExploreStore(s => s.isSaved(tank.id));

  return (
    <View
      className={cn('mx-5 mb-4 rounded-2xl overflow-hidden', isDark ? 'bg-slate-800' : 'bg-white')}
      style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.08, shadowRadius: 8, elevation: 3 }}
    >
      {/* Image */}
      <Pressable onPress={onPress}>
        <View style={{ position: 'relative' }}>
          <Image
            source={{ uri: generatedImageUrl ?? tank.imageUrl }}
            style={{ width: '100%', height: 180 }}
            resizeMode="cover"
          />
          {/* Generate AI image button */}
          {!generatedImageUrl && !isGenerating && (
            <Pressable
              onPress={onGenerateImage}
              style={{
                position: 'absolute', bottom: 8, right: 8,
                backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20,
                paddingHorizontal: 10, paddingVertical: 6,
                flexDirection: 'row', alignItems: 'center',
              }}
            >
              <RefreshCw size={12} color="white" />
              <Text style={{ color: 'white', fontSize: 11, fontWeight: '600', marginLeft: 4 }}>AI Image</Text>
            </Pressable>
          )}
          {isGenerating && (
            <View style={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" color="white" style={{ marginRight: 4 }} />
              <Text style={{ color: 'white', fontSize: 11, fontWeight: '600' }}>Generating…</Text>
            </View>
          )}
        </View>
      </Pressable>
      {/* Tags overlay */}
      <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {tank.tags.map(tag => (
          <View key={tag} style={{ backgroundColor: `${TAG_COLORS[tag]}CC`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: '700', textTransform: 'capitalize' }}>{tag}</Text>
          </View>
        ))}
      </View>
      {/* Save button */}
      <Pressable
        onPress={() => toggleSaved(tank.id)}
        style={{ position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 8 }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isSaved
          ? <BookmarkCheck size={18} color="#0EA5E9" />
          : <Bookmark size={18} color="white" />
        }
      </Pressable>
      {/* Info */}
      <Pressable onPress={onPress} className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center">
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: tank.ownerColor, alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>{tank.ownerInitial}</Text>
            </View>
            <View>
              <Text className={cn('text-sm font-semibold', isDark ? 'text-white' : 'text-slate-900')}>{tank.tankName}</Text>
              <Text className={cn('text-xs', isDark ? 'text-slate-400' : 'text-slate-500')}>{tank.ownerName}</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <Heart size={14} color="#EF4444" />
            <Text className={cn('text-xs ml-1', isDark ? 'text-slate-400' : 'text-slate-500')}>{tank.likeCount}</Text>
          </View>
        </View>
        <Text className={cn('text-sm', isDark ? 'text-slate-300' : 'text-slate-600')} numberOfLines={2}>{tank.description}</Text>
        <View className="flex-row mt-2">
          <Text className={cn('text-xs', isDark ? 'text-slate-500' : 'text-slate-400')}>
            {tank.fishCount} fish · {tank.plantCount} plants
          </Text>
        </View>
      </Pressable>
    </View>
  );
};

const CommunityTankDetailModal = ({
  tank, visible, onClose, isDark,
}: {
  tank: CommunityTank | null;
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
}) => {
  if (!tank) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <View style={{
          backgroundColor: isDark ? '#0F172A' : '#fff',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          maxHeight: '85%',
        }}>
          {/* Handle */}
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: isDark ? '#334155' : '#E2E8F0' }} />
          </View>
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: tank.ownerColor, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{tank.ownerInitial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', fontSize: 17, color: isDark ? '#F8FAFC' : '#0F172A' }}>{tank.tankName}</Text>
              <Text style={{ fontSize: 12, color: isDark ? '#64748B' : '#94A3B8', marginTop: 1 }}>by {tank.ownerName}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <X size={22} color={isDark ? '#64748B' : '#94A3B8'} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 20 }}>
            <Text style={{ fontSize: 14, color: isDark ? '#94A3B8' : '#64748B', lineHeight: 21, marginBottom: 16 }}>
              {tank.description}
            </Text>

            {/* Stats row */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
              <View style={{ flex: 1, backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderRadius: 14, padding: 12 }}>
                <Text style={{ color: '#0EA5E9', fontSize: 20, fontWeight: '800' }}>{tank.tankSizeGallons}</Text>
                <Text style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 11, marginTop: 2 }}>gallons</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderRadius: 14, padding: 12 }}>
                <Text style={{ color: '#F59E0B', fontSize: 20, fontWeight: '800' }}>{tank.fishCount}</Text>
                <Text style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 11, marginTop: 2 }}>fish species</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderRadius: 14, padding: 12 }}>
                <Text style={{ color: '#10B981', fontSize: 20, fontWeight: '800' }}>{tank.plantCount}</Text>
                <Text style={{ color: isDark ? '#64748B' : '#94A3B8', fontSize: 11, marginTop: 2 }}>plant types</Text>
              </View>
            </View>

            {/* Cleaning frequency */}
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderRadius: 14, padding: 12, marginBottom: 16 }}>
              <Clock size={16} color="#8B5CF6" />
              <Text style={{ marginLeft: 8, fontSize: 13, color: isDark ? '#CBD5E1' : '#475569', fontWeight: '600' }}>
                {tank.cleaningFrequency}
              </Text>
            </View>

            {/* Fish list */}
            {tank.fishNames.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <FishIconDetail size={15} color="#0EA5E9" />
                  <Text style={{ fontWeight: '700', fontSize: 13, marginLeft: 6, color: isDark ? '#F8FAFC' : '#0F172A' }}>Fish</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {tank.fishNames.map(name => (
                    <View key={name} style={{ backgroundColor: '#0EA5E915', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}>
                      <Text style={{ color: '#0EA5E9', fontSize: 12, fontWeight: '600' }}>{name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Plant list */}
            {tank.plantNames.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <BookOpen size={15} color="#10B981" />
                  <Text style={{ fontWeight: '700', fontSize: 13, marginLeft: 6, color: isDark ? '#F8FAFC' : '#0F172A' }}>Plants</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {tank.plantNames.map(name => (
                    <View key={name} style={{ backgroundColor: '#10B98115', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}>
                      <Text style={{ color: '#10B981', fontSize: 12, fontWeight: '600' }}>{name}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Tags */}
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 32 }}>
              {tank.tags.map(tag => (
                <View key={tag} style={{ backgroundColor: `${TAG_COLORS[tag]}20`, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: TAG_COLORS[tag], fontSize: 11, fontWeight: '700', textTransform: 'capitalize' }}>{tag}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const FAQItem = ({ question, answer, isDark }: { question: string; answer: string; isDark: boolean }) => {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      onPress={() => setOpen(o => !o)}
      className={cn('mb-2 rounded-xl overflow-hidden', isDark ? 'bg-slate-800' : 'bg-white')}
    >
      <View className="flex-row items-center justify-between p-4">
        <Text className={cn('flex-1 text-sm font-semibold pr-2', isDark ? 'text-white' : 'text-slate-900')}>{question}</Text>
        {open ? <ChevronUp size={18} color="#0EA5E9" /> : <ChevronDown size={18} color={isDark ? '#64748B' : '#94A3B8'} />}
      </View>
      {open && (
        <View className={cn('px-4 pb-4', isDark ? 'bg-slate-800' : 'bg-white')}>
          <Text className={cn('text-sm leading-5', isDark ? 'text-slate-300' : 'text-slate-600')}>{answer}</Text>
        </View>
      )}
    </Pressable>
  );
};

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeFilter, setActiveFilter] = useState<TankTag | 'all'>('all');
  const [detailTank, setDetailTank] = useState<CommunityTank | null>(null);
  const [communityImages, setCommunityImages] = useState<Record<string, string>>({});
  const [generatingImage, setGeneratingImage] = useState<string | null>(null);

  const tanks = useTankStore(s => s.tanks);
  const toggleTankPublic = useTankStore(s => s.toggleTankPublic);

  const filteredCommunityTanks = useMemo(() =>
    activeFilter === 'all'
      ? communityTanks
      : communityTanks.filter(t => t.tags.includes(activeFilter)),
    [activeFilter]
  );

  const generateCommunityImage = async (tank: CommunityTank) => {
    if (generatingImage === tank.id || communityImages[tank.id]) return;
    setGeneratingImage(tank.id);
    const url = await generateTankImage(
      tank.fishNames,
      tank.plantNames,
      tank.tags.includes('saltwater') ? 'saltwater' : 'freshwater',
      false
    );
    if (url) setCommunityImages(prev => ({ ...prev, [tank.id]: url }));
    setGeneratingImage(null);
  };

  return (
    <View className={cn('flex-1', isDark ? 'bg-slate-900' : 'bg-slate-50')}>
      <SafeAreaView edges={['top']} className="flex-1">
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <LinearGradient
            colors={isDark ? ['#0F172A', '#1C3461'] : ['#0EA5E9', '#0369A1']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
          >
            <View className="flex-row items-center mb-1">
              <Compass size={24} color="white" />
              <Text className="text-white text-2xl font-bold ml-2">Explore</Text>
            </View>
            <Text className="text-white/70 text-sm">Community tanks, articles & FAQs</Text>
          </LinearGradient>

          {/* Filter chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14 }}
            style={{ flexGrow: 0 }}
          >
            {ALL_FILTERS.map(f => (
              <Pressable
                key={f}
                onPress={() => setActiveFilter(f)}
                className={cn(
                  'px-4 py-2 rounded-full mr-2',
                  activeFilter === f ? 'bg-sky-500' : isDark ? 'bg-slate-800' : 'bg-white border border-slate-200'
                )}
              >
                <Text className={cn('text-sm font-semibold capitalize', activeFilter === f ? 'text-white' : isDark ? 'text-slate-300' : 'text-slate-600')}>
                  {f === 'all' ? 'All' : f}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Featured Tanks */}
          <View className="mb-2">
            <Text className={cn('text-lg font-bold px-5 mb-3', isDark ? 'text-white' : 'text-slate-900')}>
              Featured Tanks
            </Text>
            {filteredCommunityTanks.map(tank => (
              <CommunityTankCard
                key={tank.id}
                tank={tank}
                isDark={isDark}
                onPress={() => setDetailTank(tank)}
                generatedImageUrl={communityImages[tank.id]}
                isGenerating={generatingImage === tank.id}
                onGenerateImage={() => generateCommunityImage(tank)}
              />
            ))}
          </View>

          {/* My Tanks — public/private toggle */}
          {tanks.length > 0 && (
            <View className="px-5 mb-6">
              <Text className={cn('text-lg font-bold mb-3', isDark ? 'text-white' : 'text-slate-900')}>
                My Tanks
              </Text>
              {tanks.map(tank => (
                <View
                  key={tank.id}
                  className={cn('flex-row items-center p-4 rounded-xl mb-2', isDark ? 'bg-slate-800' : 'bg-white')}
                >
                  <View className="flex-1">
                    <Text className={cn('font-semibold', isDark ? 'text-white' : 'text-slate-900')}>{tank.name}</Text>
                    <Text className={cn('text-xs mt-0.5', isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {tank.fishIds.length} fish · {(tank.plantIds ?? []).length} plants
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => toggleTankPublic(tank.id)}
                    className={cn('flex-row items-center px-3 py-1.5 rounded-full', tank.isPublic ? 'bg-sky-500' : isDark ? 'bg-slate-700' : 'bg-slate-100')}
                  >
                    {tank.isPublic
                      ? <Globe size={14} color="white" />
                      : <Lock size={14} color={isDark ? '#64748B' : '#94A3B8'} />
                    }
                    <Text className={cn('text-xs font-semibold ml-1.5', tank.isPublic ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500')}>
                      {tank.isPublic ? 'Public' : 'Private'}
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          {/* Articles */}
          <View className="px-5 mb-6">
            <View className="flex-row items-center mb-3">
              <Newspaper size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              <Text className={cn('text-lg font-bold ml-2', isDark ? 'text-white' : 'text-slate-900')}>Articles</Text>
            </View>
            {articles.map(article => {
              const Icon = CATEGORY_ICONS[article.category] ?? BookOpen;
              return (
                <View
                  key={article.id}
                  className={cn('flex-row p-4 rounded-xl mb-2', isDark ? 'bg-slate-800' : 'bg-white')}
                >
                  <View className="w-10 h-10 rounded-xl bg-sky-500/10 items-center justify-center mr-3 flex-shrink-0">
                    <Icon size={18} color="#0EA5E9" />
                  </View>
                  <View className="flex-1">
                    <Text className={cn('text-sm font-semibold mb-1', isDark ? 'text-white' : 'text-slate-900')}>{article.title}</Text>
                    <Text className={cn('text-xs leading-4', isDark ? 'text-slate-400' : 'text-slate-500')} numberOfLines={2}>{article.summary}</Text>
                    <Text className="text-xs text-sky-500 mt-1">{article.readMinutes} min read · {article.category}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* FAQs */}
          <View className="px-5 mb-6">
            <View className="flex-row items-center mb-3">
              <HelpCircle size={18} color={isDark ? '#94A3B8' : '#64748B'} />
              <Text className={cn('text-lg font-bold ml-2', isDark ? 'text-white' : 'text-slate-900')}>FAQs</Text>
            </View>
            {faqs.map(faq => (
              <FAQItem key={faq.id} question={faq.question} answer={faq.answer} isDark={isDark} />
            ))}
          </View>

          <View className="h-8" />
        </ScrollView>
      </SafeAreaView>

      <CommunityTankDetailModal
        tank={detailTank}
        visible={!!detailTank}
        onClose={() => setDetailTank(null)}
        isDark={isDark}
      />
    </View>
  );
}
