import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components';
import useAuthStore from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';

export default function OTPScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const phone = route.params?.phone ?? '';
  const user = route.params?.user ?? null;
  const token = route.params?.token ?? null;

  const login = useAuthStore((state) => state.login);

  const [digits, setDigits] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleDigit = (value, index) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const allFilled = digits.every((d) => d.length === 1);

  const handleSubmit = async () => {
    if (!allFilled || loading) return;
    setLoading(true);
    try {
      if (user && token) {
        await login(user, token);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <Text style={styles.title}>Баталгаажуулах</Text>
        <Text style={styles.subtitle}>
          Бид {phone || 'XXXXXX'} дугаарт 4 оронтой код илгээлээ. Доор оруулна уу.
        </Text>

        <View style={styles.boxRow}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[styles.box, digit ? styles.boxFilled : null]}
              value={digit}
              onChangeText={(v) => handleDigit(v, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        <Pressable style={styles.resendBtn}>
          <Text style={styles.resendText}>
            Код хүлээж авсангүй уу?{'  '}
            <Text style={styles.resendLink}>Дахин илгээх</Text>
          </Text>
        </Pressable>

        <Button
          title="Үргэлжлүүлэх"
          onPress={handleSubmit}
          disabled={!allFilled}
          loading={loading}
          style={styles.submitBtn}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.white,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: 40,
  },
  title: {
    ...typography.h1,
    fontSize: 26,
    marginBottom: spacing.md,
  },
  subtitle: {
    ...typography.body,
    lineHeight: 22,
    marginBottom: 40,
  },
  boxRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  box: {
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1.5,
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    height: 56,
    width: 56,
  },
  boxFilled: {
    borderColor: colors.primary,
  },
  resendBtn: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: spacing.sm,
  },
  resendText: {
    ...typography.body,
  },
  resendLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  submitBtn: {},
});
