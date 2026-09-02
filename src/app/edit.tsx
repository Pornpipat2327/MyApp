/**
 * @file edit.tsx
 * @description หน้าจอแก้ไขข้อมูลสินค้า (Edit Product Screen)
 * ดึงข้อมูลสินค้าเดิมจาก Route Params หรือจาก REST API แล้วนำมาแสดงในฟอร์มเพื่อแก้ไข
 */

import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, Text, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AddScreen from './add';
import { ThemedView } from '@/components/themed-view';
import { getProductsApiUrl } from '@/constants/api';
import { ProductFormData } from '@/types/product';

export interface EditProductScreenProps {
  product?: ProductFormData | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EditProductScreen({
  product: propProduct,
  onSuccess,
  onCancel,
}: EditProductScreenProps = {}) {
  const router = useRouter();
  const params = useLocalSearchParams<{
    id?: string;
    name?: string;
    price?: string;
    stock?: string;
    category?: string;
    location?: string;
    image?: string;
    description?: string;
    rating?: string;
  }>();

  // สร้างข้อมูลเริ่มต้นจาก params หรือ prop ถ้ามีอยู่แล้ว
  const initialProductData = useMemo<ProductFormData | null>(() => {
    if (propProduct) return propProduct;
    if (params.id && params.name) {
      return {
        id: params.id,
        name: params.name,
        price: params.price ? parseFloat(params.price) : 0,
        stock: params.stock ? parseInt(params.stock, 10) : 0,
        category: params.category || '',
        location_text: params.location || '',
        image_url: params.image || '',
        description: params.description || '',
        rating: params.rating ? parseFloat(params.rating) : undefined,
      };
    }
    return null;
  }, [propProduct, params]);

  const [productData, setProductData] = useState<ProductFormData | null>(initialProductData);
  const [fetching, setFetching] = useState<boolean>(!initialProductData && !!params.id);

  // ดึงข้อมูลเพิ่มเติมจาก API หากมีเฉพาะ id ใน route params
  useEffect(() => {
    if (initialProductData) {
      return;
    }

    if (params.id) {
      fetch(`${getProductsApiUrl()}/${params.id}`)
        .then((res) => res.json())
        .then((resData) => {
          if (resData.success && resData.data) {
            const d = resData.data;
            setProductData({
              id: String(d.Product_ID || d.id || params.id),
              name: d.Name || d.name || '',
              price: d.Price || d.price || 0,
              stock: d.Stock || d.stock || 0,
              category: d.Category || d.category || '',
              location_text: d.Location || d.location || d.location_text || '',
              image_url: d.image || d.image_url || '',
              description: d.Description || d.description || '',
              rating: d.Rating || d.rating || undefined,
            });
          } else {
            Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลสินค้าที่ระบุ');
          }
        })
        .catch((err) => {
          console.error('Fetch edit product error:', err);
        })
        .finally(() => {
          setFetching(false);
        });
    }
  }, [params.id, initialProductData]);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/product');
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/product');
    }
  };

  if (fetching) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6cc349" />
        <Text style={{ marginTop: 12, color: '#888' }}>กำลังโหลดข้อมูลสินค้า...</Text>
      </ThemedView>
    );
  }

  return (
    <AddScreen
      product={productData}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
