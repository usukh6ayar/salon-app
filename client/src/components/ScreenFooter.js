import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors, spacing } from "../theme";

export default function ScreenFooter({ children, absolute = false, style }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.footer,
        absolute && styles.footerAbsolute,
        { paddingBottom: Math.max(insets.bottom, spacing.lg) },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  footerAbsolute: {
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
  },
});
