import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'title' && styles.title,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'link' && styles.link,
        type === 'linkPrimary' && styles.linkPrimary,
        type === 'code' && styles.code,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    fontFamily: Platform.select({ web: 'var(--font-sans)', default: undefined }),
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    fontFamily: Platform.select({ web: 'var(--font-sans)', default: undefined }),
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: Platform.select({ web: 'var(--font-sans)', default: undefined }),
  },
  title: {
    fontSize: 48,
    fontWeight: '400',
    lineHeight: 43,           // lineHeight 0.9 per display-md spec
    letterSpacing: -0.5,
    fontFamily: Platform.select({ web: 'var(--font-display)', default: undefined }),
  },
  subtitle: {
    fontSize: 24,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: 0.96,
    fontFamily: Platform.select({ web: 'var(--font-sans)', default: undefined }),
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#6cc349',         // vanilla-green-3 — nav-link-hover accent
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: '700' }) ?? '500',
    fontSize: 12,
  },
});
