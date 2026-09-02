/**
 * @file payment-method-selector.tsx
 * @description คอมโพเนนต์เลือกช่องทางการชำระเงิน (PromptPay, โอนผ่านธนาคาร, เก็บเงินปลายทาง)
 */

import React from 'react';
import { StyleSheet, View, Pressable, Image } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { PaymentMethod } from '@/types/order';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  totalAmount: number;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  totalAmount,
}: PaymentMethodSelectorProps) {
  const theme = useTheme();

  return (
    <ThemedView type="backgroundElement" style={styles.sectionCard}>
      {/* Header ของ Section */}
      <View style={styles.cardHeaderRow}>
        <SymbolView
          tintColor="#34C759"
          name={{ ios: 'creditcard.fill', android: 'payment', web: 'payment' } as any}
          size={20}
        />
        <ThemedText type="smallBold" style={styles.cardHeaderTitle}>
          2. เลือกวิธีชำระเงิน (Payment Method)
        </ThemedText>
      </View>

      <View style={styles.methodsList}>
        {/* ตัวเลือกที่ 1: PromptPay QR Code */}
        <Pressable
          onPress={() => onSelectMethod('promptpay')}
          style={[
            styles.methodOption,
            {
              backgroundColor: theme.background,
              borderColor: selectedMethod === 'promptpay' ? '#6cc349' : theme.border,
            },
          ]}
        >
          <View style={styles.optionRadioRow}>
            <View
              style={[
                styles.radioCircle,
                selectedMethod === 'promptpay' && { borderColor: '#6cc349', borderWidth: 5 },
              ]}
            />
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">PromptPay QR พร้อมเพย์ (แนะนำ)</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                สแกนจ่ายผ่าน Mobile Banking ได้ทุกธนาคาร ยอดเงินปรับทันที
              </ThemedText>
            </View>
          </View>

          {selectedMethod === 'promptpay' && (
            <View style={[styles.qrContainer, { backgroundColor: '#ffffff' }]}>
              <ThemedText type="smallBold" style={{ color: '#000000', marginBottom: 4 }}>
                ExtremeKey Official PromptPay
              </ThemedText>
              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PROMPTPAY-EXTREMEKEY-${totalAmount.toFixed(2)}`,
                }}
                style={styles.qrImage}
                resizeMode="contain"
              />
              <ThemedText type="small" style={{ color: '#555555', marginTop: 4 }}>
                ยอดชำระ: ฿{totalAmount.toFixed(2)}
              </ThemedText>
            </View>
          )}
        </Pressable>

        {/* ตัวเลือกที่ 2: โอนผ่านบัญชีธนาคาร (Bank Transfer) */}
        <Pressable
          onPress={() => onSelectMethod('bank_transfer')}
          style={[
            styles.methodOption,
            {
              backgroundColor: theme.background,
              borderColor: selectedMethod === 'bank_transfer' ? '#6cc349' : theme.border,
            },
          ]}
        >
          <View style={styles.optionRadioRow}>
            <View
              style={[
                styles.radioCircle,
                selectedMethod === 'bank_transfer' && { borderColor: '#6cc349', borderWidth: 5 },
              ]}
            />
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">โอนเงินผ่านบัญชีธนาคาร (Bank Transfer)</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                โอนผ่านเลขบัญชีธนาคารกสิกรไทย หรือ ธนาคารกรุงเทพ
              </ThemedText>
            </View>
          </View>

          {selectedMethod === 'bank_transfer' && (
            <View style={[styles.bankDetailsBox, { borderColor: theme.border }]}>
              <ThemedText type="smallBold" style={{ color: '#007AFF' }}>
                ธนาคารกสิกรไทย (KBANK)
              </ThemedText>
              <ThemedText type="small">เลขที่บัญชี: 123-4-56789-0</ThemedText>
              <ThemedText type="small">ชื่อบัญชี: บจก. เอ็กซ์ตรีม คีย์บอร์ด (ไทยแลนด์)</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 4 }}>
                * กรุณาเก็บหลักฐานสลิปการโอนไว้เพื่อตรวจสอบ
              </ThemedText>
            </View>
          )}
        </Pressable>

        {/* ตัวเลือกที่ 3: เก็บเงินปลายทาง (Cash on Delivery) */}
        <Pressable
          onPress={() => onSelectMethod('cod')}
          style={[
            styles.methodOption,
            {
              backgroundColor: theme.background,
              borderColor: selectedMethod === 'cod' ? '#6cc349' : theme.border,
            },
          ]}
        >
          <View style={styles.optionRadioRow}>
            <View
              style={[
                styles.radioCircle,
                selectedMethod === 'cod' && { borderColor: '#6cc349', borderWidth: 5 },
              ]}
            />
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">เก็บเงินปลายทาง (Cash on Delivery: COD)</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                ชำระเงินสดหรือสแกนจ่ายกับเจ้าหน้าที่พนักงานขนส่งเมื่อพัสดุถึงมือคุณ
              </ThemedText>
            </View>
          </View>
        </Pressable>
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
  methodsList: {
    gap: Spacing.three,
  },
  methodOption: {
    padding: Spacing.three,
    borderWidth: 1.5,
    borderRadius: 6,
    gap: Spacing.two,
  },
  optionRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#888888',
  },
  qrContainer: {
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 8,
    marginTop: Spacing.two,
  },
  qrImage: {
    width: 160,
    height: 160,
  },
  bankDetailsBox: {
    padding: Spacing.two,
    borderWidth: 1,
    borderRadius: 4,
    marginTop: Spacing.one,
    gap: 2,
  },
});
