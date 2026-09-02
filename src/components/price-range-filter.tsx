import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  PanResponder,
  Platform,
  Pressable,
} from 'react-native';
import { ThemedText } from './themed-text';
import { Spacing } from '@/constants/theme';

export interface PriceRangeFilterProps {
  absoluteMin?: number;
  absoluteMax?: number;
  minPrice: number;
  maxPrice: number;
  onPriceChange: (min: number, max: number) => void;
  title?: string;
  currencySymbol?: string;
}

const VISUAL_HANDLE_SIZE = 18;
const TOUCH_TARGET_SIZE = 36;
const TRACK_HEIGHT = 4;

export function PriceRangeFilter({
  absoluteMin = 0,
  absoluteMax = 10000,
  minPrice,
  maxPrice,
  onPriceChange,
  title = 'ช่วงราคา',
}: PriceRangeFilterProps) {
  // Measured track width
  const [trackWidth, setTrackWidth] = useState<number>(0);
  const trackRef = useRef<View>(null);

  // Local text input states for fluid typing
  const [minText, setMinText] = useState<string>(String(minPrice));
  const [maxText, setMaxText] = useState<string>(String(maxPrice));

  // Keep latest values in refs to prevent recreate and closure staleness
  const absMinRef = useRef(absoluteMin);
  const absMaxRef = useRef(absoluteMax);
  const minPriceRef = useRef(minPrice);
  const maxPriceRef = useRef(maxPrice);
  const trackWidthRef = useRef(trackWidth);
  const onPriceChangeRef = useRef(onPriceChange);

  absMinRef.current = absoluteMin;
  absMaxRef.current = absoluteMax;
  minPriceRef.current = minPrice;
  maxPriceRef.current = maxPrice;
  trackWidthRef.current = trackWidth;
  onPriceChangeRef.current = onPriceChange;

  // Sync inputs with props
  useEffect(() => {
    setMinText(String(minPrice));
  }, [minPrice]);

  useEffect(() => {
    setMaxText(String(maxPrice));
  }, [maxPrice]);

  const rangeSpan = Math.max(1, absoluteMax - absoluteMin);

  // Calculate percentage & position safely
  const minPercent = Math.max(0, Math.min(1, (minPrice - absoluteMin) / rangeSpan));
  const maxPercent = Math.max(0, Math.min(1, (maxPrice - absoluteMin) / rangeSpan));

  const minPos = trackWidth > 0 ? minPercent * trackWidth : 0;
  const maxPos = trackWidth > 0 ? maxPercent * trackWidth : 0;

  // Fluid update handler with clamping
  const updateRange = useCallback((newMin: number, newMax: number) => {
    const clampedMin = Math.max(absMinRef.current, Math.min(newMin, newMax));
    const clampedMax = Math.min(absMaxRef.current, Math.max(newMax, clampedMin));

    setMinText(String(clampedMin));
    setMaxText(String(clampedMax));
    onPriceChangeRef.current(clampedMin, clampedMax);
  }, []);

  // Web Pointer Dragging (60 FPS, global window tracking, no dropped gestures)
  const handleWebPointerDown = (type: 'min' | 'max') => (e: any) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    e.preventDefault();
    e.stopPropagation();

    const trackElement = trackRef.current as any;
    if (!trackElement || !trackElement.getBoundingClientRect) return;

    const getPositionValue = (clientX: number) => {
      const rect = trackElement.getBoundingClientRect();
      const relativeX = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const ratio = rect.width > 0 ? relativeX / rect.width : 0;
      return Math.round(absMinRef.current + ratio * (absMaxRef.current - absMinRef.current));
    };

    const onPointerMove = (moveEvent: MouseEvent | PointerEvent) => {
      const currentVal = getPositionValue(moveEvent.clientX);
      if (type === 'min') {
        updateRange(Math.min(currentVal, maxPriceRef.current), maxPriceRef.current);
      } else {
        updateRange(minPriceRef.current, Math.max(currentVal, minPriceRef.current));
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
  };

  // Mobile PanResponder for Min Handle (Left)
  const minPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {},
        onPanResponderMove: (_, gestureState) => {
          if (trackWidthRef.current <= 0) return;
          const currentPercent = (minPriceRef.current - absMinRef.current) / (absMaxRef.current - absMinRef.current);
          const currentPx = currentPercent * trackWidthRef.current;
          const targetPx = Math.max(0, Math.min(currentPx + gestureState.dx, trackWidthRef.current));
          const newRatio = targetPx / trackWidthRef.current;
          const newVal = Math.round(absMinRef.current + newRatio * (absMaxRef.current - absMinRef.current));
          updateRange(Math.min(newVal, maxPriceRef.current), maxPriceRef.current);
        },
      }),
    [updateRange]
  );

  // Mobile PanResponder for Max Handle (Right)
  const maxPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {},
        onPanResponderMove: (_, gestureState) => {
          if (trackWidthRef.current <= 0) return;
          const currentPercent = (maxPriceRef.current - absMinRef.current) / (absMaxRef.current - absMinRef.current);
          const currentPx = currentPercent * trackWidthRef.current;
          const targetPx = Math.max(0, Math.min(currentPx + gestureState.dx, trackWidthRef.current));
          const newRatio = targetPx / trackWidthRef.current;
          const newVal = Math.round(absMinRef.current + newRatio * (absMaxRef.current - absMinRef.current));
          updateRange(minPriceRef.current, Math.max(newVal, minPriceRef.current));
        },
      }),
    [updateRange]
  );

  // Commit text input values on blur or enter
  const commitMinInput = () => {
    let parsed = parseFloat(minText.replace(/[^0-9.]/g, ''));
    if (isNaN(parsed)) parsed = absoluteMin;
    updateRange(parsed, maxPrice);
  };

  const commitMaxInput = () => {
    let parsed = parseFloat(maxText.replace(/[^0-9.]/g, ''));
    if (isNaN(parsed)) parsed = absoluteMax;
    updateRange(minPrice, parsed);
  };

  // Tap anywhere on track to move closest handle
  const handleTrackPress = (e: any) => {
    const clickX = e.nativeEvent.locationX;
    const distToMin = Math.abs(clickX - minPos);
    const distToMax = Math.abs(clickX - maxPos);
    const ratio = trackWidth > 0 ? Math.max(0, Math.min(1, clickX / trackWidth)) : 0;
    const clickedVal = Math.round(absoluteMin + ratio * rangeSpan);

    if (distToMin <= distToMax) {
      updateRange(clickedVal, maxPrice);
    } else {
      updateRange(minPrice, clickedVal);
    }
  };

  return (
    <View style={styles.container}>
      {/* Title */}
      <ThemedText type="smallBold" style={styles.title}>
        {title}
      </ThemedText>

      {/* Two Inputs Row: [ Min ] - [ Max ] */}
      <View style={styles.inputsRow}>
        <View style={styles.inputWrapper}>
          <TextInput
            value={minText}
            onChangeText={setMinText}
            onBlur={commitMinInput}
            onSubmitEditing={commitMinInput}
            keyboardType="numeric"
            placeholder={String(absoluteMin)}
            placeholderTextColor="#898481"
            style={styles.input}
          />
        </View>

        <ThemedText style={styles.dashText}>-</ThemedText>

        <View style={styles.inputWrapper}>
          <TextInput
            value={maxText}
            onChangeText={setMaxText}
            onBlur={commitMaxInput}
            onSubmitEditing={commitMaxInput}
            keyboardType="numeric"
            placeholder={String(absoluteMax)}
            placeholderTextColor="#898481"
            style={styles.input}
          />
        </View>
      </View>

      {/* Range Slider Track Area */}
      <View
        ref={trackRef}
        style={styles.sliderContainer}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w > 0) setTrackWidth(w);
        }}
      >
        {/* Inactive Background Track (tappable) */}
        <Pressable onPress={handleTrackPress} style={styles.trackBackground}>
          {/* Active Highlighted Range Track */}
          <View
            style={[
              styles.trackActive,
              {
                left: Math.max(0, minPos),
                width: Math.max(0, maxPos - minPos),
              },
            ]}
          />
        </Pressable>

        {/* Min Handle (Left) with large transparent hit box */}
        <View
          {...minPanResponder.panHandlers}
          {...(Platform.OS === 'web' ? { onPointerDown: handleWebPointerDown('min') } : {})}
          style={[
            styles.touchTarget,
            {
              left: Math.max(0, Math.min(minPos - TOUCH_TARGET_SIZE / 2, trackWidth - TOUCH_TARGET_SIZE)),
            },
          ]}
        >
          <View style={styles.visualHandle}>
            <View style={styles.handleInnerDot} />
          </View>
        </View>

        {/* Max Handle (Right) with large transparent hit box */}
        <View
          {...maxPanResponder.panHandlers}
          {...(Platform.OS === 'web' ? { onPointerDown: handleWebPointerDown('max') } : {})}
          style={[
            styles.touchTarget,
            {
              left: Math.max(0, Math.min(maxPos - TOUCH_TARGET_SIZE / 2, trackWidth - TOUCH_TARGET_SIZE)),
            },
          ]}
        >
          <View style={styles.visualHandle}>
            <View style={styles.handleInnerDot} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: Spacing.one,
    gap: Spacing.two,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ede5e2',
    letterSpacing: 0.5,
  },
  inputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  inputWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#3d3938',               // surface-dark-soft
    borderRadius: 6,                      // matching user's rounded box in screenshot
    backgroundColor: '#262423',           // surface-mid
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  input: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ede5e2',
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
        fontFamily: 'var(--font-sans)',
      },
    }),
  },
  dashText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#898481',
    paddingHorizontal: 2,
  },
  sliderContainer: {
    width: '100%',
    height: 36,
    justifyContent: 'center',
    position: 'relative',
    marginTop: 6,
    ...Platform.select({
      web: {
        userSelect: 'none',
        touchAction: 'none',
      } as any,
    }),
  },
  trackBackground: {
    width: '100%',
    height: TRACK_HEIGHT,
    backgroundColor: '#3d3938',           // Inactive track
    borderRadius: 2,
    position: 'relative',
    justifyContent: 'center',
  },
  trackActive: {
    height: TRACK_HEIGHT,
    backgroundColor: '#ff7675',           // Matching user image coral/salmon active line
    borderRadius: 2,
    position: 'absolute',
    top: 0,
  },
  touchTarget: {
    position: 'absolute',
    top: 36 / 2 - TOUCH_TARGET_SIZE / 2,
    width: TOUCH_TARGET_SIZE,
    height: TOUCH_TARGET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    ...Platform.select({
      web: {
        cursor: 'grab',
      } as any,
    }),
  },
  visualHandle: {
    width: VISUAL_HANDLE_SIZE,
    height: VISUAL_HANDLE_SIZE,
    borderRadius: VISUAL_HANDLE_SIZE / 2,
    borderWidth: 2.5,
    borderColor: '#ff7675',               // Coral circle ring as in user image
    backgroundColor: '#ffffff',           // White center
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
      } as any,
    }),
  },
  handleInnerDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ff7675',
  },
});
