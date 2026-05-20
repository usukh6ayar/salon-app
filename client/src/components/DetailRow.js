import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

export default function DetailRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
    marginRight: spacing.md,
  },
  value: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    textAlign: 'right',
  },
});
