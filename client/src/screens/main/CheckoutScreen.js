import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import apiClient from "../../api/client";
import { Button, Card, DetailRow, Header, LoadingScreen, RadioOption, ScreenFooter } from "../../components";
import useBookingStore from "../../store/bookingStore";
import { colors, shadows, spacing, typography } from "../../theme";

const PLACEHOLDER_SALON_IMAGE =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=80";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const PAYMENT_ONLINE = "online";
const PAYMENT_AT_SALON = "at_salon";

function getSalonImage(salon) {
  const urls = salon?.photo_urls;
  if (Array.isArray(urls) && urls[0] && !urls[0].includes("example.com"))
    return urls[0];
  if (typeof urls === "string" && urls && !urls.includes("example.com"))
    return urls;
  return PLACEHOLDER_SALON_IMAGE;
}

function formatPrice(price) {
  const value = Number(price);
  return Number.isNaN(value) ? "₮0" : `₮${value.toLocaleString("mn-MN")}`;
}

function formatRating(rating) {
  const value = Number(rating);
  return Number.isNaN(value) ? "0.0" : value.toFixed(1);
}

function getReviewCount(salon) {
  if (salon?.review_count) return salon.review_count;
  return Math.floor(200 + (Number(salon?.id) || 1) * 22);
}

function formatTime12h(time24) {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = Number(hourStr);
  const minute = minuteStr;
  const period = hour >= 12 ? "PM" : "AM";
  hour %= 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${period}`;
}

function parseDateKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatBookingDateTime(dateKey, time24) {
  if (!dateKey || !time24) return "—";
  const date = parseDateKey(dateKey);
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_LABELS[date.getMonth()]} ${date.getDate()} at ${formatTime12h(time24)}`;
}

function hasMorningPromo(time24) {
  return time24 === "09:00" || time24 === "09:30";
}

function getStylistLabel(stylist) {
  if (!stylist?.id || stylist?.name === "Хэн ч байж болно") {
    return "Хэн ч байж болно";
  }
  return stylist.name;
}

