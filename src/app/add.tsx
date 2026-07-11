import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { TopHeader } from '@/components/top-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CATEGORIES = ['Gaming', 'Wireless', 'Vintage', 'Ergonomic', 'Compact', 'Mechanical'];

export default function AddScreen() {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSubmit = () => {
    // TODO: implement product submission
    alert(`Product "${name}" added!`);
    setName('');
    setPrice('');
    setCategory('');
    setDescription('');
    setSelectedCategory(null);
  };

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Page Header */}
          <View style={styles.pageHeader}>
            <View style={[styles.headerIconCircle, { backgroundColor: '#007AFF' }]}>
              <SymbolView
                tintColor="#ffffff"
                name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }}
                size={28}
              />
            </View>
            <ThemedText type="subtitle" style={styles.pageTitle}>
              Add Product
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.pageSubtitle}>
              Fill in the details below to add a new product to your catalog.
            </ThemedText>
          </View>

          {/* Form Card */}
          <ThemedView type="backgroundElement" style={styles.formCard}>
            {/* Product Name */}
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold" style={styles.label}>Product Name</ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Nova RGB Mechanical"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            {/* Price */}
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold" style={styles.label}>Price (USD)</ThemedText>
              <TextInput
                value={price}
                onChangeText={setPrice}
                placeholder="e.g. 159.00"
                placeholderTextColor={theme.textSecondary}
                keyboardType="decimal-pad"
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            {/* Category Picker */}
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold" style={styles.label}>Category</ThemedText>
              <View style={styles.categoryChips}>
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat}
                    onPress={() => setSelectedCategory(cat)}
                    style={({ pressed }) => [
                      styles.chip,
                      {
                        backgroundColor: selectedCategory === cat ? '#007AFF' : theme.backgroundSelected,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <ThemedText
                      type="small"
                      style={[
                        styles.chipText,
                        { color: selectedCategory === cat ? '#ffffff' : theme.text },
                      ]}
                    >
                      {cat}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Description */}
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold" style={styles.label}>Description</ThemedText>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your product..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={[
                  styles.input,
                  styles.textArea,
                  { color: theme.text, borderColor: theme.backgroundSelected },
                ]}
              />
            </View>

            {/* Submit Button */}
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [styles.submitButton, pressed && styles.submitPressed]}
            >
              <SymbolView
                tintColor="#ffffff"
                name={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }}
                size={18}
              />
              <ThemedText type="smallBold" style={styles.submitText}>
                Add Product
              </ThemedText>
            </Pressable>
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: BottomTabInset + Spacing.four,
  },
  pageHeader: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  headerIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  pageSubtitle: {
    textAlign: 'center',
    maxWidth: 400,
  },
  formCard: {
    width: '100%',
    maxWidth: MaxContentWidth,
    marginHorizontal: Spacing.four,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.four,
    ...Platform.select({
      web: {
        width: `calc(100% - ${Spacing.four * 2}px)`,
      },
    }),
  },
  fieldGroup: {
    gap: Spacing.two,
  },
  label: {
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    fontSize: 15,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.two + 4,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: Spacing.five,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  submitPressed: {
    opacity: 0.85,
  },
  submitText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});
