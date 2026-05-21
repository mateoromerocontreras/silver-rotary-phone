import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useAuthStore } from '@/src/stores/authStore';
import { useThemeStore } from '@/src/stores/themeStore';
import { Card } from '@/src/components/ui/Card';
import { spacing, typography, radius } from '@/src/theme';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
  rightElement?: React.ReactNode;
}

function MenuItem({ icon, label, value, onPress, destructive, rightElement }: MenuItemProps) {
  const colors = useThemeColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      activeOpacity={0.6}
    >
      <View style={[styles.menuIcon, { backgroundColor: (destructive ? colors.expense : colors.accent) + '18' }]}>
        <Ionicons
          name={icon}
          size={20}
          color={destructive ? colors.expense : colors.accent}
        />
      </View>
      <Text style={[styles.menuLabel, { color: destructive ? colors.expense : colors.text }]}>
        {label}
      </Text>
      {rightElement ?? (
        <>
          {value && (
            <Text style={[styles.menuValue, { color: colors.textTertiary }]}>{value}</Text>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </>
      )}
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useThemeColors();
  const { user, logout } = useAuthStore();
  const { mode, setMode } = useThemeStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const toggleDarkMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile header */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={[styles.profileName, { color: colors.text }]}>{user?.name}</Text>
        <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user?.email}</Text>
      </View>

      {/* Settings sections */}
      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PREFERENCES</Text>
      <Card padding="xs" style={styles.menuCard}>
        <MenuItem icon="moon-outline" label="Dark Mode" rightElement={
          <Switch
            value={mode === 'dark'}
            onValueChange={toggleDarkMode}
            trackColor={{ true: colors.accent, false: colors.surfaceSecondary }}
            thumbColor="#FFFFFF"
          />
        } />
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <MenuItem icon="cash-outline" label="Currency" value={user?.currency ?? 'USD'} />
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <MenuItem icon="notifications-outline" label="Notifications" />
      </Card>

      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DATA</Text>
      <Card padding="xs" style={styles.menuCard}>
        <MenuItem icon="download-outline" label="Export Data" />
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <MenuItem icon="cloud-upload-outline" label="Backup" />
      </Card>

      <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ABOUT</Text>
      <Card padding="xs" style={styles.menuCard}>
        <MenuItem icon="information-circle-outline" label="Version" value="1.0.0" />
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <MenuItem icon="document-text-outline" label="Privacy Policy" />
        <View style={[styles.separator, { backgroundColor: colors.border }]} />
        <MenuItem icon="shield-checkmark-outline" label="Terms of Service" />
      </Card>

      <Card padding="xs" style={[styles.menuCard, { marginTop: spacing['2xl'] }]}>
        <MenuItem
          icon="log-out-outline"
          label="Sign Out"
          destructive
          onPress={handleLogout}
        />
      </Card>

      <View style={{ height: spacing['4xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 60 },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    marginBottom: spacing['3xl'],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarText: {
    ...typography.title1,
    color: '#FFFFFF',
  },
  profileName: { ...typography.title2, marginBottom: spacing.xs },
  profileEmail: { ...typography.callout },
  sectionLabel: {
    ...typography.caption1,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: spacing['3xl'],
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  menuCard: { marginHorizontal: spacing['2xl'] },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { ...typography.body, flex: 1 },
  menuValue: { ...typography.subheadline, marginRight: spacing.xs },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
});
