import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  color?: string;
  emptyColor?: string;
}

export function StarRating({
  value,
  onChange,
  size = 28,
  color = '#FFCC00',
  emptyColor = '#D1D1D6',
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number>(0);

  const display = hovered > 0 ? hovered : value;

  return (
    <View style={styles.row}>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable
            key={star}
            onPress={() => onChange(star)}
            onPointerEnter={() => setHovered(star)}
            onPointerLeave={() => setHovered(0)}
            style={({ pressed }) => [styles.starBtn, pressed && styles.pressed]}
            accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <ThemedText
              style={[
                styles.star,
                { fontSize: size, color: star <= display ? color : emptyColor },
              ]}
            >
              ★
            </ThemedText>
          </Pressable>
        ))}
      </View>
      <ThemedText type="smallBold" style={styles.label}>
        {value.toFixed(1)} / 5
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  starBtn: {
    padding: 2,
  },
  pressed: { opacity: 0.6 },
  star: {
    lineHeight: undefined,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
