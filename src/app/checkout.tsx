/**
 * @file checkout.tsx
 * @description หน้าจอชำระเงินและสั่งซื้อสินค้า (Checkout Screen)
 * รวบรวมฟอร์มข้อมูลที่อยู่จัดส่ง, ช่องทางการชำระเงิน (PromptPay/โอนธนาคาร/COD), สรุปยอดเงิน และบันทึกคำสั่งซื้อ
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Platform,
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
import { Order, PaymentMethod } from '@/types/order';
import { ShippingForm, ShippingFormValues } from '@/components/checkout/shipping-form';
import { PaymentMethodSelector } from '@/components/checkout/payment-method-selector';
import { OrderSummaryCard } from '@/components/checkout/order-summary-card';
import { OrderSuccessModal } from '@/components/checkout/order-success-modal';
import { getStorageJSON, setStorageJSON } from '@/utils/storage';

export default function CheckoutScreen() {
  const theme = useTheme();
  const router = useRouter();
  const {
    items,
    subtotal,
    shippingFee,
    discount,
    grandTotal,
    appliedCoupon,
    clearCart,
  } = useCart();

  // กำหนดค่าเริ่มต้นของผู้รับจาก User ที่เข้าสู่ระบบ (Lazy initialization ป้องกัน cascading renders)
  const [shippingValues, setShippingValues] = useState<ShippingFormValues>(() => {
    let defaultRecipient = '';
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const user = getStorageJSON<{ username?: string }>('user', {});
        if (user?.username) defaultRecipient = user.username;
      } catch {}
    }
    return {
      recipientName: defaultRecipient,
      phone: '',
      address: '',
      city: '',
      postalCode: '',
      note: '',
    };
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('promptpay');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const handleShippingChange = useCallback(
    <K extends keyof ShippingFormValues>(key: K, value: ShippingFormValues[K]) => {
      setShippingValues((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  /**
   * ฟังก์ชันดำเนินการสั่งซื้อสินค้า
   */
  const handlePlaceOrder = () => {
    if (!shippingValues.recipientName.trim()) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุล ผู้รับ');
      return;
    }
    if (!shippingValues.phone.trim()) {
      setErrorMessage('กรุณาระบุเบอร์โทรศัพท์ติดต่อ');
      return;
    }
    if (
      !shippingValues.address.trim() ||
      !shippingValues.city.trim() ||
      !shippingValues.postalCode.trim()
    ) {
      setErrorMessage('กรุณากรอกข้อมูลที่อยู่จัดส่งให้ครบถ้วน (ที่อยู่, เมือง/จังหวัด, รหัสไปรษณีย์)');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('ไม่มีสินค้าในตะกร้า กรุณาเลือกสินค้าก่อนทำการสั่งซื้อ');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const orderId = `EK-${randomNum}`;

      const user = getStorageJSON<{ username?: string; role?: string }>('user', {});
      const currentUsername = user?.username || 'Guest';
      const currentRole = user?.role || 'user';

      const newOrder: Order = {
        id: orderId,
        username: currentUsername,
        userRole: currentRole,
        createdAt: new Date().toISOString(),
        status: 'pending',
        items: [...items],
        subtotal,
        shippingFee,
        discount,
        totalAmount: grandTotal,
        couponCode: appliedCoupon?.code,
        shippingAddress: {
          recipientName: shippingValues.recipientName.trim(),
          phone: shippingValues.phone.trim(),
          address: shippingValues.address.trim(),
          city: shippingValues.city.trim(),
          postalCode: shippingValues.postalCode.trim(),
          note: shippingValues.note.trim(),
        },
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        trackingNumber: `TH${Math.floor(100000000 + Math.random() * 900000000)}TH`,
      };

      // บันทึกลง LocalStorage
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        try {
          const existingOrders = getStorageJSON<Order[]>('extreme_keys_orders', []);
          const updatedOrders = [newOrder, ...existingOrders];
          setStorageJSON('extreme_keys_orders', updatedOrders);
          window.dispatchEvent(new Event('orders-change'));
        } catch (e) {
          console.error('Failed to save order to localStorage', e);
        }
      }

      clearCart();
      setLoading(false);
      setCompletedOrder(newOrder);
    }, 800);
  };

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader />

        {/* แถบย้อนกลับและหัวข้อ */}
        <View style={[styles.headerBar, { borderBottomColor: theme.border }]}>
          <Pressable
            onPress={() => router.push('/cart' as any)}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' } as any}
              size={20}
            />
            <ThemedText type="smallBold">ตะกร้าสินค้า</ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            ชำระเงินและจัดส่ง (Checkout)
          </ThemedText>
          <View style={{ width: 80 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {completedOrder ? (
            /* แสดงหน้าจอสั่งซื้อสำเร็จ */
            <OrderSuccessModal order={completedOrder} />
          ) : (
            <View style={styles.mainWrapper}>
              {/* คอลัมน์ซ้าย: ฟอร์มที่อยู่ และ วิธีชำระเงิน */}
              <View style={styles.formsColumn}>
                {errorMessage && (
                  <View style={styles.errorBanner}>
                    <ThemedText style={{ color: '#FF3B30', fontSize: 13 }}>
                      ⚠️ {errorMessage}
                    </ThemedText>
                  </View>
                )}

                <ShippingForm
                  values={shippingValues}
                  onChange={handleShippingChange}
                />

                <PaymentMethodSelector
                  selectedMethod={paymentMethod}
                  onSelectMethod={setPaymentMethod}
                  totalAmount={grandTotal}
                />
              </View>

              {/* คอลัมน์ขวา: การ์ดสรุปยอดเงินและปุ่มสั่งซื้อ */}
              <View style={styles.summaryColumn}>
                <OrderSummaryCard
                  items={items}
                  subtotal={subtotal}
                  shippingFee={shippingFee}
                  discount={discount}
                  grandTotal={grandTotal}
                  appliedCoupon={appliedCoupon}
                  loading={loading}
                  onPlaceOrder={handlePlaceOrder}
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
  mainWrapper: {
    flexDirection: 'row',
    gap: Spacing.four,
    flexWrap: 'wrap',
  },
  formsColumn: {
    flex: 1.4,
    minWidth: 320,
    gap: Spacing.four,
  },
  summaryColumn: {
    flex: 1,
    minWidth: 280,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: '#FF3B30',
    padding: Spacing.two,
    borderRadius: 6,
  },
  pressed: {
    opacity: 0.7,
  },
});
