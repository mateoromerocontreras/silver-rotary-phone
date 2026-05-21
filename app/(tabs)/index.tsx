import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Dimensions,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useAuthStore } from '@/src/stores/authStore';
import { api } from '@/src/api/client';
import { Card } from '@/src/components/ui/Card';
import { AmountText } from '@/src/components/shared/AmountText';
import { CategoryIcon } from '@/src/components/shared/CategoryIcon';
import { formatCurrency, getRelativeDate } from '@/src/lib/format';
import { spacing, typography, radius } from '@/src/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.7;

export default function HomeScreen() {
  const colors = useThemeColors();
  const { user } = useAuthStore();

  const { data: accounts, refetch: refetchAccounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: api.accounts.list,
  });

  const { data: summary } = useQuery({
    queryKey: ['summary'],
    queryFn: api.reports.summary,
  });

  const { data: txResult, refetch: refetchTx } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: () => api.transactions.list(1, 5),
  });

  const totalBalance = accounts?.reduce((sum, a) => sum + a.balance, 0) ?? 0;
  const recentTx = txResult?.data ?? [];

  const [refreshing, setRefreshing] = React.useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchAccounts(), refetchTx()]);
    setRefreshing(false);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {greeting()},
          </Text>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.name ?? 'there'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.notifButton, { backgroundColor: colors.surfaceSecondary }]}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Total Balance Card */}
      <Card style={[styles.balanceCard, { backgroundColor: colors.accent }]} padding="2xl">
        <Text style={styles.balanceLabel}>Total Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(totalBalance)}</Text>
        {summary && (
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={[styles.dot, { backgroundColor: '#34C759' }]} />
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.totalIncome)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.summaryItem}>
              <View style={[styles.dot, { backgroundColor: '#FF6B6B' }]} />
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={styles.summaryValue}>
                {formatCurrency(summary.totalExpense)}
              </Text>
            </View>
          </View>
        )}
      </Card>

      {/* Accounts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Accounts</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: colors.accent }]}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.accountsScroll}
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + spacing.md}
        >
          {accounts?.map((account) => (
            <TouchableOpacity key={account.id} activeOpacity={0.7}>
              <Card
                style={[styles.accountCard, { width: CARD_WIDTH }]}
                padding="lg"
              >
                <View style={styles.accountHeader}>
                  <View
                    style={[
                      styles.accountIcon,
                      { backgroundColor: (account.color || colors.accent) + '20' },
                    ]}
                  >
                    <Ionicons
                      name={account.type === 'CREDIT_CARD' ? 'card-outline' : 'wallet-outline'}
                      size={18}
                      color={account.color || colors.accent}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.accountName, { color: colors.text }]} numberOfLines={1}>
                      {account.name}
                    </Text>
                    <Text style={[styles.accountInstitution, { color: colors.textTertiary }]}>
                      {account.institution ?? account.type.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                <AmountText
                  amount={account.balance}
                  size="lg"
                  type={account.balance < 0 ? 'expense' : 'neutral'}
                  style={{ marginTop: spacing.md }}
                />
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Transactions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAll, { color: colors.accent }]}>See all</Text>
          </TouchableOpacity>
        </View>
        <Card padding="sm">
          {recentTx.map((tx, i) => (
            <TouchableOpacity
              key={tx.id}
              style={[
                styles.txRow,
                i < recentTx.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
              activeOpacity={0.6}
            >
              <CategoryIcon
                icon={tx.category?.icon ?? 'ellipse'}
                color={tx.category?.color ?? colors.textTertiary}
                size={44}
              />
              <View style={styles.txInfo}>
                <Text style={[styles.txDescription, { color: colors.text }]} numberOfLines={1}>
                  {tx.description}
                </Text>
                <Text style={[styles.txDate, { color: colors.textTertiary }]}>
                  {tx.category?.name} · {getRelativeDate(tx.date)}
                </Text>
              </View>
              <AmountText
                amount={tx.type === 'INCOME' ? tx.amount : -tx.amount}
                showSign
                type={tx.type === 'INCOME' ? 'income' : 'expense'}
                size="sm"
              />
            </TouchableOpacity>
          ))}
        </Card>
      </View>

      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  greeting: { ...typography.subheadline },
  name: { ...typography.title2 },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    marginHorizontal: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  balanceLabel: {
    ...typography.subheadline,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xs,
  },
  balanceAmount: {
    ...typography.amount,
    color: '#FFFFFF',
    marginBottom: spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    padding: spacing.md,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: spacing.xs,
  },
  summaryLabel: {
    ...typography.caption2,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  summaryValue: {
    ...typography.footnote,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    width: 1,
    height: 32,
    marginHorizontal: spacing.md,
  },
  section: { marginBottom: spacing['2xl'] },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.md,
  },
  sectionTitle: { ...typography.headline },
  seeAll: { ...typography.subheadline, fontWeight: '500' },
  accountsScroll: { paddingHorizontal: spacing['2xl'], gap: spacing.md },
  accountCard: {},
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  accountIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountName: { ...typography.subheadline, fontWeight: '600' },
  accountInstitution: { ...typography.caption1 },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  txInfo: { flex: 1 },
  txDescription: { ...typography.subheadline, fontWeight: '500' },
  txDate: { ...typography.caption1, marginTop: 2 },
});
