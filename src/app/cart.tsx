/**
 * @file cart.tsx
 * @description หน้าจอแสดงรายการตะกร้าสินค้า (Shopping Cart Screen)
 * ประกอบด้วยรายการสินค้าที่เลือก, ตัวปรับจำนวน, ฟอร์มใส่คูปองส่วนลด, สรุปยอดเงิน และปุ่มไปชำระเงิน
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { TopHeader } from '@/components/top-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/hooks/use-cart';
import { CartItemRow } from '@/components/cart/cart-item-row';
import { CartCouponSection } from '@/components/cart/cart-coupon-section';
import { CartSummaryCard } from '@/components/cart/cart-summary-card';

export default function CartScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    items,
    totalItems,
    subtotal,
    shippingFee,
    discount,
    grandTotal,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(
    null
  );

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = codeToApply || couponInput;
    if (!code.trim()) return;
    const result = applyCoupon(code);
    setCouponFeedback(result);
    if (result.success) {
      setCouponInput('');
    }
  };

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader />

        {/* แถบหัวเรื่องและปุ่มย้อนกลับ */}
        <View style={[styles.headerBar, { borderBottomColor: theme.border }]}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.push('/product' as any))}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' } as any}
              size={20}
            />
            <ThemedText type="smallBold">ย้อนกลับ</ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            ตะกร้าสินค้าของคุณ ({totalItems})
          </ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {items.length === 0 ? (
            /* สถานะเมื่อตะกร้าว่างเปล่า */
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <SymbolView
                tintColor={theme.textSecondary}
                name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' } as any}
                size={64}
              />
              <ThemedText type="subtitle" style={{ marginTop: Spacing.three }}>
                ตะกร้าสินค้าว่างเปล่า
              </ThemedText>
              <ThemedText
                type="small"
                themeColor="textSecondary"
                style={{ textAlign: 'center', maxWidth: 320, marginTop: Spacing.one }}
              >
                คุณยังไม่ได้เพิ่มคีย์บอร์ดลงในตะกร้าสินค้า เริ่มต้นเลือกดูคีย์บอร์ดที่ถูกใจได้เลย!
              </ThemedText>
              <Pressable
                onPress={() => router.push('/product')}
                style={({ pressed }) => [
                  styles.browseBtn,
                  { backgroundColor: '#6cc349' },
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
                  เลือกซื้อสินค้า (Explore Store)
                </ThemedText>
              </Pressable>
            </ThemedView>
          ) : (
            <View style={styles.mainWrapper}>
              {/* คอลัมน์ซ้าย: รายการสินค้าในตะกร้า และ ส่วนคูปอง */}
              <View style={styles.itemsColumn}>
                <View style={styles.sectionHeadingRow}>
                  <ThemedText type="smallBold" style={styles.sectionTitle}>
                    รายการสินค้าในตะกร้า ({totalItems} ชิ้น)
                  </ThemedText>
                  <Pressable onPress={clearCart} style={({ pressed }) => pressed && styles.pressed}>
                    <ThemedText type="small" style={{ color: '#FF3B30' }}>
                      ล้างตะกร้าทั้งหมด
                    </ThemedText>
                  </Pressable>
                </View>

                {/* รายการสินค้าแต่ละชิ้น */}
                <View style={{ gap: Spacing.two }}>
                  {items.map((item) => (
                    <CartItemRow
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </View>

                {/* ส่วนคูปองส่วนลด */}
                <CartCouponSection
                  couponInput={couponInput}
                  onCouponInputChange={setCouponInput}
                  onApplyCoupon={handleApplyCoupon}
                  onRemoveCoupon={removeCoupon}
                  appliedCoupon={appliedCoupon}
                  feedback={couponFeedback}
                />
              </View>

              {/* คอลัมน์ขวา: การ์ดสรุปยอดเงินและปุ่มสั่งซื้อ */}
              <View style={styles.summaryColumn}>
                <CartSummaryCard
                  totalItems={totalItems}
                  subtotal={subtotal}
                  shippingFee={shippingFee}
                  discount={discount}
                  grandTotal={grandTotal}
                />
              </View>
            </View>
          )}
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
  backButton: {
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
  emptyCard: {
    padding: Spacing.six,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
    marginTop: Spacing.four,
  },
  browseBtn: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 6,
    marginTop: Spacing.three,
  },
  mainWrapper: {
    flexDirection: 'row',
    gap: Spacing.four,
    flexWrap: 'wrap',
  },
  itemsColumn: {
    flex: 1.4,
    minWidth: 320,
    gap: Spacing.three,
  },
  summaryColumn: {
    flex: 1,
    minWidth: 280,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 15,
  },
  pressed: {
    opacity: 0.7,
  },
});
