import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ActivityIndicator,
  type ViewStyle, type TextStyle,
} from 'react-native';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { radius, spacing, typography } from '@/src/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  title, onPress, variant = 'primary', size = 'lg',
  loading, disabled, style,
}: ButtonProps) {
  const colors = useThemeColors();

  const bgColor =
    variant === 'primary' ? colors.accent :
    variant === 'secondary' ? colors.surfaceSecondary : 'transparent';

  const textColor =
    variant === 'primary' ? '#FFFFFF' :
    variant === 'secondary' ? colors.text : colors.accent;

  const height = size === 'sm' ? 36 : size === 'md' ? 44 : 52;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          height,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: textColor } as TextStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  text: {
    ...typography.headline,
  },
});
