import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import apiClient from '../../api/client';
import { Button, LoadingScreen } from '../../components';
import useBookingStore from '../../store/bookingStore';
import { colors, spacing, typography } from '../../theme';

const PLACEHOLDER_SALON_IMAGE =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80';

const CATEGORY_TABS = [
  { id: 'haircut', label: 'Үс засалт' },
  { id: 'style', label: 'Үс стил' },
  { id: 'treatment', label: 'Үсний уураг' },
  { id: 'set', label: 'Сет' },
  { id: 'nails', label: 'Хумс будах' },
];

function getHeroImage(salon) {
  const urls = salon?.photo_urls;
  if (Array.isArray(urls) && urls[0] && !urls[0].includes('example.com')) return urls[0];
  if (typeof urls === 'string' && urls && !urls.includes('example.com')) return urls;
  return PLACEHOLDER_SALON_IMAGE;
}

function formatPrice(price) {
  const value = Number(price);
  return Number.isNaN(value) ? '₮0' : `₮${value.toLocaleString('mn-MN')}`;
}

function formatDuration(minutes) {
  const value = Number(minutes);
  return Number.isNaN(value) ? '' : `${value} Mins`;
}

function formatRating(rating) {
  const value = Number(rating);
  return Number.isNaN(value) ? '0.0' : value.toFixed(1);
}

function getReviewCount(salon) {
  if (salon?.review_count) return salon.review_count;
  return Math.floor(200 + (Number(salon?.id) || 1) * 22);
}

function getServiceCategory(service) {
  const name = service.name || '';
  if (/тайрах|засалт/i.test(name)) return 'haircut';
  if (/загвар|стил|будах/i.test(name)) return 'style';
  if (/эмчилгээ|уураг/i.test(name)) return 'treatment';
  if (/сет|багц/i.test(name)) return 'set';
  if (/хумс|маник/i.test(name)) return 'nails';
  return 'haircut';
}

