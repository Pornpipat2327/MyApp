/**
 * @file checkout.tsx
 * @description หน้าจอชำระเงินและสั่งซื้อสินค้า สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Dark Border (#3d3938), Primary Buttons (#3c8527), และ Warning Banner (#ff605e)
 */

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { TopHeader } from '@/components/top-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useCart } from '@/hooks/use-cart';
import { Order, PaymentMethod } from '@/types/order';
import { ShippingForm } from '@/components/checkout/shipping-form';
import { ShippingAddressValues } from '@/components/checkout/types';
import { PaymentMethodSelector } from '@/components/checkout/payment-method-selector';
import { OrderSummaryCard } from '@/components/checkout/order-summary-card';
import { OrderSuccessModal } from '@/components/checkout/order-success-modal';
import { getStorageJSON, setStorageJSON, emitStorageChange } from '@/utils/storage';

export default function CheckoutScreen() {
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

  // กำหนดค่าเริ่มต้นของผู้รับจาก User ที่เข้าสู่ระบบ
  const [shippingValues, setShippingValues] = useState<ShippingAddressValues>(() => {
    let defaultRecipient = '';
    try {
      const user = getStorageJSON<{ username?: string }>('user', {});
      if (user?.username) defaultRecipient = user.username;
    } catch {}
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
    (key: keyof ShippingAddressValues, value: string) => {
      setShippingValues((prev: ShippingAddressValues) => ({ ...prev, [key]: value }));
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

    // สร้างข้อมูล Order จำลอง
    setTimeout(() => {
      let currentUsername = 'Guest';
      let currentUserRole = 'user';
      try {
        const user = getStorageJSON<{ username?: string; role?: string }>('user', {});
        if (user?.username) currentUsername = user.username;
        if (user?.role) currentUserRole = user.role;
      } catch {}

      const newOrder: Order = {
        id: `EK-${Math.floor(10000 + Math.random() * 90000)}`,
        username: currentUsername,
        userRole: currentUserRole,
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
          note: (shippingValues.note || '').trim(),
        },
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        trackingNumber: `TH${Math.floor(100000000 + Math.random() * 900000000)}TH`,
      };

      // บันทึกลงใน Universal Storage (ทำงานทั้งบน Mobile และ Web)
      try {
        const existingOrders = getStorageJSON<Order[]>('extreme_keys_orders', []);
        const updated = [newOrder, ...(Array.isArray(existingOrders) ? existingOrders : [])];
        setStorageJSON('extreme_keys_orders', updated);
        emitStorageChange('orders-change');
      } catch (e) {
        console.error('Failed to save order to storage', e);
      }

      clearCart();
      setLoading(false);
      setCompletedOrder(newOrder);
    }, 1000);
  };

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader />

        {/* แถบหัวเรื่องและปุ่มย้อนกลับ */}
        <View style={styles.headerBar}>
          <Pressable
            onPress={() => router.push('/cart' as any)}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor="#6cc349"
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' } as any}
              size={20}
            />
            <ThemedText type="smallBold">Cart</ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Checkout & Payment
          </ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {completedOrder ? (
              <OrderSuccessModal order={completedOrder} />
            ) : (
              <View style={styles.mainWrapper}>
                {/* แบนเนอร์แสดงข้อความเตือน Error */}
                {errorMessage && (
                  <View style={styles.errorBanner}>
                    <ThemedText style={{ color: '#ff605e', fontSize: 13, fontWeight: '700' }}>
                      ⚠️ {errorMessage}
                    </ThemedText>
                  </View>
                )}

                {/* คอลัมน์ซ้าย: ฟอร์มที่อยู่ และ ช่องทางชำระเงิน */}
                <View style={styles.formsColumn}>
                  <ShippingForm
                    values={shippingValues}
                    onChange={handleShippingChange}
                  />

                  <PaymentMethodSelector
                    selectedMethod={paymentMethod}
                    onSelectMethod={setPaymentMethod}
                    grandTotal={grandTotal}
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
        </KeyboardAvoidingView>
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
    flex: 1,
    minWidth: 280,
    width: '100%',
    gap: Spacing.four,
  },
  summaryColumn: {
    flex: 1,
    minWidth: 260,
    width: '100%',
  },
  errorBanner: {
    width: '100%',
    backgroundColor: 'rgba(255, 96, 94, 0.15)',
    borderWidth: 1,
    borderColor: '#ff605e',
    padding: Spacing.two,
    borderRadius: 0, // 0px voxel doctrine
  },
  pressed: {
    opacity: 0.7,
  },
});
