import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../../components';
import useAuthStore from '../../store/authStore';
import { colors, spacing, typography } from '../../theme';

const MENU_ITEMS = [
  { icon: 'person-outline', label: 'Профайл засах' },
  { icon: 'notifications-outline', label: 'Мэдэгдэл' },
  { icon: 'lock-closed-outline', label: 'Нууц үг солих' },
  { icon: 'help-circle-outline', label: 'Тусламж' },
];

export default function ProfileScreen() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={36} color={colors.white} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || '—'}</Text>
            <Text style={styles.userDetail}>{user?.email || '—'}</Text>
            {user?.phone ? (
              <Text style={styles.userDetail}>{user.phone}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item) => (
            <Pressable key={item.label} style={styles.menuRow}>
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <View style={styles.logoutSection}>
          <Button title="Гарах" variant="outline" onPress={logout} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.white,
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  userName: {
    ...typography.h3,
    fontSize: 18,
    marginBottom: spacing.xs,
  },
  userDetail: {
    ...typography.body,
    marginTop: 2,
  },
  menuSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  menuRow: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  menuIconWrap: {
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    height: 38,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 38,
  },
  menuLabel: {
    ...typography.body,
    flex: 1,
  },
  logoutSection: {
    marginTop: spacing.sm,
  },
});
