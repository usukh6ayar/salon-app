import { useEffect } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function OnboardingScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Login'), 2000);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2B61F5" />
      <Text style={styles.logo}>Beauty Corner</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#2B61F5',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
