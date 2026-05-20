import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '../../api/client';
import { Button, Header, ModalCard, RadioOption, ScreenFooter } from '../../components';
import useBookingStore from '../../store/bookingStore';
import { colors, shadows, spacing, typography } from '../../theme';

const METHOD_CARD = 'card';
const METHOD_APPLE = 'applepay';
const METHOD_GOOGLE = 'googlepay';

function detectBrand(number) {
  const digits = number.replace(/\D/g, '');
  if (digits.startsWith('4')) return 'visa';
  if (digits.startsWith('5')) return 'mastercard';
  return 'visa';
}

function parseExpiry(expiry) {
  const [month, year] = expiry.split('/').map((part) => part.trim());
  return {
    exp_month: Number(month) || 1,
    exp_year: Number(year) < 100 ? 2000 + Number(year) : Number(year) || 2030,
  };
}

function isCardFormValid(cardForm) {
  return (
    cardForm.number.replace(/\D/g, '').length >= 4 &&
    cardForm.expiry.trim().length > 0 &&
    cardForm.cvc.trim().length > 0 &&
    cardForm.name.trim().length > 0
  );
}

function VisaLogo() {
  return (
    <View style={styles.visaLogo}>
      <Text style={styles.visaLogoText}>VISA</Text>
    </View>
  );
}

function MastercardLogo() {
  return (
    <View style={styles.mastercardLogo}>
      <View style={[styles.mcCircle, styles.mcCircleRed]} />
      <View style={[styles.mcCircle, styles.mcCircleOrange]} />
    </View>
  );
}

function CardBrandLogo({ brand }) {
  if (brand === 'mastercard') return <MastercardLogo />;
  return <VisaLogo />;
}

function ApplePayBadge() {
  return (
    <View style={styles.applePayBadge}>
      <Ionicons name="logo-apple" size={16} color={colors.white} />
      <Text style={styles.applePayText}>Pay</Text>
    </View>
  );
}

function GooglePayBadge() {
  return (
    <View style={styles.googlePayBadge}>
      <Text style={styles.googlePayG}>G</Text>
      <Text style={styles.googlePayLabel}>Pay</Text>
    </View>
  );
}

