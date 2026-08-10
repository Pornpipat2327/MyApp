import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { TopHeader } from '@/components/top-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const CATEGORIES = ['Gaming', 'Wireless', 'Vintage', 'Ergonomic', 'Compact', 'Mechanical'];

const getApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3032/api/products';
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:3032/api/products`;
  }
  return 'http://localhost:3032/api/products';
};

export interface EditableProduct {
  id?: string;
  name: string;
  category?: string;
  stock?: number;
  location_text?: string;
  badge_status?: string;
  image_url?: string;
  price?: number;
  description?: string;
}

export interface AddProductScreenProps {
  existingCategories?: string[];
  product?: EditableProduct | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddScreen({ product = null, onSuccess, onCancel }: AddProductScreenProps = {}) {
  const theme = useTheme();
  const router = useRouter();
  const isEditMode = !!product;

  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product?.price !== undefined ? String(product.price) : '');
  const [stock, setStock] = useState(product?.stock !== undefined ? String(product.stock) : '10');
  const [location, setLocation] = useState(product?.location_text ?? '');
  const [imageUrl, setImageUrl] = useState(product?.image_url ?? '');
  const [description, setDescription] = useState(product?.description ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(product?.category ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const user = localStorage.getItem('user');
      if (!user) {
        router.replace('/login' as any);
      }
    }
  }, []);

  useEffect(() => {
    if (product) {
      setName(product.name ?? '');
      setPrice(product.price !== undefined ? String(product.price) : '');
      setStock(product.stock !== undefined ? String(product.stock) : '10');
      setLocation(product.location_text ?? '');
      setImageUrl(product.image_url ?? '');
      setDescription(product.description ?? '');
      setSelectedCategory(product.category ?? null);
    }
  }, [product]);

  const handleSubmit = async () => {
    // Validation: 400 Bad Request -> Missing name
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        alert('400 Bad Request: Missing product name');
      } else {
        Alert.alert('Error 400 Bad Request', 'Product name is required');
      }
      return;
    }

    setLoading(true);

    try {
      // Build product object from form state according to Slide 5, 7 & 8
      const payload = {
        name: name.trim(),
        price: parseFloat(price) || 0,
        stock: parseInt(stock, 10) || 0,
        category: selectedCategory || '',
        location_text: location.trim() || 'Store Front',
        badge_status: product?.badge_status || 'Active',
        image_url: imageUrl.trim() || null,
        description: description.trim(),
      };

      const url = isEditMode && product?.id ? `${getApiUrl()}/${product.id}` : getApiUrl();
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && (data.success || response.status === 201 || response.status === 200)) {
        const msg = isEditMode
          ? `Product updated successfully!`
          : `Product created successfully! (ID: ${data.productId || 'N/A'})`;

        if (Platform.OS === 'web') {
          alert(msg);
        } else {
          Alert.alert('Success', msg);
        }

        if (!isEditMode) {
          // Reset form on Add
          setName('');
          setPrice('');
          setStock('10');
          setLocation('');
          setImageUrl('');
          setDescription('');
          setSelectedCategory(null);
        }

        if (onSuccess) onSuccess();
      } else {
        // 400 Bad Request or 500 Server Error
        const errorMsg = data.error || data.message || (isEditMode ? 'Failed to update product' : 'Failed to add product');
        if (Platform.OS === 'web') {
          alert(`Error (${response.status}): ${errorMsg}`);
        } else {
          Alert.alert(`Error (${response.status})`, errorMsg);
        }
      }
    } catch (error: any) {
      console.error('Fetch error:', error);
      const networkErrMsg = 'Cannot connect to server. Please check DB connection or API URL.';
      if (Platform.OS === 'web') {
        alert(`500 Server Error: ${networkErrMsg}`);
      } else {
        Alert.alert('500 Server Error', networkErrMsg);
      }
    } finally {
      setLoading(false);
    }
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
            <View style={[styles.headerIconCircle, { backgroundColor: isEditMode ? '#FF9500' : '#007AFF' }]}>
              <SymbolView
                tintColor="#ffffff"
                name={{
                  ios: isEditMode ? 'pencil.circle.fill' : 'plus.circle.fill',
                  android: isEditMode ? 'edit' : 'add_circle',
                  web: isEditMode ? 'edit' : 'add_circle',
                }}
                size={28}
              />
            </View>
            <ThemedText type="subtitle" style={styles.pageTitle}>
              {isEditMode ? 'Edit Product' : 'Add Product'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.pageSubtitle}>
              {isEditMode
                ? 'Update details for this product in your catalog.'
                : 'Fill in the details below to add a new product to your catalog.'}
            </ThemedText>
          </View>

          {/* Form Card */}
          <ThemedView type="backgroundElement" style={styles.formCard}>
            {/* Product Name */}
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold" style={styles.label}>Product Name *</ThemedText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="e.g. Nova RGB Mechanical"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            {/* Price & Stock Row */}
            <View style={{ flexDirection: 'row', gap: Spacing.three }}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <ThemedText type="smallBold" style={styles.label}>Price (THB)</ThemedText>
                <TextInput
                  value={price}
                  onChangeText={setPrice}
                  placeholder="e.g. 1590.00"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="decimal-pad"
                  style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <ThemedText type="smallBold" style={styles.label}>Stock Quantity</ThemedText>
                <TextInput
                  value={stock}
                  onChangeText={setStock}
                  placeholder="e.g. 10"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="number-pad"
                  style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
                />
              </View>
            </View>

            {/* Location Text */}
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold" style={styles.label}>Location / Store</ThemedText>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="e.g. Warehouse A / Store Front"
                placeholderTextColor={theme.textSecondary}
                style={[styles.input, { color: theme.text, borderColor: theme.backgroundSelected }]}
              />
            </View>

            {/* Image URL */}
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold" style={styles.label}>Image URL</ThemedText>
              <TextInput
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://example.com/image.jpg"
                placeholderTextColor={theme.textSecondary}
                keyboardType="url"
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
              disabled={loading}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitPressed,
                loading && { opacity: 0.6 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <SymbolView
                    tintColor="#ffffff"
                    name={{ ios: 'checkmark.circle', android: 'check_circle', web: 'check_circle' }}
                    size={18}
                  />
                  <ThemedText type="smallBold" style={styles.submitText}>
                    Add Product
                  </ThemedText>
                </>
              )}
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
