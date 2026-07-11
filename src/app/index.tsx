import React from 'react';
import { StyleSheet, ScrollView, View, Image, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { TopHeader } from '@/components/top-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// ─── DATA ───────────────────────────────────────────────────────────

const STATS = [
  { id: 's1', label: 'Total Products', value: '128', change: '+12', icon: { ios: 'shippingbox.fill', android: 'inventory_2', web: 'inventory_2' }, color: '#007AFF' },
  { id: 's2', label: 'Total Orders', value: '1,847', change: '+86', icon: { ios: 'cart.fill', android: 'shopping_cart', web: 'shopping_cart' }, color: '#30D158' },
  { id: 's3', label: 'Revenue', value: '$48.2K', change: '+15%', icon: { ios: 'dollarsign.circle.fill', android: 'payments', web: 'payments' }, color: '#FF9F0A' },
  { id: 's4', label: 'Customers', value: '3,204', change: '+124', icon: { ios: 'person.2.fill', android: 'group', web: 'group' }, color: '#BF5AF2' },
];

const RECENT_ORDERS = [
  { id: 'o1', customer: 'Somchai K.', product: 'Nova RGB Mechanical', amount: '$159.00', status: 'completed' as const, date: 'Jul 11' },
  { id: 'o2', customer: 'Ploy R.', product: 'Aero 75 Wireless', amount: '$129.00', status: 'shipped' as const, date: 'Jul 11' },
  { id: 'o3', customer: 'Mike T.', product: 'Retro Type Classic', amount: '$189.00', status: 'processing' as const, date: 'Jul 10' },
  { id: 'o4', customer: 'Nida S.', product: 'Ergo Split Pro', amount: '$249.00', status: 'completed' as const, date: 'Jul 10' },
  { id: 'o5', customer: 'James W.', product: 'Sakura 60 Compact', amount: '$99.00', status: 'shipped' as const, date: 'Jul 09' },
];

const TOP_PRODUCTS = [
  { id: 'tp1', name: 'Nova RGB Mechanical', sold: 342, revenue: '$54.4K', image: require('@/assets/images/keyboard_mechanical_rgb.png') },
  { id: 'tp2', name: 'Aero 75 Wireless', sold: 289, revenue: '$37.3K', image: require('@/assets/images/keyboard_wireless_white.png') },
  { id: 'tp3', name: 'Retro Type Classic', sold: 198, revenue: '$37.4K', image: require('@/assets/images/keyboard_retro_vintage.png') },
  { id: 'tp4', name: 'Ergo Split Pro', sold: 156, revenue: '$38.8K', image: require('@/assets/images/keyboard_ergonomic_split.png') },
];

const QUICK_ACTIONS = [
  { id: 'qa1', label: 'Add Product', icon: { ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }, color: '#007AFF' },
  { id: 'qa2', label: 'View Orders', icon: { ios: 'list.bullet.rectangle.fill', android: 'receipt_long', web: 'receipt_long' }, color: '#30D158' },
  { id: 'qa3', label: 'Manage GB', icon: { ios: 'clock.fill', android: 'schedule', web: 'schedule' }, color: '#FF9F0A' },
  { id: 'qa4', label: 'Analytics', icon: { ios: 'chart.bar.fill', android: 'bar_chart', web: 'bar_chart' }, color: '#FF453A' },
];

const WEEKLY_SALES = [
  { day: 'Mon', value: 42 },
  { day: 'Tue', value: 58 },
  { day: 'Wed', value: 35 },
  { day: 'Thu', value: 74 },
  { day: 'Fri', value: 62 },
  { day: 'Sat', value: 89 },
  { day: 'Sun', value: 51 },
];
const maxSale = Math.max(...WEEKLY_SALES.map((d) => d.value));

const GB_STATUS = [
  { id: 'gb1', name: 'Nova RGB Mechanical', progress: 0.78, current: 390, moq: 500, closingDate: 'Aug 15', status: 'live' as const },
  { id: 'gb2', name: 'Retro Type Classic', progress: 0.92, current: 276, moq: 300, closingDate: 'Jul 25', status: 'ending-soon' as const },
  { id: 'gb3', name: 'Ergo Split Pro', progress: 0.45, current: 90, moq: 200, closingDate: 'Sep 01', status: 'live' as const },
];

const STATUS_COLORS = {
  completed: { label: 'Completed', color: '#30D158', bg: '#30D15818' },
  processing: { label: 'Processing', color: '#FF9F0A', bg: '#FF9F0A18' },
  shipped: { label: 'Shipped', color: '#007AFF', bg: '#007AFF18' },
};

// ─── SUB-COMPONENTS ─────────────────────────────────────────────────

function SectionHeader({ title, actionText }: { title: string; actionText?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText type="smallBold" style={styles.sectionTitle}>{title}</ThemedText>
      {actionText && (
        <Pressable style={({ pressed }) => pressed && styles.pressed}>
          <ThemedText type="small" style={styles.sectionLink}>{actionText}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, { width: `${Math.min(progress * 100, 100)}%`, backgroundColor: color }]} />
    </View>
  );
}

// ─── MAIN SCREEN ────────────────────────────────────────────────────

export default function HomeScreen() {
  const theme = useTheme();

  return (
    <ThemedView type="background" style={styles.root}>
      <SafeAreaView edges={['top']} style={styles.safe}>
        <TopHeader />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollInner}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Welcome ── */}
          <View style={styles.content}>
            <View style={styles.welcomeRow}>
              <View style={styles.welcomeText}>
                <ThemedText type="small" themeColor="textSecondary">สวัสดี, Admin 👋</ThemedText>
                <ThemedText type="subtitle" style={styles.welcomeTitle}>
                  ยินดีต้อนรับสู่{'\n'}ExtremeKey
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" style={styles.welcomeSub}>
                  จัดการร้านค้าคีย์บอร์ดของคุณได้จากที่นี่
                </ThemedText>
              </View>
              <View style={[styles.avatar, { backgroundColor: theme.backgroundElement }]}>
                <SymbolView
                  tintColor={theme.textSecondary}
                  name={{ ios: 'person.crop.circle.fill', android: 'account_circle', web: 'account_circle' }}
                  size={44}
                />
              </View>
            </View>
          </View>

          {/* ── Stats ── */}
          <View style={[styles.content, styles.statsGrid]}>
            {STATS.map((s) => (
              <ThemedView key={s.id} type="backgroundElement" style={styles.statCard}>
                <View style={[styles.statIcon, { backgroundColor: s.color + '18' }]}>
                  <SymbolView tintColor={s.color} name={s.icon} size={16} />
                </View>
                <ThemedText type="small" themeColor="textSecondary" style={styles.statLabel}>{s.label}</ThemedText>
                <ThemedText type="subtitle" style={styles.statValue}>{s.value}</ThemedText>
                <View style={styles.statChangeRow}>
                  <SymbolView tintColor="#30D158" name={{ ios: 'arrow.up.right', android: 'trending_up', web: 'trending_up' }} size={10} />
                  <ThemedText type="small" style={styles.statChange}>{s.change}</ThemedText>
                </View>
              </ThemedView>
            ))}
          </View>

          {/* ── Quick Actions ── */}
          <SectionHeader title="Quick Actions" />
          <View style={[styles.content, styles.actionsRow]}>
            {QUICK_ACTIONS.map((a) => (
              <Pressable key={a.id} style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}>
                <ThemedView type="backgroundElement" style={styles.actionInner}>
                  <View style={[styles.actionIcon, { backgroundColor: a.color + '18' }]}>
                    <SymbolView tintColor={a.color} name={a.icon} size={20} />
                  </View>
                  <ThemedText type="small" style={styles.actionLabel}>{a.label}</ThemedText>
                </ThemedView>
              </Pressable>
            ))}
          </View>

          {/* ── Weekly Sales ── */}
          <SectionHeader title="Weekly Sales" actionText="Details" />
          <View style={styles.content}>
            <ThemedView type="backgroundElement" style={styles.card}>
              <View style={styles.chartHeader}>
                <View>
                  <ThemedText type="subtitle" style={styles.chartTotal}>$12,480</ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">Total this week</ThemedText>
                </View>
                <View style={styles.chartBadge}>
                  <SymbolView tintColor="#30D158" name={{ ios: 'arrow.up.right', android: 'trending_up', web: 'trending_up' }} size={11} />
                  <ThemedText type="smallBold" style={{ color: '#30D158', fontSize: 12 }}>+18.2%</ThemedText>
                </View>
              </View>
              <View style={styles.chartBars}>
                {WEEKLY_SALES.map((d) => (
                  <View key={d.day} style={styles.chartCol}>
                    <View style={styles.chartTrack}>
                      <View style={[styles.chartFill, {
                        height: `${(d.value / maxSale) * 100}%`,
                        backgroundColor: d.value === maxSale ? '#007AFF' : theme.backgroundSelected,
                      }]} />
                    </View>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.chartLabel}>{d.day}</ThemedText>
                  </View>
                ))}
              </View>
            </ThemedView>
          </View>

          {/* ── Group Buy Status ── */}
          <SectionHeader title="Group Buy Status" actionText="View All" />
          <View style={[styles.content, styles.gbList]}>
            {GB_STATUS.map((gb) => {
              const barColor = gb.progress >= 0.8 ? '#30D158' : '#007AFF';
              return (
                <ThemedView key={gb.id} type="backgroundElement" style={styles.card}>
                  <View style={styles.gbRow}>
                    <ThemedText type="smallBold" numberOfLines={1} style={styles.gbName}>{gb.name}</ThemedText>
                    <View style={[styles.gbBadge, {
                      backgroundColor: gb.status === 'ending-soon' ? '#FF453A18' : '#30D15818',
                    }]}>
                      <ThemedText type="small" style={{
                        fontSize: 11, fontWeight: '700',
                        color: gb.status === 'ending-soon' ? '#FF453A' : '#30D158',
                      }}>
                        {gb.status === 'ending-soon' ? '⏰ Ending Soon' : '🟢 Live'}
                      </ThemedText>
                    </View>
                  </View>
                  <ProgressBar progress={gb.progress} color={barColor} />
                  <View style={styles.gbMeta}>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.gbSmall}>
                      {gb.current}/{gb.moq} MOQ
                    </ThemedText>
                    <ThemedText type="smallBold" style={{ fontSize: 12, color: barColor }}>
                      {Math.round(gb.progress * 100)}%
                    </ThemedText>
                  </View>
                  <View style={styles.gbDateRow}>
                    <SymbolView tintColor={theme.textSecondary} name={{ ios: 'calendar', android: 'event', web: 'event' }} size={11} />
                    <ThemedText type="small" themeColor="textSecondary" style={styles.gbSmall}>Closes {gb.closingDate}</ThemedText>
                  </View>
                </ThemedView>
              );
            })}
          </View>

          {/* ── Top Products ── */}
          <SectionHeader title="Top Products" actionText="See All" />
          <View style={styles.content}>
            <ThemedView type="backgroundElement" style={styles.card}>
              {TOP_PRODUCTS.map((p, i) => (
                <View key={p.id}>
                  <View style={styles.productRow}>
                    <ThemedText type="smallBold" style={styles.productRank}>#{i + 1}</ThemedText>
                    <Image source={p.image} style={styles.productThumb} resizeMode="cover" />
                    <View style={styles.productInfo}>
                      <ThemedText type="smallBold" numberOfLines={1}>{p.name}</ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" style={styles.productSold}>{p.sold} sold</ThemedText>
                    </View>
                    <ThemedText type="smallBold" style={styles.productRev}>{p.revenue}</ThemedText>
                  </View>
                  {i < TOP_PRODUCTS.length - 1 && <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />}
                </View>
              ))}
            </ThemedView>
          </View>

          {/* ── Recent Orders ── */}
          <SectionHeader title="Recent Orders" actionText="View All" />
          <View style={styles.content}>
            <ThemedView type="backgroundElement" style={styles.card}>
              {RECENT_ORDERS.map((o, i) => {
                const sc = STATUS_COLORS[o.status];
                return (
                  <View key={o.id}>
                    <View style={styles.orderRow}>
                      <View style={styles.orderLeft}>
                        <ThemedText type="smallBold">{o.customer}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary" style={styles.orderProd} numberOfLines={1}>{o.product}</ThemedText>
                      </View>
                      <View style={styles.orderRight}>
                        <ThemedText type="smallBold">{o.amount}</ThemedText>
                        <View style={[styles.orderBadge, { backgroundColor: sc.bg }]}>
                          <ThemedText type="small" style={{ fontSize: 10, fontWeight: '700', color: sc.color }}>{sc.label}</ThemedText>
                        </View>
                      </View>
                    </View>
                    {i < RECENT_ORDERS.length - 1 && <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />}
                  </View>
                );
              })}
            </ThemedView>
          </View>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

