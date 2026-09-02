/**
 * @file cart-coupon-section.tsx
 * @description ส่วนใส่โค้ดคูปองส่วนลด แถบคูปองแนะนำ และการจัดการลบคูปอง
 */

import React from 'react';
import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Coupon, AVAILABLE_COUPONS } from '@/hooks/use-cart';

interface CartCouponSectionProps {
  couponInput: string;
  onCouponInputChange: (text: string) => void;
  onApplyCoupon: (code?: string) => void;
  onRemoveCoupon: () => void;
  appliedCoupon: Coupon | null;
  feedback: { success: boolean; message: string } | null;
}

export function CartCouponSection({
  couponInput,
  onCouponInputChange,
  onApplyCoupon,
  onRemoveCoupon,
  appliedCoupon,
  feedback,
}: CartCouponSectionProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold" style={styles.title}>
        🎟️ โค้ดส่วนลด (Promo Code)
      </ThemedText>

      {appliedCoupon ? (
        /* เมื่อมีการใส่คูปองสำเร็จแล้ว */
        <View style={[styles.appliedBox, { borderColor: '#34C759' }]}>
          <View style={{ flex: 1 }}>
            <ThemedText type="smallBold" style={{ color: '#34C759' }}>
              ✓ ใช้งานโค้ด: {appliedCoupon.code}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {appliedCoupon.description}
            </ThemedText>
          </View>
          <Pressable onPress={onRemoveCoupon} style={styles.removeBtn}>
            <ThemedText type="small" style={{ color: '#FF3B30' }}>
              ยกเลิก
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        /* ช่องกรอกโค้ดส่วนลด */
        <View style={styles.inputRow}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="ใส่โค้ดส่วนลด เช่น EXTREME10"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="characters"
            value={couponInput}
            onChangeText={onCouponInputChange}
          />
          <Pressable
            onPress={() => onApplyCoupon()}
            style={({ pressed }) => [
              styles.applyBtn,
              { backgroundColor: '#6cc349' },
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
              ใช้งาน
            </ThemedText>
          </Pressable>
        </View>
      )}

      {/* ข้อความแจ้งเตือนสถานะคูปอง */}
      {feedback && (
        <ThemedText
          type="small"
          style={{
            color: feedback.success ? '#34C759' : '#FF3B30',
            marginTop: 2,
          }}
        >
          {feedback.message}
        </ThemedText>
      )}

      {/* ชิปคูปองแนะนำที่กดใช้งานได้ทันที */}
      {!appliedCoupon && (
        <View style={styles.availableSection}>
          <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
            คูปองแนะนำสำหรับคุณ:
          </ThemedText>
          <View style={styles.chipsRow}>
            {AVAILABLE_COUPONS.map((cp) => (
              <Pressable
                key={cp.code}
                onPress={() => onApplyCoupon(cp.code)}
                style={({ pressed }) => [
                  styles.couponChip,
                  { backgroundColor: theme.background, borderColor: theme.border },
                  pressed && styles.pressed,
                ]}
              >
                <ThemedText type="smallBold" style={{ color: '#6cc349', fontSize: 11 }}>
                  🏷️ {cp.code}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.three,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
    gap: Spacing.two,
  },
  title: {
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    fontSize: 13,
  },
  applyBtn: {
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    borderRadius: 4,
  },
  appliedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: Spacing.two,
    borderRadius: 6,
    backgroundColor: 'rgba(52, 199, 89, 0.08)',
  },
  removeBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  availableSection: {
    gap: 4,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  couponChip: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.7,
  },
});
