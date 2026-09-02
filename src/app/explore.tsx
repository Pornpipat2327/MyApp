/**
 * @file explore.tsx
 * @description หน้าจอคู่มือและข้อมูลการเริ่มต้นใช้งาน (Explore & Documentation Screen)
 */

import React from 'react';
import { SymbolView } from 'expo-symbols';
import { Platform, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TopHeader } from '@/components/top-header';
import { ExternalLink } from '@/components/external-link';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { WebBadge } from '@/components/web-badge';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function TabTwoScreen() {
  const theme = useTheme();

  return (
    <ThemedView type="background" style={styles.mainContainer}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader />

        <ScrollView
          style={[styles.scrollView, { backgroundColor: theme.background }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.container}>
            <ThemedView style={styles.titleContainer}>
              <ThemedText type="subtitle">คู่มือการพัฒนา (Explore)</ThemedText>
              <ThemedText style={styles.centerText} themeColor="textSecondary">
                เอกสารประกอบการพัฒนาแอปพลิเคชันด้วย Expo React Native
              </ThemedText>

              <ExternalLink href="https://docs.expo.dev" asChild>
                <Pressable style={({ pressed }) => pressed && styles.pressed}>
                  <ThemedView type="backgroundElement" style={styles.linkButton}>
                    <ThemedText type="link">Expo documentation</ThemedText>
                    <SymbolView
                      tintColor={theme.text}
                      name={{ ios: 'arrow.up.right.square', android: 'link', web: 'link' }}
                      size={12}
                    />
                  </ThemedView>
                </Pressable>
              </ExternalLink>
            </ThemedView>

            <ThemedView style={styles.sectionsWrapper}>
              <Collapsible title="File-based routing">
                <ThemedText type="small">
                  แอปพลิเคชันนี้ใช้ Expo Router โครงสร้างโฟลเดอร์ใน <ThemedText type="code">src/app/</ThemedText> จะถูกแปลงเป็นเส้นทาง Routing โดยอัตโนมัติ
                </ThemedText>
              </Collapsible>

              <Collapsible title="Android, iOS, and web support">
                <ThemedView type="backgroundElement" style={styles.collapsibleContent}>
                  <ThemedText type="small">
                    โปรเจกต์นี้รองรับ Cross-platform ทั้งบน Android, iOS และ Web Browser
                  </ThemedText>
                </ThemedView>
              </Collapsible>

              <Collapsible title="Architecture & Design System">
                <ThemedText type="small">
                  ออกแบบโดยแยกโมดูลฟังก์ชันการทำงานเป็นสัดส่วน (Modular Architecture) สไตล์ Voxel Design System
                </ThemedText>
              </Collapsible>
            </ThemedView>

            {Platform.OS === 'web' && <WebBadge />}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: BottomTabInset + Spacing.four,
  },
  container: {
    maxWidth: MaxContentWidth,
    width: '100%',
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  centerText: {
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  linkButton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.one,
    alignItems: 'center',
  },
  sectionsWrapper: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  collapsibleContent: {
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 6,
  },
});
