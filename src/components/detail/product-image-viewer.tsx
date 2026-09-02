/**
 * @file product-image-viewer.tsx
 * @description คอมโพเนนต์แสดงผลรูปภาพสินค้าขนาดใหญ่ในหน้ารายละเอียด พร้อม Badge หมวดหมู่
 */

import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getImageSource } from '@/utils/image';

interface ProductImageViewerProps {
  image?: string;
  category?: string;
}

export function ProductImageViewer({ image, category }: ProductImageViewerProps) {
  const theme = useTheme();
  const imgSrc = getImageSource(image);

  return (
    <ThemedView type="backgroundElement" style={styles.container}>
      {imgSrc ? (
        <Image source={imgSrc} style={styles.image} resizeMode="contain" />
      ) : (
        <View style={styles.placeholder}>
          <SymbolView
            tintColor={theme.textSecondary}
            name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' } as any}
            size={72}
          />
          <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 8 }}>
            ไม่มีรูปภาพตัวอย่าง
          </ThemedText>
        </View>
      )}

      {category && (
        <View style={styles.categoryBadge}>
          <ThemedText type="smallBold" style={styles.categoryText}>
            {category}
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 320,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
    position: 'relative',
  },
  image: {
    width: '90%',
    height: '90%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    color: '#ffffff',
    fontSize: 12,
  },
});
