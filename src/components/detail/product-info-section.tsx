/**
 * @file product-info-section.tsx
 * @description คอมโพเนนต์แสดงข้อมูลหลักของสินค้า (ชื่อ, ราคา, คะแนนรีวิว, จำนวนสต็อก, สถานที่จัดเก็บ, คำอธิบาย)
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

interface ProductInfoSectionProps {
  name: string;
  price: number | string;
  rating?: number | string;
  stock?: number | string;
  location?: string;
  description?: string;
}

export function ProductInfoSection({
  name,
  price,
  rating = 4.5,
  stock = 0,
  location,
  description,
}: ProductInfoSectionProps) {
  const numericPrice = Number(price) || 0;
  const numericStock = Number(stock) || 0;
  const isOutOfStock = numericStock <= 0;

  return (
    <View style={styles.container}>
      {/* ชื่อสินค้า */}
      <ThemedText type="subtitle" style={styles.productName}>
        {name}
      </ThemedText>

      {/* แถวแสดงราคาและคะแนนรีวิว */}
      <View style={styles.priceRow}>
        <ThemedText type="subtitle" style={styles.priceText}>
          ${numericPrice.toFixed(2)}
        </ThemedText>
        <View style={styles.ratingBadge}>
          <ThemedText style={styles.starIcon}>★</ThemedText>
          <ThemedText type="smallBold" style={{ fontSize: 13 }}>
            {Number(rating).toFixed(1)} / 5.0
          </ThemedText>
        </View>
      </View>

      {/* สเปกสินค้า: สต็อก และ สถานที่ */}
      <ThemedView type="backgroundElement" style={styles.specsCard}>
        <View style={styles.specItem}>
          <ThemedText type="small" themeColor="textSecondary">
            สถานะสต็อก:
          </ThemedText>
          <ThemedText
            type="smallBold"
            style={{
              color: isOutOfStock ? '#FF3B30' : '#34C759',
            }}
          >
            {isOutOfStock ? 'สินค้าหมด (Out of Stock)' : `พร้อมส่ง (${numericStock} ชิ้น)`}
          </ThemedText>
        </View>

        {location ? (
          <View style={styles.specItem}>
            <ThemedText type="small" themeColor="textSecondary">
              คลังจัดเก็บ:
            </ThemedText>
            <ThemedText type="smallBold">{location}</ThemedText>
          </View>
        ) : null}
      </ThemedView>

      {/* รายละเอียดสินค้า */}
      <View style={styles.descSection}>
        <ThemedText type="smallBold" style={styles.descTitle}>
          รายละเอียดสินค้า (Description)
        </ThemedText>
        <ThemedText
          type="small"
          themeColor="textSecondary"
          style={styles.descText}
        >
          {description && description.trim()
            ? description
            : 'ไม่มีคำอธิบายเพิ่มเติมสำหรับสินค้านี้'}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  productName: {
    fontSize: 22,
    lineHeight: 28,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    color: '#6cc349',
    fontSize: 26,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 204, 0, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  starIcon: {
    color: '#FFCC00',
    fontSize: 14,
  },
  specsCard: {
    padding: Spacing.three,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
    gap: Spacing.two,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  descSection: {
    gap: Spacing.one,
  },
  descTitle: {
    fontSize: 15,
  },
  descText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
