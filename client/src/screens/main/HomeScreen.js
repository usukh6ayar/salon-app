import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import apiClient from '../../api/client';
import useAuthStore from '../../store/authStore';
import useBookingStore from '../../store/bookingStore';

const PRIMARY = '#2B61F5';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const BORDER = '#E5E7EB';
const SURFACE = '#F5F5F7';
const PLACEHOLDER_SALON_IMAGE =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80';
const PROMO_BANNER_IMAGE =
  'https://images.unsplash.com/photo-1585747860715-2ba37e788b91?w=800&q=80';

const SERVICE_CATEGORIES = [
  { id: 'haircut', label: 'Үс засах', icon: 'cut-outline' },
  { id: 'color', label: 'Үс будах', icon: 'color-palette-outline' },
  { id: 'nails', label: 'Хумсны будалт', icon: 'hand-left-outline' },
];

function getSalonImage(salon) {
  const urls = salon?.photo_urls;

  if (Array.isArray(urls) && urls.length > 0 && urls[0]) {
    return urls[0];
  }

  if (typeof urls === 'string' && urls.length > 0) {
    return urls;
  }

  return PLACEHOLDER_SALON_IMAGE;
}

function formatRating(rating) {
  const value = Number(rating);
  if (Number.isNaN(value)) {
    return '0.0';
  }
  return value.toFixed(1);
}

