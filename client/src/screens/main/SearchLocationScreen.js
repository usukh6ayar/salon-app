import { StyleSheet, Text, View } from 'react-native';

export default function SearchLocationScreen() {
  return (
    <View style={styles.container}>
      <Text>Search Location Screen</Text>
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
