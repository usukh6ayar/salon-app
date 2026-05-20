import { Modal, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../theme';

export default function ModalCard({ visible, children }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  card: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 20,
    gap: spacing.md,
    padding: spacing.xxl,
    width: '100%',
  },
});
