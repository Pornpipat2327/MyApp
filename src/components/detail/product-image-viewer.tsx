/**
 * @file product-image-viewer.tsx
 * @description คอมโพเนนต์แสดงผลรูปภาพสินค้าขนาดใหญ่ สไตล์ Minecraft Voxel Design System
 * 0px Voxel Doctrine, Dark Canvas (#1d1e1e), และ Category Badge (#6cc349)
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
        <Image source={imgSrc} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.placeholder}>
          <SymbolView
            tintColor={theme.textSecondary}
            name={{ ios: 'keyboard', android: 'keyboard', web: 'keyboard' } as any}
            size={80}
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
    borderRadius: 0, // 0px voxel doctrine
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3d3938',
    backgroundColor: '#1d1e1e',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: Spacing.three,
    left: Spacing.three,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 0, // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#6cc349',
    backgroundColor: 'rgba(108, 195, 73, 0.15)',
  },
  categoryText: {
    color: '#6cc349',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
