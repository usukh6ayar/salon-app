import { StyleSheet, Text, View } from 'react-native';

export default function PaymentScreen() {
  return (
    <View style={styles.container}>
      <Text>Payment Screen</Text>
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
