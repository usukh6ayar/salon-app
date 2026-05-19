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
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import apiClient from '../../api/client';
import { Button, LoadingScreen } from '../../components';
import useBookingStore from '../../store/bookingStore';
import { colors, shadows, spacing, typography } from '../../theme';

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
  return Number.isNaN(value) ? '—' : `${value} Mins`;
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
    if (grouped[category]) {
      grouped[category].push(service);
    } else {
      grouped.haircut.push(service);
    }
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

  const servicesByCategory = useMemo(
    () => groupServicesByCategory(services),
    [services],
  );

  const filteredServices = useMemo(() => {
    const tabServices = servicesByCategory[activeTab] ?? [];
    if (tabServices.length > 0) return tabServices;
    return services;
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
        const [salonRes, servicesRes] = await Promise.all([
          apiClient.get(`/api/salons/${salonId}`),
          apiClient.get(`/api/salons/${salonId}/services`),
        ]);
        setSalonData(salonRes.data);
        const list = Array.isArray(servicesRes.data) ? servicesRes.data : [];
        setServices(list);

        const grouped = groupServicesByCategory(list);
        const firstTabWithServices = CATEGORY_TABS.find(
          (tab) => (grouped[tab.id] ?? []).length > 0,
        );
        if (firstTabWithServices) {
          setActiveTab(firstTabWithServices.id);
        }
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
    setService(selectedServices);
    setStylist(null);
    navigation.navigate('StylistSelect');
  };

  if (loading) {
    return <LoadingScreen />;
  }

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
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: insets.top + spacing.sm },
        ]}
      >
        <View style={styles.topBar}>
          <Pressable style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={() => setIsFavorite((v) => !v)}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={22}
              color={isFavorite ? colors.favorite : colors.textPrimary}
            />
          </Pressable>
        </View>

        <Image source={{ uri: getHeroImage(salon) }} style={styles.heroImage} />

        <View style={styles.body}>
          <Text style={styles.salonName}>{salon.name}</Text>

          <View style={styles.metaRow}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
            <Text style={styles.metaText}>{addressLine}</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color={colors.textMuted} />
            <Text style={styles.metaText}>9AM-10PM, Mon-Sun</Text>
          </View>

          <View style={styles.metaRow}>
            <Ionicons name="star" size={16} color={colors.gold} />
            <Text style={styles.metaText}>
              {formatRating(salon.rating)} ({getReviewCount(salon)})
            </Text>
          </View>

          {salon.description ? (
            <Text style={styles.description} numberOfLines={3}>
              {salon.description}
            </Text>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsRow}
          >
            {CATEGORY_TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  style={styles.tabItem}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                    {tab.label}
                  </Text>
                  {active ? <View style={styles.tabUnderline} /> : null}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={[styles.serviceListCard, shadows.card]}>
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
                          <Text style={styles.servicePrice}>
                            {formatPrice(service.price)}
                          </Text>
                          <Ionicons
                            name="time-outline"
                            size={14}
                            color={colors.textMuted}
                          />
                          <Text style={styles.serviceDuration}>
                            {formatDuration(service.duration_minutes)}
                          </Text>
                        </View>
                      </View>
                      <Pressable
                        style={[
                          styles.addBtn,
                          selected && styles.addBtnSelected,
                        ]}
                        onPress={() => toggleService(service)}
                      >
                        {selected ? (
                          <Ionicons name="checkmark" size={18} color={colors.white} />
                        ) : (
                          <Ionicons name="add" size={20} color={colors.textPrimary} />
                        )}
                      </Pressable>
                    </View>
                    {!isLast ? <View style={styles.divider} /> : null}
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {canContinue ? (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
          <Button
            title={`Үргэлжлүүлэх (${selectedCount})`}
            onPress={handleContinue}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  scroll: {
    paddingBottom: 120,
    paddingHorizontal: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  iconBtn: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
    ...shadows.card,
  },
  heroImage: {
    borderRadius: 16,
    height: 220,
    marginBottom: spacing.lg,
    width: '100%',
  },
  body: {
    paddingBottom: spacing.xl,
  },
  salonName: {
    ...typography.h2,
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  metaText: {
    ...typography.body,
    flex: 1,
  },
  description: {
    ...typography.body,
    lineHeight: 22,
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  tabsRow: {
    gap: spacing.xl,
    marginBottom: spacing.lg,
    paddingRight: spacing.sm,
  },
  tabItem: {
    marginRight: spacing.xs,
  },
  tabLabel: {
    ...typography.tab,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  tabUnderline: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    height: 3,
    marginTop: spacing.sm,
    width: '100%',
  },
  serviceListCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  serviceRow: {
    alignItems: 'center',
    flexDirection: 'row',
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
    marginRight: spacing.sm,
  },
  serviceDuration: {
    ...typography.caption,
  },
  addBtn: {
    alignItems: 'center',
    borderColor: colors.textPrimary,
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
  },
  footer: {
    backgroundColor: colors.background,
    bottom: 0,
    left: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    position: 'absolute',
    right: 0,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.caption,
    paddingVertical: spacing.lg,
    textAlign: 'center',
  },
});
