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
        <Ionicons name="chevron-back" size={24} color={colors.black} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    backgroundColor: colors.white,
    flexDirection: 'row',
    height: 52,
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    alignItems: 'center',
    height: 40,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 40,
  },
  title: {
    ...typography.h3,
    color: colors.black,
    flex: 1,
  },
});
