import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  TextInput,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { TopHeader } from '@/components/top-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCart, CartItem } from '@/hooks/use-cart';
import { getBaseUrl } from '@/constants/api';

export interface Order {
  id: string;
  username: string;
  userRole?: string;
  createdAt: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  totalAmount: number;
  couponCode?: string;
  shippingAddress: {
    recipientName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    note?: string;
  };
  paymentMethod: 'promptpay' | 'bank_transfer' | 'cod';
  paymentStatus: 'paid' | 'pending';
  trackingNumber?: string;
}

export default function CheckoutScreen() {
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
    clearCart,
  } = useCart();

  // Form State
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'promptpay' | 'bank_transfer' | 'cod'>('promptpay');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Auto-fill user information if logged in
  useEffect(() => {
    if (Platform.OS === 'web') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const userObj = JSON.parse(userStr);
          if (userObj?.username) {
            setRecipientName(userObj.username);
          }
        } catch (e) {}
      }
    }
  }, []);

  const getImageSource = (imagePath?: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
      return { uri: imagePath };
    }
    if (imagePath.startsWith('/uploads/') || imagePath.startsWith('/')) {
      return { uri: `${getBaseUrl()}${imagePath}` };
    }
    return null;
  };

  const handlePlaceOrder = () => {
    // Validate inputs
    if (!recipientName.trim()) {
      setErrorMessage('Please enter recipient name');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Please enter phone number');
      return;
    }
    if (!address.trim() || !city.trim() || !postalCode.trim()) {
      setErrorMessage('Please fill in complete shipping address (Address, City, Postal Code)');
      return;
    }
    if (items.length === 0) {
      setErrorMessage('Your cart is empty. Please add products first.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      // Generate Order ID e.g. #EK-74892
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const orderId = `EK-${randomNum}`;

      let currentUsername = 'Guest';
      let currentRole = 'user';
      if (Platform.OS === 'web') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            currentUsername = u.username || 'Guest';
            currentRole = u.role || 'user';
          } catch (e) {}
        }
      }

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
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          note: note.trim(),
        },
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        trackingNumber: `TH${Math.floor(100000000 + Math.random() * 900000000)}TH`,
      };

      // Save to localStorage
      if (Platform.OS === 'web') {
        try {
          const existingOrdersStr = localStorage.getItem('extreme_keys_orders');
          const existingOrders: Order[] = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
          const updatedOrders = [newOrder, ...existingOrders];
          localStorage.setItem('extreme_keys_orders', JSON.stringify(updatedOrders));
          window.dispatchEvent(new Event('orders-change'));
        } catch (e) {
          console.error('Failed to save order to localStorage', e);
        }
      }

      // Clear cart
      clearCart();
      setLoading(false);
      setCompletedOrder(newOrder);
    }, 1200);
  };

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader />

        {/* Header Bar */}
        <View style={[styles.headerBar, { borderBottomColor: 'rgba(128,128,128,0.15)' }]}>
          <Pressable
            onPress={() => router.push('/cart' as any)}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor={theme.text}
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

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {completedOrder ? (
            /* Order Success Modal State */
            <ThemedView type="backgroundElement" style={styles.successCard}>
              <View style={styles.successIconCircle}>
                <SymbolView
                  tintColor="#34C759"
                  name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' } as any}
                  size={64}
                />
              </View>
              <ThemedText type="subtitle" style={styles.successTitle}>
                Order Placed Successfully! 🎉
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.successSubtitle}>
                Thank you for your purchase. Your custom keyboard order is now being processed.
              </ThemedText>

              {/* Order Info Box */}
              <View style={[styles.orderInfoBox, { backgroundColor: theme.background }]}>
                <View style={styles.infoRow}>
                  <ThemedText type="small" themeColor="textSecondary">Order ID</ThemedText>
                  <ThemedText type="smallBold" style={{ color: '#007AFF' }}>#{completedOrder.id}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText type="small" themeColor="textSecondary">Tracking Number</ThemedText>
                  <ThemedText type="smallBold">{completedOrder.trackingNumber}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText type="small" themeColor="textSecondary">Payment Method</ThemedText>
                  <ThemedText type="smallBold" style={{ textTransform: 'uppercase' }}>{completedOrder.paymentMethod}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText type="small" themeColor="textSecondary">Total Amount</ThemedText>
                  <ThemedText type="smallBold" style={{ color: '#34C759', fontSize: 16 }}>
                    ${completedOrder.totalAmount.toFixed(2)}
                  </ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText type="small" themeColor="textSecondary">Deliver To</ThemedText>
                  <ThemedText type="small" style={{ textAlign: 'right', maxWidth: '60%' }}>
                    {completedOrder.shippingAddress.recipientName}, {completedOrder.shippingAddress.address}, {completedOrder.shippingAddress.city} {completedOrder.shippingAddress.postalCode}
                  </ThemedText>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.successActions}>
                <Pressable
                  onPress={() => router.push('/orders' as any)}
                  style={({ pressed }) => [styles.viewOrdersBtn, { backgroundColor: theme.text }, pressed && styles.pressed]}
                >
                  <ThemedText type="smallBold" style={{ color: theme.background }}>
                    View My Orders
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/product')}
                  style={({ pressed }) => [styles.backHomeBtn, pressed && styles.pressed]}
                >
                  <ThemedText type="small" themeColor="textSecondary">
                    Continue Shopping
                  </ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          ) : (
            <View style={styles.mainWrapper}>
              {/* Left Column: Forms */}
              <View style={styles.formsColumn}>
                {errorMessage && (
                  <View style={styles.errorBanner}>
                    <ThemedText style={{ color: '#FF3B30', fontSize: 13 }}>⚠️ {errorMessage}</ThemedText>
                  </View>
                )}

                {/* 1. Shipping Information Form */}
                <ThemedView type="backgroundElement" style={styles.sectionCard}>
                  <View style={styles.cardHeaderRow}>
                    <SymbolView
                      tintColor="#007AFF"
                      name={{ ios: 'shippingbox.fill', android: 'local_shipping', web: 'local_shipping' } as any}
                      size={20}
                    />
                    <ThemedText type="smallBold" style={styles.cardHeaderTitle}>
                      1. Shipping Address & Contact
                    </ThemedText>
                  </View>

                  <View style={styles.inputGrid}>
                    <View style={styles.inputGroup}>
                      <ThemedText type="smallBold" style={styles.label}>Recipient Full Name *</ThemedText>
                      <TextInput
                        placeholder="e.g. John Doe"
                        placeholderTextColor={theme.textSecondary}
                        value={recipientName}
                        onChangeText={setRecipientName}
                        style={[styles.input, { color: theme.text, backgroundColor: theme.background }] as any}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <ThemedText type="smallBold" style={styles.label}>Phone Number *</ThemedText>
                      <TextInput
                        placeholder="e.g. 081-234-5678"
                        placeholderTextColor={theme.textSecondary}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        style={[styles.input, { color: theme.text, backgroundColor: theme.background }] as any}
                      />
                    </View>

                    <View style={[styles.inputGroup, { width: '100%' }]}>
                      <ThemedText type="smallBold" style={styles.label}>Delivery Address *</ThemedText>
                      <TextInput
                        placeholder="House no., Building, Street address"
                        placeholderTextColor={theme.textSecondary}
                        value={address}
                        onChangeText={setAddress}
                        style={[styles.input, { color: theme.text, backgroundColor: theme.background }] as any}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <ThemedText type="smallBold" style={styles.label}>City / District *</ThemedText>
                      <TextInput
                        placeholder="e.g. Bangkok / Chatuchak"
                        placeholderTextColor={theme.textSecondary}
                        value={city}
                        onChangeText={setCity}
                        style={[styles.input, { color: theme.text, backgroundColor: theme.background }] as any}
                      />
                    </View>

                    <View style={styles.inputGroup}>
                      <ThemedText type="smallBold" style={styles.label}>Postal Code *</ThemedText>
                      <TextInput
                        placeholder="e.g. 10900"
                        placeholderTextColor={theme.textSecondary}
                        value={postalCode}
                        onChangeText={setPostalCode}
                        keyboardType="numeric"
                        style={[styles.input, { color: theme.text, backgroundColor: theme.background }] as any}
                      />
                    </View>

                    <View style={[styles.inputGroup, { width: '100%' }]}>
                      <ThemedText type="smallBold" style={styles.label}>Delivery Note (Optional)</ThemedText>
                      <TextInput
                        placeholder="Special instructions for delivery rider..."
                        placeholderTextColor={theme.textSecondary}
                        value={note}
                        onChangeText={setNote}
                        style={[styles.input, { color: theme.text, backgroundColor: theme.background }] as any}
                      />
                    </View>
                  </View>
                </ThemedView>

                {/* 2. Payment Method Selector */}
                <ThemedView type="backgroundElement" style={styles.sectionCard}>
                  <View style={styles.cardHeaderRow}>
                    <SymbolView
                      tintColor="#34C759"
                      name={{ ios: 'creditcard.fill', android: 'payment', web: 'payment' } as any}
                      size={20}
                    />
                    <ThemedText type="smallBold" style={styles.cardHeaderTitle}>
                      2. Payment Method
                    </ThemedText>
                  </View>

                  <View style={styles.paymentOptions}>
                    {/* PromptPay QR */}
                    <Pressable
                      onPress={() => setPaymentMethod('promptpay')}
                      style={[
                        styles.paymentOptionCard,
                        { backgroundColor: theme.background },
                        paymentMethod === 'promptpay' && styles.paymentOptionActive,
                      ]}
                    >
                      <View style={styles.paymentOptionHeader}>
                        <View style={styles.radioCircle}>
                          {paymentMethod === 'promptpay' && <View style={styles.radioInner} />}
                        </View>
                        <ThemedText type="smallBold">📱 PromptPay QR Code</ThemedText>
                      </View>
                      <ThemedText type="small" themeColor="textSecondary" style={{ marginLeft: 28 }}>
                        Instant payment via Mobile Banking (Scannable QR Code)
                      </ThemedText>

                      {paymentMethod === 'promptpay' && (
                        <View style={styles.qrDemoBox}>
                          <View style={styles.qrCodePlaceholder}>
                            <ThemedText style={{ fontSize: 32 }}>📲</ThemedText>
                            <ThemedText type="smallBold" style={{ color: '#007AFF', marginTop: 4 }}>
                              PromptPay Thai QR
                            </ThemedText>
                            <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 11 }}>
                              Amount: ${grandTotal.toFixed(2)} (฿{(grandTotal * 35).toLocaleString()})
                            </ThemedText>
                          </View>
                          <ThemedText type="small" style={{ color: '#34C759', textAlign: 'center', marginTop: 6, fontSize: 12 }}>
                            ✓ Live QR generated — Automatic Verification Enabled
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>

                    {/* Bank Transfer */}
                    <Pressable
                      onPress={() => setPaymentMethod('bank_transfer')}
                      style={[
                        styles.paymentOptionCard,
                        { backgroundColor: theme.background },
                        paymentMethod === 'bank_transfer' && styles.paymentOptionActive,
                      ]}
                    >
                      <View style={styles.paymentOptionHeader}>
                        <View style={styles.radioCircle}>
                          {paymentMethod === 'bank_transfer' && <View style={styles.radioInner} />}
                        </View>
                        <ThemedText type="smallBold">🏦 Bank Transfer</ThemedText>
                      </View>
                      <ThemedText type="small" themeColor="textSecondary" style={{ marginLeft: 28 }}>
                        Kasikorn Bank (KBank) / Siam Commercial Bank (SCB)
                      </ThemedText>

                      {paymentMethod === 'bank_transfer' && (
                        <View style={styles.bankInfoBox}>
                          <ThemedText type="small" style={{ fontWeight: '700' }}>
                            🏦 Kasikorn Bank (KBANK)
                          </ThemedText>
                          <ThemedText type="small" themeColor="textSecondary">
                            Account: 123-4-56789-0 (ExtremeKeys Co., Ltd.)
                          </ThemedText>
                        </View>
                      )}
                    </Pressable>

                    {/* Cash on Delivery */}
                    <Pressable
                      onPress={() => setPaymentMethod('cod')}
                      style={[
                        styles.paymentOptionCard,
                        { backgroundColor: theme.background },
                        paymentMethod === 'cod' && styles.paymentOptionActive,
                      ]}
                    >
                      <View style={styles.paymentOptionHeader}>
                        <View style={styles.radioCircle}>
                          {paymentMethod === 'cod' && <View style={styles.radioInner} />}
                        </View>
                        <ThemedText type="smallBold">💵 Cash on Delivery (COD)</ThemedText>
                      </View>
                      <ThemedText type="small" themeColor="textSecondary" style={{ marginLeft: 28 }}>
                        Pay cash when the keyboard package arrives at your door
                      </ThemedText>
                    </Pressable>
                  </View>
                </ThemedView>
              </View>

              {/* Right Column: Order Summary & Confirm */}
              <View style={styles.summaryColumn}>
                <ThemedView type="backgroundElement" style={styles.summaryCard}>
                  <ThemedText type="smallBold" style={styles.summaryTitle}>
                    Order Review ({totalItems} items)
                  </ThemedText>

                  {/* Items mini list */}
                  <View style={styles.miniItemsList}>
                    {items.map((item) => (
                      <View key={item.id} style={styles.miniItemRow}>
                        <View style={styles.miniItemThumb}>
                          {getImageSource(item.image) ? (
                            <Image source={getImageSource(item.image)!} style={styles.miniImg} />
                          ) : (
                            <View style={styles.miniImgPlaceholder}>
                              <SymbolView tintColor={theme.textSecondary} name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' } as any} size={14} />
                            </View>
                          )}
                        </View>
                        <View style={{ flex: 1 }}>
                          <ThemedText type="smallBold" numberOfLines={1} style={{ fontSize: 13 }}>
                            {item.name}
                          </ThemedText>
                          <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 11 }}>
                            Qty: {item.quantity} × ${item.price.toFixed(2)}
                          </ThemedText>
                        </View>
                        <ThemedText type="smallBold" style={{ fontSize: 13 }}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </ThemedText>
                      </View>
                    ))}
                  </View>

                  <View style={[styles.divider, { backgroundColor: 'rgba(128,128,128,0.15)' }]} />

                  <View style={styles.priceRow}>
                    <ThemedText type="small" themeColor="textSecondary">Subtotal</ThemedText>
                    <ThemedText type="smallBold">${subtotal.toFixed(2)}</ThemedText>
                  </View>

                  <View style={styles.priceRow}>
                    <ThemedText type="small" themeColor="textSecondary">Shipping Fee</ThemedText>
                    <ThemedText type="smallBold" style={{ color: shippingFee === 0 ? '#34C759' : theme.text }}>
                      {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                    </ThemedText>
                  </View>

                  {discount > 0 && (
                    <View style={styles.priceRow}>
                      <ThemedText type="small" style={{ color: '#34C759' }}>Discount ({appliedCoupon?.code})</ThemedText>
                      <ThemedText type="smallBold" style={{ color: '#34C759' }}>-${discount.toFixed(2)}</ThemedText>
                    </View>
                  )}

                  <View style={[styles.divider, { backgroundColor: 'rgba(128,128,128,0.15)' }]} />

                  <View style={styles.totalRow}>
                    <ThemedText type="subtitle" style={{ fontSize: 18 }}>Total to Pay</ThemedText>
                    <ThemedText type="subtitle" style={styles.totalAmountText}>
                      ${grandTotal.toFixed(2)}
                    </ThemedText>
                  </View>

                  {/* Place Order Button */}
                  <Pressable
                    onPress={handlePlaceOrder}
                    disabled={loading || items.length === 0}
                    style={({ pressed }) => [
                      styles.placeOrderBtn,
                      (pressed || loading) && styles.pressed,
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <ThemedText type="smallBold" style={styles.placeOrderText}>
                        Place Order (${grandTotal.toFixed(2)}) 🚀
                      </ThemedText>
                    )}
                  </Pressable>
                </ThemedView>
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
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
  },
  mainWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.four,
  },
  formsColumn: {
    flex: 1,
    minWidth: 320,
    gap: Spacing.four,
  },
  summaryColumn: {
    width: 340,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 20,
      } as any,
    }),
  },
  sectionCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.one,
  },
  cardHeaderTitle: {
    fontSize: 16,
  },
  inputGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  inputGroup: {
    width: '48%',
    ...Platform.select({
      web: { width: `calc(50% - ${Spacing.two}px)` as any },
    }),
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.2)',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
    ...Platform.select({
      web: { outlineStyle: 'none' as any },
    }),
  },
  paymentOptions: {
    gap: Spacing.two,
  },
  paymentOptionCard: {
    padding: Spacing.three,
    borderRadius: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(128,128,128,0.15)',
  },
  paymentOptionActive: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: 2,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  qrDemoBox: {
    marginTop: Spacing.two,
    padding: Spacing.three,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    borderRadius: Spacing.two,
    alignItems: 'center',
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
    borderRadius: Spacing.two,
    width: '100%',
    maxWidth: 240,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bankInfoBox: {
    marginTop: Spacing.two,
    padding: Spacing.two,
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
    borderRadius: Spacing.one,
  },
  summaryCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  summaryTitle: {
    fontSize: 16,
    marginBottom: Spacing.one,
  },
  miniItemsList: {
    gap: Spacing.two,
    maxHeight: 180,
  },
  miniItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  miniItemThumb: {
    width: 36,
    height: 36,
    borderRadius: Spacing.one,
    overflow: 'hidden',
  },
  miniImg: {
    width: '100%',
    height: '100%',
  },
  miniImgPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(128,128,128,0.1)',
  },
  divider: {
    height: 1,
    width: '100%',
    marginVertical: Spacing.one,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalAmountText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#007AFF',
  },
  placeOrderBtn: {
    backgroundColor: '#34C759',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  placeOrderText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    padding: Spacing.two,
    borderRadius: Spacing.two,
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  successCard: {
    width: '100%',
    maxWidth: 540,
    alignItems: 'center',
    padding: Spacing.five,
    borderRadius: Spacing.four,
    marginTop: Spacing.four,
  },
  successIconCircle: {
    marginBottom: Spacing.two,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  successSubtitle: {
    textAlign: 'center',
    marginTop: Spacing.one,
    marginBottom: Spacing.four,
    maxWidth: 400,
  },
  orderInfoBox: {
    width: '100%',
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  successActions: {
    width: '100%',
    gap: Spacing.two,
  },
  viewOrdersBtn: {
    width: '100%',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backHomeBtn: {
    width: '100%',
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.75,
  },
});
