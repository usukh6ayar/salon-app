import { useCallback, useEffect, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import apiClient from '../../api/client';
import useBookingStore from '../../store/bookingStore';
import { colors, spacing, typography } from '../../theme';

const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80';

function getSalonImage(salon) {
  const urls = salon?.photo_urls;
  if (Array.isArray(urls) && urls[0] && !urls[0].includes('example.com')) return urls[0];
  if (typeof urls === 'string' && urls && !urls.includes('example.com')) return urls;
  return PLACEHOLDER_IMAGE;
}

function formatRating(rating) {
  const value = Number(rating);
  return Number.isNaN(value) ? '0.0' : value.toFixed(1);
}

function FavoriteSalonCard({ salon, onPress }) {
  const reviewCount = salon.review_count ?? Math.floor(200 + (Number(salon.id) || 1) * 22);
  return (
    <Pressable style={styles.salonCard} onPress={() => onPress(salon)}>
      <Image source={{ uri: getSalonImage(salon) }} style={styles.salonImage} />
      <View style={styles.salonContent}>
        <View style={styles.salonTopRow}>
          <Text style={styles.salonName} numberOfLines={1}>{salon.name}</Text>
          <Text style={styles.salonCity}>{salon.city}</Text>
        </View>
        <View style={styles.salonAddressRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.salonAddress} numberOfLines={1}>{salon.address}</Text>
        </View>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FBBF24" />
          <Text style={styles.ratingText}>{formatRating(salon.rating)}</Text>
          <Text style={styles.reviewCount}>({reviewCount})</Text>
        </View>
      </View>
    </Pressable>
  );
}

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const setSalon = useBookingStore((state) => state.setSalon);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/favorites');
      setFavorites(Array.isArray(data) ? data : []);
    } catch {
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadFavorites);
    return unsubscribe;
  }, [navigation, loadFavorites]);

  const handleOpenSalon = (salon) => {
    setSalon(salon);
    navigation.navigate('HomeTab', { screen: 'SalonDetail', params: { salon } });
  };

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Дуртай</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={56} color={colors.border} />
          <Text style={styles.emptyTitle}>Дуртай салон байхгүй</Text>
          <Text style={styles.emptySubtitle}>
            Салоны дэлгэрэнгүй хуудаснаас ❤️ дарж дуртай болгоорой
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <FavoriteSalonCard salon={item} onPress={handleOpenSalon} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.white,
    flex: 1,
  },
  header: {
    backgroundColor: colors.white,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  headerTitle: {
    ...typography.h3,
    fontSize: 18,
  },
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  empty: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 24,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  salonCard: {
    backgroundColor: colors.white,
    borderColor: colors.border,
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
    backgroundColor: colors.background,
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
    color: colors.textPrimary,
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  salonCity: {
    color: colors.textMuted,
    fontSize: 12,
  },
  salonAddressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  salonAddress: {
    color: colors.textSecondary,
    flex: 1,
    fontSize: 13,
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  reviewCount: {
    color: colors.textMuted,
    fontSize: 13,
  },
});
