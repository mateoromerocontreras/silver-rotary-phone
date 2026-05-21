import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius } from '@/src/theme';

const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'briefcase': 'briefcase-outline',
  'code-slash': 'code-slash-outline',
  'cart': 'cart-outline',
  'restaurant': 'restaurant-outline',
  'car': 'car-outline',
  'game-controller': 'game-controller-outline',
  'bag': 'bag-outline',
  'flash': 'flash-outline',
  'medkit': 'medkit-outline',
  'repeat': 'repeat-outline',
  'trending-up': 'trending-up-outline',
  'home': 'home-outline',
  'card': 'card-outline',
  'wallet': 'wallet-outline',
  'cash': 'cash-outline',
};

interface CategoryIconProps {
  icon: string;
  color: string;
  size?: number;
}

export function CategoryIcon({ icon, color, size = 40 }: CategoryIconProps) {
  const ionIcon = iconMap[icon] || 'ellipse-outline';

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: color + '18',
        },
      ]}
    >
      <Ionicons name={ionIcon} size={size * 0.5} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
