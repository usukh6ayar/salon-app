import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button, Header, ScreenFooter } from '../../components';
import useBookingStore from '../../store/bookingStore';
import { colors, spacing, typography } from '../../theme';

export default function PaymentStatusScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const clearBooking = useBookingStore((s) => s.clearBooking);

  const success = route.params?.success ?? false;
  const booking = route.params?.booking ?? null;
  const totalAmount = route.params?.totalAmount ?? booking?.total_price ?? 0;
  const errorMessage = route.params?.error ?? 'Захиалга үүсгэхэд алдаа гарлаа';

  const handleViewReceipt = () => {
    navigation.replace('Receipt', {
      booking,
      totalAmount,
    });
  };

  const handleGoHome = () => {
    clearBooking();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.white }}>
      <Header title={success ? 'Амжилттай' : 'Алдаа'} />

      <View style={styles.content}>
        {success ? (
          <>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color={colors.white} />
            </View>
            <Text style={styles.title}>Захиалга амжилттай бүртгэгдлээ!</Text>
            <Text style={styles.subtitle}>
              Та салон дээр ирж үйлчилгээгээ авна уу. Төлбөрөө салон дээр төлнө.
            </Text>
            {booking?.id ? (
              <Text style={styles.bookingId}>Захиалгын дугаар: #{booking.id}</Text>
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.failedIcon}>
              <Ionicons name="close" size={40} color={colors.white} />
            </View>
            <Text style={styles.title}>Алдаа гарлаа</Text>
            <Text style={styles.subtitle}>{errorMessage}</Text>
          </>
        )}
      </View>

      <ScreenFooter style={styles.footerStack}>
        {success ? (
          <>
            <Button title="Баримтыг үзэх" onPress={handleViewReceipt} />
            <Button title="Нүүр хуудас" variant="outline" onPress={handleGoHome} />
          </>
        ) : (
          <Button title="Буцах" onPress={handleGoBack} />
        )}
      </ScreenFooter>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  successIcon: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: 80,
  },
  failedIcon: {
    alignItems: 'center',
    backgroundColor: colors.error,
    borderRadius: 40,
    height: 80,
    justifyContent: 'center',
    marginBottom: spacing.xl,
    width: 80,
  },
  title: {
    ...typography.h2,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  bookingId: {
    ...typography.bodyBold,
    color: colors.primary,
    textAlign: 'center',
  },
  footerStack: {
    gap: spacing.md,
  },
});
