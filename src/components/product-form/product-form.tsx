/**
 * @file product-form.tsx
 * @description คอมโพเนนต์ฟอร์มสำหรับสร้างสินค้าใหม่และแก้ไขสินค้าเดิม (Shared Product Form)
 * ใช้ร่วมกันระหว่างหน้า add.tsx และ edit.tsx เพื่อลดโค้ดซ้ำซ้อน
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SymbolView } from 'expo-symbols';
import * as ImagePicker from 'expo-image-picker';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StarRating } from '@/components/star-rating';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getUploadApiUrl } from '@/constants/api';
import { ProductFormData } from '@/types/product';
import { CATEGORY_NAMES } from '@/constants/categories';

interface ProductFormProps {
  initialData?: ProductFormData | null;
  isEditMode?: boolean;
  onSubmit: (formData: ProductFormData) => Promise<void>;
  onCancel?: () => void;
  loading: boolean;
}

export function ProductForm({
  initialData,
  isEditMode = false,
  onSubmit,
  onCancel,
  loading,
}: ProductFormProps) {
  const theme = useTheme();

  const getInitialLoc = () => initialData?.location_text ?? (initialData as any)?.location ?? '';
  const getInitialImg = () => initialData?.image_url ?? (initialData as any)?.image ?? '';

  // สถานะข้อมูลฟอร์ม
  const [name, setName] = useState(initialData?.name ?? '');
  const [price, setPrice] = useState(
    initialData?.price !== undefined && initialData?.price !== null ? String(initialData.price) : ''
  );
  const [stock, setStock] = useState(
    initialData?.stock !== undefined && initialData?.stock !== null ? String(initialData.stock) : '10'
  );
  const [location, setLocation] = useState(getInitialLoc());
  const [imageUrl, setImageUrl] = useState(getInitialImg());
  const [imagePreview, setImagePreview] = useState<string | null>(getInitialImg() || null);
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialData?.category ?? 'Gaming'
  );
  const [rating, setRating] = useState<number>(
    initialData?.rating !== undefined && initialData?.rating !== null ? Number(initialData.rating) : 5
  );

  // อัปเดตข้อมูลฟอร์มทันทีเมื่อ initialData มีการเปลี่ยนแปลง (เช่น โหลดเสร็จจาก API หรือเปลี่ยนสินค้า)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name ?? '');
      setPrice(
        initialData.price !== undefined && initialData.price !== null ? String(initialData.price) : ''
      );
      setStock(
        initialData.stock !== undefined && initialData.stock !== null ? String(initialData.stock) : '10'
      );
      const loc = initialData.location_text ?? (initialData as any)?.location ?? '';
      setLocation(loc);
      const img = initialData.image_url ?? (initialData as any)?.image ?? '';
      setImageUrl(img);
      setImagePreview(img || null);
      setDescription(initialData.description ?? '');
      setSelectedCategory(initialData.category ?? 'Gaming');
      setRating(
        initialData.rating !== undefined && initialData.rating !== null ? Number(initialData.rating) : 5
      );
      setErrorMsg(null);
    }
  }, [initialData]);

  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  /**
   * ฟังก์ชันเลือกและอัปโหลดรูปภาพ
   */
  const handlePickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'กรุณาอนุญาตให้เข้าถึงรูปภาพในเครื่อง');
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
        const msg = data.message || 'อัปโหลดรูปภาพไม่สำเร็จ';
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert('ข้อผิดพลาด', msg);
      }
    } catch {
      const msg = 'ไม่สามารถติดต่อเซิร์ฟเวอร์อัปโหลดรูปภาพได้';
      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('ข้อผิดพลาด', msg);
    } finally {
      setUploading(false);
    }
  };

  /**
   * ฟังก์ชันตรวจสอบและส่งข้อมูลฟอร์ม
   */
  const handleSubmit = async () => {
    if (!name.trim()) {
      setErrorMsg('กรุณากรอกชื่อสินค้า');
      return;
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      setErrorMsg('กรุณากรอกราคาที่ถูกต้อง (ต้องเป็นตัวเลข >= 0)');
      return;
    }

    const numericStock = parseInt(stock, 10);
    if (isNaN(numericStock) || numericStock < 0) {
      setErrorMsg('กรุณากรอกจำนวนสต็อกที่ถูกต้อง (ต้องเป็นจำนวนเต็ม >= 0)');
      return;
    }

    setErrorMsg(null);

    await onSubmit({
      id: initialData?.id,
      name: name.trim(),
      category: selectedCategory || 'General',
      price: numericPrice,
      stock: numericStock,
      location_text: location.trim(),
      image_url: imageUrl.trim(),
      description: description.trim(),
      rating,
    });
  };

  return (
    <View style={styles.formContainer}>
      {errorMsg && (
        <View style={styles.errorBanner}>
          <ThemedText style={styles.errorText}>⚠️ {errorMsg}</ThemedText>
        </View>
      )}

      {/* 1. อัปโหลดรูปภาพสินค้า */}
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold" style={styles.cardTitle}>
          รูปภาพสินค้า (Product Image)
        </ThemedText>

        <View style={styles.imagePickerArea}>
          {imagePreview ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: imagePreview }} style={styles.previewImage} resizeMode="contain" />
              <Pressable
                onPress={() => {
                  setImagePreview(null);
                  setImageUrl('');
                }}
                style={styles.removeImageBtn}
              >
                <SymbolView tintColor="#ffffff" name={{ ios: 'xmark', android: 'close', web: 'close' } as any} size={14} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handlePickImage}
              disabled={uploading}
              style={[styles.uploadBox, { borderColor: theme.border }]}
            >
              {uploading ? (
                <ActivityIndicator color="#6cc349" />
              ) : (
                <>
                  <SymbolView
                    tintColor={theme.textSecondary}
                    name={{ ios: 'photo.badge.plus', android: 'add_photo_alternate', web: 'add_photo_alternate' } as any}
                    size={36}
                  />
                  <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 6 }}>
                    คลิกเพื่อเลือกและอัปโหลดรูปภาพ
                  </ThemedText>
                </>
              )}
            </Pressable>
          )}

          {/* ช่องใส่ Image URL ตรงๆ */}
          <View style={{ gap: 4 }}>
            <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
              หรือระบุ URL รูปภาพโดยตรง:
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="https://example.com/keyboard.jpg"
              placeholderTextColor={theme.textSecondary}
              value={imageUrl}
              onChangeText={(text) => {
                setImageUrl(text);
                setImagePreview(text.trim() || null);
              }}
            />
          </View>
        </View>
      </ThemedView>

      {/* 2. ข้อมูลทั่วไป */}
      <ThemedView type="backgroundElement" style={styles.card}>
        <ThemedText type="smallBold" style={styles.cardTitle}>
          ข้อมูลสินค้า (Basic Details)
        </ThemedText>

        {/* ชื่อสินค้า */}
        <View style={styles.fieldGroup}>
          <ThemedText type="small" themeColor="textSecondary">
            ชื่อสินค้า *
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="เช่น ROG Azoth Wireless Gaming Keyboard"
            placeholderTextColor={theme.textSecondary}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* หมวดหมู่สินค้า (Chips) */}
        <View style={styles.fieldGroup}>
          <ThemedText type="small" themeColor="textSecondary">
            หมวดหมู่ (Category)
          </ThemedText>
          <View style={styles.chipsRow}>
            {CATEGORY_NAMES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setSelectedCategory(cat)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? '#6cc349' : theme.background,
                      borderColor: isSelected ? '#6cc349' : theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    type="small"
                    style={{
                      color: isSelected ? '#ffffff' : theme.text,
                      fontWeight: isSelected ? '600' : '400',
                    }}
                  >
                    {cat}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ราคา และ จำนวนสต็อก */}
        <View style={styles.rowTwoCols}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <ThemedText type="small" themeColor="textSecondary">
              ราคา ($) *
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="0.00"
              placeholderTextColor={theme.textSecondary}
              keyboardType="decimal-pad"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <ThemedText type="small" themeColor="textSecondary">
              จำนวนคงเหลือ (Stock) *
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              placeholder="10"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              value={stock}
              onChangeText={setStock}
            />
          </View>
        </View>

        {/* คลังจัดเก็บ */}
        <View style={styles.fieldGroup}>
          <ThemedText type="small" themeColor="textSecondary">
            ตำแหน่งจัดเก็บในคลัง (Location)
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="เช่น Warehouse B, Shelf 4"
            placeholderTextColor={theme.textSecondary}
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* คะแนนดาวเริ่มต้น */}
        <View style={styles.fieldGroup}>
          <ThemedText type="small" themeColor="textSecondary">
            คะแนนรีวิวเริ่มต้น
          </ThemedText>
          <StarRating value={rating} onChange={setRating} />
        </View>

        {/* คำอธิบายสินค้า */}
        <View style={styles.fieldGroup}>
          <ThemedText type="small" themeColor="textSecondary">
            รายละเอียดคำอธิบาย (Description)
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="คุณสมบัติ, สวิตช์, เลย์เอาต์..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>
      </ThemedView>

      {/* ปุ่มบันทึกและยกเลิก */}
      <View style={styles.actionsRow}>
        {onCancel && (
          <Pressable
            onPress={onCancel}
            disabled={loading}
            style={[styles.cancelBtn, { borderColor: theme.border }]}
          >
            <ThemedText type="smallBold">ยกเลิก</ThemedText>
          </Pressable>
        )}

        <Pressable
          onPress={handleSubmit}
          disabled={loading}
          style={[styles.submitBtn, { backgroundColor: '#6cc349' }, loading && { opacity: 0.7 }]}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <ThemedText type="smallBold" style={{ color: '#ffffff', fontSize: 15 }}>
              {isEditMode ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้าลงระบบ'}
            </ThemedText>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    gap: Spacing.four,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 96, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#ff605e',
    padding: Spacing.two,
    borderRadius: 0, // 0px voxel doctrine
  },
  errorText: {
    color: '#ff605e',
    fontSize: 13,
  },
  card: {
    padding: Spacing.four,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    gap: Spacing.three,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#d0c5c0',
    borderBottomWidth: 1,
    borderBottomColor: '#3d3938',
    paddingBottom: Spacing.two,
  },
  imagePickerArea: {
    gap: Spacing.two,
  },
  uploadBox: {
    height: 140,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#3d3938',
    borderRadius: 0, // 0px voxel doctrine
    backgroundColor: '#262423',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContainer: {
    height: 180,
    borderRadius: 0, // 0px voxel doctrine
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#3d3938',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 24,
    height: 24,
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldGroup: {
    gap: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#898481',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 0, // 0px voxel doctrine
    fontSize: 14,
    backgroundColor: '#262423',
    color: '#ede5e2',
    height: 48,
  },
  textArea: {
    height: 100,
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: Platform.OS === 'ios' ? 10 : Spacing.two,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    backgroundColor: '#262423',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.two,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: '#3d3938',
    borderRadius: 0, // 0px voxel doctrine
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 0, // 0px voxel doctrine
    backgroundColor: '#3c8527', // vanilla-green-5
    borderWidth: 2,
    borderColor: '#262423',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
