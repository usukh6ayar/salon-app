import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, typography } from '../../theme';

export default function FavoritesScreen() {
  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Дуртай</Text>
      </View>
      <View style={styles.empty}>
        <Ionicons name="heart-outline" size={56} color={colors.border} />
        <Text style={styles.emptyTitle}>Дуртай салон байхгүй</Text>
        <Text style={styles.emptySubtitle}>
          Танд таалагдсан салонуудыг энд хадгалж болно
        </Text>
      </View>
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
  empty: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
  },
});
