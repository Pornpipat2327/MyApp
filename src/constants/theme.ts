/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Theme updated to Minecraft design system (desgian.md).
 * Keys are unchanged — only values are replaced. No business logic is affected.
 */

import '@/global.css';

import { Platform } from 'react-native';

// ─── Minecraft Design System — all surfaces use dark canvas ───────────────
// Both light and dark use the Minecraft dark-canvas palette so the voxel
// aesthetic is enforced regardless of system color scheme.
export const Colors = {
  light: {
    text: '#ffffff',              // off-white
    background: '#313131',        // canvas-dark
    backgroundElement: '#1d1e1e', // surface-dark
    backgroundSelected: '#3d3938',// surface-dark-soft
    textSecondary: '#d0c5c0',     // grey-2
    border: '#3d3938',            // surface border divider
  },
  dark: {
    text: '#ffffff',              // off-white
    background: '#313131',        // canvas-dark
    backgroundElement: '#1d1e1e', // surface-dark
    backgroundSelected: '#3d3938',// surface-dark-soft
    textSecondary: '#d0c5c0',     // grey-2
    border: '#3d3938',            // surface border divider
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80, web: 80 }) ?? 80;
export const MaxContentWidth = 800;
