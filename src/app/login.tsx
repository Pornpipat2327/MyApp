import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  TextInput,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { TopHeader } from '@/components/top-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { getLoginApiUrl, getBaseUrl } from '@/constants/api';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string; role: string } | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(getLoginApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userData = {
          username: data.user?.username || data.username || username.trim(),
          role: data.user?.role || data.role || 'user',
          token: data.token,
        };

        if (Platform.OS === 'web') {
          localStorage.setItem('user', JSON.stringify(userData));
          if (data.token) {
            localStorage.setItem('token', data.token);
          }
          window.dispatchEvent(new Event('auth-change'));
        }

        setUser(userData);
        router.replace('/');
      } else {
        setErrorMsg(data.message || 'Login failed. Please check credentials.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Cannot connect to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please fill in all fields');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch(`${getBaseUrl()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMsg('Account created! Please sign in with your credentials.');
        setMode('login');
        setPassword('');
      } else {
        setErrorMsg(data.message || 'Registration failed. Username may already exist.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Cannot connect to server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth-change'));
    }
    setUser(null);
    setUsername('');
    setPassword('');
  };

  return (
    <ThemedView type="background" style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <TopHeader />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <ThemedView type="backgroundElement" style={styles.heroBanner}>
            <ThemedText type="subtitle" style={styles.heroTitle}>
              {mode === 'login' ? 'Welcome Back' : 'Join ExtremeKeys'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.heroSubtitle}>
              {mode === 'login'
                ? 'Sign in to access your administrative panel & account settings.'
                : 'Create an account to manage custom keyboards and orders.'}
            </ThemedText>
          </ThemedView>

          {/* Form Card */}
          <ThemedView type="backgroundElement" style={styles.formCard}>
            {user ? (
              <View style={styles.loggedInBox}>
                <SymbolView
                  tintColor={theme.text}
                  name={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' } as any}
                  size={64}
                />
                <ThemedText type="subtitle" style={{ marginTop: Spacing.two }}>
                  {user.username}
                </ThemedText>
                <View style={styles.statusBadge}>
                  <ThemedText type="smallBold" style={{ color: '#6cc349' }}>
                    Active Session ({user.role})
                  </ThemedText>
                </View>

                <Pressable
                  onPress={handleLogout}
                  style={({ pressed }) =>
                    [
                      styles.submitButton,
                      { backgroundColor: '#ff605e', marginTop: Spacing.four }, // warning-red logout
                      pressed && styles.pressed,
                    ] as any}
                >
                  <ThemedText type="smallBold" style={styles.submitButtonText}>
                    Sign Out
                  </ThemedText>
                </Pressable>
              </View>
            ) : (
              <>
                {/* Tabs for Login / Register */}
                <View style={styles.tabContainer}>
                  <Pressable
                    onPress={() => {
                      setMode('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    style={[
                      styles.tabButton,
                      mode === 'login' && { borderBottomColor: theme.text, borderBottomWidth: 2 },
                    ]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={{ color: mode === 'login' ? theme.text : theme.textSecondary }}
                    >
                      Sign In
                    </ThemedText>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setMode('register');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    style={[
                      styles.tabButton,
                      mode === 'register' && { borderBottomColor: theme.text, borderBottomWidth: 2 },
                    ]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={{ color: mode === 'register' ? theme.text : theme.textSecondary }}
                    >
                      Register
                    </ThemedText>
                  </Pressable>
                </View>

                {/* Error Banner */}
                {errorMsg && (
                  <View style={styles.errorBanner}>
                    <ThemedText style={styles.errorText}>{errorMsg}</ThemedText>
                  </View>
                )}

                {/* Success Banner */}
                {successMsg && (
                  <View style={[styles.errorBanner, { backgroundColor: 'rgba(52, 199, 89, 0.15)', borderColor: '#34C759' }]}>
                    <ThemedText style={{ color: '#34C759', fontSize: 13 }}>{successMsg}</ThemedText>
                  </View>
                )}

                {/* Username Input */}
                <View style={styles.inputGroup}>
                  <ThemedText type="smallBold" style={styles.inputLabel}>
                    Username
                  </ThemedText>
                  <TextInput
                    placeholder="Enter username"
                    placeholderTextColor={theme.textSecondary}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    style={[
                      styles.input,
                      { color: theme.text, backgroundColor: theme.background, borderColor: 'rgba(128,128,128,0.2)' },
                    ] as any}
                  />
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <ThemedText type="smallBold" style={styles.inputLabel}>
                    Password
                  </ThemedText>
                  <TextInput
                    placeholder="Enter password"
                    placeholderTextColor={theme.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={[
                      styles.input,
                      { color: theme.text, backgroundColor: theme.background, borderColor: 'rgba(128,128,128,0.2)' },
                    ] as any}
                  />
                </View>

                {/* Submit Button */}
                <Pressable
                  onPress={mode === 'login' ? handleLogin : handleRegister}
                  disabled={loading}
                  style={({ pressed }) =>
                    [
                      styles.submitButton,
                      (pressed || loading) && styles.pressed,
                    ] as any}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <ThemedText type="smallBold" style={styles.submitButtonText}>
                      {mode === 'login' ? 'Sign In' : 'Create Account'}
                    </ThemedText>
                  )}
                </Pressable>
              </>
            )}
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    paddingHorizontal: Spacing.three,
  },
  heroBanner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    marginBottom: Spacing.three,
    borderRadius: 0,                      // 0px voxel doctrine
    borderWidth: 2,
    borderColor: '#3d3938',               // surface-dark-soft
    borderLeftWidth: 4,
    borderLeftColor: '#6cc349',           // vanilla-green-3 accent stripe
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
    ...Platform.select({ web: { fontFamily: 'var(--font-sans)' } }),
  },
  heroSubtitle: {
    marginTop: Spacing.one,
    color: '#d0c5c0',                     // grey-2
  },
  formCard: {
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
    borderRadius: 0,                      // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#3d3938',               // surface-dark-soft
    ...Platform.select({
      web: { width: `calc(100% - ${Spacing.four * 2}px)` as any },
    }),
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.three,
    borderBottomWidth: 2,
    borderBottomColor: '#3d3938',         // surface-dark-soft
  },
  tabButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    marginRight: Spacing.two,
  },
  loggedInBox: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  statusBadge: {
    backgroundColor: 'rgba(108,195,73,0.15)', // vanilla-green tint
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 0,                      // 0px voxel doctrine
    borderWidth: 1,
    borderColor: '#6cc349',               // vanilla-green-3
    marginTop: Spacing.two,
  },
  errorBanner: {
    backgroundColor: 'rgba(255,96,94,0.15)', // warning-red tint
    borderColor: '#ff605e',               // warning-red
    borderWidth: 1,
    padding: Spacing.two,
    borderRadius: 0,                      // 0px voxel doctrine
    marginBottom: Spacing.three,
  },
  errorText: {
    color: '#ff605e',                     // warning-red
  },
  inputGroup: {
    marginBottom: Spacing.three,
  },
  inputLabel: {
    marginBottom: Spacing.one,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#d0c5c0',                     // grey-2 eyebrow label
    ...Platform.select({ web: { fontFamily: 'var(--font-sans)' } }),
  },
  input: {
    borderWidth: 1,
    borderColor: '#898481',               // grey-soft
    borderRadius: 0,                      // 0px voxel doctrine
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
    backgroundColor: '#262423',           // surface-mid
    color: '#ede5e2',                     // grey-warm-1
    height: 48,                           // text-input height per spec
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
        fontFamily: 'var(--font-sans)',
      },
    }),
  },
  submitButton: {
    width: '100%',
    paddingVertical: 15,                  // button-primary padding per spec
    borderRadius: 0,                      // 0px voxel doctrine
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
    backgroundColor: '#3c8527',           // vanilla-green-5 — primary button fill
    borderWidth: 2,
    borderColor: '#262423',               // surface-mid border per spec
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.54,
    color: '#ffffff',
    ...Platform.select({ web: { fontFamily: 'var(--font-sans)' } }),
  },
  pressed: {
    opacity: 0.7,
  },
});
