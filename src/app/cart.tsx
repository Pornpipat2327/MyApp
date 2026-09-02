import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  Image,
  TextInput,
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
import { useCart, AVAILABLE_COUPONS } from '@/hooks/use-cart';
import { getBaseUrl } from '@/constants/api';

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
  const [couponFeedback, setCouponFeedback] = useState<{ success: boolean; message: string } | null>(null);

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

        {/* Header Bar */}
        <View style={[styles.headerBar, { borderBottomColor: 'rgba(128,128,128,0.15)' }]}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.push('/product' as any))}
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          >
            <SymbolView
              tintColor={theme.text}
              name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' } as any}
              size={20}
            />
            <ThemedText type="smallBold">Back</ThemedText>
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>
            Shopping Cart ({totalItems})
          </ThemedText>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {items.length === 0 ? (
            /* Empty Cart State */
            <ThemedView type="backgroundElement" style={styles.emptyCard}>
              <SymbolView
                tintColor={theme.textSecondary}
                name={{ ios: 'cart', android: 'shopping_cart', web: 'shopping_cart' } as any}
                size={64}
              />
              <ThemedText type="subtitle" style={{ marginTop: Spacing.three }}>
                Your Cart is Empty
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center', maxWidth: 300, marginTop: Spacing.one }}>
                Looks like you haven't added any custom keyboards to your cart yet.
              </ThemedText>
              <Pressable
                onPress={() => router.push('/product')}
                style={({ pressed }) => [styles.browseBtn, { backgroundColor: theme.text }, pressed && styles.pressed]}
              >
                <ThemedText type="smallBold" style={{ color: theme.background }}>
                  Explore Keyboards
                </ThemedText>
              </Pressable>
            </ThemedView>
          ) : (
            <View style={styles.mainWrapper}>
              {/* Left/Main Column: Cart Items */}
              <View style={styles.itemsSection}>
                <View style={styles.sectionHeadingRow}>
                  <ThemedText type="smallBold" style={styles.sectionTitle}>
                    Cart Items ({totalItems})
                  </ThemedText>
                  <Pressable onPress={clearCart} style={({ pressed }) => pressed && styles.pressed}>
                    <ThemedText type="small" style={{ color: '#FF3B30' }}>
                      Clear All
                    </ThemedText>
                  </Pressable>
                </View>

                <View style={{ gap: Spacing.three }}>
                  {items.map((item) => {
                    const imgSrc = getImageSource(item.image);
                    const maxStock = item.stock ?? 99;
                    return (
                      <ThemedView key={item.id} type="backgroundElement" style={styles.cartItemCard}>
                        {/* Thumbnail */}
                        <View style={styles.imageWrapper}>
                          {imgSrc ? (
                            <Image source={imgSrc} style={styles.itemImage} resizeMode="cover" />
                          ) : (
                            <View style={[styles.itemImage, styles.placeholderImg, { backgroundColor: theme.background }]}>
                              <SymbolView
                                tintColor={theme.textSecondary}
                                name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' } as any}
                                size={28}
                              />
                            </View>
                          )}
                        </View>

                        {/* Details */}
                        <View style={styles.itemInfo}>
                          <View style={styles.itemTopRow}>
                            <View style={{ flex: 1, paddingRight: Spacing.two }}>
                              {item.category && (
                                <ThemedText type="small" style={styles.itemCategory}>
                                  {item.category}
                                </ThemedText>
                              )}
                              <ThemedText type="smallBold" style={styles.itemName} numberOfLines={2}>
                                {item.name}
                              </ThemedText>
                            </View>
                            {/* Delete Button */}
                            <Pressable
                              onPress={() => removeFromCart(item.id)}
                              style={({ pressed }) => [styles.deleteBtn, pressed && styles.pressed]}
                            >
                              <SymbolView
                                tintColor="#FF3B30"
                                name={{ ios: 'trash', android: 'delete', web: 'delete' } as any}
                                size={18}
                              />
                            </Pressable>
                          </View>

                          {/* Price & Quantity Row */}
                          <View style={styles.itemBottomRow}>
                            <ThemedText type="smallBold" style={styles.itemPrice}>
                              ${(item.price * item.quantity).toFixed(2)}
                              <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12, fontWeight: '400' }}>
                                {' '}(${item.price.toFixed(2)} / ea)
                              </ThemedText>
                            </ThemedText>

                            {/* Stepper */}
                            <View style={[styles.stepper, { backgroundColor: theme.background }]}>
                              <Pressable
                                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                                style={({ pressed }) => [styles.stepBtn, pressed && styles.pressed]}
                              >
                                <ThemedText style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>−</ThemedText>
                              </Pressable>
                              <ThemedText style={[styles.stepQty, { color: theme.text }]}>
                                {item.quantity}
                              </ThemedText>
                              <Pressable
                                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={item.quantity >= maxStock}
                                style={({ pressed }) => [
                                  styles.stepBtn,
                                  (pressed || item.quantity >= maxStock) && { opacity: 0.3 },
                                ]}
                              >
                                <ThemedText style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>+</ThemedText>
                              </Pressable>
                            </View>
                          </View>
                        </View>
                      </ThemedView>
                    );
                  })}
                </View>

                {/* Promo Code Section */}
                <ThemedView type="backgroundElement" style={styles.couponCard}>
                  <ThemedText type="smallBold" style={{ marginBottom: Spacing.two }}>
                    🏷️ Promo Code / Discount Voucher
                  </ThemedText>
                  
                  {appliedCoupon ? (
                    <View style={styles.appliedCouponRow}>
                      <View style={styles.appliedCouponBadge}>
                        <ThemedText type="smallBold" style={{ color: '#34C759' }}>
                          ✓ Code '{appliedCoupon.code}' Applied ({appliedCoupon.discountPercent}% OFF)
                        </ThemedText>
                      </View>
                      <Pressable onPress={removeCoupon} style={({ pressed }) => [styles.removeCouponBtn, pressed && styles.pressed]}>
                        <ThemedText type="small" style={{ color: '#FF3B30' }}>Remove</ThemedText>
                      </Pressable>
                    </View>
                  ) : (
                    <>
                      <View style={styles.couponInputRow}>
                        <TextInput
                          placeholder="Enter coupon code (e.g. PROMO10)"
                          placeholderTextColor={theme.textSecondary}
                          value={couponInput}
                          onChangeText={(txt) => {
                            setCouponInput(txt);
                            setCouponFeedback(null);
                          }}
                          autoCapitalize="characters"
                          style={[
                            styles.couponInput,
                            { color: theme.text, backgroundColor: theme.background, borderColor: 'rgba(128,128,128,0.2)' },
                          ] as any}
                        />
                        <Pressable
                          onPress={() => handleApplyCoupon()}
                          style={({ pressed }) => [
                            styles.applyCouponBtn,
                            { backgroundColor: theme.text },
                            pressed && styles.pressed,
                          ]}
                        >
                          <ThemedText type="smallBold" style={{ color: theme.background }}>
                            Apply
                          </ThemedText>
                        </Pressable>
                      </View>

                      {couponFeedback && (
                        <ThemedText
                          type="small"
                          style={{
                            color: couponFeedback.success ? '#34C759' : '#FF3B30',
                            marginTop: Spacing.one,
                          }}
                        >
                          {couponFeedback.message}
                        </ThemedText>
                      )}

                      {/* Quick Apply Suggestions */}
                      <View style={styles.couponChipsRow}>
                        <ThemedText type="small" themeColor="textSecondary">
                          Try:
                        </ThemedText>
                        {AVAILABLE_COUPONS.map((c) => (
                          <Pressable
                            key={c.code}
                            onPress={() => handleApplyCoupon(c.code)}
                            style={({ pressed }) => [styles.couponChip, { backgroundColor: theme.background }, pressed && styles.pressed]}
                          >
                            <ThemedText type="small" style={{ color: '#007AFF', fontWeight: '700' }}>
                              {c.code} ({c.discountPercent}%)
                            </ThemedText>
                          </Pressable>
                        ))}
                      </View>
                    </>
                  )}
                </ThemedView>
              </View>

              {/* Right Column: Order Summary Card */}
              <View style={styles.summarySection}>
                <ThemedView type="backgroundElement" style={styles.summaryCard}>
                  <ThemedText type="smallBold" style={styles.summaryTitle}>
                    Order Summary
                  </ThemedText>

                  <View style={styles.summaryRow}>
                    <ThemedText type="small" themeColor="textSecondary">Subtotal ({totalItems} items)</ThemedText>
                    <ThemedText type="smallBold">${subtotal.toFixed(2)}</ThemedText>
                  </View>

                  <View style={styles.summaryRow}>
                    <ThemedText type="small" themeColor="textSecondary">Shipping Fee</ThemedText>
                    <ThemedText type="smallBold" style={{ color: shippingFee === 0 ? '#34C759' : theme.text }}>
                      {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                    </ThemedText>
                  </View>

                  {discount > 0 && (
                    <View style={styles.summaryRow}>
                      <ThemedText type="small" style={{ color: '#34C759' }}>Discount ({appliedCoupon?.code})</ThemedText>
                      <ThemedText type="smallBold" style={{ color: '#34C759' }}>-${discount.toFixed(2)}</ThemedText>
                    </View>
                  )}

                  {/* Free shipping threshold indicator */}
                  {subtotal < 100 && (
                    <View style={styles.freeShippingTip}>
                      <ThemedText type="small" style={{ color: '#007AFF', fontSize: 12 }}>
                        💡 Add ${(100 - subtotal).toFixed(2)} more for FREE shipping!
                      </ThemedText>
                    </View>
                  )}

                  <View style={[styles.summaryDivider, { backgroundColor: 'rgba(128,128,128,0.15)' }]} />

                  <View style={styles.totalRow}>
                    <ThemedText type="subtitle" style={{ fontSize: 18 }}>Grand Total</ThemedText>
                    <ThemedText type="subtitle" style={styles.grandTotalText}>
                      ${grandTotal.toFixed(2)}
                    </ThemedText>
                  </View>

                  {/* Checkout Button */}
                  <Pressable
                    onPress={() => router.push('/checkout' as any)}
                    style={({ pressed }) => [styles.checkoutBtn, pressed && styles.pressed]}
                  >
                    <ThemedText type="smallBold" style={styles.checkoutBtnText}>
                      Proceed to Checkout →
                    </ThemedText>
                  </Pressable>

                  {/* Continue Shopping Button */}
                  <Pressable
                    onPress={() => router.push('/product')}
                    style={({ pressed }) => [styles.continueBtn, pressed && styles.pressed]}
                  >
                    <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
                      ← Continue Shopping
                    </ThemedText>
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
    borderBottomWidth: 2,
    borderBottomColor: '#3d3938',         // surface-dark-soft
    backgroundColor: '#313131',           // canvas-dark
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
  itemsSection: {
    flex: 1,
    minWidth: 320,
    gap: Spacing.three,
  },
  summarySection: {
    width: 340,
    ...Platform.select({
      web: {
        position: 'sticky',
        top: 20,
      } as any,
    }),
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#d0c5c0',
    ...Platform.select({ web: { fontFamily: 'var(--font-sans)' } }),
  },
  cartItemCard: {
    flexDirection: 'row',
    padding: Spacing.three,
    borderRadius: 0,                      // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    gap: Spacing.three,
    alignItems: 'center',
  },
  imageWrapper: {
    width: 84,
    height: 84,
    borderRadius: 0,                      // 0px voxel doctrine
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImg: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
    height: '100%',
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemCategory: {
    fontSize: 11,
    color: '#6cc349',                     // vanilla-green-3 eyebrow
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemName: {
    fontSize: 15,
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  itemPrice: {
    fontSize: 16,
    color: '#6cc349',                     // vanilla-green-3 price accent
    fontWeight: '800',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 0,                      // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    overflow: 'hidden',
  },
  stepBtn: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    minWidth: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepQty: {
    paddingHorizontal: Spacing.two,
    fontSize: 14,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  couponCard: {
    padding: Spacing.three,
    borderRadius: 0,                      // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    marginTop: Spacing.two,
  },
  couponInputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  couponInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#898481',               // grey-soft
    borderRadius: 0,                      // 0px voxel doctrine
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
    backgroundColor: '#262423',           // surface-mid
    color: '#ede5e2',                     // grey-warm-1
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
        fontFamily: 'var(--font-sans)',
      },
    }),
  },
  applyCouponBtn: {
    paddingHorizontal: Spacing.four,
    borderRadius: 0,                      // 0px voxel doctrine
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3c8527',           // vanilla-green-5
    borderWidth: 2,
    borderColor: '#262423',
  },
  couponChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: Spacing.two,
  },
  couponChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: 0,                      // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#6cc349',               // vanilla-green-3
  },
  appliedCouponRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appliedCouponBadge: {
    backgroundColor: 'rgba(108,195,73,0.15)', // vanilla-green tint
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: 0,                      // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#6cc349',
  },
  removeCouponBtn: {
    padding: Spacing.one,
  },
  summaryCard: {
    padding: Spacing.four,
    borderRadius: 0,                      // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    gap: Spacing.two,
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: Spacing.one,
    color: '#d0c5c0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  freeShippingTip: {
    backgroundColor: 'rgba(108,195,73,0.08)', // vanilla-green tint
    padding: Spacing.two,
    borderRadius: 0,                      // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#52a535',               // vanilla-green-4
    marginVertical: 4,
  },
  summaryDivider: {
    height: 1,
    width: '100%',
    marginVertical: Spacing.one,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  grandTotalText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#6cc349',                     // vanilla-green-3 grand total
  },
  checkoutBtn: {
    backgroundColor: '#3c8527',           // vanilla-green-5 primary button
    paddingVertical: 15,                  // button-primary padding per spec
    borderRadius: 0,                      // 0px voxel doctrine
    borderWidth: 2,
    borderColor: '#262423',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.54,
  },
  continueBtn: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  emptyCard: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.four,
    borderRadius: 0,                      // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    marginTop: Spacing.six,
  },
  browseBtn: {
    marginTop: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: 0,                      // 0px voxel doctrine
    backgroundColor: '#3c8527',           // vanilla-green-5
    borderWidth: 2,
    borderColor: '#262423',
  },
  pressed: {
    opacity: 0.75,
  },
});

