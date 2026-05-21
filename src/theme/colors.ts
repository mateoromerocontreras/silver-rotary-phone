export const colors = {
  light: {
    background: '#F8F9FA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F1F3F5',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    accent: '#007AFF',
    accentLight: '#E8F2FF',
    income: '#34C759',
    incomeLight: '#E8F8ED',
    expense: '#FF3B30',
    expenseLight: '#FFF0EF',
    warning: '#FF9500',
    warningLight: '#FFF5E6',
    card: '#FFFFFF',
    shadow: 'rgba(0, 0, 0, 0.06)',
    overlay: 'rgba(0, 0, 0, 0.4)',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    statusBar: 'dark-content' as const,
  },
  dark: {
    background: '#000000',
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    textTertiary: '#636366',
    border: '#38383A',
    accent: '#0A84FF',
    accentLight: '#0A84FF22',
    income: '#30D158',
    incomeLight: '#30D15822',
    expense: '#FF453A',
    expenseLight: '#FF453A22',
    warning: '#FF9F0A',
    warningLight: '#FF9F0A22',
    card: '#1C1C1E',
    shadow: 'rgba(0, 0, 0, 0.3)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    tabBar: '#1C1C1E',
    tabBarBorder: '#38383A',
    statusBar: 'light-content' as const,
  },
};

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  accent: string;
  accentLight: string;
  income: string;
  incomeLight: string;
  expense: string;
  expenseLight: string;
  warning: string;
  warningLight: string;
  card: string;
  shadow: string;
  overlay: string;
  tabBar: string;
  tabBarBorder: string;
  statusBar: 'dark-content' | 'light-content';
};
