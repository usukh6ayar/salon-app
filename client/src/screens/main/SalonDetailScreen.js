import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import apiClient from '../../api/client';
import useBookingStore from '../../store/bookingStore';

const PRIMARY = '#2B61F5';
const BG = '#F5F5F7';
const CARD = '#FFFFFF';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const BORDER = '#E5E7EB';

const PLACEHOLDER_SALON_IMAGE =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80';
const CATEGORY_TABS = [
  { id: 'all', label: 'Бүгд' },
  { id: 'haircut', label: 'Үс засалт' },
  { id: 'style', label: 'Үс стил' },
  { id: 'treatment', label: 'Үсний уураг' },
  { id: 'set', label: 'Сет' },
  { id: 'nails', label: 'Хумс будаг' },
];

function getHeroImage(salon) {
  const urls = salon?.photo_urls;
  if (Array.isArray(urls) && urls[0]) return urls[0];
  if (typeof urls === 'string' && urls) return urls;
  return PLACEHOLDER_SALON_IMAGE;
}

function formatPrice(price) {
  const value = Number(price);
  return Number.isNaN(value) ? '₮0' : `₮${value.toLocaleString('mn-MN')}`;
}

function formatDuration(minutes) {
  const value = Number(minutes);
  return Number.isNaN(value) ? '—' : `${value} мин`;
}

function formatRating(rating) {
  const value = Number(rating);
  return Number.isNaN(value) ? '0.0' : value.toFixed(1);
}

function cardShadow() {
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  };
}