export default function PaymentScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const totalAmount = route.params?.totalAmount ?? 0;

  const selectedSalon = useBookingStore((s) => s.selectedSalon);
  const selectedStylist = useBookingStore((s) => s.selectedStylist);
  const selectedService = useBookingStore((s) => s.selectedService);
  const selectedServices = useBookingStore((s) => s.selectedServices);
  const selectedDate = useBookingStore((s) => s.selectedDate);
  const selectedTime = useBookingStore((s) => s.selectedTime);
  const clearBooking = useBookingStore((s) => s.clearBooking);

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [savedCards, setSavedCards] = useState([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [savingCard, setSavingCard] = useState(false);
  const [completedBooking, setCompletedBooking] = useState(null);
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: '',
  });

  const serviceId = useMemo(() => {
    if (selectedServices?.length > 0) return selectedServices[0].id;
    return selectedService?.id ?? null;
  }, [selectedService, selectedServices]);

  const loadCards = useCallback(async () => {
    setLoadingCards(true);
    try {
      const { data } = await apiClient.get('/api/payments/cards');
      const cards = Array.isArray(data) ? data : [];
      setSavedCards(cards);
      if (cards.length > 0) {
        setSelectedCardId((prev) => prev ?? cards[0].id);
      }
    } catch {
      setSavedCards([]);
    } finally {
      setLoadingCards(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const isMethodReady = useMemo(() => {
    if (selectedMethod === METHOD_CARD) return selectedCardId != null;
    if (selectedMethod === METHOD_APPLE || selectedMethod === METHOD_GOOGLE) return true;
    return false;
  }, [selectedCardId, selectedMethod]);

  const openAddCardForm = () => {
    setSelectedMethod(METHOD_CARD);
    setShowAddCardForm(true);
  };

  const closeAddCardForm = () => {
    setShowAddCardForm(false);
    setCardForm({ number: '', expiry: '', cvc: '', name: '' });
  };

  const selectCardMethod = () => {
    setSelectedMethod(METHOD_CARD);
    setShowAddCardForm(false);
    if (savedCards.length > 0) {
      setSelectedCardId((prev) => prev ?? savedCards[0].id);
    }
  };

  const handleSaveCard = async () => {
    if (!isCardFormValid(cardForm)) return;

    const digits = cardForm.number.replace(/\D/g, '');
    setSavingCard(true);

    try {
      const { exp_month, exp_year } = parseExpiry(cardForm.expiry);
      const { data } = await apiClient.post('/api/payments/cards', {
        last4: digits.slice(-4),
        brand: detectBrand(digits),
        exp_month,
        exp_year,
      });
      await loadCards();
      setSelectedCardId(data.id);
      setSelectedMethod(METHOD_CARD);
      closeAddCardForm();
    } finally {
      setSavingCard(false);
    }
  };

  const handlePay = async () => {
    if (showAddCardForm) {
      await handleSaveCard();
      return;
    }

    if (!isMethodReady || !selectedSalon?.id || !serviceId || !selectedDate || !selectedTime) {
      return;
    }

    setShowLoadingModal(true);

    try {
      const { data: booking } = await apiClient.post('/api/bookings', {
        salon_id: selectedSalon.id,
        stylist_id: selectedStylist?.id ?? null,
        service_id: serviceId,
        booking_date: selectedDate,
        booking_time: selectedTime,
        total_price: totalAmount,
      });

      const { data: paymentResult } = await apiClient.post('/api/payments', {
        booking_id: booking.id,
        amount: totalAmount,
        method: selectedMethod,
      });

      setShowLoadingModal(false);

      if (paymentResult.success === true) {
        setCompletedBooking(booking);
        setShowSuccessModal(true);
      } else {
        setShowFailedModal(true);
      }
    } catch {
      setShowLoadingModal(false);
      setShowFailedModal(true);
    }
  };

  const handleViewReceipt = () => {
    setShowSuccessModal(false);
    setShowLoadingModal(false);
    setShowFailedModal(false);

    navigation.replace('Receipt', {
      booking: completedBooking,
      totalAmount,
    });
  };

  const handleGoHome = () => {
    setShowSuccessModal(false);
    clearBooking();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const bottomTitle = showAddCardForm ? 'Картыг хадгалах' : 'Төлбөр хийх';
  const bottomDisabled = showAddCardForm
    ? savingCard || !isCardFormValid(cardForm)
    : !isMethodReady;

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.white }}>
      <Header title="Төлбөрийн аргыг сонгох" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable style={[styles.methodCard, shadows.card]} onPress={selectCardMethod}>
          <RadioOption
            label="Credit/ Debit Card"
            selected={selectedMethod === METHOD_CARD}
            onPress={selectCardMethod}
          />

          {selectedMethod === METHOD_CARD ? (
            <View style={styles.cardExpanded}>
              {loadingCards ? (
                <ActivityIndicator color={colors.primary} style={styles.cardsLoader} />
              ) : (
                savedCards.map((card) => (
                  <Pressable
                    key={card.id}
                    style={styles.savedCardRow}
                    onPress={() => setSelectedCardId(card.id)}
                  >
                    <CardBrandLogo brand={card.brand} />
                    <Text style={styles.savedCardNumber}>**** {card.last4}</Text>
                    <View style={[styles.radioOuter, selectedCardId === card.id && styles.radioOuterSelected]}>
                      {selectedCardId === card.id ? <View style={styles.radioInner} /> : null}
                    </View>
                  </Pressable>
                ))
              )}

              {!showAddCardForm ? (
                <Pressable onPress={openAddCardForm}>
                  <Text style={styles.addCardLink}>+ Add Card</Text>
                </Pressable>
              ) : (
                <View style={styles.addCardForm}>
                  <View style={styles.addCardHeader}>
                    <Text style={styles.addCardTitle}>Карт нэмэх</Text>
                    <Pressable onPress={closeAddCardForm} hitSlop={8}>
                      <Ionicons name="close" size={22} color={colors.textPrimary} />
                    </Pressable>
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Картын дугаар"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={cardForm.number}
                    onChangeText={(number) => setCardForm((prev) => ({ ...prev, number }))}
                  />

                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, styles.inputHalf]}
                      placeholder="MM/YY"
                      placeholderTextColor={colors.textMuted}
                      value={cardForm.expiry}
                      onChangeText={(expiry) => setCardForm((prev) => ({ ...prev, expiry }))}
                    />
                    <TextInput
                      style={[styles.input, styles.inputHalf]}
                      placeholder="CVC"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="number-pad"
                      secureTextEntry
                      value={cardForm.cvc}
                      onChangeText={(cvc) => setCardForm((prev) => ({ ...prev, cvc }))}
                    />
                  </View>

                  <TextInput
                    style={styles.input}
                    placeholder="Карт эзэмшигчийн нэр"
                    placeholderTextColor={colors.textMuted}
                    value={cardForm.name}
                    onChangeText={(name) => setCardForm((prev) => ({ ...prev, name }))}
                  />
                </View>
              )}
            </View>
          ) : null}
        </Pressable>

        <RadioOption
          label="Apple Pay"
          selected={selectedMethod === METHOD_APPLE}
          onPress={() => {
            setSelectedMethod(METHOD_APPLE);
            setShowAddCardForm(false);
          }}
          rightElement={<ApplePayBadge />}
          style={[styles.methodCard, shadows.card]}
        />

        <RadioOption
          label="Google Pay"
          selected={selectedMethod === METHOD_GOOGLE}
          onPress={() => {
            setSelectedMethod(METHOD_GOOGLE);
            setShowAddCardForm(false);
          }}
          rightElement={<GooglePayBadge />}
          style={[styles.methodCard, shadows.card]}
        />
      </ScrollView>

      <ScreenFooter>
        <Button title={bottomTitle} onPress={handlePay} disabled={bottomDisabled} />
      </ScreenFooter>

      <ModalCard visible={showLoadingModal}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.modalTitle}>Таны төлбөрийг боловсруулж байна...</Text>
        <Text style={styles.modalSubtitle}>
          Бид таны гүйлгээг дүүрсэх хүртэл хүлээнэ үү.
        </Text>
      </ModalCard>

      <ModalCard visible={showSuccessModal}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark" size={28} color={colors.white} />
        </View>
        <Text style={styles.modalTitle}>Таны салоны захиалга баталгаажлаа!</Text>
        <Text style={styles.modalSubtitle}>
          Төлбөрөө төлсөнд баярлалаа. Бид тантай удахгүй уулзахыг тэсэн ядан хүлээж байна.
        </Text>
        <Button label="Баримтыг үзэх" onPress={handleViewReceipt} />
        <Button label="Нүүр хуудас" variant="outline" onPress={handleGoHome} />
      </ModalCard>

      <ModalCard visible={showFailedModal}>
        <View style={styles.failedIcon}>
          <Ionicons name="close" size={28} color={colors.white} />
        </View>
        <Text style={styles.modalTitle}>Төлбөр амжилтгүй боллоо</Text>
        <Text style={styles.modalSubtitle}>
          Бид таны төлбөрийг боловсруулж чадсангүй. Картын дэлгэрэнгүй мэдээллийг
          шалгах эсвэл өөр төлбөрийн хэрэгслээр оролдоно уу.
        </Text>
        <Button label="Дахин оролдох" onPress={() => setShowFailedModal(false)} />
        <Button
          label="Төлбөрийн аргыг өөрчлөх"
          variant="outline"
          onPress={() => setShowFailedModal(false)}
        />
      </ModalCard>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  methodCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  cardExpanded: {
    marginTop: spacing.lg,
  },
  cardsLoader: {
    marginVertical: spacing.md,
  },
  savedCardRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  savedCardNumber: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
    marginLeft: spacing.md,
  },
  radioOuter: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 11,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  addCardLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  addCardForm: {
    marginTop: spacing.sm,
  },
  addCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  addCardTitle: {
    ...typography.h3,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 10,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputHalf: {
    flex: 1,
  },
  visaLogo: {
    backgroundColor: colors.textPrimary,
    borderRadius: 4,
    height: 28,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    width: 44,
  },
  visaLogoText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  mastercardLogo: {
    height: 28,
    justifyContent: 'center',
    width: 44,
  },
  mcCircle: {
    borderRadius: 10,
    height: 20,
    position: 'absolute',
    width: 20,
  },
  mcCircleRed: {
    backgroundColor: colors.favorite,
    left: 4,
  },
  mcCircleOrange: {
    backgroundColor: colors.gold,
    left: 18,
  },
  applePayBadge: {
    alignItems: 'center',
    backgroundColor: colors.textPrimary,
    borderRadius: 6,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  applePayText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  googlePayBadge: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  googlePayG: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  googlePayLabel: {
    ...typography.bodyBold,
    fontSize: 13,
  },
  modalTitle: {
    ...typography.h3,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.body,
    textAlign: 'center',
  },
  successIcon: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  failedIcon: {
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
});
