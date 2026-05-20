import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import apiClient from '../../api/client';
import { Button } from '../../components';
import { colors, spacing } from '../../theme';

const BG_IMAGE =
  'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&q=80';

export default function RegisterScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setError('Бүх талбарыг бөглөнө үү');
      return;
    }

    setLoading(true);
    try {
      const { data } = await apiClient.post('/api/auth/register', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });
      if (!data?.token || !data?.user) {
        setError('Серверийн хариу буруу байна');
        return;
      }
      navigation.navigate('OTP', {
        phone: phone.trim(),
        user: data.user,
        token: data.token,
      });
    } catch (err) {
      let message = 'Бүртгэл үүсгэхэд алдаа гарлаа. Дахин оролдоно уу';
      if (err.response?.data?.error) message = err.response.data.error;
      else if (err.message === 'Network Error')
        message = 'Серверт холбогдож чадсангүй. Wi‑Fi шалгана уу';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      {/* Background photo */}
      <Image
        source={{ uri: BG_IMAGE }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      {/* Dark overlay */}
      <View style={[StyleSheet.absoluteFillObject, styles.overlay]} />

      {/* Title text above card */}
      <View style={[styles.titleArea, { paddingTop: insets.top + 48 }]}>
        <Text style={styles.imageTitle}>
          Төгс дүр төрхөө хэдхэн минутын дотор захиалаарай!
        </Text>
      </View>

      {/* Bottom card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.card}
          contentContainerStyle={[
            styles.cardContent,
            { paddingBottom: Math.max(insets.bottom + spacing.xl, 40) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Нэр"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="words"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Имэйл хаяг"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Утасны дугаар"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Нууц үг"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            editable={!loading}
          />

          <Button
            title="Үргэлжлүүлэх"
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
            style={styles.submitBtn}
          />

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Эсвэл</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable style={styles.socialBtn} disabled={loading}>
            <Ionicons name="logo-apple" size={20} color={colors.black} />
            <Text style={styles.socialBtnText}>Apple ID-р үргэлжлүүлэх</Text>
          </Pressable>

          <Pressable style={styles.socialBtn} disabled={loading}>
            <Text style={styles.googleG}>G</Text>
            <Text style={styles.socialBtnText}>Google-р үргэлжлүүлэх</Text>
          </Pressable>

          <Pressable
            style={styles.linkBtn}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
          >
            <Text style={styles.linkText}>Нэвтрэх</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: '#000',
    flex: 1,
  },
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.50)',
  },
  titleArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  imageTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 33,
  },
  card: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  input: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 12,
    color: colors.textPrimary,
    fontSize: 15,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  submitBtn: {
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 14,
    marginHorizontal: spacing.md,
  },
  socialBtn: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    marginBottom: spacing.md,
    paddingVertical: 14,
  },
  socialBtnText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  googleG: {
    color: '#4285F4',
    fontSize: 18,
    fontWeight: '700',
  },
  linkBtn: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  linkText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
