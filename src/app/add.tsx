/**
 * @file add.tsx
 * @description หน้าจอเพิ่มสินค้าใหม่ลงในระบบ (Add Product Screen)
 * จำกัดสิทธิ์ให้เฉพาะผู้ดูแลระบบ (Admin) เท่านั้นที่สามารถเพิ่มสินค้าได้
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { TopHeader } from '@/components/top-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { getProductsApiUrl } from '@/constants/api';
import { ProductFormData } from '@/types/product';
import { ProductForm } from '@/components/product-form/product-form';
import { getStorageItem, isCurrentUserAdmin } from '@/utils/storage';

export interface AddProductScreenProps {
  product?: ProductFormData | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function AddScreen({ product = null, onSuccess, onCancel }: AddProductScreenProps = {}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  // ตรวจสอบสิทธิ์ Admin เมื่อเข้าสู่หน้านี้
  useEffect(() => {
    const user = getStorageItem('user');
    if (!user) {
      router.replace('/login' as any);
      return;
    }
    if (!isCurrentUserAdmin()) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.alert('สงวนสิทธิ์เฉพาะผู้ดูแลระบบ (Administrator) เท่านั้น');
      } else {
        Alert.alert('การเข้าถึงถูกจำกัด', 'สงวนสิทธิ์เฉพาะผู้ดูแลระบบเท่านั้น');
      }
      router.replace('/' as any);
    }
  }, [router]);

  /**
   * ส่งข้อมูลบันทึกสินค้าลง MySQL ผ่าน REST API
   */
  const handleSaveProduct = async (formData: ProductFormData) => {
    setSubmitting(true);
    try {
      const isEdit = !!formData.id;
      const url = isEdit
        ? `${getProductsApiUrl()}/${formData.id}`
        : getProductsApiUrl();

      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          price: formData.price,
          stock: formData.stock,
          location: formData.location_text,
          image: formData.image_url,
          description: formData.description,
          rating: formData.rating,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const successMsg = isEdit
          ? `อัปเดตข้อมูล "${formData.name}" สำเร็จ!`
          : `เพิ่มสินค้า "${formData.name}" สำเร็จ!`;

        if (Platform.OS === 'web') {
          window.alert(successMsg);
        } else {
          Alert.alert('สำเร็จ', successMsg);
        }

        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/product');
        }
      } else {
        const errorMsg = data.message || 'บันทึกข้อมูลไม่สำเร็จ';
        if (Platform.OS === 'web') window.alert(errorMsg);
        else Alert.alert('ข้อผิดพลาด', errorMsg);
      }
    } catch {
      const errorMsg = 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ฐานข้อมูลได้';
      if (Platform.OS === 'web') window.alert(errorMsg);
      else Alert.alert('ข้อผิดพลาด', errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelAction = () => {
    if (onCancel) {
      onCancel();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/product');
    }
  };

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader />

        {/* แถบหัวเรื่อง */}
        <View style={styles.headerBar}>
          <Pressable
            onPress={handleCancelAction}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor="#6cc349"
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' } as any}
              size={20}
            />
            <ThemedText type="smallBold">ย้อนกลับ</ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            {product ? 'แก้ไขสินค้า (Edit Product)' : 'เพิ่มสินค้าใหม่ (Add New Product)'}
          </ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProductForm
            initialData={product}
            isEditMode={!!product}
            onSubmit={handleSaveProduct}
            onCancel={handleCancelAction}
            loading={submitting}
          />
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderBottomWidth: 2,
    borderBottomColor: '#3d3938',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  pressed: {
    opacity: 0.7,
  },
});