function SalonCard({ salon, onPressDetails }) {
  return (
    <Pressable style={styles.salonCard} onPress={() => onPressDetails(salon)}>
      <Image source={{ uri: getSalonImage(salon) }} style={styles.salonImage} />
      <View style={styles.salonContent}>
        <View style={styles.salonTopRow}>
          <Text style={styles.salonName} numberOfLines={1}>
            {salon.name}
          </Text>
          <Text style={styles.salonCity}>{salon.city}</Text>
        </View>
        <View style={styles.salonAddressRow}>
          <Ionicons name="location-outline" size={14} color={TEXT_MUTED} />
          <Text style={styles.salonAddress} numberOfLines={1}>
            {salon.address}
          </Text>
        </View>
        <View style={styles.salonBottomRow}>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FBBF24" />
            <Text style={styles.ratingText}>{formatRating(salon.rating)}</Text>
          </View>
          <Pressable
            style={styles.detailsButton}
            onPress={(event) => {
              event.stopPropagation?.();
              onPressDetails(salon);
            }}
          >
            <Text style={styles.detailsButtonText}>Дэлгэрэнгүй</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const setSalon = useBookingStore((state) => state.setSalon);

  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('haircut');
  const [selectedCity] = useState('Улаанбаатар');

  const userName = user?.name?.split(' ')[0] || 'Хэрэглэгч';

  const fetchSalons = useCallback(async () => {
    setError('');
    setLoading(true);

    try {
      const { data } = await apiClient.get('/api/salons', {
        params: { city: selectedCity },
      });
      setSalons(Array.isArray(data) ? data : []);
    } catch (err) {
      const message =
        err.response?.data?.error || 'Салонууд ачаалахад алдаа гарлаа';
      setError(message);
      setSalons([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCity]);

  useEffect(() => {
    fetchSalons();
  }, [fetchSalons]);

  const handleOpenSalon = (salon) => {
    setSalon(salon);
    navigation.navigate('SalonDetail', { salon });
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Pressable
        style={styles.locationRow}
        onPress={() => navigation.navigate('SearchLocation')}
      >
        <Ionicons name="location" size={18} color={PRIMARY} />
        <Text style={styles.locationText}>{selectedCity}</Text>
        <Ionicons name="chevron-down" size={16} color={TEXT_SECONDARY} />
      </Pressable>

      <View style={styles.greetingRow}>
        <View style={styles.greetingTextWrap}>
          <Text style={styles.greetingTitle}>Сайн уу. {userName}!</Text>
          <Text style={styles.greetingSubtitle}>
            Гоо сайхны үйлчилгээгээ одоо захиалаарай
          </Text>
        </View>
        <Pressable style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={22} color={TEXT_PRIMARY} />
          <View style={styles.notificationDot} />
        </Pressable>
      </View>

      <Pressable
        style={styles.searchBar}
        onPress={() => navigation.navigate('SearchLocation')}
      >
        <Ionicons name="search" size={20} color={TEXT_MUTED} />
        <Text style={styles.searchPlaceholder}>Салон, үйлчилгээ хайх...</Text>
      </Pressable>

      <ImageBackground
        source={{ uri: PROMO_BANNER_IMAGE }}
        style={styles.promoBanner}
        imageStyle={styles.promoBannerImage}
      >
        <View style={styles.promoOverlay}>
          <Text style={styles.promoLabel}>Онцгой өглөө!</Text>
          <Text style={styles.promoTitle}>20% Хямдрал</Text>
          <Text style={styles.promoSubtitle}>
            9-10 цагийн хооронд бүх үсний засалт дээр.
          </Text>
          <Pressable style={styles.promoButton}>
            <Text style={styles.promoButtonText}>Захиалах</Text>
          </Pressable>
        </View>
      </ImageBackground>

      <Text style={styles.sectionTitle}>Үйлчилгээ</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
      >
        {SERVICE_CATEGORIES.map((item) => {
          const isActive = selectedCategory === item.id;

          return (
            <Pressable
              key={item.id}
              style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(item.id)}
            >
              <Ionicons
                name={item.icon}
                size={18}
                color={isActive ? '#FFFFFF' : TEXT_MUTED}
              />
              <Text
                style={[
                  styles.categoryChipText,
                  isActive && styles.categoryChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionTitle}>Онцлох салонууд</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {loading && salons.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      ) : (
        <FlatList
          data={salons}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <SalonCard salon={item} onPressDetails={handleOpenSalon} />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.emptyText}>Салон олдсонгүй</Text>
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {loading && salons.length > 0 ? (
        <View style={styles.refreshOverlay}>
          <ActivityIndicator color={PRIMARY} />
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerSection: {
    paddingTop: 8,
  },
  locationRow: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  locationText: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '600',
  },
  greetingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greetingTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  greetingTitle: {
    color: TEXT_PRIMARY,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },
  greetingSubtitle: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    lineHeight: 20,
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: BORDER,
    borderRadius: 14,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    position: 'relative',
    width: 48,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  notificationDot: {
    backgroundColor: '#EF4444',
    borderRadius: 4,
    height: 8,
    position: 'absolute',
    right: 12,
    top: 10,
    width: 8,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: SURFACE,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  searchPlaceholder: {
    color: TEXT_MUTED,
    flex: 1,
    fontSize: 15,
  },
  promoBanner: {
    borderRadius: 20,
    height: 170,
    marginBottom: 24,
    overflow: 'hidden',
  },
  promoBannerImage: {
    borderRadius: 20,
  },
  promoOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  promoLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  promoTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  promoSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  promoButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  promoButtonText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
  },
  categoryList: {
    gap: 10,
    marginBottom: 24,
    paddingRight: 4,
  },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: BORDER,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    marginRight: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoryChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  categoryChipText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '600',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
  },
  salonCard: {
    backgroundColor: '#FFFFFF',
    borderColor: BORDER,
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 14,
    overflow: 'hidden',
    padding: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  salonImage: {
    backgroundColor: SURFACE,
    borderRadius: 14,
    height: 88,
    width: 88,
  },
  salonContent: {
    flex: 1,
    marginLeft: 12,
    minHeight: 88,
  },
  salonTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  salonName: {
    color: TEXT_PRIMARY,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  salonCity: {
    color: TEXT_MUTED,
    fontSize: 12,
  },
  salonAddressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  salonAddress: {
    color: TEXT_SECONDARY,
    flex: 1,
    fontSize: 13,
  },
  salonBottomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  ratingText: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: '600',
  },
  detailsButton: {
    backgroundColor: '#EEF3FF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  detailsButtonText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '600',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 12,
  },
  emptyText: {
    color: TEXT_MUTED,
    fontSize: 14,
    textAlign: 'center',
  },
  refreshOverlay: {
    alignItems: 'center',
    bottom: 24,
    left: 0,
    position: 'absolute',
    right: 0,
  },
});