// ─── STYLES ─────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // ── Layout ──
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollInner: {
    paddingBottom: BottomTabInset + Spacing.four,
  },
  pressed: { opacity: 0.75 },

  // Shared content wrapper — keeps everything aligned and padded
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
  },

  // ── Section Header ──
  sectionHeader: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    marginTop: Spacing.five,
    marginBottom: Spacing.three,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  sectionLink: { fontWeight: '600', color: '#007AFF', fontSize: 13 },

  // ── Shared Card ──
  card: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
  },

  // ── Welcome ──
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.one,
  },
  welcomeText: { flex: 1, gap: Spacing.one },
  welcomeTitle: { fontSize: 24, fontWeight: '800', lineHeight: 30 },
  welcomeSub: { fontSize: 13, marginTop: 2 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Stats ──
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  statCard: {
    flexBasis: '48%',
    flexGrow: 1,
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: 3,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statLabel: { fontSize: 11, letterSpacing: 0.2 },
  statValue: { fontSize: 22, fontWeight: '800', lineHeight: 26 },
  statChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statChange: { fontSize: 11, color: '#30D158', fontWeight: '600' },

  // ── Quick Actions ──
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  actionCard: { flex: 1 },
  actionInner: {
    alignItems: 'center',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    gap: Spacing.two,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  // ── Chart ──
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.three,
  },
  chartTotal: { fontSize: 24, fontWeight: '800', lineHeight: 28 },
  chartBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#30D15818',
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Spacing.three,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 90,
    gap: Spacing.one,
  },
  chartCol: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  chartTrack: {
    width: '100%',
    height: 70,
    justifyContent: 'flex-end',
  },
  chartFill: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: { fontSize: 10 },

  // ── Group Buy ──
  gbList: { gap: Spacing.two },
  gbRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.one,
  },
  gbName: { fontSize: 13, flex: 1, marginRight: Spacing.two },
  gbBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Spacing.three,
  },
  gbMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  gbSmall: { fontSize: 11 },
  gbDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },

  // ── Progress Bar ──
  progressBg: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(128,128,128,0.12)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // ── Top Products ──
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  productRank: { fontSize: 13, width: 22, textAlign: 'center', color: '#007AFF' },
  productThumb: { width: 36, height: 36, borderRadius: Spacing.two },
  productInfo: { flex: 1, gap: 1 },
  productSold: { fontSize: 11 },
  productRev: { fontSize: 13, color: '#30D158' },

  // ── Orders ──
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  orderLeft: { flex: 1, gap: 1 },
  orderProd: { fontSize: 11 },
  orderRight: { alignItems: 'flex-end', gap: Spacing.one },
  orderBadge: {
    paddingHorizontal: Spacing.two,
    paddingVertical: 1,
    borderRadius: Spacing.three,
  },

  // ── Divider ──
  divider: { height: 1, marginVertical: 2 },
});
