/**
 * @file login.tsx
 * @description หน้าจอเข้าสู่ระบบและสมัครสมาชิก (Authentication Screen)
 * รองรับการเข้าสู่ระบบแบบ Role-based (User / Admin) พร้อมบันทึก Token และข้อมูลลง LocalStorage
 */

import React, { useState } from 'react';
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
import { getStorageJSON, setStorageItem, removeStorageItem } from '@/utils/storage';

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // โหลดผู้ใช้ปัจจุบันแบบ Lazy Initializer เพื่อขจัด cascading setState ใน useEffect
  const [user, setUser] = useState<{ username: string; role: string } | null>(() => {
    return getStorageJSON('user', null);
  });

  /**
   * ดำเนินการเข้าสู่ระบบ
   */
  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
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
          setStorageItem('user', JSON.stringify(userData));
          if (data.token) {
            setStorageItem('token', data.token);
          }
          window.dispatchEvent(new Event('auth-change'));
        }

        setUser(userData);
        router.replace('/');
      } else {
        setErrorMsg(data.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูล');
      }
    } catch {
      setErrorMsg('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ระบบยืนยันตัวตนได้');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ดำเนินการลงทะเบียนผู้ใช้ใหม่
   */
  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
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
        setSuccessMsg('สร้างบัญชีสำเร็จแล้ว! กรุณาเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่าน');
        setMode('login');
        setPassword('');
      } else {
        setErrorMsg(data.message || 'การลงทะเบียนไม่สำเร็จ ชื่อผู้ใช้นี้อาจมีอยู่ในระบบแล้ว');
      }
    } catch {
      setErrorMsg('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
    } finally {
      setLoading(false);
    }
  };

  /**
   * ดำเนินการออกจากระบบ
   */
  const handleLogout = () => {
    if (Platform.OS === 'web') {
      removeStorageItem('user');
      removeStorageItem('token');
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
          {user ? (
            /* กรณีที่เข้าสู่ระบบอยู่แล้ว */
            <ThemedView type="backgroundElement" style={styles.card}>
              <View style={styles.avatarCircle}>
                <SymbolView
                  tintColor="#6cc349"
                  name={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' } as any}
                  size={64}
                />
              </View>

              <ThemedText type="subtitle" style={{ textAlign: 'center' }}>
                สวัสดี, {user.username} 👋
              </ThemedText>

              <View style={[styles.roleBadge, { backgroundColor: user.role === 'admin' ? '#FF9500' : '#007AFF' }]}>
                <ThemedText style={styles.roleText}>
                  สิทธิ์การใช้งาน: {user.role.toUpperCase()}
                </ThemedText>
              </View>

              <View style={styles.userActionsRow}>
                <Pressable
                  onPress={() => router.push('/product')}
                  style={[styles.primaryBtn, { backgroundColor: '#6cc349' }]}
                >
                  <ThemedText type="smallBold" style={{ color: '#ffffff' }}>
                    ไปยังหน้าร้านค้า
                  </ThemedText>
                </Pressable>

                <Pressable onPress={handleLogout} style={styles.logoutBtn}>
                  <ThemedText type="smallBold" style={{ color: '#FF3B30' }}>
                    ออกจากระบบ (Sign Out)
                  </ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          ) : (
            /* ฟอร์มเข้าสู่ระบบ / ลงทะเบียน */
            <ThemedView type="backgroundElement" style={styles.card}>
              <View style={styles.tabsHeader}>
                <Pressable
                  onPress={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                  style={[styles.tabToggle, mode === 'login' && styles.activeTabToggle]}
                >
                  <ThemedText
                    type="smallBold"
                    style={{ color: mode === 'login' ? '#6cc349' : theme.textSecondary }}
                  >
                    เข้าสู่ระบบ (Sign In)
                  </ThemedText>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                  style={[styles.tabToggle, mode === 'register' && styles.activeTabToggle]}
                >
                  <ThemedText
                    type="smallBold"
                    style={{ color: mode === 'register' ? '#6cc349' : theme.textSecondary }}
                  >
                    สมัครสมาชิก (Register)
                  </ThemedText>
                </Pressable>
              </View>

              {/* ข้อความแจ้งเตือน */}
              {errorMsg && (
                <View style={styles.errorBox}>
                  <ThemedText style={{ color: '#FF3B30', fontSize: 13 }}>⚠️ {errorMsg}</ThemedText>
                </View>
              )}

              {successMsg && (
                <View style={styles.successBox}>
                  <ThemedText style={{ color: '#34C759', fontSize: 13 }}>✓ {successMsg}</ThemedText>
                </View>
              )}

              {/* ข้อมูลใบ้บัญชีทดสอบ */}
              <View style={[styles.hintBox, { backgroundColor: theme.background }]}>
                <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
                  💡 บัญชีทดสอบ Admin: <ThemedText type="smallBold">admin / adminpassword</ThemedText>
                </ThemedText>
              </View>

              {/* ฟิลด์กรอกข้อมูล */}
              <View style={styles.formGroup}>
                <ThemedText type="small" themeColor="textSecondary">
                  ชื่อผู้ใช้ (Username)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="ชื่อบัญชีของคุณ"
                  placeholderTextColor={theme.textSecondary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText type="small" themeColor="textSecondary">
                  รหัสผ่าน (Password)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: theme.background, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="รหัสผ่าน"
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              {/* ปุ่มดำเนินการ */}
              <Pressable
                onPress={mode === 'login' ? handleLogin : handleRegister}
                disabled={loading}
                style={[
                  styles.primaryBtn,
                  { backgroundColor: '#6cc349' },
                  loading && { opacity: 0.7 },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <ThemedText type="smallBold" style={{ color: '#ffffff', fontSize: 15 }}>
                    {mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชีใหม่'}
                  </ThemedText>
                )}
              </Pressable>
            </ThemedView>
          )}
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
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    padding: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.six,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80%',
  },
  card: {
    maxWidth: 440,
    width: '100%',
    padding: Spacing.five,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(128, 128, 128, 0.15)',
    gap: Spacing.three,
  },
  tabsHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(128, 128, 128, 0.15)',
    marginBottom: Spacing.two,
  },
  tabToggle: {
    flex: 1,
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  activeTabToggle: {
    borderBottomWidth: 2,
    borderBottomColor: '#6cc349',
  },
  avatarCircle: {
    alignItems: 'center',
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  userActionsRow: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  hintBox: {
    padding: Spacing.two,
    borderRadius: 4,
  },
  errorBox: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: Spacing.two,
    borderRadius: 4,
  },
  successBox: {
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    padding: Spacing.two,
    borderRadius: 4,
  },
  formGroup: {
    gap: 6,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderRadius: 6,
    fontSize: 14,
  },
  primaryBtn: {
    paddingVertical: Spacing.three,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  logoutBtn: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
});
