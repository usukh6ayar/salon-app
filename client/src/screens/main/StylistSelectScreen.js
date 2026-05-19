import { StyleSheet, Text, View } from 'react-native';

export default function StylistSelectScreen() {
  return (
    <View style={styles.container}>
      <Text>Stylist Select Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});
