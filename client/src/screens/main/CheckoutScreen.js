import { StyleSheet, Text, View } from 'react-native';

export default function CheckoutScreen() {
  return (
    <View style={styles.container}>
      <Text>Checkout Screen</Text>
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
