/**
 * @file detail.tsx
 * @description หน้ารายละเอียดสินค้า (Product Detail Screen)
 * ประกอบด้วยรูปภาพขนาดใหญ่, รายละเอียดสเปก, ตัวปรับจำนวน, ปุ่มเพิ่มลงตะกร้า และปุ่มจัดการสินค้าสำหรับ Admin
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
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/hooks/use-cart';
import { getProductsApiUrl } from '@/constants/api';
import { Product } from '@/types/product';
import { ProductImageViewer } from '@/components/detail/product-image-viewer';
import { ProductInfoSection } from '@/components/detail/product-info-section';
import { ProductActionBar } from '@/components/detail/product-action-bar';
import { isCurrentUserAdmin } from '@/utils/storage';

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
      if (Platform.OS === 'web') {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          router.replace('/login' as any);
          return;
        }
        setIsAdmin(isCurrentUserAdmin());
      }

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
            price: d.Price ?? d.price ?? 0,
            rating: d.Rating ?? d.rating ?? 4.5,
            description: d.Description ?? d.description ?? '',
            image: d.image ?? d.Image ?? d.image_url ?? '',
            stock: d.Stock ?? d.stock ?? 0,
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

  /**
   * เพิ่มสินค้าลงในตะกร้าพร้อม Feedback แสดงผล
   */
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
    }, 1800);
  };

  /**
   * นำทางไปยังหน้าแก้ไขสินค้า
   */
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

  /**
   * ขอยืนยันและส่งคำขอลบสินค้า
   */
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
        <View style={[styles.headerBar, { borderBottomColor: theme.border }]}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.push('/product'))}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' } as any}
              size={20}
            />
            <ThemedText type="smallBold">รายการสินค้า</ThemedText>
          </Pressable>
          <ThemedText type="smallBold" numberOfLines={1} style={styles.headerTitle}>
            รายละเอียดสินค้า
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
                กำลังโหลดรายละเอียดสินค้า...
              </ThemedText>
            </View>
          ) : error ? (
            <View style={styles.centerBox}>
              <ThemedText style={{ color: '#FF3B30', fontSize: 16 }}>⚠️ {error}</ThemedText>
              <Pressable
                onPress={() => router.push('/product')}
                style={[styles.backStoreBtn, { backgroundColor: theme.backgroundElement }]}
              >
                <ThemedText type="smallBold">กลับไปหน้ารายการสินค้า</ThemedText>
              </Pressable>
            </View>
          ) : product ? (
            <View style={styles.mainGrid}>
              {/* รูปภาพสินค้า */}
              <View style={styles.imageColumn}>
                <ProductImageViewer image={product.image} category={product.category} />
              </View>

              {/* ข้อมูลและการสั่งซื้อ */}
              <View style={styles.infoColumn}>
                <ProductInfoSection
                  name={product.name}
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
                  addedSuccess={addedSuccess}
                  isAdmin={isAdmin}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </View>
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
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    padding: Spacing.four,
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
    borderRadius: 6,
    marginTop: Spacing.two,
  },
  mainGrid: {
    flexDirection: 'row',
    gap: Spacing.five,
    flexWrap: 'wrap',
  },
  imageColumn: {
    flex: 1,
    minWidth: 320,
  },
  infoColumn: {
    flex: 1.2,
    minWidth: 320,
    gap: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