export default function SalonDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const paramSalon = route.params?.salon;
  const setSalon = useBookingStore((s) => s.setSalon);
  const setService = useBookingStore((s) => s.setService);
  const setStylist = useBookingStore((s) => s.setStylist);

  const [salon, setSalonData] = useState(paramSalon ?? null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('haircut');
  const [selectedServices, setSelectedServices] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);

  const selectedCount = selectedServices.length;
  const canContinue = selectedCount > 0;

  const filteredServices = useMemo(() => {
    if (activeTab === 'all') return services;
    if (activeTab === 'haircut') {
      return services.filter((s) => /тайрах|засалт/i.test(s.name));
    }
    if (activeTab === 'style') {
      return services.filter((s) => /загвар|стил/i.test(s.name));
    }
    if (activeTab === 'treatment') {
      return services.filter((s) => /эмчилгээ|уураг/i.test(s.name));
    }
    if (activeTab === 'nails') {
      return services.filter((s) => /хумс|маник/i.test(s.name));
    }
    return services;
  }, [activeTab, services]);

  useEffect(() => {
    const salonId = paramSalon?.id;
    if (!salonId) {
      setError('Салоны мэдээлэл олдсонгүй');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [salonRes, servicesRes] = await Promise.all([
          apiClient.get(`/api/salons/${salonId}`),
          apiClient.get(`/api/salons/${salonId}/services`),
        ]);
        setSalonData(salonRes.data);
        setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
      } catch (err) {
        setError(err.response?.data?.error || 'Салоны мэдээлэл ачаалахад алдаа гарлаа');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [paramSalon?.id]);

  const toggleService = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.some((item) => item.id === service.id);
      if (exists) {
        return prev.filter((item) => item.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const handleContinue = () => {
    if (!canContinue || !salon) return;

    setSalon(salon);
    setService(selectedServices[0]);
    setStylist(null);
    navigation.navigate('StylistSelect');
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (error || !salon) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Салон олдсонгүй'}</Text>
        <Pressable style={styles.primaryBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.primaryBtnText}>Буцах</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={[styles.heroContainer, { marginTop: insets.top + 8 }]}>
          <ImageBackground
            source={{ uri: getHeroImage(salon) }}
            style={styles.heroImage}
            imageStyle={styles.heroImageInner}
          >
            <View style={styles.heroGradient} />
            <View style={styles.heroTopBar}>
              <Pressable style={styles.heroIconBtn} onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
              </Pressable>
              <Pressable
                style={styles.heroIconBtn}
                onPress={() => setIsFavorite((v) => !v)}
              >
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFavorite ? '#EF4444' : TEXT_PRIMARY}
                />
              </Pressable>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.body}>
          <Text style={styles.title}>{salon.name}</Text>

          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Ionicons
                key={star}
                name={
                  star <= Math.round(Number(salon.rating) || 0) ? 'star' : 'star-outline'
                }
                size={16}
                color="#FBBF24"
              />
            ))}
            <Text style={styles.ratingText}>{formatRating(salon.rating)}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={TEXT_MUTED} />
            <Text style={styles.metaText}>
              {salon.address}
              {salon.city ? `, ${salon.city}` : ''}
            </Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color={TEXT_MUTED} />
            <Text style={styles.metaText}>09:00 - 19:00, Даваа - Ням</Text>
          </View>

          {salon.description ? (
            <Text style={styles.description}>{salon.description}</Text>
          ) : null}

          <Text style={styles.sectionTitle}>Үйлчилгээнүүд</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {CATEGORY_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)}>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                  {active ? <View style={styles.tabUnderline} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>

          {filteredServices.length === 0 ? (
            <Text style={styles.emptyText}>Үйлчилгээ олдсонгүй</Text>
          ) : (
            filteredServices.map((service) => {
              const selected = selectedServices.some((item) => item.id === service.id);
              return (
                <Pressable
                  key={service.id}
                  style={[styles.serviceRowCard, cardShadow()]}
                  onPress={() => toggleService(service)}
                >
                  <View style={styles.serviceRowInfo}>
                    <Text style={styles.serviceRowTitle}>{service.name}</Text>
                    <Text style={styles.serviceRowPrice}>{formatPrice(service.price)}</Text>
                    <View style={styles.durationRow}>
                      <Ionicons name="time-outline" size={14} color={TEXT_MUTED} />
                      <Text style={styles.serviceRowDuration}>
                        {formatDuration(service.duration_minutes)}
                      </Text>
                    </View>
                  </View>
                  {selected ? (
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={styles.plusCircle}>
                      <Ionicons name="add" size={20} color={TEXT_PRIMARY} />
                    </View>
                  )}
                </Pressable>
              );
            })
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text style={styles.continueBtnText}>
            Үргэлжлүүлэх ({selectedCount})
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: BG, flex: 1 },
  centered: {
    alignItems: 'center',
    backgroundColor: BG,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  scroll: { paddingBottom: 120 },
  heroContainer: { paddingHorizontal: 20 },
  heroImage: {
    borderRadius: 16,
    height: 220,
    overflow: 'hidden',
    width: '100%',
  },
  heroImageInner: { borderRadius: 16 },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  heroTopBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 14,
  },
  heroIconBtn: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
    ...cardShadow(),
  },
  body: { paddingHorizontal: 20, paddingTop: 18 },
  title: {
    color: TEXT_PRIMARY,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
  },
  ratingText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginLeft: 6,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  metaText: { color: TEXT_SECONDARY, flex: 1, fontSize: 14 },
  description: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  tabsRow: { gap: 20, marginBottom: 14, paddingRight: 8 },
  tabLabel: { color: TEXT_MUTED, fontSize: 14, fontWeight: '600' },
  tabLabelActive: { color: PRIMARY },
  tabUnderline: {
    backgroundColor: PRIMARY,
    borderRadius: 2,
    height: 3,
    marginTop: 6,
    width: '100%',
  },
  serviceRowCard: {
    alignItems: 'center',
    backgroundColor: CARD,
    borderColor: BORDER,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 16,
  },
  serviceRowInfo: { flex: 1 },
  serviceRowTitle: {
    color: TEXT_PRIMARY,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  serviceRowPrice: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginBottom: 6,
  },
  durationRow: { alignItems: 'center', flexDirection: 'row', gap: 4 },
  serviceRowDuration: { color: TEXT_MUTED, fontSize: 14 },
  plusCircle: {
    alignItems: 'center',
    borderColor: TEXT_PRIMARY,
    borderRadius: 18,
    borderWidth: 1.5,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  checkCircle: {
    alignItems: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  footer: {
    backgroundColor: BG,
    borderTopColor: BORDER,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  continueBtn: {
    alignItems: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingVertical: 16,
  },
  continueBtnDisabled: { backgroundColor: '#D1D5DB' },
  continueBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  errorText: { color: '#DC2626', fontSize: 14, marginBottom: 16, textAlign: 'center' },
  emptyText: { color: TEXT_MUTED, fontSize: 14, marginBottom: 16 },
  primaryBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});
