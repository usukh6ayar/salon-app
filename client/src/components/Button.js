import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing, typography } from '../theme';

export default function Button({ title, onPress, disabled = false, style }) {
  return (
    <Pressable
      style={[styles.button, disabled && styles.buttonDisabled, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: spacing.lg,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  label: {
    ...typography.button,
  },
  labelDisabled: {
    color: colors.white,
  },
});
