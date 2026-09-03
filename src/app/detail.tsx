/**
 * @file detail.tsx
 * @description หน้ารายละเอียดสินค้า สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Hero Image (Height 320), Info Card Border (#3d3938), และ Dungeons Gold Voltage (#ffc42b)
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TopHeader } from '@/components/top-header';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/hooks/use-cart';
import { getProductsApiUrl } from '@/constants/api';
import { Product } from '@/types/product';
import { ProductImageViewer } from '@/components/detail/product-image-viewer';
import { ProductInfoSection } from '@/components/detail/product-info-section';
import { ProductActionBar } from '@/components/detail/product-action-bar';
import { isCurrentUserAdmin, getStorageItem } from '@/utils/storage';

export default function ProductDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // ดึงข้อมูลสินค้าและสิทธิ์ Admin เมื่อเข้าสู่หน้านี้
  useFocusEffect(
    useCallback(() => {
      // 1. ตรวจสอบสถานะการเข้าสู่ระบบ
      const userStr = getStorageItem('user');
      if (!userStr) {
        router.replace('/login' as any);
        return;
      }
      setIsAdmin(isCurrentUserAdmin());

      // 2. ตรวจสอบ ID สินค้า
      if (!params.id) {
        setError('ไม่พบรหัสสินค้าที่ต้องการแสดง');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      fetch(`${getProductsApiUrl()}/${params.id}`)
        .then((res) => res.json())
        .then((resData) => {
          const d = resData?.data ?? resData;
          if (!d || (!d.id && !d.Product_ID && !d.name && !d.Name)) {
            throw new Error('ไม่พบข้อมูลสินค้าชิ้นนี้ในระบบ');
          }
          setProduct({
            id: d.Product_ID ?? d.id ?? params.id!,
            name: d.Name ?? d.name ?? '',
            category: d.Category ?? d.category ?? 'General',
            price: Number(d.Price ?? d.price ?? 0),
            rating: Number(d.Rating ?? d.rating ?? 4.5),
            description: d.Description ?? d.description ?? '',
            image: d.image ?? d.Image ?? d.image_url ?? '',
            stock: Number(d.Stock ?? d.stock ?? 0),
            location: d.Location ?? d.location ?? d.location_text ?? '',
          });
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดสินค้า');
        })
        .finally(() => {
          setLoading(false);
        });
    }, [params.id, router])
  );

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 1800);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    router.push('/checkout' as any);
  };

  const handleEdit = () => {
    if (!product) return;
    router.push({
      pathname: '/edit' as any,
      params: {
        id: String(product.id),
        name: product.name,
        price: String(product.price),
        stock: String(product.stock ?? 0),
        category: product.category,
        location: product.location,
        image: product.image,
        description: product.description,
        rating: String(product.rating ?? 5),
      },
    });
  };

  const handleDelete = async () => {
    if (!product) return;

    const doDelete = async () => {
      try {
        const res = await fetch(`${getProductsApiUrl()}/${product.id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (Platform.OS === 'web') {
            window.alert(`ลบ "${product.name}" สำเร็จเรียบร้อย`);
          } else {
            Alert.alert('สำเร็จ', `ลบ "${product.name}" เรียบร้อยแล้ว`);
          }
          router.back();
        } else {
          const msg = data.message || 'ลบสินค้าไม่สำเร็จ';
          if (Platform.OS === 'web') window.alert(msg);
          else Alert.alert('ข้อผิดพลาด', msg);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('ข้อผิดพลาด', msg);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${product.name}"?`)) {
        doDelete();
      }
    } else {
      Alert.alert('ยืนยันการลบ', `คุณต้องการลบ "${product.name}" หรือไม่?`, [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'ลบสินค้า', style: 'destructive', onPress: doDelete },
      ]);
    }
  };

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader />

        {/* แถบย้อนกลับและหัวข้อ */}
        <View style={[styles.headerBar, { borderBottomColor: '#3d3938' }]}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.push('/product'))}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' } as any}
              size={20}
            />
            <ThemedText type="smallBold">Back</ThemedText>
          </Pressable>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.headerTitle}>
            Product Detail
          </ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <View style={styles.centerBox}>
              <ActivityIndicator size="large" color="#6cc349" />
              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 12 }}>
                Loading details...
              </ThemedText>
            </View>
          ) : error ? (
            <View style={styles.centerBox}>
              <ThemedText style={{ color: '#ff605e', fontSize: 16 }}>⚠️ {error}</ThemedText>
              <Pressable
                onPress={() => router.push('/product')}
                style={styles.backStoreBtn}
              >
                <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
                  Go Back
                </ThemedText>
              </Pressable>
            </View>
          ) : product ? (
            <View style={styles.detailWrapper}>
              {/* รูปภาพสินค้าแบบเต็มความกว้าง */}
              <ProductImageViewer image={product.image} category={product.category} />

              {/* ข้อมูลและการสั่งซื้อ ใน Info Card สไตล์ Minecraft */}
              <ThemedView type="backgroundElement" style={styles.infoCard}>
                <ProductInfoSection
                  name={product.name}
                  category={product.category}
                  price={product.price}
                  rating={product.rating}
                  stock={product.stock}
                  location={product.location}
                  description={product.description}
                />

                <ProductActionBar
                  quantity={quantity}
                  maxStock={Number(product.stock) || 0}
                  onQuantityChange={setQuantity}
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  addedSuccess={addedSuccess}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </ThemedView>
            </View>
          ) : null}
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
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerTitle: {
    fontSize: 16,
    maxWidth: 200,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: BottomTabInset + Spacing.six,
  },
  centerBox: {
    paddingVertical: Spacing.six * 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  backStoreBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 0,
    backgroundColor: '#3c8527',
    borderWidth: 2,
    borderColor: '#262423',
    marginTop: Spacing.two,
  },
  detailWrapper: {
    width: '100%',
    maxWidth: 720,
    ...Platform.select({ web: { width: 'calc(100% - 0px)' as any } }),
  },
  infoCard: {
    margin: Spacing.three,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.75,
  },
});
