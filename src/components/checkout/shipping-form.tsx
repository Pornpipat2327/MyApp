/**
 * @file shipping-form.tsx
 * @description ฟอร์มกรอกข้อมูลที่อยู่และข้อมูลติดต่อสำหรับจัดส่งสินค้า
 */

import React from 'react';
import { StyleSheet, View, TextInput } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ShippingFormValues {
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  note: string;
}

interface ShippingFormProps {
  values: ShippingFormValues;
  onChange: <K extends keyof ShippingFormValues>(key: K, value: ShippingFormValues[K]) => void;
}

export function ShippingForm({ values, onChange }: ShippingFormProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.sectionCard}>
      {/* Header ของ Section */}
      <View style={styles.cardHeaderRow}>
        <SymbolView
          tintColor="#007AFF"
          name={{ ios: 'shippingbox.fill', android: 'local_shipping', web: 'local_shipping' } as any}
          size={20}
        />
        <ThemedText type="smallBold" style={styles.cardHeaderTitle}>
          1. ข้อมูลการจัดส่งและผู้รับ (Shipping Information)
        </ThemedText>
      </View>

      <View style={styles.formContent}>
        {/* ช่องกรอกชื่อผู้รับ */}
        <View style={styles.fieldGroup}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
            ชื่อ-นามสกุล ผู้รับ *
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="เช่น สมชาย สายแต่งบอร์ด"
            placeholderTextColor={theme.textSecondary}
            value={values.recipientName}
            onChangeText={(text) => onChange('recipientName', text)}
          />
        </View>

        {/* ช่องกรอกเบอร์โทรศัพท์ */}
        <View style={styles.fieldGroup}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
            เบอร์โทรศัพท์ติดต่อ *
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="เช่น 089-123-4567"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
            value={values.phone}
            onChangeText={(text) => onChange('phone', text)}
          />
        </View>

        {/* ช่องกรอกที่อยู่ */}
        <View style={styles.fieldGroup}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
            ที่อยู่ / บ้านเลขที่ / อาคาร / ถนน *
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="บ้านเลขที่, หมู่บ้าน, ซอย, ถนน..."
            placeholderTextColor={theme.textSecondary}
            multiline
            numberOfLines={3}
            value={values.address}
            onChangeText={(text) => onChange('address', text)}
          />
        </View>

        {/* แถวคู่: เขต/จังหวัด และ รหัสไปรษณีย์ */}
        <View style={styles.rowTwoCols}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
              จังหวัด / เมือง *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="เช่น กรุงเทพฯ"
              placeholderTextColor={theme.textSecondary}
              value={values.city}
              onChangeText={(text) => onChange('city', text)}
            />
          </View>

          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
              รหัสไปรษณีย์ *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.background,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="10110"
              placeholderTextColor={theme.textSecondary}
              keyboardType="number-pad"
              value={values.postalCode}
              onChangeText={(text) => onChange('postalCode', text)}
            />
          </View>
        </View>

        {/* หมายเหตุเพิ่มเติม */}
        <View style={styles.fieldGroup}>
          <ThemedText type="small" themeColor="textSecondary" style={styles.fieldLabel}>
            หมายเหตุถึงผู้จัดส่ง (ถ้ามี)
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="เช่น ฝากไว้ที่ป้อม รปภ. / โทรบอกก่อนส่ง"
            placeholderTextColor={theme.textSecondary}
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
    borderColor: 'rgba(128, 128, 128, 0.15)',
    gap: Spacing.three,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.1)',
    paddingBottom: Spacing.two,
  },
  cardHeaderTitle: {
    fontSize: 16,
  },
  formContent: {
    gap: Spacing.three,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
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
