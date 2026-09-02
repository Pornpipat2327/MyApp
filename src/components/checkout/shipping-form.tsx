/**
 * @file shipping-form.tsx
 * @description ฟอร์มกรอกที่อยู่สำหรับจัดส่งสินค้า สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Dark Border (#3d3938), Surface Mid Input (#262423), และ Grey-2 Eyebrows (#d0c5c0)
 */

import React from 'react';
import { StyleSheet, View, TextInput, Platform } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { ShippingAddressValues } from './types';

interface ShippingFormProps {
  values: ShippingAddressValues;
  onChange: (field: keyof ShippingAddressValues, value: string) => void;
}

export function ShippingForm({ values, onChange }: ShippingFormProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.sectionCard}>
      {/* ส่วนหัวการ์ดที่อยู่จัดส่ง */}
      <View style={styles.cardHeaderRow}>
        <SymbolView
          tintColor="#6cc349"
          name={{ ios: 'shippingbox.fill', android: 'local_shipping', web: 'local_shipping' } as any}
          size={20}
        />
        <ThemedText type="smallBold" style={styles.cardHeaderTitle}>
          ที่อยู่สำหรับจัดส่ง (Shipping Address)
        </ThemedText>
      </View>

      <View style={styles.formContent}>
        {/* ชื่อผู้รับ */}
        <View style={styles.fieldGroup}>
          <ThemedText style={styles.fieldLabel}>ชื่อ-นามสกุล ผู้รับ *</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="เช่น สมชาย ใจดี"
            placeholderTextColor="#898481"
            value={values.recipientName}
            onChangeText={(text) => onChange('recipientName', text)}
          />
        </View>

        {/* เบอร์โทรศัพท์ */}
        <View style={styles.fieldGroup}>
          <ThemedText style={styles.fieldLabel}>เบอร์โทรศัพท์ติดต่อ *</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="เช่น 081-234-5678"
            placeholderTextColor="#898481"
            keyboardType="phone-pad"
            value={values.phone}
            onChangeText={(text) => onChange('phone', text)}
          />
        </View>

        {/* ที่อยู่จัดส่ง */}
        <View style={styles.fieldGroup}>
          <ThemedText style={styles.fieldLabel}>บ้านเลขที่, ถนน, แขวง/ตำบล *</ThemedText>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="เช่น 123/45 ซอยทองหล่อ ถนนสุขุมวิท"
            placeholderTextColor="#898481"
            multiline
            numberOfLines={2}
            value={values.address}
            onChangeText={(text) => onChange('address', text)}
          />
        </View>

        {/* จังหวัด และ รหัสไปรษณีย์ */}
        <View style={styles.rowTwoCols}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <ThemedText style={styles.fieldLabel}>จังหวัด *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="เช่น กรุงเทพฯ"
              placeholderTextColor="#898481"
              value={values.city}
              onChangeText={(text) => onChange('city', text)}
            />
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <ThemedText style={styles.fieldLabel}>รหัสไปรษณีย์ *</ThemedText>
            <TextInput
              style={styles.input}
              placeholder="10110"
              placeholderTextColor="#898481"
              keyboardType="number-pad"
              value={values.postalCode}
              onChangeText={(text) => onChange('postalCode', text)}
            />
          </View>
        </View>

        {/* หมายเหตุเพิ่มเติม */}
        <View style={styles.fieldGroup}>
          <ThemedText style={styles.fieldLabel}>หมายเหตุถึงผู้จัดส่ง (ถ้ามี)</ThemedText>
          <TextInput
            style={styles.input}
            placeholder="เช่น ฝากไว้ที่ป้อม รปภ. / โทรบอกก่อนส่ง"
            placeholderTextColor="#898481"
            value={values.note}
            onChangeText={(text) => onChange('note', text)}
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#3d3938',
    gap: Spacing.three,
    borderRadius: 0, // 0px voxel doctrine
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#3d3938',
    paddingBottom: Spacing.two,
  },
  cardHeaderTitle: {
    fontSize: 16,
  },
  formContent: {
    gap: Spacing.three,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#d0c5c0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#898481',
    borderRadius: 0, // 0px voxel doctrine
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
    backgroundColor: '#262423',
    color: '#ede5e2',
    height: 48,
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
        fontFamily: 'var(--font-sans)',
      },
    }),
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
});
