import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, typography } from '../theme';

export default function Header({ title, onBack }) {
  const navigation = useNavigation();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    navigation.goBack();
  };

  return (
    <View style={styles.header}>
      <Pressable style={styles.backBtn} onPress={handleBack} hitSlop={8}>
        <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.card,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 40,
  },
  title: {
    ...typography.h2,
    flex: 1,
    fontSize: 18,
  },
});
