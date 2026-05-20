import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import apiClient from '../../api/client';
import { colors, spacing, typography } from '../../theme';

const MONTH_LABELS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatDate(dateKey) {
  if (!dateKey) return '—';
  const [year, month, day] = dateKey.split('-').map(Number);
  return `${MONTH_LABELS[month - 1]} ${day}, ${year}`;
}

function formatTime(time24) {
  if (!time24) return '—';
  const [h, m] = time24.split(':');
  let hour = Number(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  hour %= 12;
  if (hour === 0) hour = 12;
  return `${hour}:${m} ${period}`;
}

const STATUS_CONFIG = {
  pending: { bg: '#FEF3C7', text: '#92400E', label: 'Хүлээгдэж байна' },
  confirmed: { bg: '#D1FAE5', text: '#065F46', label: 'Баталгаажсан' },
  cancelled: { bg: '#FEE2E2', text: '#991B1B', label: 'Цуцалсан' },
  completed: { bg: '#DBEAFE', text: '#1E40AF', label: 'Дууссан' },
};

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

export default function BookingsScreen() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/api/bookings/my');
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await apiClient.patch(`/api/bookings/${id}/cancel`);
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: 'cancelled' } : b)),
      );
    } catch {
      // silent
    } finally {
      setCancelling(null);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Захиалгууд</Text>
      </View>

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator color={colors.primary} style={styles.loader} />
        ) : bookings.length === 0 ? (
          <Text style={styles.emptyText}>Захиалга байхгүй байна</Text>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.salonName}>{booking.salon_name}</Text>
                <StatusBadge status={booking.status} />
              </View>
              <Text style={styles.meta}>
                {formatDate(booking.booking_date)} · {formatTime(booking.booking_time)}
              </Text>
              {booking.stylist_name ? (
                <Text style={styles.meta}>{booking.stylist_name}</Text>
              ) : null}
              {booking.service_name ? (
                <Text style={styles.meta}>{booking.service_name}</Text>
              ) : null}
              {booking.status === 'pending' ? (
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => handleCancel(booking.id)}
                  disabled={cancelling === booking.id}
                >
                  <Text style={styles.cancelText}>
                    {cancelling === booking.id ? 'Цуцалж байна...' : 'Цуцлах'}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
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
  content: {
    paddingBottom: 40,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  loader: {
    marginTop: 40,
  },
  emptyText: {
    ...typography.body,
    marginTop: 40,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 14,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  salonName: {
    ...typography.bodyBold,
    flex: 1,
    marginRight: spacing.sm,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    ...typography.caption,
    marginTop: 3,
  },
  cancelBtn: {
    alignSelf: 'flex-start',
    borderColor: colors.error,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  cancelText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
  },
});
