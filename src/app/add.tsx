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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as ImagePicker from 'expo-image-picker';
import { TopHeader } from '@/components/top-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getProductsApiUrl, getUploadApiUrl } from '@/constants/api';

const CATEGORIES = ['Gaming', 'Wireless', 'Vintage', 'Ergonomic', 'Compact', 'Mechanical'];

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
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image_url ?? null);
  const [description, setDescription] = useState(product?.description ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(product?.category ?? null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      setImagePreview(product.image_url ?? null);
      setDescription(product.description ?? '');
      setSelectedCategory(product.category ?? null);
    }
  }, [product]);

  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      base64: true,
    });

    if (result.canceled || !result.assets || result.assets.length === 0) return;

    const asset = result.assets[0];
    setImagePreview(asset.uri);
    setUploading(true);

    try {
      const mimeType = asset.mimeType || 'image/jpeg';
      const base64Data = `data:${mimeType};base64,${asset.base64}`;

      const response = await fetch(getUploadApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Data }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.url) {
        setImageUrl(data.url);
      } else {
        const msg = data.message || 'Failed to upload image';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('Upload Failed', msg);
        setImagePreview(null);
        setImageUrl('');
      }
    } catch (err: any) {
      const msg = 'Cannot connect to server. Please check your connection.';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Upload Error', msg);
      setImagePreview(null);
      setImageUrl('');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageUrl('');
  };

  const handleSubmit = async () => {
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
      const payload = {
        name: name.trim(),
        price: parseFloat(price) || 0,
        stock: parseInt(stock, 10) || 0,
        category: selectedCategory || '',
        location_text: location.trim() || 'Store Front',
        badge_status: product?.badge_status || 'Active',
        image_url: imageUrl || null,
        description: description.trim(),
      };

      const url = isEditMode && product?.id ? `${getProductsApiUrl()}/${product.id}` : getProductsApiUrl();
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
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
          setName('');
          setPrice('');
          setStock('10');
          setLocation('');
          setImageUrl('');
          setImagePreview(null);
          setDescription('');
          setSelectedCategory(null);
        }

        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/product');
        }
      } else {
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

            {/* Image Upload */}
            <View style={styles.fieldGroup}>
              <ThemedText type="smallBold" style={styles.label}>Product Image</ThemedText>

              {imagePreview ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: imagePreview }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  {uploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="large" color="#ffffff" />
                      <ThemedText type="small" style={{ color: '#ffffff', marginTop: 8 }}>Uploading...</ThemedText>
                    </View>
                  )}
                  {!uploading && (
                    <View style={styles.imageActions}>
                      <Pressable
                        onPress={pickImage}
                        style={({ pressed }) => [styles.imageActionBtn, { backgroundColor: '#007AFF' }, pressed && styles.pressed]}
                      >
                        <SymbolView tintColor="#fff" name={{ ios: 'arrow.triangle.2.circlepath', android: 'refresh', web: 'refresh' }} size={14} />
                        <ThemedText type="small" style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Change</ThemedText>
                      </Pressable>
                      <Pressable
                        onPress={removeImage}
                        style={({ pressed }) => [styles.imageActionBtn, { backgroundColor: '#FF3B30' }, pressed && styles.pressed]}
                      >
                        <SymbolView tintColor="#fff" name={{ ios: 'trash', android: 'delete', web: 'delete' }} size={14} />
                        <ThemedText type="small" style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Remove</ThemedText>
                      </Pressable>
                    </View>
                  )}
                </View>
              ) : (
                <Pressable
                  onPress={pickImage}
                  style={({ pressed }) => [
                    styles.uploadPlaceholder,
                    { borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundSelected + '40' },
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.uploadIcon, { backgroundColor: '#007AFF18' }]}>
                    <SymbolView tintColor="#007AFF" name={{ ios: 'photo.badge.plus', android: 'add_photo_alternate', web: 'add_photo_alternate' }} size={28} />
                  </View>
                  <ThemedText type="smallBold" style={{ color: '#007AFF', fontSize: 14 }}>เลือกรูปภาพ</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
                    Tap to browse your photo library
                  </ThemedText>
                </Pressable>
              )}
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
              disabled={loading || uploading}
              style={({ pressed }) => [
                styles.submitButton,
                pressed && styles.submitPressed,
                (loading || uploading) && { opacity: 0.6 },
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
                    {isEditMode ? 'Update Product' : 'Add Product'}
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
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollView: { flex: 1 },
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
  pageTitle: { fontSize: 28, fontWeight: '800' },
  pageSubtitle: { textAlign: 'center', maxWidth: 400 },
  formCard: {
    width: '100%',
    maxWidth: MaxContentWidth,
    marginHorizontal: Spacing.four,
    borderRadius: Spacing.four,
    padding: Spacing.four,
    gap: Spacing.four,
    ...Platform.select({
      web: { width: `calc(100% - ${Spacing.four * 2}px)` },
    }),
  },
  fieldGroup: { gap: Spacing.two },
  label: { fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.8 },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    fontSize: 15,
    ...Platform.select({ web: { outlineStyle: 'none' } }),
  },
  textArea: { minHeight: 100, paddingTop: Spacing.two + 4 },
  // ── Image Upload ──
  uploadPlaceholder: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.five,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  uploadIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  imagePreviewContainer: {
    borderRadius: Spacing.three,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    padding: Spacing.two,
  },
  imageActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  chip: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one + 2,
    borderRadius: Spacing.five,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  pressed: { opacity: 0.7 },
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
  submitPressed: { opacity: 0.85 },
  submitText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
});

