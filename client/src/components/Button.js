import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

import { colors, spacing } from '../theme';

export default function Button({
  title,
  label,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  style,
}) {
  const text = label ?? title;
  const isOutline = variant === 'outline';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={[
        styles.button,
        isOutline && styles.buttonOutline,
        isDisabled && !isOutline && styles.buttonDisabled,
        isDisabled && isOutline && styles.buttonOutlineDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : colors.white} />
      ) : (
        <Text
          style={[
            styles.label,
            isOutline && styles.labelOutline,
            isDisabled && !isOutline && styles.labelDisabled,
          ]}
        >
          {text}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.lg,
    width: '100%',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  buttonDisabled: {
    backgroundColor: colors.disabled,
  },
  buttonOutlineDisabled: {
    opacity: 0.6,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  labelOutline: {
    color: colors.primary,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
});
