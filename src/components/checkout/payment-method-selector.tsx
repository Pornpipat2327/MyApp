/**
 * @file payment-method-selector.tsx
 * @description คอมโพเนนต์เลือกช่องทางการชำระเงิน สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Dark Border (#3d3938), Active Border (#6cc349), และ Square Radios (0px)
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { PaymentMethod } from './types';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  grandTotal: number;
}

export function PaymentMethodSelector({
  selectedMethod,
  onSelectMethod,
  grandTotal,
}: PaymentMethodSelectorProps) {
  return (
    <ThemedView type="backgroundElement" style={styles.sectionCard}>
      {/* ส่วนหัวการ์ดช่องทางการชำระเงิน */}
      <View style={styles.cardHeaderRow}>
        <SymbolView
          tintColor="#6cc349"
          name={{ ios: 'creditcard.fill', android: 'payment', web: 'payment' } as any}
          size={20}
        />
        <ThemedText type="smallBold" style={styles.cardHeaderTitle}>
          ช่องทางการชำระเงิน (Payment Method)
        </ThemedText>
      </View>

      <View style={styles.methodsList}>
        {/* ตัวเลือก 1: PromptPay QR Code */}
        <Pressable
          onPress={() => onSelectMethod('promptpay')}
          style={[
            styles.methodOption,
            selectedMethod === 'promptpay'
              ? styles.methodOptionActive
              : styles.methodOptionInactive,
          ]}
        >
          <View style={styles.optionRadioRow}>
            <View
              style={[
                styles.radioCircle,
                selectedMethod === 'promptpay' && styles.radioCircleActive,
              ]}
            >
              {selectedMethod === 'promptpay' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">พร้อมเพย์ QR Code (PromptPay - แนะนำ)</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                สแกนจ่ายได้ทันทีผ่านทุก Mobile Banking Application
              </ThemedText>
            </View>
          </View>

          {selectedMethod === 'promptpay' && (
            <View style={styles.qrContainer}>
              <View style={styles.qrDemoBox}>
                <SymbolView
                  tintColor="#6cc349"
                  name={{ ios: 'qrcode', android: 'qr_code_2', web: 'qr_code_2' } as any}
                  size={120}
                />
                <ThemedText type="smallBold" style={{ marginTop: 8, color: '#6cc349' }}>
                  สแกนจ่าย ${grandTotal.toFixed(2)}
                </ThemedText>
              </View>
            </View>
          )}
        </Pressable>

        {/* ตัวเลือก 2: โอนเงินผ่านธนาคาร */}
        <Pressable
          onPress={() => onSelectMethod('bank_transfer')}
          style={[
            styles.methodOption,
            selectedMethod === 'bank_transfer'
              ? styles.methodOptionActive
              : styles.methodOptionInactive,
          ]}
        >
          <View style={styles.optionRadioRow}>
            <View
              style={[
                styles.radioCircle,
                selectedMethod === 'bank_transfer' && styles.radioCircleActive,
              ]}
            >
              {selectedMethod === 'bank_transfer' && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText type="smallBold">โอนเงินผ่านบัญชีธนาคาร (Bank Transfer)</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                ธนาคารกสิกรไทย / ไทยพาณิชย์
              </ThemedText>
            </View>
          </View>

          {selectedMethod === 'bank_transfer' && (
            <View style={styles.bankInfoBox}>
              <ThemedText type="smallBold" style={{ color: '#6cc349' }}>
                ธนาคารกสิกรไทย (KBANK)
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                เลขบัญชี: 123-4-56789-0
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                ชื่อบัญชี: บจก. เอ็กซ์ตรีม คีย์บอร์ด สโตร์
              </ThemedText>
            </View>
          )}
        </Pressable>

        {/* ตัวเลือก 3: เก็บเงินปลายทาง COD */}
        <Pressable
          onPress={() => onSelectMethod('cod')}
          style={[
            styles.methodOption,
            selectedMethod === 'cod'
              ? styles.methodOptionActive
              : styles.methodOptionInactive,
          ]}
        >
          <View style={styles.optionRadioRow}>
            <View
              style={[
                styles.radioCircle,
                selectedMethod === 'cod' && styles.radioCircleActive,
              ]}
            >
              {selectedMethod === 'cod' && <View style={styles.radioInner} />}
            </View>
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
  methodsList: {
    gap: Spacing.two,
  },
  methodOption: {
    padding: Spacing.three,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    gap: Spacing.two,
  },
  methodOptionInactive: {
    borderColor: '#3d3938',
  },
  methodOptionActive: {
    borderColor: '#6cc349',
    borderWidth: 2,
  },
  optionRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 0, // 0px square checkbox
    borderWidth: 2,
    borderColor: '#898481',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: '#6cc349',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 0,
    backgroundColor: '#6cc349',
  },
  qrContainer: {
    alignItems: 'center',
    padding: Spacing.two,
  },
  qrDemoBox: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.two,
    borderWidth: 1,
    borderColor: '#6cc349',
    borderRadius: 0,
    width: '100%',
    maxWidth: 240,
    backgroundColor: '#262423',
  },
  bankInfoBox: {
    padding: Spacing.two,
    backgroundColor: 'rgba(108, 195, 73, 0.08)',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#52a535',
    gap: 2,
  },
});
