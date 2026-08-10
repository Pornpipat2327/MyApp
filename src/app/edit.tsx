import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, Alert, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AddProductScreen, { EditableProduct } from './add';
import { ThemedView } from '@/components/themed-view';

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

export type EditProductScreenProps = {
  product?: EditableProduct | null;
  existingCategories?: string[];
  onSuccess?: () => void;
  onCancel?: () => void;
};

export default function EditProductScreen({
  product: propProduct,
  existingCategories = [],
  onSuccess,
  onCancel,
}: EditProductScreenProps = {}) {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string; name?: string; price?: string; stock?: string; category?: string; location?: string; image?: string; description?: string }>();

  const [productData, setProductData] = useState<EditableProduct | null>(propProduct || null);
  const [fetching, setFetching] = useState<boolean>(!propProduct && !!params.id);

  useEffect(() => {
    // If product is provided via props, use it
    if (propProduct) {
      setProductData(propProduct);
      return;
    }

    // Otherwise, if route params provide full product details
    if (params.id && params.name) {
      setProductData({
        id: params.id,
        name: params.name,
        price: params.price ? parseFloat(params.price) : 0,
        stock: params.stock ? parseInt(params.stock, 10) : 0,
        category: params.category || '',
        location_text: params.location || '',
        image_url: params.image || '',
        description: params.description || '',
      });
      setFetching(false);
      return;
    }

    // Or fetch from API using product ID
    if (params.id) {
      setFetching(true);
      fetch(`${getApiUrl()}/${params.id}`)
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
            });
          } else {
            Alert.alert('Error', 'Product not found');
          }
        })
        .catch((err) => {
          console.error('Fetch edit product error:', err);
        })
        .finally(() => {
          setFetching(false);
        });
    }
  }, [propProduct, params.id]);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  if (fetching) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 12, color: '#888' }}>Loading product details...</Text>
      </ThemedView>
    );
  }

  return (
    <AddProductScreen
      product={productData}
      existingCategories={existingCategories}
      onSuccess={handleSuccess}
      onCancel={handleCancel}
    />
  );
}
