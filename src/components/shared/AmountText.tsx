import React from 'react';
import { Text, type TextStyle } from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { formatCurrency } from '@/src/lib/format';
import { typography } from '@/src/theme';

interface AmountTextProps {
  amount: number;
  showSign?: boolean;
  type?: 'income' | 'expense' | 'neutral';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  style?: TextStyle;
}

export function AmountText({
  amount, showSign, type = 'neutral', size = 'md', style,
}: AmountTextProps) {
  const colors = useThemeColors();

  const color =
    type === 'income' ? colors.income :
    type === 'expense' ? colors.expense : colors.text;

  const textStyle =
    size === 'sm' ? typography.footnote :
    size === 'md' ? typography.headline :
    size === 'lg' ? typography.title2 : typography.amount;

  const sign = showSign ? (amount >= 0 ? '+' : '-') : '';
  const formatted = formatCurrency(Math.abs(amount));

  return (
    <Text style={[textStyle, { color, fontWeight: '700' } as TextStyle, style]}>
      {sign}{formatted}
    </Text>
  );
}
