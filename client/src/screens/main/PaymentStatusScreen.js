import { StyleSheet, Text, View } from 'react-native';

export default function PaymentStatusScreen() {
  return (
    <View style={styles.container}>
      <Text>Payment Status Screen</Text>
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
