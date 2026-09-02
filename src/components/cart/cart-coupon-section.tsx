/**
 * @file cart-coupon-section.tsx
 * @description ส่วนกรอกคูปองส่วนลดและแสดงคูปองที่แนะนำ สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Dark Border (#3d3938), Input (#262423), และ Button (#3c8527)
 */

import React from 'react';
import { StyleSheet, View, TextInput, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
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
  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      <ThemedText type="smallBold" style={styles.title}>
        คูปองส่วนลด (Coupon Code)
      </ThemedText>

      {appliedCoupon ? (
        <View style={styles.appliedBox}>
          <View style={{ flex: 1 }}>
            <ThemedText type="smallBold" style={{ color: '#6cc349' }}>
              ✓ ใช้คูปอง: {appliedCoupon.code}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
              {appliedCoupon.description}
            </ThemedText>
          </View>
          <Pressable onPress={onRemoveCoupon} style={styles.removeBtn}>
            <ThemedText type="smallBold" style={{ color: '#ff605e', fontSize: 12 }}>
              ยกเลิก
            </ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="กรอกรหัสส่วนลด..."
            placeholderTextColor="#898481"
            value={couponInput}
            onChangeText={onCouponInputChange}
            autoCapitalize="characters"
          />
          <Pressable
            onPress={() => onApplyCoupon()}
            style={({ pressed }) => [
              styles.applyBtn,
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type="smallBold" style={{ color: '#ffffff', fontSize: 13 }}>
              ใช้งาน
            </ThemedText>
          </Pressable>
        </View>
      )}

      {/* ข้อความผลลัพธ์การใช้งานคูปอง */}
      {feedback && (
        <ThemedText
          type="small"
          style={{
            color: feedback.success ? '#6cc349' : '#ff605e',
            fontSize: 12,
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
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  title: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: '#d0c5c0',
  },
  inputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#898481',
    borderRadius: 0, // 0px voxel doctrine
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
    backgroundColor: '#262423',
    color: '#ede5e2',
  },
  applyBtn: {
    paddingHorizontal: Spacing.four,
    borderRadius: 0, // 0px voxel doctrine
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3c8527', // vanilla-green-5
    borderWidth: 2,
    borderColor: '#262423',
  },
  appliedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6cc349',
    padding: Spacing.two,
    borderRadius: 0, // 0px voxel doctrine
    backgroundColor: 'rgba(108, 195, 73, 0.15)',
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
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  couponChip: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 3,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#6cc349',
    backgroundColor: '#262423',
  },
  pressed: {
    opacity: 0.7,
  },
});
