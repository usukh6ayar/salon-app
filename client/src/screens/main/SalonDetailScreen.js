import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import apiClient from '../../api/client';
import useBookingStore from '../../store/bookingStore';

const PRIMARY = '#2B61F5';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const BORDER = '#E5E7EB';
const SURFACE = '#F5F5F7';
const HERO_HEIGHT = 280;
const PLACEHOLDER_SALON_IMAGE =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80';
const PLACEHOLDER_STYLIST_IMAGE =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80';

function getPhotoUrls(salon) {
  const urls = salon?.photo_urls;

  if (Array.isArray(urls) && urls.length > 0) {
    return urls.filter(Boolean);
  }

  if (typeof urls === 'string' && urls.length > 0) {
    return [urls];
  }

  return [PLACEHOLDER_SALON_IMAGE];
}

function formatPrice(price) {
  const value = Number(price);
  if (Number.isNaN(value)) {
    return '₮0';
  }
  return `₮${value.toLocaleString('mn-MN')}`;
}

function formatDuration(minutes) {
  const value = Number(minutes);
  if (Number.isNaN(value)) {
    return '—';
  }
  return `${value} мин`;
}

function formatRating(rating) {
  const value = Number(rating);
  if (Number.isNaN(value)) {
    return '0.0';
  }
  return value.toFixed(1);
}

function formatSpecialties(specialties) {
  if (Array.isArray(specialties) && specialties.length > 0) {
    return specialties.join(', ');
  }
  if (typeof specialties === 'string' && specialties.length > 0) {
    return specialties;
  }
  return 'Үйлчилгээний мэргэжилтэн';
}

function getStylistImage(stylist) {
  if (stylist?.photo_url && !stylist.photo_url.includes('example.com')) {
    return stylist.photo_url;
  }
  return PLACEHOLDER_STYLIST_IMAGE;
}

