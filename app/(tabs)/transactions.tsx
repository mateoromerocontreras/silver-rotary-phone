import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { api } from '@/src/api/client';
import { CategoryIcon } from '@/src/components/shared/CategoryIcon';
import { AmountText } from '@/src/components/shared/AmountText';
import { formatDate, getRelativeDate } from '@/src/lib/format';
import { spacing, typography, radius } from '@/src/theme';
import type { Transaction, TransactionType } from '@/src/types';

const FILTERS: { label: string; value: TransactionType | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Expense', value: 'EXPENSE' },
  { label: 'Income', value: 'INCOME' },
];

export default function TransactionsScreen() {
  const colors = useThemeColors();
  const [filter, setFilter] = useState<TransactionType | 'ALL'>('ALL');

  const { data, refetch } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => api.transactions.list(1, 50),
  });

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const filtered = data?.data.filter(
    (tx) => filter === 'ALL' || tx.type === filter
  ) ?? [];

  const renderItem = ({ item: tx, index }: { item: Transaction; index: number }) => (
    <TouchableOpacity
      style={[
        styles.txRow,
        { backgroundColor: colors.card },
        index === 0 && { borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg },
        index === filtered.length - 1 && { borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
        index < filtered.length - 1 && {
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
        <Text style={[styles.txMeta, { color: colors.textTertiary }]}>
          {tx.category?.name} · {getRelativeDate(tx.date)}
        </Text>
      </View>
      <View style={styles.txAmount}>
        <AmountText
          amount={tx.type === 'INCOME' ? tx.amount : -tx.amount}
          showSign
          type={tx.type === 'INCOME' ? 'income' : 'expense'}
          size="sm"
        />
        <Text style={[styles.txAccount, { color: colors.textTertiary }]}>
          {tx.account?.name}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accent }]}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.value}
            onPress={() => setFilter(f.value)}
            style={[
              styles.chip,
              {
                backgroundColor:
                  filter === f.value ? colors.accent : colors.surfaceSecondary,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: filter === f.value ? '#FFFFFF' : colors.textSecondary,
                },
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Transaction list */}
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
              No transactions yet
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing.lg,
  },
  title: { ...typography.title1 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
  },
  chipText: {
    ...typography.footnote,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  txInfo: { flex: 1 },
  txDescription: { ...typography.subheadline, fontWeight: '500' },
  txMeta: { ...typography.caption1, marginTop: 2 },
  txAmount: { alignItems: 'flex-end' },
  txAccount: { ...typography.caption2, marginTop: 2 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['5xl'],
    gap: spacing.md,
  },
  emptyText: { ...typography.callout },
});
