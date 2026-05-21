import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { api } from '@/src/api/client';
import { Card } from '@/src/components/ui/Card';
import { CategoryIcon } from '@/src/components/shared/CategoryIcon';
import { formatCurrency, formatMonthYear } from '@/src/lib/format';
import { spacing, typography, radius } from '@/src/theme';
import type { Budget } from '@/src/types';

function BudgetProgressBar({ budget, colors }: { budget: Budget; colors: any }) {
  const pct = Math.min(budget.percentage, 100);
  const isOver = budget.percentage > 85;

  const barColor = isOver
    ? budget.percentage > 100
      ? colors.expense
      : colors.warning
    : budget.category?.color ?? colors.accent;

  return (
    <View style={[styles.progressBg, { backgroundColor: colors.surfaceSecondary }]}>
      <View
        style={[
          styles.progressFill,
          { width: `${pct}%`, backgroundColor: barColor },
        ]}
      />
    </View>
  );
}

export default function BudgetsScreen() {
  const colors = useThemeColors();
  const now = new Date();

  const { data: budgets } = useQuery({
    queryKey: ['budgets'],
    queryFn: api.budgets.list,
  });

  const totalBudget = budgets?.reduce((s, b) => s + b.amount, 0) ?? 0;
  const totalSpent = budgets?.reduce((s, b) => s + b.spent, 0) ?? 0;
  const totalPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Budgets</Text>
          <Text style={[styles.monthLabel, { color: colors.textSecondary }]}>
            {formatMonthYear(now.getMonth() + 1, now.getFullYear())}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.accent }]}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Overview Card */}
      <Card style={styles.overviewCard} padding="2xl">
        <Text style={[styles.overviewLabel, { color: colors.textSecondary }]}>
          Total Spent
        </Text>
        <View style={styles.overviewRow}>
          <Text style={[styles.overviewAmount, { color: colors.text }]}>
            {formatCurrency(totalSpent)}
          </Text>
          <Text style={[styles.overviewOf, { color: colors.textTertiary }]}>
            of {formatCurrency(totalBudget)}
          </Text>
        </View>
        <View style={[styles.progressBg, { backgroundColor: colors.surfaceSecondary, height: 8, marginTop: spacing.md }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(totalPct, 100)}%`,
                backgroundColor: totalPct > 85 ? colors.warning : colors.accent,
                height: 8,
              },
            ]}
          />
        </View>
        <Text style={[styles.overviewPct, { color: colors.textSecondary }]}>
          {totalPct.toFixed(0)}% used
        </Text>
      </Card>

      {/* Budget items */}
      {budgets?.map((budget) => (
        <TouchableOpacity key={budget.id} activeOpacity={0.7}>
          <Card style={styles.budgetCard} padding="lg">
            <View style={styles.budgetHeader}>
              <CategoryIcon
                icon={budget.category?.icon ?? 'ellipse'}
                color={budget.category?.color ?? colors.textTertiary}
                size={40}
              />
              <View style={styles.budgetInfo}>
                <Text style={[styles.budgetName, { color: colors.text }]}>
                  {budget.category?.name}
                </Text>
                <Text style={[styles.budgetMeta, { color: colors.textTertiary }]}>
                  {formatCurrency(budget.spent)} of {formatCurrency(budget.amount)}
                </Text>
              </View>
              <View style={styles.budgetPctContainer}>
                <Text
                  style={[
                    styles.budgetPct,
                    {
                      color:
                        budget.percentage > 100 ? colors.expense :
                        budget.percentage > 85 ? colors.warning : colors.textSecondary,
                    },
                  ]}
                >
                  {budget.percentage.toFixed(0)}%
                </Text>
              </View>
            </View>
            <BudgetProgressBar budget={budget} colors={colors} />
          </Card>
        </TouchableOpacity>
      ))}

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
    alignItems: 'flex-start',
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing['2xl'],
  },
  title: { ...typography.title1 },
  monthLabel: { ...typography.subheadline, marginTop: 2 },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overviewCard: { marginHorizontal: spacing['2xl'], marginBottom: spacing['2xl'] },
  overviewLabel: { ...typography.footnote, marginBottom: spacing.xs },
  overviewRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm },
  overviewAmount: { ...typography.title1 },
  overviewOf: { ...typography.subheadline },
  overviewPct: { ...typography.caption1, marginTop: spacing.sm, textAlign: 'right' },
  budgetCard: { marginHorizontal: spacing['2xl'], marginBottom: spacing.md },
  budgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  budgetInfo: { flex: 1 },
  budgetName: { ...typography.subheadline, fontWeight: '600' },
  budgetMeta: { ...typography.caption1, marginTop: 2 },
  budgetPctContainer: {},
  budgetPct: { ...typography.headline },
  progressBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
});
