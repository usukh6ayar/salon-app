import { StyleSheet, Text, View } from 'react-native';

export default function DateTimeScreen() {
  return (
    <View style={styles.container}>
      <Text>Date Time Screen</Text>
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
