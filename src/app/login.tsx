import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Pressable,
  TextInput,
  Platform,
  Alert,
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

const BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3032' : 'http://localhost:3032';
const AUTH_LOGIN_URL = `${BASE_URL}/api/auth/login`;
const AUTH_REGISTER_URL = `${BASE_URL}/api/auth/register`;

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Restore stored user session on mount
  useEffect(() => {
    if (Platform.OS === 'web') {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch (e) {
          // ignore error
        }
      }
    }
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Please enter username and password');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(AUTH_LOGIN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setCurrentUser(data.user);
        if (Platform.OS === 'web') {
          window.alert(`Welcome back, ${data.user.username}!`);
          if (data.token) {
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
        } else {
          Alert.alert('Success', `Welcome back, ${data.user.username}!`);
        }
        router.push('/product');
      } else {
        const msg = data.message || 'Login failed. Please check credentials.';
        setErrorMsg(msg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setErrorMsg(`Connection error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMsg('Username and Password are required');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(AUTH_REGISTER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const msg = `Account registered successfully! Please log in now.`;
        if (Platform.OS === 'web') {
          window.alert(msg);
        } else {
          Alert.alert('Success', msg);
        }
        setMode('login');
      } else {
        const msg = data.message || 'Registration failed. Username may already exist.';
        setErrorMsg(msg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setErrorMsg(`Connection error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (Platform.OS === 'web') {
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
    }
    setUsername('');
    setEmail('');
    setPassword('');
    setErrorMsg(null);
    router.replace('/login' as any);
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
          {/* Hero Banner */}
          <View style={[styles.heroBanner, { backgroundColor: theme.backgroundElement }]}>
            <ThemedText type="subtitle" style={styles.heroTitle}>
              {currentUser ? 'User Account' : mode === 'login' ? 'Account Login' : 'Register Account'}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.heroSubtitle}>
              {currentUser
                ? 'You are signed in to ExtremeKeys Portal.'
                : 'Sign in or create an account to manage products and inventory.'}
            </ThemedText>
          </View>

          {/* Form Card */}
          <ThemedView type="backgroundElement" style={styles.formCard}>
            {currentUser ? (
              <View style={styles.loggedInBox}>
                <SymbolView
                  tintColor="#34C759"
                  name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' } as any}
                  size={56}
                />
                <ThemedText type="subtitle" style={{ marginTop: Spacing.two, fontSize: 20 }}>
                  {currentUser.username}
                </ThemedText>
                {currentUser.email && (
                  <ThemedText type="small" themeColor="textSecondary" style={{ marginTop: 2 }}>
                    {currentUser.email}
                  </ThemedText>
                )}

                <View style={styles.statusBadge}>
                  <ThemedText type="smallBold" style={{ color: '#34C759', fontSize: 12 }}>
                    ● Online Session Active
                  </ThemedText>
                </View>

                <Pressable
                  onPress={handleLogout}
                  style={({ pressed }) => [
                    styles.submitButton,
                    { backgroundColor: '#FF3B30', marginTop: Spacing.four },
                    pressed && styles.pressed,
                  ]}
                >
                  <ThemedText type="smallBold" style={styles.submitButtonText}>
                    Sign Out (Logout)
                  </ThemedText>
                </Pressable>
              </View>
            ) : (
              <>
                {/* Mode Selector Tabs */}
                <View style={styles.tabContainer}>
                  <Pressable
                    onPress={() => {
                      setMode('login');
                      setErrorMsg(null);
                    }}
                    style={[
                      styles.tabButton,
                      mode === 'login' && { borderBottomWidth: 2, borderBottomColor: theme.text },
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
                    }}
                    style={[
                      styles.tabButton,
                      mode === 'register' && { borderBottomWidth: 2, borderBottomColor: theme.text },
                    ]}
                  >
                    <ThemedText
                      type="smallBold"
                      style={{ color: mode === 'register' ? theme.text : theme.textSecondary }}
                    >
                      Sign Up (Register)
                    </ThemedText>
                  </Pressable>
                </View>

                {errorMsg && (
                  <View style={styles.errorBanner}>
                    <ThemedText type="small" style={styles.errorText}>
                      ⚠️ {errorMsg}
                    </ThemedText>
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
                    ]}
                  />
                </View>

                {/* Email Input (Register mode only) */}
                {mode === 'register' && (
                  <View style={styles.inputGroup}>
                    <ThemedText type="smallBold" style={styles.inputLabel}>
                      Email Address
                    </ThemedText>
                    <TextInput
                      placeholder="Enter email address"
                      placeholderTextColor={theme.textSecondary}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={[
                        styles.input,
                        { color: theme.text, backgroundColor: theme.background, borderColor: 'rgba(128,128,128,0.2)' },
                      ]}
                    />
                  </View>
                )}

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
                    ]}
                  />
                </View>

                {/* Submit Button */}
                <Pressable
                  onPress={mode === 'login' ? handleLogin : handleRegister}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.submitButton,
                    { backgroundColor: theme.text },
                    (pressed || loading) && styles.pressed,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.background} />
                  ) : (
                    <ThemedText type="smallBold" style={[styles.submitButtonText, { color: theme.background }]}>
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
  },
  heroBanner: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    marginBottom: Spacing.three,
    borderRadius: Spacing.three,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: Spacing.one,
  },
  formCard: {
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
    borderRadius: Spacing.three,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128,128,128,0.15)',
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
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderColor: '#FF3B30',
    borderWidth: 1,
    padding: Spacing.two,
    borderRadius: Spacing.two,
    marginBottom: Spacing.three,
  },
  errorText: {
    color: '#FF3B30',
  },
  inputGroup: {
    marginBottom: Spacing.three,
  },
  inputLabel: {
    marginBottom: Spacing.one,
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 14,
    ...Platform.select({
      web: {
        outlineStyle: 'none' as any,
      },
    }),
  },
  submitButton: {
    width: '100%',
    paddingVertical: Spacing.three,
    borderRadius: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  pressed: {
    opacity: 0.7,
  },
});
