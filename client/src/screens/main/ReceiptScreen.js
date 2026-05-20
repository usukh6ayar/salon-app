import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, DetailRow, Header, ScreenFooter } from '../../components';
import useAuthStore from '../../store/authStore';
import useBookingStore from '../../store/bookingStore';
import { colors, shadows, spacing, typography } from '../../theme';

const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatBookingDate(dateKey) {
  if (!dateKey) return '—';
  const [year, month, day] = dateKey.split('-').map(Number);
  return `${MONTH_LABELS[month - 1]} ${day}, ${year}`;
}

function formatTime12h(time24) {
  if (!time24) return '—';
  const [hourStr, minuteStr] = time24.split(':');
  let hour = Number(hourStr);
  const period = hour >= 12 ? 'PM' : 'AM';
  hour %= 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minuteStr} ${period}`;
}

function formatPrice(price) {
  const value = Number(price);
  return Number.isNaN(value) ? '₮0' : `₮${value.toLocaleString('mn-MN')}`;
}

export default function ReceiptScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const user = useAuthStore((s) => s.user);
  const selectedSalon = useBookingStore((s) => s.selectedSalon);
  const selectedStylist = useBookingStore((s) => s.selectedStylist);
  const selectedServices = useBookingStore((s) => s.selectedServices);
  const selectedService = useBookingStore((s) => s.selectedService);
  const selectedDate = useBookingStore((s) => s.selectedDate);
  const selectedTime = useBookingStore((s) => s.selectedTime);

  const booking = route.params?.booking;
  const totalAmount = route.params?.totalAmount;

  const services =
    selectedServices?.length > 0
      ? selectedServices
      : selectedService
        ? [selectedService]
        : [];

  const stylistName =
    !selectedStylist?.id || selectedStylist?.name === 'Хэн ч байж болно'
      ? 'Хэн ч байж болно'
      : selectedStylist.name;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.white }}>
      <Header title="Баримт" onBack={() => navigation.reset({ index: 0, routes: [{ name: 'Home' }] })} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: colors.background }}
      >
        <View style={styles.qrPlaceholder}>
          <Text style={styles.qrText}>QR</Text>
        </View>
        <Text style={styles.qrHint}>
          Шуурхай бүртгүүлэхийн тулд салон дээр энэ QR кодыг уншина уу.
        </Text>

        <View style={[styles.card, shadows.card]}>
          <DetailRow label="Салон" value={selectedSalon?.name || '—'} />
          <DetailRow label="Хэрэглэгчийн нэр" value={user?.name || '—'} />
          <DetailRow label="Утас" value={user?.phone || '—'} />
          <DetailRow label="Захиалгын огноо" value={formatBookingDate(selectedDate)} />
          <DetailRow label="Захиалгын цаг" value={formatTime12h(selectedTime)} />
          <DetailRow label="Стилист" value={stylistName} />
          {booking?.id ? (
            <DetailRow label="Захиалгын дугаар" value={`#${booking.id}`} />
          ) : null}
        </View>

        <View style={[styles.card, shadows.card]}>
          {services.map((service) => (
            <DetailRow
              key={service.id}
              label={service.name}
              value={formatPrice(service.price)}
            />
          ))}
          <DetailRow
            label="Нийт"
            value={formatPrice(totalAmount ?? booking?.total_price)}
          />
        </View>
      </ScrollView>

      <ScreenFooter>
        <Button title="Download Receipt" onPress={() => {}} />
      </ScreenFooter>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  qrPlaceholder: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    height: 200,
    justifyContent: 'center',
    marginBottom: spacing.md,
    width: 200,
  },
  qrText: {
    ...typography.h2,
    color: colors.textMuted,
  },
  qrHint: {
    ...typography.body,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
});