export default function CheckoutScreen() {
  const navigation = useNavigation();

  const selectedSalon = useBookingStore((s) => s.selectedSalon);
  const selectedStylist = useBookingStore((s) => s.selectedStylist);
  const selectedService = useBookingStore((s) => s.selectedService);
  const selectedServices = useBookingStore((s) => s.selectedServices);
  const selectedDate = useBookingStore((s) => s.selectedDate);
  const selectedTime = useBookingStore((s) => s.selectedTime);

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_ONLINE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const services = useMemo(() => {
    if (selectedServices?.length > 0) return selectedServices;
    if (selectedService) return [selectedService];
    return [];
  }, [selectedService, selectedServices]);

  const durationMins = useMemo(
    () =>
      services.reduce(
        (sum, service) => sum + (Number(service.duration_minutes) || 0),
        0,
      ) || 40,
    [services],
  );

  const subtotal = useMemo(
    () =>
      services.reduce((sum, service) => sum + (Number(service.price) || 0), 0),
    [services],
  );

  const discount = useMemo(() => {
    if (!hasMorningPromo(selectedTime)) return 0;
    return Math.round(subtotal * 0.2);
  }, [selectedTime, subtotal]);

  const total = subtotal - discount;

  const addressLine = [selectedSalon?.address, selectedSalon?.city]
    .filter(Boolean)
    .join(", ");

  const handleContinue = async () => {
    setError("");

    if (
      !selectedSalon?.id ||
      !selectedDate ||
      !selectedTime ||
      services.length === 0
    ) {
      setError("Захиалгын мэдээлэл дутуу байна");
      return;
    }

    if (!selectedStylist) {
      setError("Стилист сонгоогүй байна");
      return;
    }

    if (paymentMethod === PAYMENT_ONLINE) {
      navigation.navigate("Payment", { totalAmount: total });
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await apiClient.post("/api/bookings", {
        salon_id: selectedSalon.id,
        stylist_id: selectedStylist.id,
        service_id: services[0].id,
        booking_date: selectedDate,
        booking_time: selectedTime,
      });

      navigation.replace("PaymentStatus", {
        success: true,
        booking: data,
        totalAmount: total,
      });
    } catch (err) {
      navigation.replace("PaymentStatus", {
        success: false,
        error: err.response?.data?.error || "Захиалга үүсгэхэд алдаа гарлаа",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitting) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.white }}>
      <Header title="Захиалгын хураангуй" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.salonCard, shadows.card]}>
          <View style={styles.salonTopRow}>
            <Image
              source={{ uri: getSalonImage(selectedSalon) }}
              style={styles.salonImage}
            />
            <View style={styles.salonTitleWrap}>
              <View style={styles.salonNameRow}>
                <Text style={styles.salonName} numberOfLines={1}>
                  {selectedSalon?.name || "—"}
                </Text>
              </View>
              <View style={styles.salonAddressRow}>
                <Ionicons
                  name="location-outline"
                  size={14}
                  color={colors.textMuted}
                />
                <Text style={styles.salonAddress} numberOfLines={2}>
                  {addressLine || "—"}
                </Text>
              </View>
              <View style={styles.salonRatingRow}>
                <Ionicons name="star" size={14} color={colors.gold} />
                <Text style={styles.salonRating}>
                  {formatRating(selectedSalon?.rating)} (
                  {getReviewCount(selectedSalon)})
                </Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Захиалгын дэлгэрэнгүй</Text>
        <Card style={styles.sectionCard}>
          <DetailRow
            label="Өдөр, цаг"
            value={formatBookingDateTime(selectedDate, selectedTime)}
          />
          <View style={styles.divider} />
          <DetailRow
            label="Стилист"
            value={`${getStylistLabel(selectedStylist)} - ${durationMins} Mins`}
          />
        </Card>

        <Text style={styles.sectionTitle}>Төлбөр</Text>
        <Card style={styles.sectionCard}>
          <RadioOption
            label="Онлайнаар төлөх"
            subtitle="Захиалгаа шууд баталгаажуулаарай"
            selected={paymentMethod === PAYMENT_ONLINE}
            onPress={() => setPaymentMethod(PAYMENT_ONLINE)}
          />
          <View style={styles.divider} />
          <RadioOption
            label="Салон дээр төлөх"
            subtitle="Үйлчилгээ авсны дараа төлбөрөө хийх"
            selected={paymentMethod === PAYMENT_AT_SALON}
            onPress={() => setPaymentMethod(PAYMENT_AT_SALON)}
          />
        </Card>

        <Text style={styles.sectionTitle}>Үнийн дэлгэрэнгүй мэдээлэл</Text>
        <Card style={styles.sectionCard}>
          {services.map((service) => (
            <View key={service.id} style={styles.priceRow}>
              <Text style={styles.priceServiceName}>{service.name}</Text>
              <Text style={styles.priceServiceValue}>
                {formatPrice(service.price)}
              </Text>
            </View>
          ))}

          {discount > 0 ? (
            <View style={styles.priceRow}>
              <Text style={styles.discountLabel}>Хөнгөлөлт (20%)</Text>
              <Text style={styles.discountValue}>-{formatPrice(discount)}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Нийт</Text>
            <Text style={styles.totalValue}>{formatPrice(total)}</Text>
          </View>
        </Card>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </ScrollView>

      <ScreenFooter>
        <Button title="Үргэлжлүүлэх" onPress={handleContinue} />
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
  salonCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  salonTopRow: {
    flexDirection: "row",
  },
  salonImage: {
    borderRadius: 10,
    height: 72,
    width: 72,
  },
  salonTitleWrap: {
    flex: 1,
    marginLeft: spacing.md,
  },
  salonNameRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.xs,
  },
  salonName: {
    ...typography.h3,
    flex: 1,
    marginRight: spacing.sm,
  },
  salonAddressRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  salonAddress: {
    ...typography.caption,
    flex: 1,
  },
  salonRatingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  salonRating: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  sectionCard: {
    marginBottom: spacing.xl,
  },
  divider: {
    backgroundColor: colors.border,
    height: 1,
    marginVertical: spacing.md,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  priceServiceName: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.md,
  },
  priceServiceValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  discountLabel: {
    ...typography.body,
    color: colors.promo,
    flex: 1,
  },
  discountValue: {
    ...typography.bodyBold,
    color: colors.promo,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalLabel: {
    ...typography.h3,
  },
  totalValue: {
    ...typography.h3,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: spacing.sm,
    textAlign: "center",
  },
});
