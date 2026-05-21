import { useColorScheme } from 'react-native';
import { colors, type ThemeColors } from '@/src/theme';
import { useThemeStore } from '@/src/stores/themeStore';

export function useThemeColors(): ThemeColors & { isDark: boolean } {
  const systemScheme = useColorScheme();
  const { mode } = useThemeStore();

  const isDark =
    mode === 'system' ? systemScheme === 'dark' : mode === 'dark';

  const themeColors = isDark ? colors.dark : colors.light;

  return { ...themeColors, isDark };
}
