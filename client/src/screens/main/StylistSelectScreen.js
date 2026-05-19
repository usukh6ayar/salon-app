import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import apiClient from '../../api/client';
import useBookingStore from '../../store/bookingStore';

const PRIMARY = '#2B61F5';
const GOLD = '#C9A96E';
const BG = '#F5F5F7';
const CARD = '#FFFFFF';
const TEXT_PRIMARY = '#111827';
const TEXT_MUTED = '#9CA3AF';
const BORDER = '#E5E7EB';

const PLACEHOLDER_STYLIST_IMAGE =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80';

function cardShadow() {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  };
}

function getStylistImage(stylist) {
  if (stylist?.photo_url && !stylist.photo_url.includes('example.com')) {
    return stylist.photo_url;
  }
  return PLACEHOLDER_STYLIST_IMAGE;
}

function formatSpecialty(stylist) {
  if (Array.isArray(stylist?.specialties) && stylist.specialties.length > 0) {
    return stylist.specialties.join(', ');
  }
  if (typeof stylist?.specialties === 'string' && stylist.specialties) {
    return stylist.specialties;
  }
  return stylist?.bio || 'Үсчин';
}

function OptionCard({ icon, title, subtitle, selected, onPress }) {
  return (
    <Pressable
      style={[
        styles.optionCard,
        cardShadow(),
        selected && styles.optionCardSelected,
      ]}
      onPress={onPress}
    >
      <View style={styles.optionIconWrap}>
        <Ionicons name={icon} size={22} color={PRIMARY} />
      </View>
      <View style={styles.optionTextWrap}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

function StylistCard({ stylist, isSelected, isTopRated, onPress }) {
  return (
    <Pressable
      style={[
        styles.stylistCard,
        cardShadow(),
        isSelected && styles.stylistCardSelected,
      ]}
      onPress={onPress}
    >
      <Image source={{ uri: getStylistImage(stylist) }} style={styles.stylistPhoto} />
      <View style={styles.stylistInfo}>
        <Text style={styles.stylistName}>{stylist.name}</Text>
        <Text style={styles.stylistSpecialty}>{formatSpecialty(stylist)}</Text>
      </View>
      {isTopRated ? (
        <View style={styles.topRatedBadge}>
          <Ionicons name="star" size={12} color={TEXT_PRIMARY} />
          <Text style={styles.topRatedText}>Top Rated</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function StylistSelectScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const selectedSalon = useBookingStore((s) => s.selectedSalon);
  const setStylist = useBookingStore((s) => s.setStylist);

  const salonId = selectedSalon?.id;

  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [anyoneMode, setAnyoneMode] = useState(false);

  const topRatedIds = useMemo(
    () => new Set(stylists.slice(0, 2).map((s) => s.id)),
    [stylists],
  );

  useEffect(() => {
    if (!salonId) {
      setError('Салоны мэдээлэл олдсонгүй');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await apiClient.get(`/api/salons/${salonId}/stylists`);
        setStylists(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.response?.data?.error || 'Мастерууд ачаалахад алдаа гарлаа');
        setStylists([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [salonId]);

  const hasSelection = Boolean(selectedStylist || anyoneMode);

  const handleSelectStylist = (stylist) => {
    setAnyoneMode(false);
    setSelectedStylist(stylist);
  };

  const handleAnyone = () => {
    setAnyoneMode(true);
    setSelectedStylist(stylists[0] ?? null);
  };

  const handleContinue = () => {
    if (!hasSelection || !selectedStylist) return;
    setStylist(selectedStylist);
    navigation.navigate('DateTime');
  };

  const listHeader = (
    <View>
      <OptionCard
        icon="people-outline"
        title="Хэн ч байж болно"
        subtitle="Дараагийн боломжтой стилист"
        selected={anyoneMode}
        onPress={handleAnyone}
      />
      <OptionCard
        icon="person-add-outline"
        title="Олныг сонгох"
        subtitle="Үйлчилгээ тус бүрийг сонгоно уу"
        selected={false}
        onPress={() => {}}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
        </Pressable>
        <Text style={styles.headerTitle}>Стилистээ сонго</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryBtnText}>Буцах</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={stylists}
          keyExtractor={(item) => String(item.id)}
          ListHeaderComponent={listHeader}
          renderItem={({ item }) => (
            <StylistCard
              stylist={item}
              isSelected={!anyoneMode && selectedStylist?.id === item.id}
              isTopRated={topRatedIds.has(item.id)}
              onPress={() => handleSelectStylist(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Мастер олдсонгүй</Text>
          }
        />
      )}

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={[styles.continueBtn, !hasSelection && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!hasSelection}
        >
          <Text style={styles.continueBtnText}>Сонгох & Үргэлжлүүлэх</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: BG, flex: 1 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  headerTitle: {
    color: TEXT_PRIMARY,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  headerSpacer: { width: 40 },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  listContent: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  optionCard: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderColor: BORDER,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 14,
  },
  optionCardSelected: {
    borderColor: PRIMARY,
    borderWidth: 2,
  },
  optionIconWrap: {
    alignItems: 'center',
    backgroundColor: '#EEF3FF',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  optionTextWrap: { flex: 1, marginLeft: 14 },
  optionTitle: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionSubtitle: { color: TEXT_MUTED, fontSize: 14 },
  stylistCard: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderColor: BORDER,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 14,
  },
  stylistCardSelected: {
    borderColor: GOLD,
    borderWidth: 2,
  },
  stylistPhoto: {
    backgroundColor: BG,
    borderRadius: 12,
    height: 56,
    width: 56,
  },
  stylistInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 8,
  },
  stylistName: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  stylistSpecialty: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  topRatedBadge: {
    alignItems: 'center',
    backgroundColor: '#F5D78C',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  topRatedText: {
    color: TEXT_PRIMARY,
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: BG,
    borderTopColor: BORDER,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  continueBtn: {
    alignItems: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingVertical: 16,
  },
  continueBtnDisabled: { backgroundColor: '#D1D5DB' },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 14,
    paddingTop: 16,
    textAlign: 'center',
  },
});
