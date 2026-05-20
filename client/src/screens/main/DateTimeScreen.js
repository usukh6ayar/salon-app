import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import apiClient from '../../api/client';
import { Button, Header, ScreenFooter } from '../../components';
import useBookingStore from '../../store/bookingStore';
import { colors, shadows, spacing, typography } from '../../theme';

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const ALL_SLOTS = (() => {
  const slots = [];
  for (let hour = 9; hour <= 18; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === 18 && minute === 30) break;
      slots.push(
        `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      );
    }
  }
  return slots;
})();

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return toDateKey(a) === toDateKey(b);
}

function formatDisplayDate(date) {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getDate()}`;
}

function formatTime12h(time24) {
  const [hourStr, minuteStr] = time24.split(':');
  let hour = Number(hourStr);
  const minute = minuteStr;
  const period = hour >= 12 ? 'PM' : 'AM';
  hour %= 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${period}`;
}

function hasMorningPromo(time24) {
  return time24 === '09:00' || time24 === '09:30';
}

function isAnyoneStylist(stylist) {
  return !stylist?.id || stylist?.name === 'Хэн ч байж болно';
}

function buildFutureDates(startDate, count) {
  const dates = [];
  for (let i = 0; i < count; i += 1) {
    dates.push(addDays(startDate, i));
  }
  return dates;
}

export default function DateTimeScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const selectedService = useBookingStore((s) => s.selectedService);
  const selectedServices = useBookingStore((s) => s.selectedServices);
  const selectedStylist = useBookingStore((s) => s.selectedStylist);
  const setDateTime = useBookingStore((s) => s.setDateTime);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [pickerVisible, setPickerVisible] = useState(false);

  const anyoneMode = isAnyoneStylist(selectedStylist);

  const durationMins = useMemo(() => {
    if (selectedServices?.length > 0) {
      return selectedServices.reduce(
        (sum, service) => sum + (Number(service.duration_minutes) || 0),
        0,
      );
    }
    return Number(selectedService?.duration_minutes) || 40;
  }, [selectedService, selectedServices]);

  const quickDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [0, 1, 2].map((offset) => addDays(today, offset));
  }, []);

  const pickerDates = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return buildFutureDates(today, 60);
  }, []);

  const canContinue = Boolean(selectedDate && selectedTime);

  useEffect(() => {
    if (!selectedDate && quickDates.length > 0) {
      setSelectedDate(quickDates[0]);
    }
  }, [quickDates, selectedDate]);

  const fetchAvailability = useCallback(async () => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }

    if (anyoneMode) {
      setSlots(ALL_SLOTS.map((time) => ({ time, available: true })));
      return;
    }

    if (!selectedStylist?.id) {
      setSlots([]);
      return;
    }

    setLoadingSlots(true);
    const dateKey = toDateKey(selectedDate);

    try {
      const { data } = await apiClient.get(
        `/api/stylists/${selectedStylist.id}/availability`,
        { params: { date: dateKey } },
      );

      if (Array.isArray(data) && data.length > 0) {
        setSlots(data);
      } else {
        setSlots(ALL_SLOTS.map((time) => ({ time, available: true })));
      }
    } catch {
      setSlots(ALL_SLOTS.map((time) => ({ time, available: true })));
    } finally {
      setLoadingSlots(false);
    }
  }, [anyoneMode, selectedDate, selectedStylist?.id]);

  useEffect(() => {
    setSelectedTime(null);
    fetchAvailability();
  }, [fetchAvailability]);

  const handleContinue = () => {
    if (!canContinue) return;
    setDateTime(toDateKey(selectedDate), selectedTime);
    navigation.navigate('Checkout');
  };

  const handleSelectDate = (date) => {
    setSelectedDate(date);
  };

  const isQuickDate = (date) =>
    quickDates.some((quickDate) => isSameDay(quickDate, date));

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.white }}>
      <Header title="Огноо, цаг" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Огноог сонгох</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateRow}
        >
          {quickDates.map((date) => {
            const selected = isSameDay(date, selectedDate);
            return (
              <Pressable
                key={toDateKey(date)}
                style={[
                  styles.dateCard,
                  selected ? styles.dateCardSelected : styles.dateCardUnselected,
                  shadows.card,
                ]}
                onPress={() => handleSelectDate(date)}
              >
                <Text
                  style={[
                    styles.dateDay,
                    selected && styles.dateTextSelected,
                  ]}
                >
                  {DAY_LABELS[date.getDay()]}
                </Text>
                <Text
                  style={[
                    styles.dateValue,
                    selected && styles.dateTextSelected,
                  ]}
                >
                  {formatDisplayDate(date)}
                </Text>
                <Text
                  style={[
                    styles.dateDuration,
                    selected && styles.dateTextSelected,
                  ]}
                >
                  {durationMins} mins
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            style={[styles.dateCard, styles.moreCard, shadows.card]}
            onPress={() => setPickerVisible(true)}
          >
            <Ionicons name="calendar-outline" size={22} color={colors.textPrimary} />
            <Text style={styles.moreText}>Илүү</Text>
          </Pressable>
        </ScrollView>

        {!isQuickDate(selectedDate) && selectedDate ? (
          <Text style={styles.customDateHint}>
            Сонгосон: {formatDisplayDate(selectedDate)}
          </Text>
        ) : null}

        <Text style={styles.sectionTitle}>Цагийг сонгох</Text>

        {loadingSlots ? (
          <View style={styles.slotsLoading}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <View style={styles.timeList}>
            {slots.map((slot) => {
              const available = slot.available !== false;
              const selected = selectedTime === slot.time;
              const showPromo = available && hasMorningPromo(slot.time);

              return (
                <Pressable
                  key={slot.time}
                  style={[
                    styles.timeSlot,
                    shadows.card,
                    available ? styles.timeSlotDefault : styles.timeSlotUnavailable,
                    selected && styles.timeSlotSelected,
                  ]}
                  onPress={() => {
                    if (available) setSelectedTime(slot.time);
                  }}
                  disabled={!available}
                >
                  <Text
                    style={[
                      styles.timeSlotText,
                      !available && styles.timeSlotTextDisabled,
                      selected && styles.timeSlotTextSelected,
                    ]}
                  >
                    {formatTime12h(slot.time)}
                  </Text>
                  {showPromo ? (
                    <Text style={styles.promoText}>20% Off</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <ScreenFooter>
        <Button
          title="Захиалга баталгаажуулах"
          onPress={handleContinue}
          disabled={!canContinue}
        />
      </ScreenFooter>

      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
            <Text style={styles.modalTitle}>Огноо сонгох</Text>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {pickerDates.map((date) => {
                const selected = isSameDay(date, selectedDate);
                return (
                  <Pressable
                    key={toDateKey(date)}
                    style={[styles.modalRow, selected && styles.modalRowSelected]}
                    onPress={() => {
                      handleSelectDate(date);
                      setPickerVisible(false);
                    }}
                  >
                    <Text style={[styles.modalRowText, selected && styles.modalRowTextSelected]}>
                      {DAY_LABELS[date.getDay()]} · {formatDisplayDate(date)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Button title="Хаах" onPress={() => setPickerVisible(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  dateRow: {
    gap: spacing.md,
    marginBottom: spacing.xl,
    paddingRight: spacing.sm,
  },
  dateCard: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 2,
    minWidth: 88,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  dateCardUnselected: {
    backgroundColor: colors.surfaceMuted,
    borderColor: 'transparent',
  },
  dateCardSelected: {
    backgroundColor: colors.card,
    borderColor: colors.primary,
  },
  dateDay: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  dateValue: {
    ...typography.h3,
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  dateDuration: {
    ...typography.caption,
    fontSize: 12,
  },
  dateTextSelected: {
    color: colors.primary,
  },
  moreCard: {
    backgroundColor: colors.card,
    borderColor: 'transparent',
    justifyContent: 'center',
    minHeight: 96,
  },
  moreText: {
    ...typography.bodyBold,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  customDateHint: {
    ...typography.caption,
    marginBottom: spacing.lg,
    marginTop: -spacing.md,
  },
  slotsLoading: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  timeList: {
    gap: spacing.md,
  },
  timeSlot: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  timeSlotDefault: {
    borderColor: colors.border,
  },
  timeSlotUnavailable: {
    backgroundColor: colors.unavailable,
    borderColor: colors.unavailable,
  },
  timeSlotSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  timeSlotText: {
    ...typography.bodyBold,
    fontSize: 16,
  },
  timeSlotTextDisabled: {
    color: colors.textMuted,
  },
  timeSlotTextSelected: {
    color: colors.primary,
  },
  promoText: {
    color: colors.promo,
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
  },
  modalTitle: {
    ...typography.h2,
    fontSize: 18,
    marginBottom: spacing.md,
  },
  modalList: {
    marginBottom: spacing.lg,
    maxHeight: 360,
  },
  modalRow: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    paddingVertical: spacing.md,
  },
  modalRowSelected: {
    backgroundColor: colors.primaryLight,
  },
  modalRowText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  modalRowTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
