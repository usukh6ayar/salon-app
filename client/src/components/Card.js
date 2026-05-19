import { Pressable, StyleSheet, View } from 'react-native';

import { colors, shadows, spacing } from '../theme';

export default function Card({
  children,
  onPress,
  selected = false,
  style,
  contentStyle,
}) {
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper
      style={[
        styles.card,
        selected && styles.cardSelected,
        style,
      ]}
      onPress={onPress}
    >
      <View style={[styles.inner, contentStyle]}>{children}</View>
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: 'transparent',
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardSelected: {
    borderColor: colors.primary,
  },
  inner: {
    padding: spacing.lg,
  },
});
