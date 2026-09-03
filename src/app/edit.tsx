/**
 * @file edit.tsx
 * @description หน้าจอแก้ไขข้อมูลสินค้า (Edit Product Screen)
 * ดึงข้อมูลสินค้าเดิมจาก REST API ตามรหัสสินค้า (ID) แล้วนำมาแสดงในฟอร์มเพื่อแก้ไข
 */

import React, { useState, useCallback, useRef } from 'react';
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
  const searchParams = useLocalSearchParams<{
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

  // ดึงค่าเฉพาะ Primitive ID เพื่อป้องกันปัญหา Reference loop ใน useCallback
  const paramId = searchParams.id ? String(searchParams.id) : undefined;

  const [productData, setProductData] = useState<ProductFormData | null>(propProduct ?? null);
  const [fetching, setFetching] = useState<boolean>(!propProduct && !!paramId);
  const isMountedRef = useRef(true);

  // ดึงข้อมูลสินค้าล่าสุดจาก Backend API ทุกครั้งที่เข้าสู่หน้านี้
  useFocusEffect(
    useCallback(() => {
      isMountedRef.current = true;

      // 1. หากได้รับ product ผ่าน Prop โดยตรง
      if (propProduct) {
        setProductData(propProduct);
        setFetching(false);
        return;
      }

      // 2. หากไม่มี id
      if (!paramId) {
        setFetching(false);
        setProductData(null);
        return;
      }

      // 3. เริ่มดึงข้อมูลสินค้าจาก API
      setFetching(true);

      fetch(`${getProductsApiUrl()}/${paramId}`)
        .then((res) => res.json())
        .then((resData) => {
          if (!isMountedRef.current) return;
          const d = resData?.data ?? resData;
          if (d && (d.id !== undefined || d.Product_ID !== undefined || d.name || d.Name)) {
            const loadedProduct: ProductFormData = {
              id: String(d.id ?? d.Product_ID ?? paramId),
              name: d.name ?? d.Name ?? '',
              category: d.category ?? d.Category ?? 'General',
              price: Number(d.price ?? d.Price ?? 0),
              stock: Number(
                d.stock !== undefined
                  ? d.stock
                  : d.Stock !== undefined
                  ? d.Stock
                  : 0
              ),
              location_text:
                d.location_text ??
                d.location ??
                d.Location ??
                '',
              image_url:
                d.image_url ??
                d.image ??
                d.Image ??
                '',
              description: d.description ?? d.Description ?? '',
              rating:
                d.rating !== undefined
                  ? Number(d.rating)
                  : d.Rating !== undefined
                  ? Number(d.Rating)
                  : 5,
            };
            setProductData(loadedProduct);
          } else {
            // หาก Backend ไม่พบข้อมูล และมีข้อมูลสำรองจาก params
            if (searchParams.name) {
              setProductData({
                id: paramId,
                name: searchParams.name,
                category: searchParams.category || 'General',
                price: searchParams.price ? parseFloat(searchParams.price) : 0,
                stock: searchParams.stock ? parseInt(searchParams.stock, 10) : 0,
                location_text: searchParams.location_text || searchParams.location || '',
                image_url: searchParams.image_url || searchParams.image || '',
                description: searchParams.description || '',
                rating: searchParams.rating ? parseFloat(searchParams.rating) : 5,
              });
            } else {
              const msg = 'ไม่พบข้อมูลสินค้าที่ต้องการแก้ไข';
              if (Platform.OS === 'web') alert(msg);
              else Alert.alert('ข้อผิดพลาด', msg);
            }
          }
        })
        .catch((err) => {
          if (!isMountedRef.current) return;
          console.error('Fetch edit product error:', err);

          // Fallback ข้อมูลจาก params หาก API ขัดข้อง
          if (searchParams.name) {
            setProductData({
              id: paramId,
              name: searchParams.name,
              category: searchParams.category || 'General',
              price: searchParams.price ? parseFloat(searchParams.price) : 0,
              stock: searchParams.stock ? parseInt(searchParams.stock, 10) : 0,
              location_text: searchParams.location_text || searchParams.location || '',
              image_url: searchParams.image_url || searchParams.image || '',
              description: searchParams.description || '',
              rating: searchParams.rating ? parseFloat(searchParams.rating) : 5,
            });
          } else {
            const msg = 'เกิดข้อผิดพลาดในการโหลดข้อมูลสินค้า';
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert('ข้อผิดพลาด', msg);
          }
        })
        .finally(() => {
          if (isMountedRef.current) {
            setFetching(false);
          }
        });

      return () => {
        isMountedRef.current = false;
      };
    }, [paramId, propProduct])
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
      key={productData?.id ?? paramId ?? 'edit-screen'}
      product={productData}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