function groupServicesByCategory(services) {
  const grouped = {};
  CATEGORY_TABS.forEach((tab) => {
    grouped[tab.id] = [];
  });
  services.forEach((service) => {
    const category = getServiceCategory(service);
    grouped[category]
      ? grouped[category].push(service)
      : grouped.haircut.push(service);
  });
  return grouped;
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
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  const servicesByCategory = useMemo(
    () => groupServicesByCategory(services),
    [services],
  );

  const filteredServices = useMemo(() => {
    const tabServices = servicesByCategory[activeTab] ?? [];
    return tabServices.length > 0 ? tabServices : services;
  }, [activeTab, services, servicesByCategory]);

  const selectedCount = selectedServices.length;
  const canContinue = selectedCount > 0;

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
        const [salonRes, servicesRes, favRes] = await Promise.all([
          apiClient.get(`/api/salons/${salonId}`),
          apiClient.get(`/api/salons/${salonId}/services`),
          apiClient.get(`/api/favorites/${salonId}`).catch(() => ({ data: { isFavorite: false } })),
        ]);
        setSalonData(salonRes.data);
        const list = Array.isArray(servicesRes.data) ? servicesRes.data : [];
        setServices(list);
        setIsFavorite(favRes.data?.isFavorite ?? false);

        const grouped = groupServicesByCategory(list);
        const firstTab = CATEGORY_TABS.find((tab) => (grouped[tab.id] ?? []).length > 0);
        if (firstTab) setActiveTab(firstTab.id);
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
      return exists ? prev.filter((item) => item.id !== service.id) : [...prev, service];
    });
  };

  const handleContinue = () => {
    if (!canContinue || !salon) return;
    setSalon(salon);
    setService(selectedServices);
    setStylist(null);
    navigation.navigate('StylistSelect');
  };

  if (loading) return <LoadingScreen />;

  if (error || !salon) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error || 'Салон олдсонгүй'}</Text>
        <Button title="Буцах" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const addressLine = [salon.address, salon.city].filter(Boolean).join(', ');

  return (
    <View style={styles.root}>
      {/* Fixed top navigation — outside scroll, clears status bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable
          style={styles.navBtn}
          onPress={() => navigation.goBack()}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.black} />
        </Pressable>
        <Pressable
          style={styles.navBtn}
          onPress={async () => {
            if (favoriteLoading || !salon?.id) return;
            setFavoriteLoading(true);
            const next = !isFavorite;
            setIsFavorite(next);
            try {
              if (next) {
                await apiClient.post(`/api/favorites/${salon.id}`);
              } else {
                await apiClient.delete(`/api/favorites/${salon.id}`);
              }
            } catch {
              setIsFavorite(!next);
            } finally {
              setFavoriteLoading(false);
            }
          }}
          hitSlop={8}
        >
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavorite ? colors.favorite : colors.textPrimary}
          />
        </Pressable>
      </View>

      {/* Scrollable content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: canContinue ? 96 : 32 }}
      >
        {/* Hero image — full width, no padding */}
        <Image
          source={{ uri: getHeroImage(salon) }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Salon info section */}
        <View style={styles.infoSection}>
          <Text style={styles.salonName}>{salon.name}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>{addressLine || '—'}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>9AM-10PM, Mon -Sun</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="star" size={15} color={colors.gold} />
            <Text style={[styles.metaText, styles.ratingText]}>
              {formatRating(salon.rating)}
            </Text>
            <Text style={styles.metaText}>({getReviewCount(salon)})</Text>
          </View>

          {salon.description ? (
            <Text style={styles.description} numberOfLines={3}>
              {salon.description}
            </Text>
          ) : null}
        </View>

        {/* Tab bar — full width with bottom border */}
        <View style={styles.tabBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {CATEGORY_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  style={styles.tab}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                  {active ? <View style={styles.tabUnderline} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Service list */}
        <View style={styles.serviceSection}>
          {filteredServices.length === 0 ? (
            <Text style={styles.emptyText}>Үйлчилгээ олдсонгүй</Text>
          ) : (
            filteredServices.map((service, index) => {
              const selected = selectedServices.some((item) => item.id === service.id);
              const isLast = index === filteredServices.length - 1;
              return (
                <View key={service.id}>
                  <View style={styles.serviceRow}>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <View style={styles.serviceMeta}>
                        <Text style={styles.servicePrice}>{formatPrice(service.price)}</Text>
                        <Ionicons name="time-outline" size={13} color={colors.textMuted} />
                        <Text style={styles.serviceDuration}>
                          {formatDuration(service.duration_minutes)}
                        </Text>
                      </View>
                    </View>
                    <Pressable
                      style={[styles.addBtn, selected && styles.addBtnSelected]}
                      onPress={() => toggleService(service)}
                      hitSlop={8}
                    >
                      {selected ? (
                        <Ionicons name="checkmark" size={18} color={colors.white} />
                      ) : (
                        <Ionicons name="add" size={20} color={colors.textSecondary} />
                      )}
                    </Pressable>
                  </View>
                  {!isLast ? <View style={styles.divider} /> : null}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Floating continue button */}
      {canContinue ? (
        <SafeAreaView edges={['bottom']} style={styles.floatingFooter}>
          <View style={styles.floatingInner}>
            <Button
              title={`Үргэлжлүүлэх (${selectedCount})`}
              onPress={handleContinue}
            />
          </View>
        </SafeAreaView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.white,
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },

  // Top navigation
  topBar: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  navBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    width: 40,
  },

  // Hero image
  heroImage: {
    height: 240,
    width: '100%',
  },

  // Info section
  infoSection: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  salonName: {
    ...typography.h1,
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  metaText: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
  },
  ratingText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },

  // Tab bar
  tabBar: {
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    marginTop: spacing.sm,
  },
  tabsContent: {
    paddingHorizontal: spacing.xl,
  },
  tab: {
    marginRight: spacing.xl,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
    position: 'relative',
  },
  tabText: {
    ...typography.tab,
    color: colors.textMuted,
    fontSize: 14,
  },
  tabTextActive: {
    color: colors.primary,
  },
  tabUnderline: {
    backgroundColor: colors.primary,
    borderRadius: 1,
    bottom: -1,
    height: 2,
    left: 0,
    position: 'absolute',
    right: 0,
  },

  // Service list
  serviceSection: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  serviceRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  serviceInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  serviceName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  serviceMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  servicePrice: {
    ...typography.body,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  serviceDuration: {
    ...typography.caption,
    fontSize: 13,
  },
  addBtn: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 18,
    borderWidth: 1.5,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  addBtnSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginHorizontal: spacing.lg,
  },
  emptyText: {
    ...typography.caption,
    paddingVertical: spacing.xl,
    textAlign: 'center',
  },

  // Floating footer
  floatingFooter: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  floatingInner: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
});