export default function SalonDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  const paramSalon = route.params?.salon;
  const setSalon = useBookingStore((state) => state.setSalon);
  const setService = useBookingStore((state) => state.setService);
  const setStylist = useBookingStore((state) => state.setStylist);

  const [salon, setSalonData] = useState(paramSalon ?? null);
  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [validationError, setValidationError] = useState('');

  const photos = useMemo(() => getPhotoUrls(salon), [salon]);
  const heroImage = photos[0];

  useEffect(() => {
    const salonId = paramSalon?.id;

    if (!salonId) {
      setError('Салоны мэдээлэл олдсонгүй');
      setLoading(false);
      return;
    }

    const fetchSalonDetails = async () => {
      setError('');
      setLoading(true);

      try {
        const [salonRes, stylistsRes, servicesRes] = await Promise.all([
          apiClient.get(`/api/salons/${salonId}`),
          apiClient.get(`/api/salons/${salonId}/stylists`),
          apiClient.get(`/api/salons/${salonId}/services`),
        ]);

        setSalonData(salonRes.data);
        setStylists(Array.isArray(stylistsRes.data) ? stylistsRes.data : []);
        setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
      } catch (err) {
        const message =
          err.response?.data?.error || 'Салоны мэдээлэл ачаалахад алдаа гарлаа';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchSalonDetails();
  }, [paramSalon?.id]);

  const handleBook = () => {
    setValidationError('');

    if (!selectedService || !selectedStylist) {
      setValidationError('Үйлчилгээ болон мастераа сонгоно уу');
      return;
    }

    if (!salon) {
      return;
    }

    setSalon(salon);
    setService(selectedService);
    setStylist(selectedStylist);
    navigation.navigate('DateTime');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  if (error || !salon) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Салон олдсонгүй'}</Text>
          <Pressable style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>Буцах</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.heroWrap}>
          <Image source={{ uri: heroImage }} style={styles.heroImage} />
          <View style={[styles.heroActions, { top: insets.top + 8 }]}>
            <Pressable style={styles.iconButton} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
            </Pressable>
            <Pressable
              style={styles.iconButton}
              onPress={() => setIsFavorite((value) => !value)}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={22}
                color={isFavorite ? '#EF4444' : TEXT_PRIMARY}
              />
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.salonName}>{salon.name}</Text>

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

          <View style={styles.metaRow}>
            <Ionicons name="star" size={16} color="#FBBF24" />
            <Text style={styles.metaText}>{formatRating(salon.rating)}</Text>
          </View>

          {salon.description ? (
            <Text style={styles.description}>{salon.description}</Text>
          ) : null}

          {photos.length > 1 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoStrip}
            >
              {photos.map((uri, index) => (
                <Image
                  key={`${uri}-${index}`}
                  source={{ uri }}
                  style={styles.photoThumb}
                />
              ))}
            </ScrollView>
          ) : null}

          <Text style={styles.sectionTitle}>Үйлчилгээнүүд</Text>
          {services.length === 0 ? (
            <Text style={styles.emptySectionText}>Үйлчилгээ байхгүй</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {services.map((service) => {
                const isSelected = selectedService?.id === service.id;

                return (
                  <Pressable
                    key={service.id}
                    style={[styles.serviceCard, isSelected && styles.cardSelected]}
                    onPress={() => setSelectedService(service)}
                  >
                    <Text style={styles.serviceName} numberOfLines={2}>
                      {service.name}
                    </Text>
                    <View style={styles.serviceMetaRow}>
                      <Ionicons name="time-outline" size={14} color={TEXT_MUTED} />
                      <Text style={styles.serviceMeta}>
                        {formatDuration(service.duration_minutes)}
                      </Text>
                    </View>
                    <Text style={styles.servicePrice}>
                      {formatPrice(service.price)}
                    </Text>
                    {isSelected ? (
                      <View style={styles.selectedBadge}>
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <Text style={styles.sectionTitle}>Мастерууд</Text>
          {stylists.length === 0 ? (
            <Text style={styles.emptySectionText}>Мастер байхгүй</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {stylists.map((stylist) => {
                const isSelected = selectedStylist?.id === stylist.id;

                return (
                  <Pressable
                    key={stylist.id}
                    style={[styles.stylistCard, isSelected && styles.cardSelected]}
                    onPress={() => setSelectedStylist(stylist)}
                  >
                    <Image
                      source={{ uri: getStylistImage(stylist) }}
                      style={styles.stylistPhoto}
                    />
                    <Text style={styles.stylistName} numberOfLines={1}>
                      {stylist.name}
                    </Text>
                    <Text style={styles.stylistSpecialties} numberOfLines={2}>
                      {formatSpecialties(stylist.specialties)}
                    </Text>
                    {isSelected ? (
                      <View style={styles.selectedBadgeSmall}>
                        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          {validationError ? (
            <Text style={styles.validationError}>{validationError}</Text>
          ) : null}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <Pressable style={styles.bookButton} onPress={handleBook}>
          <Text style={styles.bookButtonText}>Цаг захиалах</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroWrap: {
    height: HERO_HEIGHT,
    position: 'relative',
  },
  heroImage: {
    height: HERO_HEIGHT,
    width: '100%',
  },
  heroActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 20,
    position: 'absolute',
    right: 20,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    height: 44,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: 44,
    elevation: 3,
  },
  content: {
    marginTop: -24,
    paddingHorizontal: 20,
  },
  salonName: {
    color: TEXT_PRIMARY,
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 12,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  metaText: {
    color: TEXT_SECONDARY,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  description: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
    marginTop: 8,
  },
  photoStrip: {
    gap: 10,
    marginBottom: 20,
    paddingRight: 4,
  },
  photoThumb: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    height: 72,
    width: 96,
  },
  sectionTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    marginTop: 8,
  },
  horizontalList: {
    gap: 12,
    marginBottom: 24,
    paddingRight: 4,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderColor: BORDER,
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 130,
    padding: 14,
    position: 'relative',
    width: 160,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stylistCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: BORDER,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    position: 'relative',
    width: 130,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: PRIMARY,
    borderWidth: 2,
  },
  serviceName: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
    minHeight: 40,
  },
  serviceMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  serviceMeta: {
    color: TEXT_MUTED,
    fontSize: 13,
  },
  servicePrice: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '700',
  },
  stylistPhoto: {
    backgroundColor: SURFACE,
    borderRadius: 40,
    height: 72,
    marginBottom: 10,
    width: 72,
  },
  stylistName: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  stylistSpecialties: {
    color: TEXT_MUTED,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  selectedBadge: {
    alignItems: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 12,
    height: 24,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
    width: 24,
  },
  selectedBadgeSmall: {
    alignItems: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 8,
    width: 20,
  },
  emptySectionText: {
    color: TEXT_MUTED,
    fontSize: 14,
    marginBottom: 20,
  },
  validationError: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopColor: BORDER,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    position: 'absolute',
    right: 0,
  },
  bookButton: {
    alignItems: 'center',
    backgroundColor: PRIMARY,
    borderRadius: 14,
    paddingVertical: 16,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
