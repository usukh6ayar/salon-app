import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Header } from '../../components';
import { colors, spacing, typography } from '../../theme';

const INITIAL_RECENT = [
  { id: '1', city: 'Дархан', label: 'Дархан, Монгол' },
  { id: '2', city: 'Улаанбаатар', label: 'Улаанбаатар, Монгол' },
];

export default function SearchLocationScreen() {
  const navigation = useNavigation();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState(INITIAL_RECENT);

  const removeRecent = (id) => setRecent((prev) => prev.filter((item) => item.id !== id));

  const handleSelect = () => navigation.goBack();

  const filtered = query.trim()
    ? recent.filter((item) =>
        item.city.toLowerCase().includes(query.toLowerCase()),
      )
    : recent;

  return (
    <SafeAreaView edges={['top']} style={styles.root}>
      <Header title="Байршил хайх" />

      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search input */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Хайг эсвэл хотын нэрийг оруулна уу"
            placeholderTextColor={colors.textMuted}
            autoFocus={false}
            returnKeyType="search"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>

        {filtered.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Recent Locations</Text>
            {filtered.map((item) => (
              <Pressable
                key={item.id}
                style={styles.locationRow}
                onPress={handleSelect}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={colors.textMuted}
                />
                <View style={styles.locationText}>
                  <Text style={styles.cityName}>{item.city}</Text>
                  <Text style={styles.cityLabel}>{item.label}</Text>
                </View>
                <Pressable
                  onPress={() => removeRecent(item.id)}
                  hitSlop={12}
                >
                  <Ionicons name="close" size={18} color={colors.textMuted} />
                </Pressable>
              </Pressable>
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Дээрх байршил эсвэл хотын нэрийг оруулаад эхэл.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.white,
    flex: 1,
  },
  content: {
    paddingBottom: 40,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  searchInput: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 15,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  locationRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  locationText: {
    flex: 1,
  },
  cityName: {
    ...typography.bodyBold,
    marginBottom: 2,
  },
  cityLabel: {
    ...typography.caption,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    ...typography.body,
    textAlign: 'center',
  },
});
