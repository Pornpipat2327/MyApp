/**
 * @file edit.tsx
 * @description หน้าจอแก้ไขข้อมูลสินค้า (Edit Product Screen)
 * ดึงข้อมูลสินค้าเดิมจาก Route Params หรือจาก REST API แล้วนำมาแสดงในฟอร์มเพื่อแก้ไข
 */

import React, { useState, useCallback, useMemo } from 'react';
import { ActivityIndicator, Text, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
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
    location_text?: string;
    image?: string;
    image_url?: string;
    description?: string;
    rating?: string;
  }>();

  // สร้างข้อมูลเริ่มต้นจาก params ถ้ามีส่งมาด้วย
  const parsedParamsProduct = useMemo<ProductFormData | null>(() => {
    if (params.id) {
      return {
        id: String(params.id),
        name: params.name || '',
        price: params.price ? parseFloat(params.price) : 0,
        stock: params.stock ? parseInt(params.stock, 10) : 0,
        category: params.category || 'General',
        location_text: params.location_text || params.location || '',
        image_url: params.image_url || params.image || '',
        description: params.description || '',
        rating: params.rating ? parseFloat(params.rating) : 5,
      };
    }
    return null;
  }, [params]);

  const [productData, setProductData] = useState<ProductFormData | null>(
    propProduct ?? (parsedParamsProduct?.name ? parsedParamsProduct : null)
  );
  const [fetching, setFetching] = useState<boolean>(false);

  // ดึงข้อมูลสินค้าล่าสุดจาก Backend API ทุกครั้งที่เข้าสู่หน้านี้
  useFocusEffect(
    useCallback(() => {
      if (propProduct) {
        setProductData(propProduct);
        setFetching(false);
        return;
      }

      const targetId = params.id;
      if (!targetId) {
        setFetching(false);
        setProductData(null);
        return;
      }

      // หากมี params ข้อมูลเบื้องต้น ให้แสดงทันทีเพื่อป้องกันหน้าจอว่างเปล่า
      if (parsedParamsProduct?.name) {
        setProductData(parsedParamsProduct);
      } else {
        setFetching(true);
      }

      let isMounted = true;

      fetch(`${getProductsApiUrl()}/${targetId}`)
        .then((res) => res.json())
        .then((resData) => {
          if (!isMounted) return;
          const d = resData?.data ?? resData;
          if (d && (d.id !== undefined || d.Product_ID !== undefined || d.name || d.Name)) {
            const loadedProduct: ProductFormData = {
              id: String(d.id ?? d.Product_ID ?? targetId),
              name: d.name ?? d.Name ?? params.name ?? '',
              category: d.category ?? d.Category ?? params.category ?? 'General',
              price: Number(d.price ?? d.Price ?? params.price ?? 0),
              stock: Number(
                d.stock !== undefined
                  ? d.stock
                  : d.Stock !== undefined
                  ? d.Stock
                  : params.stock
                  ? parseInt(params.stock, 10)
                  : 0
              ),
              location_text:
                d.location_text ??
                d.location ??
                d.Location ??
                params.location_text ??
                params.location ??
                '',
              image_url:
                d.image_url ??
                d.image ??
                d.Image ??
                params.image_url ??
                params.image ??
                '',
              description: d.description ?? d.Description ?? params.description ?? '',
              rating:
                d.rating !== undefined
                  ? Number(d.rating)
                  : d.Rating !== undefined
                  ? Number(d.Rating)
                  : params.rating
                  ? parseFloat(params.rating)
                  : 5,
            };
            setProductData(loadedProduct);
          } else if (!parsedParamsProduct?.name) {
            const msg = 'ไม่พบข้อมูลสินค้าที่ต้องการแก้ไข';
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert('ข้อผิดพลาด', msg);
          }
        })
        .catch((err) => {
          if (!isMounted) return;
          console.error('Fetch edit product error:', err);
          // หาก fetch ล้มเหลว แต่มีข้อมูลจาก params ให้คงข้อมูลนั้นไว้
          if (!parsedParamsProduct?.name) {
            const msg = 'เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า';
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert('ข้อผิดพลาด', msg);
          }
        })
        .finally(() => {
          if (isMounted) {
            setFetching(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }, [propProduct, params.id, parsedParamsProduct])
  );

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/product' as any);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/product' as any);
    }
  };

  if (fetching && !productData) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6cc349" />
        <Text style={{ marginTop: 12, color: '#888' }}>กำลังโหลดข้อมูลสินค้า...</Text>
      </ThemedView>
    );
  }

  return (
    <AddScreen
      key={productData?.id ?? params.id ?? 'edit-screen'}
      product={productData}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
