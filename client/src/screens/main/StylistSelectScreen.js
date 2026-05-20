import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '../../api/client';
import { Button, Card, Header, LoadingScreen, ScreenFooter } from '../../components';
import useBookingStore from '../../store/bookingStore';
import { colors, spacing, typography } from '../../theme';

const PLACEHOLDER_STYLIST_IMAGE =
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80';

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
    <Card selected={selected} onPress={onPress} style={styles.optionCard}>
      <View style={styles.optionRow}>
        <View style={styles.optionIconWrap}>
          <Ionicons name={icon} size={22} color={colors.primary} />
        </View>
        <View style={styles.optionTextWrap}>
          <Text style={styles.optionTitle}>{title}</Text>
          <Text style={styles.optionSubtitle}>{subtitle}</Text>
        </View>
      </View>
    </Card>
  );
}

function StylistCard({ stylist, isSelected, isTopRated, onPress }) {
  return (
    <Card selected={isSelected} onPress={onPress} style={styles.stylistCard}>
      <View style={styles.stylistRow}>
        <Image source={{ uri: getStylistImage(stylist) }} style={styles.stylistPhoto} />
        <View style={styles.stylistInfo}>
          <Text style={styles.stylistName}>{stylist.name}</Text>
          <Text style={styles.stylistSpecialty}>{formatSpecialty(stylist)}</Text>
        </View>
        {isTopRated ? (
          <View style={styles.topRatedBadge}>
            <Ionicons name="star" size={12} color={colors.textPrimary} />
            <Text style={styles.topRatedText}>Top Rated</Text>
          </View>
        ) : null}
      </View>
    </Card>
  );
}

export default function StylistSelectScreen() {
  const navigation = useNavigation();
  const selectedSalon = useBookingStore((s) => s.selectedSalon);
  const setStylist = useBookingStore((s) => s.setStylist);

  const salonId = selectedSalon?.id;

  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectionMode, setSelectionMode] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);

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

  const hasSelection = selectionMode === 'anyone' || Boolean(selectedStylist);

  const handleAnyone = () => {
    setSelectionMode('anyone');
    setSelectedStylist(null);
  };

  const handleMulti = () => {
    setSelectionMode('multi');
    setSelectedStylist(null);
  };

  const handleSelectStylist = (stylist) => {
    setSelectionMode('stylist');
    setSelectedStylist(stylist);
  };

  const handleContinue = () => {
    if (!hasSelection) return;

    if (selectionMode === 'anyone') {
      setStylist(stylists[0] ?? { id: null, name: 'Хэн ч байж болно' });
    } else if (selectedStylist) {
      setStylist(selectedStylist);
    } else {
      return;
    }

    navigation.navigate('DateTime');
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.white }}>
      <Header title="Стилистээ сонго" />

      {loading ? (
        <LoadingScreen />
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Буцах" onPress={() => navigation.goBack()} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{ flex: 1, backgroundColor: colors.background }}
          contentContainerStyle={styles.listContent}
        >
          <OptionCard
            icon="people-outline"
            title="Хэн ч байж болно"
            subtitle="Дараагийн боломжтой стилист"
            selected={selectionMode === 'anyone'}
            onPress={handleAnyone}
          />
          <OptionCard
            icon="person-add-outline"
            title="Олныг сонгох"
            subtitle="Үйлчилгээ тус бүрийг сонгоно уу"
            selected={selectionMode === 'multi'}
            onPress={handleMulti}
          />

          {stylists.length === 0 ? (
            <Text style={styles.emptyText}>Мастер олдсонгүй</Text>
          ) : (
            stylists.map((stylist) => (
              <StylistCard
                key={stylist.id}
                stylist={stylist}
                isSelected={
                  selectionMode === 'stylist' && selectedStylist?.id === stylist.id
                }
                isTopRated={topRatedIds.has(stylist.id)}
                onPress={() => handleSelectStylist(stylist)}
              />
            ))
          )}
        </ScrollView>
      )}

      {!loading && !error ? (
        <ScreenFooter>
          <Button
            title="Сонгох & Үргэлжлүүлэх"
            onPress={handleContinue}
            disabled={!hasSelection}
          />
        </ScreenFooter>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  listContent: {
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  optionCard: {
    marginBottom: spacing.md,
  },
  optionRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  optionIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  optionTextWrap: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  optionTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  optionSubtitle: {
    ...typography.caption,
  },
  stylistCard: {
    marginBottom: spacing.md,
  },
  stylistRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  stylistPhoto: {
    backgroundColor: colors.background,
    borderRadius: 8,
    height: 56,
    width: 56,
  },
  stylistInfo: {
    flex: 1,
    marginLeft: spacing.lg,
    marginRight: spacing.sm,
  },
  stylistName: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  stylistSpecialty: {
    ...typography.caption,
  },
  topRatedBadge: {
    alignItems: 'center',
    backgroundColor: colors.gold,
    borderRadius: 8,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  topRatedText: {
    ...typography.bodyBold,
    fontSize: 11,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  emptyText: {
    ...typography.caption,
    paddingTop: spacing.lg,
    textAlign: 'center',
  },
});
