/**
 * @file price-range-filter.tsx
 * @description คอมโพเนนต์ตัวกรองช่วงราคาแบบ Dual Slider (Min-Max)
 * รองรับทั้งการลากบน Web (Pointer Events 60 FPS) และ Mobile (PanResponder) พร้อมช่องกรอกตัวเลขแบบ Manual
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  PanResponder,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface PriceRangeFilterProps {
  /** ค่าต่ำสุดที่เป็นไปได้ของสินค้าทั้งหมด */
  absoluteMin: number;
  /** ค่าสูงสุดที่เป็นไปได้ของสินค้าทั้งหมด */
  absoluteMax: number;
  /** ราคาต่ำสุดที่เลือกอยู่ */
  minPrice: number;
  /** ราคาสูงสุดที่เลือกอยู่ */
  maxPrice: number;
  /** ฟังก์ชัน Callback เมื่อช่วงราคาเปลี่ยนแปลง */
  onPriceChange: (min: number, max: number) => void;
  /** ฟังก์ชันรีเซ็ตช่วงราคา */
  onReset?: () => void;
}

const THUMB_SIZE = 22;

export function PriceRangeFilter({
  absoluteMin,
  absoluteMax,
  minPrice,
  maxPrice,
  onPriceChange,
  onReset,
}: PriceRangeFilterProps) {
  const theme = useTheme();

  const [trackWidth, setTrackWidth] = useState<number>(0);
  const trackRef = useRef<View>(null);

  // การจัดการ TextInput แบบ Controlled/Uncontrolled ที่ปลอดภัยโดยไม่ต้องใช้ useEffect
  const [minInput, setMinInput] = useState<string | null>(null);
  const [maxInput, setMaxInput] = useState<string | null>(null);

  const displayMin = minInput !== null ? minInput : String(minPrice);
  const displayMax = maxInput !== null ? maxInput : String(maxPrice);

  const rangeSpan = Math.max(1, absoluteMax - absoluteMin);

  // คำนวณเปอร์เซ็นต์และตำแหน่งของ Thumb บนแทร็ก
  const minPercent = Math.max(0, Math.min(1, (minPrice - absoluteMin) / rangeSpan));
  const maxPercent = Math.max(0, Math.min(1, (maxPrice - absoluteMin) / rangeSpan));

  const minPos = trackWidth > 0 ? minPercent * trackWidth : 0;
  const maxPos = trackWidth > 0 ? maxPercent * trackWidth : 0;

  // ฟังก์ชันอัปเดตช่วงราคาพร้อม Clamping ขอบเขต
  const updateRange = useCallback(
    (newMin: number, newMax: number) => {
      const clampedMin = Math.max(absoluteMin, Math.min(newMin, newMax));
      const clampedMax = Math.min(absoluteMax, Math.max(newMax, clampedMin));
      onPriceChange(clampedMin, clampedMax);
    },
    [absoluteMin, absoluteMax, onPriceChange]
  );

  // รองรับการลากบน Web (Pointer Events)
  const handleWebPointerDown = useCallback(
    (type: 'min' | 'max') => (e: any) => {
      if (Platform.OS !== 'web' || typeof window === 'undefined') return;
      e.preventDefault();
      e.stopPropagation();

      const trackElement = trackRef.current as any;
      if (!trackElement || !trackElement.getBoundingClientRect) return;

      const getPositionValue = (clientX: number) => {
        const rect = trackElement.getBoundingClientRect();
        const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));
        const ratio = rect.width > 0 ? relativeX / rect.width : 0;
        return Math.round(absoluteMin + ratio * (absoluteMax - absoluteMin));
      };

      const onPointerMove = (moveEvent: MouseEvent | PointerEvent) => {
        const currentVal = getPositionValue(moveEvent.clientX);
        if (type === 'min') {
          updateRange(Math.min(currentVal, maxPrice), maxPrice);
        } else {
          updateRange(minPrice, Math.max(currentVal, minPrice));
        }
      };

      const onPointerUp = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('mousemove', onPointerMove);
        window.removeEventListener('mouseup', onPointerUp);
      };

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp);
      window.addEventListener('mousemove', onPointerMove, { passive: false });
      window.addEventListener('mouseup', onPointerUp);
    },
    [absoluteMin, absoluteMax, minPrice, maxPrice, updateRange]
  );

  // Mobile PanResponder สำหรับ Min Handle (Left)
  const minPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          if (trackWidth <= 0) return;
          const currentPercent = (minPrice - absoluteMin) / (absoluteMax - absoluteMin);
          const currentPx = currentPercent * trackWidth;
          const targetPx = Math.max(0, Math.min(currentPx + gestureState.dx, trackWidth));
          const newRatio = targetPx / trackWidth;
          const newVal = Math.round(absoluteMin + newRatio * (absoluteMax - absoluteMin));
          updateRange(Math.min(newVal, maxPrice), maxPrice);
        },
      }),
    [absoluteMin, absoluteMax, minPrice, maxPrice, trackWidth, updateRange]
  );

  // Mobile PanResponder สำหรับ Max Handle (Right)
  const maxPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
          if (trackWidth <= 0) return;
          const currentPercent = (maxPrice - absoluteMin) / (absoluteMax - absoluteMin);
          const currentPx = currentPercent * trackWidth;
          const targetPx = Math.max(0, Math.min(currentPx + gestureState.dx, trackWidth));
          const newRatio = targetPx / trackWidth;
          const newVal = Math.round(absoluteMin + newRatio * (absoluteMax - absoluteMin));
          updateRange(minPrice, Math.max(newVal, minPrice));
        },
      }),
    [absoluteMin, absoluteMax, minPrice, maxPrice, trackWidth, updateRange]
  );

  // การจัดการเมื่อผู้ใช้กด Submit ในช่อง TextInput
  const handleMinSubmit = () => {
    if (minInput !== null) {
      const parsed = parseFloat(minInput);
      if (!isNaN(parsed)) {
        updateRange(parsed, maxPrice);
      }
      setMinInput(null);
    }
  };

  const handleMaxSubmit = () => {
    if (maxInput !== null) {
      const parsed = parseFloat(maxInput);
      if (!isNaN(parsed)) {
        updateRange(minPrice, parsed);
      }
      setMaxInput(null);
    }
  };

  const onTrackLayout = (event: LayoutChangeEvent) => {
    const w = event.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - trackWidth) > 1) {
      setTrackWidth(w);
    }
  };

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <View style={styles.headerRow}>
        <ThemedText type="smallBold" style={styles.title}>
          ตัวกรองช่วงราคา (Price Range)
        </ThemedText>
        {onReset && (
          <Pressable onPress={onReset} hitSlop={8}>
            <ThemedText type="small" style={{ color: '#FF3B30', fontSize: 12 }}>
              รีเซ็ต
            </ThemedText>
          </Pressable>
        )}
      </View>

      {/* แทร็กสไลเดอร์ */}
      <View style={styles.sliderContainer}>
        <View ref={trackRef} onLayout={onTrackLayout} style={[styles.trackBg, { backgroundColor: theme.border }]}>
          {/* แถบไฮไลต์ช่วงที่เลือก */}
          <View
            style={[
              styles.trackHighlight,
              {
                left: minPos,
                width: Math.max(0, maxPos - minPos),
                backgroundColor: '#6cc349',
              },
            ]}
          />
        </View>

        {/* ปุ่มลากต่ำสุด (Min Thumb) */}
        <View
          {...minPanResponder.panHandlers}
          onPointerDown={handleWebPointerDown('min')}
          style={[
            styles.thumb,
            {
              left: minPos - THUMB_SIZE / 2,
              backgroundColor: '#ffffff',
              borderColor: '#6cc349',
            },
          ]}
        />

        {/* ปุ่มลากสูงสุด (Max Thumb) */}
        <View
          {...maxPanResponder.panHandlers}
          onPointerDown={handleWebPointerDown('max')}
          style={[
            styles.thumb,
            {
              left: maxPos - THUMB_SIZE / 2,
              backgroundColor: '#ffffff',
              borderColor: '#6cc349',
            },
          ]}
        />
      </View>

      {/* ช่องกรอกตัวเลข Min และ Max */}
      <View style={styles.inputsRow}>
        <View style={styles.inputCol}>
          <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 11 }}>
            ต่ำสุด ($)
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
            value={displayMin}
            onChangeText={setMinInput}
            onBlur={handleMinSubmit}
            onSubmitEditing={handleMinSubmit}
            keyboardType="decimal-pad"
          />
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.hyphen}>
          -
        </ThemedText>

        <View style={styles.inputCol}>
          <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 11 }}>
            สูงสุด ($)
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
            value={displayMax}
            onChangeText={setMaxInput}
            onBlur={handleMaxSubmit}
            onSubmitEditing={handleMaxSubmit}
            keyboardType="decimal-pad"
          />
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.three,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
    gap: Spacing.three,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
  },
  sliderContainer: {
    height: 36,
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: THUMB_SIZE / 2,
  },
  trackBg: {
    height: 4,
    borderRadius: 2,
    position: 'relative',
  },
  trackHighlight: {
    height: 4,
    position: 'absolute',
    borderRadius: 2,
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  inputCol: {
    flex: 1,
    gap: 2,
  },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 13,
  },
  hyphen: {
    paddingTop: 14,
    fontSize: 16,
  },
});
