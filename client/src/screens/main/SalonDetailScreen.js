import { StyleSheet, Text, View } from 'react-native';

export default function SalonDetailScreen() {
  return (
    <View style={styles.container}>
      <Text>Salon Detail Screen</Text>
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
